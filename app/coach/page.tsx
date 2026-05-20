"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  XCircle
} from "lucide-react";
import { formatCny, getPackage } from "@/lib/pricing";
import type { Booking, BookingStatus, PaymentChannel } from "@/lib/types";

const statusLabels: Record<BookingStatus, string> = {
  pending_review: "待确认",
  confirmed_unpaid: "已确认待付款",
  paid: "已支付待服务",
  completed: "已完成",
  cancelled: "已取消"
};

export default function CoachPage() {
  const [token, setToken] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const hasBookings = useMemo(() => bookings.length > 0, [bookings]);

  async function loadBookings() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/bookings?token=${encodeURIComponent(token)}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as {
        bookings?: Booking[];
        error?: string;
      };
      if (!response.ok || !payload.bookings) {
        throw new Error(payload.error || "读取预约失败。");
      }
      setBookings(payload.bookings);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "读取预约失败。");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, action: "confirm" | "cancel" | "complete") {
    setMessage("");
    const response = await fetch(
      `/api/bookings/${encodeURIComponent(id)}/confirm?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action })
      }
    );
    const payload = (await response.json()) as {
      booking?: Booking;
      error?: string;
    };
    if (!response.ok || !payload.booking) {
      setMessage(payload.error || "更新失败。");
      return;
    }
    setBookings((current) =>
      current.map((booking) => (booking.id === payload.booking?.id ? payload.booking : booking))
    );
  }

  async function createPayment(id: string, channel: PaymentChannel) {
    setMessage("");
    const response = await fetch("/api/payments/wechat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bookingId: id, channel })
    });
    const payload = (await response.json()) as {
      booking?: Booking;
      error?: string;
    };
    if (!response.ok || !payload.booking) {
      setMessage(payload.error || "微信支付下单失败。");
      return;
    }
    setBookings((current) =>
      current.map((booking) => (booking.id === payload.booking?.id ? payload.booking : booking))
    );
    const url = payload.booking.payment?.h5Url || payload.booking.payment?.codeUrl;
    if (url) {
      setMessage(`支付链接已生成：${url}`);
    }
  }

  useEffect(() => {
    loadBookings();
    // In local development the API can be open without COACH_ADMIN_TOKEN.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="coach-page">
      <section className="coach-shell">
        <div className="coach-header">
          <div>
            <span className="eyebrow dark">教练管理</span>
            <h1>预约确认与支付链接</h1>
            <p>确认档期后，学员才可以进入微信支付下单流程。</p>
          </div>
          <a className="button secondary compact-button" href="/">
            返回首页
          </a>
        </div>

        <div className="coach-token">
          <label className="field">
            <span>
              <ShieldCheck size={17} />
              管理口令
            </span>
            <input
              onChange={(event) => setToken(event.target.value)}
              placeholder="COACH_ADMIN_TOKEN"
              type="password"
              value={token}
            />
          </label>
          <button className="button primary compact-button" onClick={loadBookings} type="button">
            {loading ? <Loader2 className="spin" size={18} /> : <RefreshCcw size={18} />}
            刷新
          </button>
        </div>

        {message ? <p className="admin-message">{message}</p> : null}

        <div className="booking-list">
          {!hasBookings && !loading ? (
            <div className="empty-state">暂无预约。</div>
          ) : null}
          {bookings.map((booking) => {
            const selectedPackage = getPackage(booking.packageId);
            return (
              <article className="admin-booking" key={booking.id}>
                <div className="admin-booking-head">
                  <div>
                    <strong>{booking.name}</strong>
                    <span>{booking.phone}</span>
                  </div>
                  <mark>{statusLabels[booking.status]}</mark>
                </div>
                <dl>
                  <div>
                    <dt>编号</dt>
                    <dd>{booking.id}</dd>
                  </div>
                  <div>
                    <dt>套餐</dt>
                    <dd>{selectedPackage?.title || booking.packageId}</dd>
                  </div>
                  <div>
                    <dt>金额</dt>
                    <dd>{formatCny(booking.quotedAmount)}</dd>
                  </div>
                  <div>
                    <dt>时间</dt>
                    <dd>
                      {booking.date} {booking.timeSlot}
                    </dd>
                  </div>
                  <div>
                    <dt>地点</dt>
                    <dd>{booking.pickupLocation}</dd>
                  </div>
                  <div>
                    <dt>微信</dt>
                    <dd>{booking.wechat}</dd>
                  </div>
                  <div className="wide">
                    <dt>目标</dt>
                    <dd>{booking.goals}</dd>
                  </div>
                  {booking.payment ? (
                    <div className="wide">
                      <dt>支付</dt>
                      <dd>
                        {booking.payment.h5Url || booking.payment.codeUrl || booking.payment.outTradeNo}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <div className="admin-actions">
                  <button
                    disabled={booking.status !== "pending_review"}
                    onClick={() => updateStatus(booking.id, "confirm")}
                    type="button"
                  >
                    <CheckCircle2 size={17} />
                    确认档期
                  </button>
                  <button
                    disabled={booking.status !== "confirmed_unpaid"}
                    onClick={() => createPayment(booking.id, "h5")}
                    type="button"
                  >
                    <CreditCard size={17} />
                    H5支付
                  </button>
                  <button
                    disabled={booking.status !== "confirmed_unpaid"}
                    onClick={() => createPayment(booking.id, "native")}
                    type="button"
                  >
                    <CreditCard size={17} />
                    扫码支付
                  </button>
                  <button
                    disabled={booking.status !== "paid"}
                    onClick={() => updateStatus(booking.id, "complete")}
                    type="button"
                  >
                    <CheckCircle2 size={17} />
                    完成
                  </button>
                  <button
                    disabled={booking.status === "paid" || booking.status === "completed"}
                    onClick={() => updateStatus(booking.id, "cancel")}
                    type="button"
                  >
                    <XCircle size={17} />
                    取消
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
