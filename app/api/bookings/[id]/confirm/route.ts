import { NextResponse } from "next/server";
import { updateBooking } from "@/lib/store";
import { ApiError, assertCoachAuthorized } from "@/lib/validation";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    assertCoachAuthorized(request);
    const { id } = await context.params;
    const body = await readOptionalJson(request);
    const action = body.action ?? "confirm";

    if (!["confirm", "cancel", "complete"].includes(action)) {
      throw new ApiError(400, "不支持的确认动作。");
    }

    const booking = await updateBooking(id, (current) => {
      if (action === "confirm") {
        return {
          ...current,
          status:
            current.status === "paid" || current.status === "completed"
              ? current.status
              : "confirmed_unpaid"
        };
      }

      if (action === "cancel") {
        return {
          ...current,
          status: "cancelled"
        };
      }

      return {
        ...current,
        status: current.status === "paid" ? "completed" : current.status
      };
    });

    if (!booking) {
      throw new ApiError(404, "预约不存在。");
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return toErrorResponse(error);
  }
}

async function readOptionalJson(request: Request) {
  try {
    return (await request.json()) as { action?: "confirm" | "cancel" | "complete" };
  } catch {
    return {};
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "服务器错误。";
  return NextResponse.json({ error: message }, { status: 500 });
}
