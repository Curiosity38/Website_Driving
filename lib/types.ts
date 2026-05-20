export type ServiceType = "own_car" | "coach_car";

export type PackageId =
  | "own_trial"
  | "own_6h"
  | "own_10h"
  | "coach_trial"
  | "coach_6h"
  | "coach_10h";

export type BookingStatus =
  | "pending_review"
  | "confirmed_unpaid"
  | "paid"
  | "completed"
  | "cancelled";

export type DrivingLevel =
  | "刚取得驾驶证"
  | "拿证后很少开车"
  | "长时间未独立开车"
  | "想练固定路线"
  | "其他";

export type PaymentChannel = "h5" | "native";

export interface LessonPackage {
  id: PackageId;
  serviceType: ServiceType;
  title: string;
  badge: string;
  hours: number;
  price: number;
  unit: string;
  description: string;
  features: string[];
}

export interface BookingInput {
  serviceType: ServiceType;
  packageId: PackageId;
  date: string;
  timeSlot: string;
  pickupLocation: string;
  name: string;
  phone: string;
  wechat: string;
  drivingLevel: DrivingLevel;
  goals: string;
}

export interface Booking extends BookingInput {
  id: string;
  status: BookingStatus;
  quotedAmount: number;
  currency: "CNY";
  createdAt: string;
  updatedAt: string;
  payment?: {
    outTradeNo: string;
    channel: PaymentChannel;
    h5Url?: string;
    codeUrl?: string;
    transactionId?: string;
    paidAt?: string;
    createdAt: string;
  };
}
