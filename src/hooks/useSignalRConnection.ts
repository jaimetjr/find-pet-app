import { useEffect, useRef, useState, useCallback } from "react";
import * as SignalR from "@microsoft/signalr";
import { getClerkInstance } from "@clerk/clerk-expo";
import { ChatMessageDTO, ChatRoomDTO } from "@/dtos/chatDto";

const CHAT_URL = process.env.EXPO_PUBLIC_CHAT_URL;

export function useSignalRConnection(userId: string) {
  const connectionRef = useRef<SignalR.HubConnection | null>(null);
  const [latestMessage, setLatestMessage] = useState<ChatMessageDTO | null>(null);
  const [connectionState, setConnectionState] = useState(SignalR.HubConnectionState.Disconnected);
  const [latestChatRoom, setLatestChatRoom] = useState<ChatRoomDTO | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (!CHAT_URL) return;

    const setupSignalR = async () => {
      const clerk = getClerkInstance();
      const token = await clerk.session?.getToken();
      const connection = new SignalR.HubConnectionBuilder()
        .withUrl(CHAT_URL, {
          accessTokenFactory: async () => {
            if (!token) return "";
            return token;
          },
        })
        .withAutomaticReconnect()
        .build();
      connectionRef.current = connection;

      // Monitor the connection states
      connection.onclose(() =>
        setConnectionState(SignalR.HubConnectionState.Disconnected)
      );
      connection.onreconnecting(() =>
        setConnectionState(SignalR.HubConnectionState.Reconnecting)
      );
      connection.onreconnected(() =>
        setConnectionState(SignalR.HubConnectionState.Connected)
      );
      connection.on("ReceiveMessage", (message: ChatMessageDTO) => {
        setLatestMessage(message);
        if (message.recipientId === userId) {
          safeInvoke("AcknowledgeDelivery", message.id, userId).catch((e) =>
            console.error(e)
          );
        }
      });

      connection.on("NewMessage", (chatRoom: ChatRoomDTO) => {
        setLatestChatRoom(chatRoom);
      });

      connection
        .start()
        .then(() => {
          setConnectionState(connection.state);
          connection.invoke("JoinAllUserRooms", userId);
          connection.invoke("MarkAllMessagesAsDelivered", userId);
        })
        .catch((e) => {
          setConnectionState(SignalR.HubConnectionState.Disconnected);
          console.error(e);
        });
      return connection;
    };
    setupSignalR();
    return () => {
      connectionRef.current?.stop();
      connectionRef.current = null;
      setConnectionState(SignalR.HubConnectionState.Disconnected);
    };
  }, [userId]);

  const safeInvoke = useCallback(
    async <T = any,>(method: string, ...args: any[]): Promise<T | null> => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== SignalR.HubConnectionState.Connected) {
        console.warn(
          `[SignalR] Cannot invoke ${method}: connection not ready.`
        );
        return null;
      }
      try {
        return await conn.invoke<T>(method, ...args);
      } catch (err) {
        console.error(`[SignalR] Failed to invoke ${method}:`, err);
        return null;
      }
    },
    []
  );

  return { connection: connectionRef.current, connectionState, latestMessage, latestChatRoom, safeInvoke };
}
