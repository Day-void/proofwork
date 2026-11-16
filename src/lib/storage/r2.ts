import { env } from "@/config/env";

function configuration() {
  const { R2_ACCOUNT_ID: accountId, R2_ACCESS_KEY_ID: accessKey, R2_SECRET_ACCESS_KEY: secretKey, R2_BUCKET_NAME: bucket } = env;
  if (!accountId || !accessKey || !secretKey || !bucket) throw new Error("Cloudflare R2 is not configured.");
  return { accountId, accessKey, secretKey, bucket };
}

const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
const encoded = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

async function hmac(key: Uint8Array, value: string) {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value)));
}

export async function createR2PresignedUrl(method: "PUT" | "GET", key: string, expires = 300, constraints?: { contentType: string; contentLength: number }) {
  const { accountId, accessKey, secretKey, bucket } = configuration();
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = amzDate.slice(0, 8);
  const scope = `${day}/auto/s3/aws4_request`;
  const path = `/${encoded(bucket)}/${key.split("/").map(encoded).join("/")}`;
  const signedHeaders = constraints ? "content-length;content-type;host" : "host";
  const values: Array<[string, string]> = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${accessKey}/${scope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expires)],
    ["X-Amz-SignedHeaders", signedHeaders],
  ];
  const canonicalQuery = values.map(([name, value]) => [encoded(name), encoded(value)] as const)
    .sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `${name}=${value}`).join("&");
  const canonicalHeaders = constraints
    ? `content-length:${constraints.contentLength}\ncontent-type:${constraints.contentType}\nhost:${host}\n`
    : `host:${host}\n`;
  const canonicalRequest = `${method}\n${path}\n${canonicalQuery}\n${canonicalHeaders}\n${signedHeaders}\nUNSIGNED-PAYLOAD`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${hex(await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest)))}`;
  const kDate = await hmac(encoder.encode(`AWS4${secretKey}`), day);
  const kRegion = await hmac(kDate, "auto");
  const kService = await hmac(kRegion, "s3");
  const kSigning = await hmac(kService, "aws4_request");
  const signature = hex(await crypto.subtle.sign("HMAC", await crypto.subtle.importKey("raw", kSigning, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]), encoder.encode(stringToSign)));
  return `https://${host}${path}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
