import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
  Stack,
} from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@clerk/clerk-expo";
import { ChatMessageDTO, ChatRoomDTO } from "@/dtos/chatDto";
import { useChat } from "@/contexts/ChatContext";
import * as SignalR from "@microsoft/signalr";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
export default function ChatScreen() {
  const {
    userId: theirUserId,
    userName: theirUserName,
    userAvatar: theirUserAvatar,
    petId,
  } = useLocalSearchParams<{
    userId: string;
    userName: string;
    userAvatar: string;
    petId: string;
  }>();
  const theme = useTheme();
  const router = useRouter();
  const { userId } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const { safeInvoke, connectionState } = useChat();

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [room, setRoom] = useState<ChatRoomDTO | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<string>("");
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  // Load chat room and messages when connection is ready and IDs available
  useEffect(() => {
    let isMounted = true;

    const joinAndFetch = async () => {
      if (
        connectionState !== SignalR.HubConnectionState.Connected || // 1 === Connected
        !userId ||
        !theirUserId ||
        !petId
      )
        return;

      const chatRoom = await safeInvoke<ChatRoomDTO>(
        "JoinPrivateChat",
        userId,
        theirUserId,
        petId
      );
      if (!chatRoom || !chatRoom.id || !isMounted) return;
      setRoom(chatRoom);

      await safeInvoke("JoinRoomGroup", chatRoom.id);

      const history = await safeInvoke<ChatMessageDTO[]>(
        "GetMessages",
        chatRoom.id,
        1,
        50
      );
      if (isMounted && Array.isArray(history)) {
        setMessages(history);
      }

      // Request initial online status for the other user
      safeInvoke("OnlineStatus", chatRoom.id, theirUserId).catch((e) =>
        console.error("Initial OnlineStatus error", e)
      );
    };

    joinAndFetch();

    return () => {
      isMounted = false;
    };
  }, [userId, theirUserId, petId, connectionState, safeInvoke]);

  // Listen for new messages using the context's latestMessage
  const { latestMessage } = useChat();

  useEffect(() => {
    if (!latestMessage) return;
    // Only append if this message belongs to this room!
    if (latestMessage.chatRoomId !== room?.id) return;
    setMessages((prev) => [...prev, latestMessage]);
  }, [latestMessage, room?.id]);

  // Listen for message seen/delivered events using context's connection
  const { connection } = useChat();

  useEffect(() => {
    if (!connection || !room?.id) return;

    // "MessagesMarkedAsSeen" handler
    const handleMessagesMarkedAsSeen = (
      chatRoomId: string,
      seenMessages: any,
      viewerClerkId: string
    ) => {
      if (!Array.isArray(seenMessages)) return;
      if (chatRoomId !== room.id) return;
      setMessages((prev) =>
        prev.map((msg) =>
          seenMessages.find((sm: any) => sm.id === msg.id)
            ? { ...msg, wasSeen: true, seenByClerkId: viewerClerkId }
            : msg
        )
      );
    };

    // "MessageDelivered" handler
    const handleMessageDelivered = (
      messageId: string,
      recipientId: string,
      deliveredMessage: ChatMessageDTO
    ) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                wasDelivered: true,
                wasDeliveredAt: deliveredMessage.wasDeliveredAt,
              }
            : msg
        )
      );
    };

    connection.on("MessagesMarkedAsSeen", handleMessagesMarkedAsSeen);
    connection.on("MessageDelivered", handleMessageDelivered);
    
    // Handle user offline events
    connection.on("UserOffline", (isOnline: boolean, lastSeenDate: Date | null) => {
      console.log("UserOffline received:", isOnline, lastSeenDate);
      setOnlineStatus(isOnline ? "Online" : "");
      setLastSeen(isOnline ? null : lastSeenDate);
    });

    return () => {
      connection.off("MessagesMarkedAsSeen", handleMessagesMarkedAsSeen);
      connection.off("MessageDelivered", handleMessageDelivered);
      connection.off("UserOffline");
    };
  }, [connection, room?.id]);

  // Mark as seen when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!room?.id || !userId || messages.length === 0) return;
      const unseen = messages.filter(
        (msg) => !msg.wasSeen && msg.senderId !== userId
      );
      if (unseen.length > 0) {
        safeInvoke("MarkMessagesAsSeen", room.id, userId).catch((e) =>
          console.error("MarkMessagesAsSeen error", e)
        );
      }

      // Request online status for the other user
      safeInvoke("OnlineStatus", room.id, theirUserId).catch((e) =>
        console.error("OnlineStatus error", e)
      );
    }, [room?.id, userId, messages, safeInvoke, theirUserId])
  );

  const sendMessage = async () => {
    if (!inputText.trim() || !room?.id || !userId || !theirUserId) return;
    await safeInvoke(
      "SendMessage",
      room.id,
      userId,
      theirUserId,
      inputText.trim()
    );
    setInputText("");
  };

  const containerStyles = [
    styles.container,
    { backgroundColor: theme.colors.background },
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
  ];

  const inputStyles = [
    styles.input,
    {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      borderColor: theme.colors.border,
    },
  ];

  const renderMessage = ({ item }: { item: ChatMessageDTO }) => {
    const isUser = item.senderId === userId;
    let statusIcon = "✓✓";
    let statusIconColor = theme.colors.textSecondary;
    if (
      isUser &&
      item.wasSeen &&
      item.seenByClerkId &&
      item.seenByClerkId !== userId
    ) {
      // Seen: blue color
      statusIconColor = "#007AFF"; // iOS blue, or pick your preferred blue
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.otherMessageBubble,
            {
              backgroundColor: isUser
                ? theme.colors.primary
                : theme.colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? theme.colors.text : theme.colors.text },
            ]}
          >
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                { color: theme.colors.textSecondary },
              ]}
            >
              {new Date(item.sentAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {isUser && (
              <Text style={[styles.seenIndicator, { color: statusIconColor }]}>
                {statusIcon}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={containerStyles}>
      <Stack.Screen
        options={{
          headerTransparent: false,
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {theirUserAvatar ? (
                <View style={{ marginRight: 8 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      overflow: "hidden",
                      backgroundColor: theme.colors.background,
                    }}
                  >
                    <Image
                      source={{ uri: theirUserAvatar as string }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                </View>
              ) : null}
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: theme.colors.text,
                  }}
                >
                  {theirUserName}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    marginTop: 2,
                    color: onlineStatus === "Online" ? "#4CAF50" : theme.colors.textSecondary,
                  }}
                >
                  {onlineStatus}
                  {lastSeen !== null
                    ? (() => {
                        // If lastSeen is a string (from server), parse it to Date
                        const dateObj =
                          typeof lastSeen === "string"
                            ? new Date(lastSeen)
                            : lastSeen instanceof Date
                            ? lastSeen
                            : null;
                        if (!dateObj || isNaN(dateObj.getTime())) return "";
                        const day = dateObj.getDate().toString().padStart(2, "0");
                        const month = (dateObj.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const year = dateObj.getFullYear();
                        const hours = dateObj.getHours().toString().padStart(2, "0");
                        const minutes = dateObj.getMinutes().toString().padStart(2, "0");
                        return `Visto por último: ${day}/${month}/${year} ${hours}:${minutes}`;
                      })()
                    : ""}
                </Text>
              </View>
            </View>
          ),
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.navigate('/(main)/messages')}>
              <MaterialCommunityIcons name="chevron-left" size={30} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id || index.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        scrollEventThrottle={16}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              {messages.length === 0
                ? "No messages yet"
                : `Loading ${messages.length} messages...`}
            </Text>
          </View>
        )}
      />
      <View style={[inputContainerStyles, styles.inputRow]}>
        <KeyboardAwareScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            flexGrow: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
          extraHeight={0}
          extraScrollHeight={0}
          enableResetScrollToCoords={true}
          
          enableAutomaticScroll={true}
          keyboardOpeningTime={250}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[inputStyles]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />

          <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={!inputText.trim()}>
            <MaterialCommunityIcons
              name="send"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerStatus: {
    fontSize: 14,
  },
  moreButton: {
    marginLeft: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  userMessageBubble: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  seenIndicator: {
    fontSize: 12,
    marginLeft: 4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
