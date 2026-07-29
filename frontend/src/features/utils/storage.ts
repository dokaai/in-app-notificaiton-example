const STORAGE_KEYS = {
  customerUniqueCustomerId: "dokaai-demo-customer-unique-customer-id",
  customerWorkspaceId: "dokaai-demo-customer-workspace-id",
  customerProductSpaceCode: "dokaai-demo-customer-product-space-code",
  jwtToken: "dokaai-demo-jwt-token",
} as const;

const SESSION_STORAGE_KEYS = {
  customerJwtPrivateKey: "dokaai-demo-session-customer-jwt-private-key",
  customerSigningKeyId: "dokaai-demo-session-customer-signing-key-id",
} as const;

function clearLegacyTokenGenerationKeys() {
  localStorage.removeItem("dokaai-demo-customer-jwt-private-key");
  localStorage.removeItem("dokaai-demo-customer-signing-key-id");
}

export function saveAuthToStorage(payload: {
  customerUniqueCustomerId: string;
  customerWorkspaceId: string;
  customerProductSpaceCode: string;
  jwtToken: string;
}) {
  if (typeof window === "undefined") return;

  clearLegacyTokenGenerationKeys();
  localStorage.setItem(
    STORAGE_KEYS.customerUniqueCustomerId,
    payload.customerUniqueCustomerId
  );
  localStorage.setItem(STORAGE_KEYS.customerWorkspaceId, payload.customerWorkspaceId);
  localStorage.setItem(
    STORAGE_KEYS.customerProductSpaceCode,
    payload.customerProductSpaceCode
  );
  localStorage.setItem(STORAGE_KEYS.jwtToken, payload.jwtToken);
}

export function saveJwtTokenToStorage(jwtToken: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEYS.jwtToken, jwtToken);
}

export function saveTokenGenerationValuesToSession(payload: {
  customerJwtPrivateKey: string;
  customerSigningKeyId: string;
}) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    SESSION_STORAGE_KEYS.customerJwtPrivateKey,
    payload.customerJwtPrivateKey
  );
  sessionStorage.setItem(
    SESSION_STORAGE_KEYS.customerSigningKeyId,
    payload.customerSigningKeyId
  );
}

export function readTokenGenerationValuesFromSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const customerJwtPrivateKey = sessionStorage.getItem(
    SESSION_STORAGE_KEYS.customerJwtPrivateKey
  );
  const customerSigningKeyId = sessionStorage.getItem(
    SESSION_STORAGE_KEYS.customerSigningKeyId
  );

  if (!customerJwtPrivateKey || !customerSigningKeyId) {
    return null;
  }

  return {
    customerJwtPrivateKey,
    customerSigningKeyId,
  };
}

export function clearTokenGenerationValuesFromSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(SESSION_STORAGE_KEYS.customerJwtPrivateKey);
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.customerSigningKeyId);
}

export function clearAuthFromStorage() {
  if (typeof window === "undefined") return;

  clearLegacyTokenGenerationKeys();
  clearTokenGenerationValuesFromSession();
  localStorage.removeItem(STORAGE_KEYS.customerUniqueCustomerId);
  localStorage.removeItem(STORAGE_KEYS.customerWorkspaceId);
  localStorage.removeItem(STORAGE_KEYS.customerProductSpaceCode);
  localStorage.removeItem(STORAGE_KEYS.jwtToken);
}

export function readAuthFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  clearLegacyTokenGenerationKeys();
  const customerUniqueCustomerId = localStorage.getItem(
    STORAGE_KEYS.customerUniqueCustomerId
  );
  const customerWorkspaceId = localStorage.getItem(
    STORAGE_KEYS.customerWorkspaceId
  );
  const customerProductSpaceCode = localStorage.getItem(
    STORAGE_KEYS.customerProductSpaceCode
  );
  const jwtToken = localStorage.getItem(STORAGE_KEYS.jwtToken);

  if (
    !customerUniqueCustomerId ||
    !customerWorkspaceId ||
    !customerProductSpaceCode ||
    !jwtToken
  ) {
    return null;
  }

  return {
    customerUniqueCustomerId,
    customerWorkspaceId,
    customerProductSpaceCode,
    jwtToken,
  };
}
