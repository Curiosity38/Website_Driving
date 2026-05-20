import { NextResponse } from "next/server";
import { getBooking, updateBooking } from "@/lib/store";
import { createWechatOrder, isWechatPayConfigured } from "@/lib/wechat-pay";
import { ApiError } from "@/lib/validation";
import type { PaymentChannel } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      bookingId?: string;
      channel?: PaymentChannel;
    };
    const bookingId = body.bookingId?.trim();
    const channel = body.channel === "native" ? "native" : "h5";

    if (!bookingId) {
      throw new ApiError(400, "缺少 bookingId。");
    }

    const booking = await getBooking(bookingId);
    if (!booking) {
      throw new ApiError(404, "预约不存在。");
    }

    if (booking.status === "pending_review") {
      throw new ApiError(409, "教练确认档期后才能付款。");
    }

    if (booking.status === "cancelled") {
      throw new ApiError(409, "预约已取消，不能付款。");
    }

    if (booking.status === "paid" || booking.status === "completed") {
      return NextResponse.json({ booking });
    }

    if (!isWechatPayConfigured() && process.env.WECHAT_PAY_MOCK !== "true") {
      throw new ApiError(
        503,
        "微信支付未配置。请设置商户号、AppID、证书序列号、私钥、API v3 密钥和回调地址。"
      );
    }

    const outTradeNo = `${booking.id}${Date.now().toString().slice(-8)}`;
    const payment = await createWechatOrder({
      booking,
      channel,
      outTradeNo,
      clientIp: getClientIp(request)
    });

    const updated = await updateBooking(booking.id, (current) => ({
      ...current,
      payment: {
        outTradeNo: payment.outTradeNo,
        channel: payment.channel,
        h5Url: payment.h5Url,
        codeUrl: payment.codeUrl,
        createdAt: new Date().toISOString()
      }
    }));

    return NextResponse.json({ booking: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "服务器错误。";
  return NextResponse.json({ error: message }, { status: 500 });
}
