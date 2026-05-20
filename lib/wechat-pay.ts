import crypto from "node:crypto";
import type { Booking, PaymentChannel } from "./types";

interface WeChatOrderInput {
  booking: Booking;
  channel: PaymentChannel;
  outTradeNo: string;
  clientIp: string;
}

interface WeChatOrderResult {
  outTradeNo: string;
  channel: PaymentChannel;
  h5Url?: string;
  codeUrl?: string;
}

interface WeChatConfig {
  mchId: string;
  appId: string;
  serialNo: string;
  privateKey: string;
  apiV3Key: string;
  notifyUrl: string;
}

export function isWechatPayConfigured() {
  return Boolean(
    process.env.WECHAT_PAY_MCH_ID &&
      process.env.WECHAT_PAY_APPID &&
      process.env.WECHAT_PAY_SERIAL_NO &&
      process.env.WECHAT_PAY_PRIVATE_KEY &&
      process.env.WECHAT_PAY_API_V3_KEY &&
      getNotifyUrl()
  );
}

export async function createWechatOrder({
  booking,
  channel,
  outTradeNo,
  clientIp
}: WeChatOrderInput): Promise<WeChatOrderResult> {
  if (process.env.WECHAT_PAY_MOCK === "true") {
    return channel === "h5"
      ? {
          outTradeNo,
          channel,
          h5Url: `weixin://wxpay/mock?order=${encodeURIComponent(outTradeNo)}`
        }
      : {
          outTradeNo,
          channel,
          codeUrl: `weixin://wxpay/native/mock/${encodeURIComponent(outTradeNo)}`
        };
  }

  const config = getConfig();
  const endpoint =
    channel === "h5"
      ? "/v3/pay/transactions/h5"
      : "/v3/pay/transactions/native";
  const body = {
    appid: config.appId,
    mchid: config.mchId,
    description: `沈阳计时陪练-${booking.id}`,
    out_trade_no: outTradeNo,
    notify_url: config.notifyUrl,
    amount: {
      total: booking.quotedAmount * 100,
      currency: "CNY"
    },
    ...(channel === "h5"
      ? {
          scene_info: {
            payer_client_ip: clientIp || "127.0.0.1",
            h5_info: {
              type: "Wap"
            }
          }
        }
      : {})
  };
  const rawBody = JSON.stringify(body);
  const authorization = buildAuthorizationHeader(
    "POST",
    endpoint,
    rawBody,
    config
  );

  const response = await fetch(`https://api.mch.weixin.qq.com${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: rawBody
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`微信支付下单失败：${response.status} ${responseText}`);
  }

  const payload = JSON.parse(responseText) as {
    h5_url?: string;
    code_url?: string;
  };

  return {
    outTradeNo,
    channel,
    h5Url: payload.h5_url,
    codeUrl: payload.code_url
  };
}

export function verifyWechatNotifySignature(
  headers: Headers,
  rawBody: string
) {
  const publicKey = normalizePublicKey(process.env.WECHAT_PAY_PLATFORM_PUBLIC_KEY);
  if (!publicKey) {
    throw new Error("未配置 WECHAT_PAY_PLATFORM_PUBLIC_KEY，无法验签微信回调。");
  }

  const timestamp = headers.get("wechatpay-timestamp");
  const nonce = headers.get("wechatpay-nonce");
  const signature = headers.get("wechatpay-signature");
  if (!timestamp || !nonce || !signature) {
    throw new Error("微信支付回调缺少签名头。");
  }

  const message = `${timestamp}\n${nonce}\n${rawBody}\n`;
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(message);
  verifier.end();
  const ok = verifier.verify(publicKey, signature, "base64");
  if (!ok) {
    throw new Error("微信支付回调签名校验失败。");
  }
}

export function decryptWechatResource(resource: {
  associated_data?: string;
  nonce: string;
  ciphertext: string;
}) {
  const apiV3Key = process.env.WECHAT_PAY_API_V3_KEY;
  if (!apiV3Key) {
    throw new Error("未配置 WECHAT_PAY_API_V3_KEY。");
  }

  const encrypted = Buffer.from(resource.ciphertext, "base64");
  const authTag = encrypted.subarray(encrypted.length - 16);
  const ciphertext = encrypted.subarray(0, encrypted.length - 16);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(apiV3Key, "utf8"),
    Buffer.from(resource.nonce, "utf8")
  );

  if (resource.associated_data) {
    decipher.setAAD(Buffer.from(resource.associated_data, "utf8"));
  }
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString("utf8");

  return JSON.parse(decrypted) as {
    out_trade_no: string;
    transaction_id?: string;
    trade_state?: string;
  };
}

function getConfig(): WeChatConfig {
  const config = {
    mchId: process.env.WECHAT_PAY_MCH_ID,
    appId: process.env.WECHAT_PAY_APPID,
    serialNo: process.env.WECHAT_PAY_SERIAL_NO,
    privateKey: normalizePrivateKey(process.env.WECHAT_PAY_PRIVATE_KEY),
    apiV3Key: process.env.WECHAT_PAY_API_V3_KEY,
    notifyUrl: getNotifyUrl()
  };

  for (const [key, value] of Object.entries(config)) {
    if (!value) {
      throw new Error(`微信支付未配置：${key}`);
    }
  }

  return config as WeChatConfig;
}

function getNotifyUrl() {
  return (
    process.env.WECHAT_PAY_NOTIFY_URL ||
    (process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/api/payments/wechat/notify`
      : "")
  );
}

function buildAuthorizationHeader(
  method: string,
  urlPath: string,
  body: string,
  config: WeChatConfig
) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const message = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(message);
  signer.end();
  const signature = signer.sign(config.privateKey, "base64");

  return [
    "WECHATPAY2-SHA256-RSA2048",
    `mchid="${config.mchId}"`,
    `nonce_str="${nonce}"`,
    `signature="${signature}"`,
    `timestamp="${timestamp}"`,
    `serial_no="${config.serialNo}"`
  ].join(",");
}

function normalizePrivateKey(value?: string) {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.includes("BEGIN")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  return Buffer.from(trimmed, "base64").toString("utf8");
}

function normalizePublicKey(value?: string) {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.includes("BEGIN")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  return Buffer.from(trimmed, "base64").toString("utf8");
}
