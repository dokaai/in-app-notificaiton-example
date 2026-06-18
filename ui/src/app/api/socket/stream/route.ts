import { NextRequest } from "next/server";
import { io } from "socket.io-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOCKET_IO_HANDSHAKE_PATH = "/api/v1/wss/socket.io";
const INAPP_SOCKET_EVENT = "inAppMessage";

function sseEvent(event: string, payload: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export async function GET(request: NextRequest) {
  const jwtToken = request.nextUrl.searchParams.get("jwtToken");
  const wssBaseUrl = process.env.NEXT_PUBLIC_WSS_SERVICE_API_URL;

  if (!jwtToken || !wssBaseUrl) {
    return new Response(
      sseEvent("error", {
        type: "error",
        message: "Missing socket stream configuration.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      }
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      let isClosed = false;
      const socket = io(wssBaseUrl, {
        path: SOCKET_IO_HANDSHAKE_PATH,
        transports: ["websocket"],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        auth: {
          token: `Bearer ${jwtToken}`,
        },
      });

      const enqueue = (chunk: string) => {
        if (isClosed) {
          return;
        }

        controller.enqueue(encoder.encode(chunk));
      };

      const cleanup = () => {
        if (isClosed) {
          return;
        }

        isClosed = true;
        clearInterval(heartbeat);
        socket.disconnect();
        controller.close();
      };

      const heartbeat = setInterval(() => {
        enqueue(": keep-alive\n\n");
      }, 15000);

      socket.on("connect", () => {
        enqueue(sseEvent("connected", { type: "connected" }));
      });

      socket.on(INAPP_SOCKET_EVENT, (payload: unknown) => {
        enqueue(
          sseEvent(INAPP_SOCKET_EVENT, {
            type: "notification",
            data: payload,
          })
        );
      });

      socket.on("connect_error", (error: Error & { description?: unknown }) => {
        enqueue(
          sseEvent("error", {
            type: "error",
            message:
              typeof error?.message === "string" && error.message
                ? error.message
                : typeof error?.description === "string"
                  ? error.description
                  : "Socket stream connection failed.",
          })
        );
      });

      socket.on("disconnect", (reason: string) => {
        if (reason === "io client disconnect") {
          cleanup();
          return;
        }

        enqueue(
          sseEvent("error", {
            type: "error",
            message: reason || "Socket stream disconnected.",
          })
        );
      });

      request.signal.addEventListener("abort", () => {
        cleanup();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
