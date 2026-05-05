type ApiEnvelope = {
  message?: string;
  data?: unknown;
  error?: {
    description?: string;
  } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getApiSuccessMessage(
  payload: unknown,
  fallback = "Request completed successfully."
) {
  if (isRecord(payload) && typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (isRecord(error)) {
    if (isRecord(error.data) && typeof error.data.message === "string" && error.data.message.trim()) {
      return error.data.message;
    }

    if (typeof error.message === "string" && error.message.trim() && !error.message.startsWith("Request failed with status")) {
      return error.message;
    }
  }

  return fallback;
}
