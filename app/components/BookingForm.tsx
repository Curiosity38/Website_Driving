"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleGauge,
  Clock3,
  Loader2,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  UserRound
} from "lucide-react";
import {
  formatCny,
  getPackage,
  getPackagesByService,
  lessonPackages,
  timeSlots
} from "@/lib/pricing";
import type {
  Booking,
  BookingInput,
  DrivingLevel,
  PackageId,
  ServiceType
} from "@/lib/types";

const drivingLevels: DrivingLevel[] = [
  "刚取得驾驶证",
  "拿证后很少开车",
  "长时间未独立开车",
  "想练固定路线",
  "其他"
];

const serviceOptions: Array<{
  value: ServiceType;
  title: string;
  description: string;
}> = [
  {
    value: "coach_car",
    title: "教练带车",
    description: "沃尔沃S90 T8，适合先熟悉道路节奏"
  },
  {
    value: "own_car",
    title: "自己带车",
    description: "围绕自己的车和常用路线训练"
  }
];

const dateOptions = buildDateOptions(21);

export default function BookingForm() {
  const [form, setForm] = useState<BookingInput>({
    serviceType: "coach_car",
    packageId: "coach_trial",
    date: "",
    timeSlot: "",
    pickupLocation: "",
    name: "",
    phone: "",
    wechat: "",
    drivingLevel: "拿证后很少开车",
    goals: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  function updateField<Key extends keyof BookingInput>(
    key: Key,
    value: BookingInput[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function selectService(serviceType: ServiceType) {
    const firstPackage = getPackagesByService(serviceType)[0];
    setForm((current) => ({
      ...current,
      serviceType,
      packageId: firstPackage.id
    }));
  }

  function selectPackage(packageId: PackageId) {
    const selected = getPackage(packageId);
    setForm((current) => ({
      ...current,
      packageId,
      serviceType: selected?.serviceType ?? current.serviceType
    }));
  }

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const packageId = String(formData.get("packageId") || form.packageId) as PackageId;
    const submittedPackage = getPackage(packageId);
    const requestPayload: BookingInput = {
      serviceType:
        submittedPackage?.serviceType ??
        (String(formData.get("serviceType") || form.serviceType) as ServiceType),
      packageId,
      date: String(formData.get("date") || "").trim(),
      timeSlot: String(formData.get("timeSlot") || "").trim(),
      pickupLocation: String(formData.get("pickupLocation") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      wechat: String(formData.get("wechat") || "").trim(),
      drivingLevel: String(formData.get("drivingLevel") || "其他") as DrivingLevel,
      goals: String(formData.get("goals") || "").trim()
    };

    setError("");
    setCreatedBooking(null);
    setStatus("submitting");

    if (process.env.NEXT_PUBLIC_STATIC_SITE === "true") {
      setStatus("idle");
      setError(
        "GitHub Pages 静态站暂不保存预约。请通过电话或微信联系教练，并发送你选择的套餐、日期、时间段和上车地点。"
      );
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });
      const responsePayload = (await response.json()) as {
        booking?: Booking;
        error?: string;
      };

      if (!response.ok || !responsePayload.booking) {
        throw new Error(responsePayload.error || "预约提交失败，请稍后再试。");
      }

      setCreatedBooking(responsePayload.booking);
      setStatus("success");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "预约提交失败。");
      setStatus("idle");
    }
  }

  return (
    <form className="booking-form" onSubmit={submitBooking}>
      <div className="form-section">
        <div className="section-kicker">
          <CircleGauge size={18} />
          选择陪练方式与套餐
        </div>
        <div className="form-grid">
          <label className="field">
            <span>
              <CircleGauge size={17} />
              陪练方式
            </span>
            <select
              name="serviceType"
              defaultValue={form.serviceType}
              onChange={(event) => selectService(event.target.value as ServiceType)}
              onInput={(event) =>
                selectService((event.currentTarget as HTMLSelectElement).value as ServiceType)
              }
              required
            >
              {serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.title} - {option.description}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>
              <CheckCircle2 size={17} />
              套餐
            </span>
            <select
              name="packageId"
              defaultValue={form.packageId}
              onChange={(event) => selectPackage(event.target.value as PackageId)}
              onInput={(event) =>
                selectPackage((event.currentTarget as HTMLSelectElement).value as PackageId)
              }
              required
            >
              {lessonPackages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.serviceType === "coach_car" ? "教练带车" : "自带车"} - {item.title}，
                  {formatCny(item.price)} / {item.unit}
                  {item.id.endsWith("_trial") ? "（仅首次价格）" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="selected-plan">
          <strong>选择提示</strong>
          <span>
            套餐下拉中已标注服务类型、价格和时长；最终付款金额按所选套餐生成。
          </span>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>
            <CalendarDays size={17} />
            预约日期
          </span>
          <select
            aria-label="选择预约日期"
            name="date"
            onChange={(event) => updateField("date", event.target.value)}
            required
          >
            <option value="">请选择日期</option>
            {dateOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>
            <Clock3 size={17} />
            时间段
          </span>
          <select
            name="timeSlot"
            onChange={(event) => updateField("timeSlot", event.target.value)}
            required
          >
            <option value="">请选择</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>
          <MapPin size={17} />
          上车地点
        </span>
        <input
          name="pickupLocation"
          onChange={(event) => updateField("pickupLocation", event.target.value)}
          placeholder="例如：沈河区市府广场A口 / 小区南门"
          required
          value={form.pickupLocation}
        />
      </label>

      <div className="form-grid">
        <label className="field">
          <span>
            <UserRound size={17} />
            姓名
          </span>
          <input
            name="name"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="您的称呼"
            required
            value={form.name}
          />
        </label>

        <label className="field">
          <span>
            <Phone size={17} />
            联系电话
          </span>
          <input
            inputMode="tel"
            name="phone"
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="手机或电话"
            required
            value={form.phone}
          />
        </label>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>
            <MessageSquareText size={17} />
            微信号
          </span>
          <input
            name="wechat"
            onChange={(event) => updateField("wechat", event.target.value)}
            placeholder="用于确认档期和发送支付链接"
            required
            value={form.wechat}
          />
        </label>

        <label className="field">
          <span>
            <CircleGauge size={17} />
            驾驶基础
          </span>
          <select
            name="drivingLevel"
            onChange={(event) =>
              updateField("drivingLevel", event.target.value as DrivingLevel)
            }
            required
            defaultValue={form.drivingLevel}
          >
            {drivingLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>
          <MessageSquareText size={17} />
          想练什么
        </span>
        <textarea
          name="goals"
          onChange={(event) => updateField("goals", event.target.value)}
          placeholder="例如：想练单位到家的通勤路线、地下车库停车、早晚高峰跟车、变道并线。"
          required
          rows={4}
          value={form.goals}
        />
      </label>

      <div className="booking-summary" aria-live="polite">
        <div>
          <span>预计费用</span>
          <strong>按所选套餐生成</strong>
        </div>
        <p>提交后进入待教练确认状态。首次预约赠送安全驾驶技巧手册，确认档期后再付款。</p>
      </div>

      {error ? <p className="form-alert error">{error}</p> : null}
      {createdBooking ? (
        <div className="form-alert success">
          <CheckCircle2 size={18} />
          <span>
            预约已提交，编号 {createdBooking.id}。教练确认后会通过微信或电话联系付款。
          </span>
        </div>
      ) : null}

      <button className="primary-submit" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? (
          <Loader2 className="spin" size={19} />
        ) : (
          <Send size={19} />
        )}
        提交预约
      </button>
    </form>
  );
}

function buildDateOptions(days: number) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  });

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.now() + index * 24 * 60 * 60 * 1000);
    const value = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
    const labelPrefix = index === 0 ? "今天" : index === 1 ? "明天" : formatter.format(date);
    return {
      value,
      label: `${labelPrefix} ${value}`
    };
  });
}
