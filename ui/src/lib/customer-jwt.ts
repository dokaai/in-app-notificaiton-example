const JWT_ALGORITHM = "RS256";
const DEFAULT_REFRESH_BUFFER_MS = 60 * 1000;

export interface BuildCustomerJwtInput {
  privateKey: string;
  signingKeyId: string;
  uniqueCustomerId: string;
  workspaceId: string;
  productSpaceCode: string;
  expiresIn?: string;
}

export interface RefreshCustomerJwtInput extends BuildCustomerJwtInput {
  currentToken: string;
  refreshBufferMs?: number;
}

function normalizePrivateKey(privateKey: string) {
  return privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey;
}

function encodeBase64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  return atob(`${normalized}${"=".repeat(paddingLength)}`);
}

function encodeObjectBase64Url(value: Record<string, unknown>) {
  return encodeBase64Url(JSON.stringify(value));
}

function pemToArrayBuffer(pem: string) {
  const normalized = normalizePrivateKey(pem)
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function getExpirationTime(expiresIn: string | undefined, issuedAtSeconds: number) {
  const fallbackSeconds = 15 * 60;

  if (!expiresIn) {
    return issuedAtSeconds + fallbackSeconds;
  }

  const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());

  if (!match) {
    return issuedAtSeconds + fallbackSeconds;
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

export async function buildCustomerJwt({
  privateKey,
  signingKeyId,
  uniqueCustomerId,
  workspaceId,
  productSpaceCode,
  expiresIn,
}: BuildCustomerJwtInput) {
  const header = {
    alg: JWT_ALGORITHM,
    typ: "JWT",
    kid: signingKeyId,
  };
  const issuedAtSeconds = Math.floor(Date.now() / 1000);
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

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(message)
  );
  const signatureBytes = new Uint8Array(signature);
  let signatureBinary = "";

  for (let index = 0; index < signatureBytes.length; index += 1) {
    signatureBinary += String.fromCharCode(signatureBytes[index]);
  }

  const encodedSignature = encodeBase64Url(signatureBinary);

  return `${message}.${encodedSignature}`;
}

export async function refreshCustomerJwtIfNeeded({
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

  const jwtToken = await buildCustomerJwt(input);

  return {
    jwtToken,
    refreshed: true,
    expirationTime: getCustomerJwtExpirationTime(jwtToken),
  };
}
