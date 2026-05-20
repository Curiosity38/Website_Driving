import { NextResponse } from "next/server";
import { updateBookingByOutTradeNo } from "@/lib/store";
import {
  decryptWechatResource,
  verifyWechatNotifySignature
} from "@/lib/wechat-pay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    verifyWechatNotifySignature(request.headers, rawBody);
    const payload = JSON.parse(rawBody) as {
      resource?: {
        associated_data?: string;
        nonce: string;
        ciphertext: string;
      };
    };

    if (!payload.resource) {
      throw new Error("微信支付回调缺少 resource。");
    }

    const transaction = decryptWechatResource(payload.resource);

    if (transaction.trade_state === "SUCCESS") {
      await updateBookingByOutTradeNo(transaction.out_trade_no, (booking) => ({
        ...booking,
        status: "paid",
        payment: booking.payment
          ? {
              ...booking.payment,
              transactionId: transaction.transaction_id,
              paidAt: new Date().toISOString()
            }
          : booking.payment
      }));
    }

    return NextResponse.json({ code: "SUCCESS", message: "成功" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "失败";
    return NextResponse.json({ code: "FAIL", message }, { status: 500 });
  }
}
