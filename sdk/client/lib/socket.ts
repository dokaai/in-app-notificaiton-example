export interface CreateSocketConnectionOptions {
  url: string;
  protocols?: string | string[];
}

export const createSocketConnection = ({
  url,
  protocols,
}: CreateSocketConnectionOptions) => new WebSocket(url, protocols);
