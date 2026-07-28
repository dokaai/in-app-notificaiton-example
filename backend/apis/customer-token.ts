import { createSign } from "crypto";
import { jsonError } from "../lib/respond";

const JWT_ALGORITHM = "RS256";
const DEFAULT_EXPIRES_IN = "15m";
const DEFAULT_REFRESH_BUFFER_MS = 60 * 1000;

export interface GenerateCustomerJwtInput {
  privateKey: string;
  signingKeyId: string;
  uniqueCustomerId: string;
  workspaceId: string;
  productSpaceCode: string;
  expiresIn?: string;
}

export interface RefreshCustomerJwtInput extends GenerateCustomerJwtInput {
  currentToken: string;
  refreshBufferMs?: number;
}

interface CustomerTokenRequest {
  privateKey: string;
  signingKeyId: string;
  uniqueCustomerId: string;
  workspaceId: string;
  productSpaceCode: string;
  currentToken?: string;
  expiresIn?: string;
}

function normalizePrivateKey(privateKey: string) {
  return privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey;
}

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encodeObjectBase64Url(value: Record<string, unknown>) {
  return encodeBase64Url(JSON.stringify(value));
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(`${normalized}${"=".repeat(paddingLength)}`, "base64").toString(
    "utf8"
  );
}

function getExpirationTime(expiresIn: string | undefined, issuedAtSeconds: number) {
  const match = /^(\d+)([smhd])$/.exec((expiresIn ?? DEFAULT_EXPIRES_IN).trim());

  if (!match) {
    return issuedAtSeconds + 15 * 60;
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multiplier =
    unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3600 : 86400;

  return issuedAtSeconds + value * multiplier;
}

function parseJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getCustomerJwtExpirationTime(token: string) {
  const payload = parseJwtPayload(token);
  const exp = payload?.exp;

  return typeof exp === "number" ? exp * 1000 : null;
}

export function shouldRefreshCustomerJwt(
  token: string,
  refreshBufferMs = DEFAULT_REFRESH_BUFFER_MS
) {
  const expirationTime = getCustomerJwtExpirationTime(token);

  if (!expirationTime) {
    return true;
  }

  return expirationTime - Date.now() <= refreshBufferMs;
}

export function generateCustomerJwt({
  privateKey,
  signingKeyId,
  uniqueCustomerId,
  workspaceId,
  productSpaceCode,
  expiresIn,
}: GenerateCustomerJwtInput) {
  const issuedAtSeconds = Math.floor(Date.now() / 1000);
  const header = {
    alg: JWT_ALGORITHM,
    typ: "JWT",
    kid: signingKeyId,
  };
  const payload = {
    type: "customer",
    workspace_id: workspaceId,
    product_space_code: productSpaceCode,
    sub: uniqueCustomerId,
    iat: issuedAtSeconds,
    exp: getExpirationTime(expiresIn, issuedAtSeconds),
    jti: `customer-${uniqueCustomerId}-${Date.now()}`,
  };
  const encodedHeader = encodeObjectBase64Url(header);
  const encodedPayload = encodeObjectBase64Url(payload);
  const message = `${encodedHeader}.${encodedPayload}`;
  const signer = createSign("RSA-SHA256");

  signer.update(message);
  signer.end();

  const signature = signer.sign(normalizePrivateKey(privateKey));

  return {
    jwtToken: `${message}.${encodeBase64Url(signature)}`,
    expirationTime: payload.exp * 1000,
  };
}

export function refreshCustomerJwtIfNeeded({
  currentToken,
  refreshBufferMs = DEFAULT_REFRESH_BUFFER_MS,
  ...input
}: RefreshCustomerJwtInput) {
  if (!shouldRefreshCustomerJwt(currentToken, refreshBufferMs)) {
    return {
      jwtToken: currentToken,
      refreshed: false,
      expirationTime: getCustomerJwtExpirationTime(currentToken),
    };
  }

  return {
    ...generateCustomerJwt(input),
    refreshed: true,
  };
}

function validateString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CustomerTokenRequest>;
    const privateKey = body.privateKey;
    const signingKeyId = body.signingKeyId;
    const uniqueCustomerId = body.uniqueCustomerId;
    const workspaceId = body.workspaceId;
    const productSpaceCode = body.productSpaceCode;
    const currentToken = body.currentToken;

    if (
      !validateString(privateKey) ||
      !validateString(signingKeyId) ||
      !validateString(uniqueCustomerId) ||
      !validateString(workspaceId) ||
      !validateString(productSpaceCode)
    ) {
      return Response.json(
        {
          success: false,
          message: "Missing customer token payload.",
        },
        { status: 400 }
      );
    }

    const input = {
      privateKey: privateKey.trim(),
      signingKeyId: signingKeyId.trim(),
      uniqueCustomerId: uniqueCustomerId.trim(),
      workspaceId: workspaceId.trim(),
      productSpaceCode: productSpaceCode.trim(),
      expiresIn: body.expiresIn?.trim(),
    };
    const result = validateString(currentToken)
      ? refreshCustomerJwtIfNeeded({
          ...input,
          currentToken: currentToken.trim(),
        })
      : {
          ...generateCustomerJwt(input),
          refreshed: true,
        };

    return Response.json({
      success: true,
      message: result.refreshed
        ? "Customer JWT minted successfully."
        : "Customer JWT is still valid.",
      jwtToken: result.jwtToken,
      expirationTime: result.expirationTime,
      refreshed: result.refreshed,
    });
  } catch (error) {
    return jsonError(error, "Unable to mint customer JWT.");
  }
}
