"use client";

import { io, Socket } from "socket.io-client";
import type { SocketStatus } from "@/features/types/socket.types";
import { getHostAppEnv } from "@/config/host-env";

const INAPP_SOCKET_EVENT = "inAppMessage";
const SOCKET_IO_HANDSHAKE_PATH = "/socket.io";
let activeSocketClient: Socket | null = null;

export interface DemoSocketAuthConfig {
  customerUniqueCustomerId: string;
  jwtToken: string;
}

interface SocketBridgeResponse {
  success: boolean;
  message?: string;
}

function normalizeSocketPath(pathname: string) {
  const pathWithoutTrailingSlash = pathname.replace(/\/+$/, "");

  if (!pathWithoutTrailingSlash) {
    return SOCKET_IO_HANDSHAKE_PATH;
  }

  if (pathWithoutTrailingSlash.endsWith(SOCKET_IO_HANDSHAKE_PATH)) {
    return pathWithoutTrailingSlash;
  }

  return `${pathWithoutTrailingSlash}${SOCKET_IO_HANDSHAKE_PATH}`;
}

function getSocketEndpoint() {
  const { inAppSocketUrl } = getHostAppEnv();
  const parsedUrl = new URL(inAppSocketUrl);

  return {
    url: parsedUrl.origin,
    path: normalizeSocketPath(parsedUrl.pathname),
  };
}

function getSocketAuth(auth: DemoSocketAuthConfig) {
  return {
    customerUniqueCustomerId: auth.customerUniqueCustomerId,
    token: `Bearer ${auth.jwtToken}`,
  };
}

export function disconnectHostSocket() {
  if (activeSocketClient) {
    activeSocketClient.disconnect();
    activeSocketClient = null;
  }
}

export async function connectHostSocket(
  auth: DemoSocketAuthConfig,
  onStatusChange?: (status: SocketStatus) => void,
  timeoutMs = 15000
) {
  onStatusChange?.("connecting");
  const endpoint = getSocketEndpoint();

  return new Promise<SocketBridgeResponse>((resolve, reject) => {
    const socket = io(endpoint.url, {
      path: endpoint.path,
      transports: ["websocket"],
      forceNew: true,
      timeout: timeoutMs,
      auth: getSocketAuth(auth),
    });

    const cleanup = () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
    };

    const handleConnect = () => {
      cleanup();
      socket.disconnect();
      onStatusChange?.("connected");
      resolve({ success: true });
    };

    const handleConnectError = (error: Error & { description?: unknown }) => {
      cleanup();
      socket.disconnect();
      onStatusChange?.("error");
      reject(
        new Error(
          typeof error?.message === "string" && error.message
            ? error.message
            : typeof error?.description === "string"
              ? error.description
              : "Unable to establish WebSocket connection."
        )
      );
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
  });
}

export function subscribeToInAppMessages<TPayload = unknown>(
  auth: DemoSocketAuthConfig,
  listener: (payload: TPayload) => void,
  onStatusChange?: (status: SocketStatus) => void
) {
  disconnectHostSocket();
  const endpoint = getSocketEndpoint();
  const socket = io(endpoint.url, {
    path: endpoint.path,
    transports: ["websocket"],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    auth: getSocketAuth(auth),
  });
  activeSocketClient = socket;

  const handleConnected = () => {
    onStatusChange?.("connected");
  };

  const handleNotification = (payload: unknown) => {
    listener(payload as TPayload);
  };

  const handleError = () => {
    onStatusChange?.("error");
  };

  socket.on("connect", handleConnected);
  socket.on(INAPP_SOCKET_EVENT, handleNotification);
  socket.on("connect_error", handleError);
  socket.on("disconnect", handleError);

  return () => {
    socket.off("connect", handleConnected);
    socket.off(INAPP_SOCKET_EVENT, handleNotification);
    socket.off("connect_error", handleError);
    socket.off("disconnect", handleError);
    socket.disconnect();

    if (activeSocketClient === socket) {
      activeSocketClient = null;
    }
  };
}
