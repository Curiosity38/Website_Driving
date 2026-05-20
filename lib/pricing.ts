import type { LessonPackage, PackageId, ServiceType } from "./types";

export const lessonPackages: LessonPackage[] = [
  {
    id: "own_trial",
    serviceType: "own_car",
    title: "自带车体验",
    badge: "首次建议",
    hours: 2,
    price: 198,
    unit: "2小时",
    description: "熟悉自己的车，从座椅、后视镜、刹车脚感到小区周边路线。",
    features: ["2小时起练", "适合新车主", "油费停车费自理"]
  },
  {
    id: "own_6h",
    serviceType: "own_car",
    title: "自带车进阶",
    badge: "通勤适应",
    hours: 6,
    price: 720,
    unit: "6小时",
    description: "分2到3次训练，覆盖小区出入、主干路、停车和常用通勤路线。",
    features: ["等效120元/小时", "路线可定制", "适合多年未开"]
  },
  {
    id: "own_10h",
    serviceType: "own_car",
    title: "自带车系统提升",
    badge: "更稳上路",
    hours: 10,
    price: 1150,
    unit: "10小时",
    description: "完整建立观察、预判、变道、停车、复杂路口和独立驾驶习惯。",
    features: ["等效115元/小时", "课后复盘", "适合长期巩固"]
  },
  {
    id: "coach_trial",
    serviceType: "coach_car",
    title: "S90 T8体验",
    badge: "安全评估",
    hours: 2,
    price: 298,
    unit: "2小时",
    description: "使用沃尔沃S90 T8训练，先在更稳定的车况中评估驾驶问题。",
    features: ["2小时起练", "含市内车辆使用", "适合不敢上路"]
  },
  {
    id: "coach_6h",
    serviceType: "coach_car",
    title: "S90 T8标准课",
    badge: "热门选择",
    hours: 6,
    price: 1050,
    unit: "6小时",
    description: "用高端轿车完成城市道路、车距控制、转向节奏和停车训练。",
    features: ["等效175元/小时", "分次预约", "含普通道路用车"]
  },
  {
    id: "coach_10h",
    serviceType: "coach_car",
    title: "S90 T8精品课",
    badge: "系统陪练",
    hours: 10,
    price: 1680,
    unit: "10小时",
    description: "适合希望系统提升独立驾驶能力的人，覆盖日常复杂场景。",
    features: ["等效168元/小时", "定制训练计划", "课后问题跟踪"]
  }
];

export const timeSlots = [
  "08:00-10:00",
  "10:30-12:30",
  "13:30-15:30",
  "16:00-18:00",
  "19:00-21:00"
];

export function getPackagesByService(serviceType: ServiceType) {
  return lessonPackages.filter((item) => item.serviceType === serviceType);
}

export function getPackage(packageId: PackageId) {
  return lessonPackages.find((item) => item.id === packageId);
}

export function formatCny(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value);
}
