import { BffApiError } from "./api-error";

export function jsonError(error: unknown, fallback: string, fallbackStatus = 500) {
  if (error instanceof BffApiError) {
    return Response.json(
      {
        success: false,
        message: error.message,
        data: error.data,
      },
      { status: error.status }
    );
  }

  return Response.json(
    {
      success: false,
      message: error instanceof Error ? error.message : fallback,
    },
    { status: fallbackStatus }
  );
}
