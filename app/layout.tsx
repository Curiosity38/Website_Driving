import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "沈阳计时陪练预约 | 沃尔沃S90 T8专业陪练",
  description:
    "沈阳高端汽车陪练预约，自带车或沃尔沃S90 T8陪练，30年驾龄、100万公里以上经验、硕士讲师资质。"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f3ee"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
