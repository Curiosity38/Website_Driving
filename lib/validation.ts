import { getPackage, timeSlots } from "./pricing";
import type { BookingInput, DrivingLevel, ServiceType } from "./types";

const serviceTypes: ServiceType[] = ["own_car", "coach_car"];
const drivingLevels: DrivingLevel[] = [
  "刚取得驾驶证",
  "拿证后很少开车",
  "长时间未独立开车",
  "想练固定路线",
  "其他"
];

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function validateBookingInput(value: unknown): BookingInput {
  if (!value || typeof value !== "object") {
    throw new ApiError(400, "提交内容格式不正确。");
  }

  const data = value as Record<string, unknown>;
  const serviceType = data.serviceType;
  const packageId = data.packageId;
  const date = clean(data.date);
  const timeSlot = clean(data.timeSlot);
  const pickupLocation = clean(data.pickupLocation);
  const name = clean(data.name);
  const phone = clean(data.phone);
  const wechat = clean(data.wechat);
  const drivingLevel = data.drivingLevel;
  const goals = clean(data.goals);

  if (!serviceTypes.includes(serviceType as ServiceType)) {
    throw new ApiError(400, "请选择自带车或教练带车。");
  }

  const selectedPackage = getPackage(packageId as never);
  if (!selectedPackage || selectedPackage.serviceType !== serviceType) {
    throw new ApiError(400, "请选择有效套餐。");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(400, "请选择预约日期。");
  }

  const selectedDate = new Date(`${date}T00:00:00+08:00`);
  const today = new Date();
  const todayInChina = new Date(
    `${new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(today)}T00:00:00+08:00`
  );
  if (selectedDate < todayInChina) {
    throw new ApiError(400, "预约日期不能早于今天。");
  }

  if (!timeSlots.includes(timeSlot)) {
    throw new ApiError(400, "请选择有效时间段。");
  }

  if (pickupLocation.length < 4) {
    throw new ApiError(400, "请填写具体上车地点。");
  }

  if (name.length < 2) {
    throw new ApiError(400, "请填写姓名。");
  }

  if (!/^[0-9+\-\s]{7,20}$/.test(phone)) {
    throw new ApiError(400, "请填写可联系的手机号或电话。");
  }

  if (wechat.length < 2) {
    throw new ApiError(400, "请填写微信号，便于确认档期和发送付款链接。");
  }

  if (!drivingLevels.includes(drivingLevel as DrivingLevel)) {
    throw new ApiError(400, "请选择驾驶基础。");
  }

  if (goals.length < 6) {
    throw new ApiError(400, "请简单说明想练习的内容。");
  }

  return {
    serviceType: serviceType as ServiceType,
    packageId: packageId as never,
    date,
    timeSlot,
    pickupLocation,
    name,
    phone,
    wechat,
    drivingLevel: drivingLevel as DrivingLevel,
    goals
  };
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getRequestToken(request: Request) {
  const url = new URL(request.url);
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  return bearer || url.searchParams.get("token") || "";
}

export function assertCoachAuthorized(request: Request) {
  const configured = process.env.COACH_ADMIN_TOKEN;

  if (!configured && process.env.NODE_ENV !== "production") {
    return;
  }

  if (!configured) {
    throw new ApiError(500, "未配置 COACH_ADMIN_TOKEN。");
  }

  if (getRequestToken(request) !== configured) {
    throw new ApiError(401, "教练管理权限校验失败。");
  }
}
