import React, {
  createContext,
  useContext,
  ReactNode,
} from "react";
import * as SignalR from "@microsoft/signalr";
import { useAuth } from "@clerk/clerk-expo";
import { ChatMessageDTO, ChatRoomDTO } from "@/dtos/chatDto";
import { useSignalRConnection } from "../hooks/useSignalRConnection";

interface IChatContext {
  connection: SignalR.HubConnection | null;
  latestMessage: ChatMessageDTO | null;
  latestChatRoom: ChatRoomDTO | null;
  safeInvoke: <T = any>(method: string, ...args: any[]) => Promise<T | null>;
  connectionState: SignalR.HubConnectionState;
}

const ChatContext = createContext<IChatContext>({
  connection: null,
  latestMessage: null,
  latestChatRoom: null,
  safeInvoke: async () => null,
  connectionState: SignalR.HubConnectionState.Disconnected,
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuth();
  const { connection, connectionState, latestMessage, latestChatRoom, safeInvoke } = useSignalRConnection(userId ?? "");

  return (
    <ChatContext.Provider
      value={{
        connection,
        latestMessage,
        latestChatRoom,
        safeInvoke,
        connectionState,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
