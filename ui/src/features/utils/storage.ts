const STORAGE_KEYS = {
  projectId: "dokaai-sdk-project-id",
  orgId: "dokaai-sdk-org-id",
  customerPoolId: "dokaai-sdk-customer-pool-id",
  customerId: "dokaai-sdk-customer-id",
  jwtToken: "dokaai-sdk-jwt-token",
} as const;

export function saveAuthToStorage(payload: {
  projectId: string;
  orgId: string;
  customerPoolId: string;
  customerId: string;
  jwtToken: string;
}) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEYS.projectId, payload.projectId);
  localStorage.setItem(STORAGE_KEYS.orgId, payload.orgId);
  localStorage.setItem(STORAGE_KEYS.customerPoolId, payload.customerPoolId);
  localStorage.setItem(STORAGE_KEYS.customerId, payload.customerId);
  localStorage.setItem(STORAGE_KEYS.jwtToken, payload.jwtToken);
}

export function saveJwtTokenToStorage(jwtToken: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEYS.jwtToken, jwtToken);
}

export function clearAuthFromStorage() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEYS.projectId);
  localStorage.removeItem(STORAGE_KEYS.orgId);
  localStorage.removeItem(STORAGE_KEYS.customerPoolId);
  localStorage.removeItem(STORAGE_KEYS.customerId);
  localStorage.removeItem(STORAGE_KEYS.jwtToken);
}

export function readAuthFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  const projectId = localStorage.getItem(STORAGE_KEYS.projectId);
  const orgId = localStorage.getItem(STORAGE_KEYS.orgId);
  const customerPoolId = localStorage.getItem(STORAGE_KEYS.customerPoolId);
  const customerId = localStorage.getItem(STORAGE_KEYS.customerId);
  const jwtToken = localStorage.getItem(STORAGE_KEYS.jwtToken);

  if (!projectId || !orgId || !customerPoolId || !customerId || !jwtToken) {
    return null;
  }

  return {
    projectId,
    orgId,
    customerPoolId,
    customerId,
    jwtToken,
  };
}
