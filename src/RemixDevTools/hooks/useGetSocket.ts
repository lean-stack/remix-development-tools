import { ReadyState, default as useWebSocket } from "react-use-websocket";
import {
  JsonObject,
  Options,
  WebSocketHook,
} from "react-use-websocket/dist/lib/types";
import { useRDTContext } from "../context/useRDTContext";
import { useState } from "react";

const RETRY_COUNT = 2;

export const useGetSocket = <T extends JsonObject>(options?: Options) => {
  const { shouldConnectWithForge, setShouldConnectWithForge, port } =
    useRDTContext();
  const [retryCount, setRetryCount] = useState(0);
  const opts: Options = {
    ...options,
    share: true,
    shouldReconnect: () => true,
    reconnectAttempts: RETRY_COUNT,
    reconnectInterval: 0,
    onClose: (e) => {
      // connection closed by remix forge
      if (e.code === 1005) {
        setShouldConnectWithForge(false);
        setRetryCount(0);
        return;
      }
      if (retryCount < RETRY_COUNT) {
        return setRetryCount(retryCount + 1);
      }
      setShouldConnectWithForge(false);
    },
  };
  const properties = useWebSocket(
    `ws://localhost:${port}`,
    opts,
    shouldConnectWithForge
  ) as WebSocketHook<T, MessageEvent<any> | null>;

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[properties.readyState];
  const isConnected = properties.readyState === ReadyState.OPEN;
  const isConnecting = properties.readyState === ReadyState.CONNECTING;
  return { ...properties, connectionStatus, isConnected, isConnecting };
};
