const STORAGE_KEYS = {
  customerJwtPrivateKey: "dokaai-sdk-customer-jwt-private-key",
  customerSigningKeyId: "dokaai-sdk-customer-signing-key-id",
  customerUniqueCustomerId: "dokaai-sdk-customer-unique-customer-id",
  customerWorkspaceId: "dokaai-sdk-customer-workspace-id",
  customerProductSpaceCode: "dokaai-sdk-customer-product-space-code",
  jwtToken: "dokaai-sdk-jwt-token",
} as const;

export function saveAuthToStorage(payload: {
  customerJwtPrivateKey: string;
  customerSigningKeyId: string;
  customerUniqueCustomerId: string;
  customerWorkspaceId: string;
  customerProductSpaceCode: string;
  jwtToken: string;
}) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEYS.customerJwtPrivateKey, payload.customerJwtPrivateKey);
  localStorage.setItem(STORAGE_KEYS.customerSigningKeyId, payload.customerSigningKeyId);
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

export function clearAuthFromStorage() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEYS.customerJwtPrivateKey);
  localStorage.removeItem(STORAGE_KEYS.customerSigningKeyId);
  localStorage.removeItem(STORAGE_KEYS.customerUniqueCustomerId);
  localStorage.removeItem(STORAGE_KEYS.customerWorkspaceId);
  localStorage.removeItem(STORAGE_KEYS.customerProductSpaceCode);
  localStorage.removeItem(STORAGE_KEYS.jwtToken);
}

export function readAuthFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  const customerJwtPrivateKey = localStorage.getItem(
    STORAGE_KEYS.customerJwtPrivateKey
  );
  const customerSigningKeyId = localStorage.getItem(
    STORAGE_KEYS.customerSigningKeyId
  );
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
    !customerJwtPrivateKey ||
    !customerSigningKeyId ||
    !customerUniqueCustomerId ||
    !customerWorkspaceId ||
    !customerProductSpaceCode ||
    !jwtToken
  ) {
    return null;
  }

  return {
    customerJwtPrivateKey,
    customerSigningKeyId,
    customerUniqueCustomerId,
    customerWorkspaceId,
    customerProductSpaceCode,
    jwtToken,
  };
}
