import { NextRequest, NextResponse } from "next/server";
import { io } from "socket.io-client";

export const runtime = "nodejs";

const SOCKET_IO_HANDSHAKE_PATH = "/api/v1/wss/socket.io";

interface SocketConnectRequest {
  customerKey: string;
  orgId: string;
  jwtToken: string;
  timeoutMs?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SocketConnectRequest;

    if (!body.customerKey || !body.orgId || !body.jwtToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing socket connection payload.",
        },
        { status: 400 }
      );
    }

    const wssBaseUrl = process.env.NEXT_PUBLIC_WSS_SERVICE_API_URL;

    if (!wssBaseUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing WSS service URL.",
        },
        { status: 500 }
      );
    }

    const timeoutMs = body.timeoutMs ?? 8000;

    const result = await new Promise<{ success: true }>((resolve, reject) => {
      const socket = io(wssBaseUrl, {
        path: SOCKET_IO_HANDSHAKE_PATH,
        transports: ["polling", "websocket"],
        forceNew: true,
        timeout: timeoutMs,
        extraHeaders: {
          "x-customer": body.customerKey,
          "x-org-token": body.orgId,
          "x-access-token": body.jwtToken,
          "x-org-id": body.orgId,
          "x-app-environment": process.env.NODE_ENV ?? "development",
          "x-refresh-token": body.jwtToken,
          "Content-Type": "application/json",
        },
      });

      const timeoutId = setTimeout(() => {
        socket.disconnect();
        reject(new Error("Socket connection timed out."));
      }, timeoutMs);

      socket.on("connect", () => {
        clearTimeout(timeoutId);
        socket.disconnect();
        resolve({ success: true });
      });

      socket.on("connect_error", (error: Error & { description?: unknown }) => {
        clearTimeout(timeoutId);
        socket.disconnect();
        const message =
          typeof error?.message === "string" && error.message
            ? error.message
            : typeof error?.description === "string"
              ? error.description
              : "Unable to establish WebSocket connection.";
        reject(new Error(message));
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to establish WebSocket connection.",
      },
      { status: 500 }
    );
  }
}
