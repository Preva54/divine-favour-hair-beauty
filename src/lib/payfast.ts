import { createHash } from "crypto";
import { SALON } from "@/lib/constants";

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID ?? "";
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY ?? "";
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE ?? "";
const SANDBOX = ["1", "true", "yes"].includes((process.env.PAYFAST_SANDBOX ?? "1").toLowerCase());

export const payfastConfigured = Boolean(MERCHANT_ID && MERCHANT_KEY);

export const PAYFAST_URLS = SANDBOX
  ? { site: "https://sandbox.payfast.co.za", validate: "https://sandbox.payfast.co.za/eng/query/validate" }
  : { site: "https://www.payfast.co.za", validate: "https://www.payfast.co.za/eng/query/validate" };

const baseUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function payfastSignature(params: Record<string, string>): string {
  const pairs = Object.keys(params)
    .filter((k) => k !== "signature" && params[k] !== "" && params[k] != null)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`);
  let query = pairs.join("&");
  if (PASSPHRASE) query += `&passphrase=${encodeURIComponent(PASSPHRASE).replace(/%20/g, "+")}`;
  return createHash("md5").update(query).digest("hex");
}

export function verifyPayfastSignature(params: Record<string, string>): boolean {
  if (!params.signature) return false;
  return payfastSignature(params) === params.signature;
}

export interface PayfastOrder {
  ref: string;
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
}

export function buildPayfastUrl(order: PayfastOrder): string {
  const params: Record<string, string> = {
    merchant_id: MERCHANT_ID,
    merchant_key: MERCHANT_KEY,
    return_url: `${baseUrl()}/api/payments/payfast/return?ref=${order.ref}`,
    cancel_url: `${baseUrl()}/api/payments/payfast/cancel?ref=${order.ref}`,
    notify_url: `${baseUrl()}/api/payments/payfast/notify`,
    name_first: order.firstName,
    name_last: order.lastName,
    email_address: order.email,
    m_payment_id: order.ref,
    amount: order.amount.toFixed(2),
    item_name: `Divine Favour order ${order.ref}`,
    item_description: `${SALON.name} — order ${order.ref}`,
    custom_str1: order.ref,
  };
  params.signature = payfastSignature(params);
  const query = Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
  return `${PAYFAST_URLS.site}/eng/process?${query}`;
}
