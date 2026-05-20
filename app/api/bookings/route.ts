import { NextResponse } from "next/server";
import { getPackage } from "@/lib/pricing";
import { createBooking, listBookings } from "@/lib/store";
import { ApiError, assertCoachAuthorized, validateBookingInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    assertCoachAuthorized(request);
    const bookings = await listBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = validateBookingInput(await request.json());
    const selectedPackage = getPackage(input.packageId);
    if (!selectedPackage) {
      throw new ApiError(400, "套餐不存在。");
    }

    const booking = await createBooking({
      ...input,
      status: "pending_review",
      quotedAmount: selectedPackage.price,
      currency: "CNY"
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "服务器错误。";
  return NextResponse.json({ error: message }, { status: 500 });
}
