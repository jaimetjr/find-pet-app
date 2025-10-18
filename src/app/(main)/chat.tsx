import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
  Stack,
} from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@clerk/clerk-expo";
import { ChatMessageDTO, ChatRoomDTO } from "@/dtos/chatDto";
import { useChat } from "@/contexts/ChatContext";
import * as SignalR from "@microsoft/signalr";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type MessagePageDto = {
  items: ChatMessageDTO[]; // <- if your hub returns PascalCase, rename to Items and map accordingly
  nextBefore: string | null; // <- NextBefore
  hasMore: boolean; // <- HasMore
};

const MessageRow = React.memo(function MessageRow({
  item,
  isUser,
  themeTextColor,
  themeTextSecondary,
  themePrimary,
}: {
  item: ChatMessageDTO;
  isUser: boolean;
  themeTextColor: string;
  themeTextSecondary: string;
  themePrimary: string;
}) {
  let statusIcon = "✓✓";
  let statusIconColor = themeTextSecondary;
  if (
    isUser &&
    item.wasSeen &&
    item.seenByClerkId &&
    item.seenByClerkId !== item.senderId
  ) {
    statusIconColor = "#007AFF";
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
          { backgroundColor: isUser ? themePrimary : "#1f1f1f10" },
        ]}
      >
        <Text style={[styles.messageText, { color: themeTextColor }]}>
          {item.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, { color: themeTextSecondary }]}>
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
});

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
  const { safeInvoke, connectionState, connection, latestMessage } = useChat();

  const flatListRef = useRef<FlatList<ChatMessageDTO>>(null);
  const ids = useRef<Set<string>>(new Set());

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]); // ASC order (oldest -> newest)
  const [room, setRoom] = useState<ChatRoomDTO | null>(null);

  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const [hasMoreOlder, setHasMoreOlder] = useState<boolean>(true);

  const [onlineStatus, setOnlineStatus] = useState<string>("");
  const [lastSeen, setLastSeen] = useState<Date | string | null>(null);

  // -------- Helpers
  const scrollToBottom = useCallback((animated = false) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const nearBottomRef = useRef(true);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // For inverted list, "near bottom" means contentOffset.y is small (we’re visually at bottom)
    const y = e.nativeEvent.contentOffset.y;
    nearBottomRef.current = y < 80; // tweak threshold
  }, []);

  // -------- Join room & initial fetch (latest N)
  useEffect(() => {
    let isMounted = true;

    const joinAndFetch = async () => {
      if (
        connectionState !== SignalR.HubConnectionState.Connected ||
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

      // Fetch latest N with cursor API
      const page = await safeInvoke<MessagePageDto>(
        "GetLatestMessages",
        chatRoom.id,
        50
      );
      // If backend returns PascalCase, map here:
      // const page = await safeInvoke<any>("GetLatestMessages", chatRoom.id, 50);
      // const mapped: MessagePageDto = { items: page.Items, nextBefore: page.NextBefore, hasMore: page.HasMore };

      const itemsAsc = page?.items ?? [];
      const itemsDesc = itemsAsc.slice().reverse(); // newest -> oldest

      itemsDesc.forEach((m) => ids.current.add(m.id)); // dedupe set

      setMessages(itemsDesc); // <-- DESC in state
      setOlderCursor(page?.nextBefore ?? null);
      setHasMoreOlder(!!page?.hasMore);

      // (Optional) scroll to bottom once after first layout
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false }); // with inverted, offset 0 = bottom
      });
      // Ask for presence
      safeInvoke("OnlineStatus", chatRoom.id, theirUserId).catch(() => {});
    };

    joinAndFetch();
    return () => {
      isMounted = false;
    };
  }, [userId, theirUserId, petId, connectionState, safeInvoke, scrollToBottom]);

  // -------- Load older (lazy) when reaching top (because inverted list)
  const loadingOlderRef = useRef(false);
  const loadOlder = useCallback(async () => {
    if (loadingOlderRef.current) return;
    if (!room?.id) return;
    if (!hasMoreOlder) return;
    if (!olderCursor) return; // <- extra guard

    loadingOlderRef.current = true;
    try {
      const page = await safeInvoke<MessagePageDto>(
        "GetMessagesBefore",
        room.id,
        olderCursor,
        50
      );

      const olderAsc = (page?.items ?? []).filter(
        (m) => !ids.current.has(m.id)
      );
      olderAsc.forEach((m) => ids.current.add(m.id));
      const olderDesc = olderAsc.slice().reverse();

      setMessages((prev) => [...prev, ...olderDesc]);

      // If server returns nothing, stop asking
      if (!page?.hasMore || olderDesc.length === 0) {
        setHasMoreOlder(false);
        setOlderCursor(null);
      } else {
        setHasMoreOlder(Boolean(page?.hasMore));
        setOlderCursor(page?.nextBefore ?? null);
      }
    } catch (e) {
      console.warn("[chat] GetMessagesBefore failed", e);
      // Don’t loop forever on errors at top
      setHasMoreOlder(false);
      setOlderCursor(null);
    } finally {
      loadingOlderRef.current = false;
    }
  }, [room?.id, hasMoreOlder, olderCursor, safeInvoke]);

  // -------- Realtime: append newest if for this room
  useEffect(() => {
    if (!latestMessage || latestMessage.chatRoomId !== room?.id) return;
    if (ids.current.has(latestMessage.id)) return;

    ids.current.add(latestMessage.id);

    // DESC array: newest at index 0
    setMessages((prev) => [latestMessage, ...prev]);

    // Auto-scroll only if user is already near the bottom
    if (nearBottomRef.current) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
    }
  }, [latestMessage, room?.id, scrollToBottom]);

  // -------- Delivery/Seen/Presence events
  useEffect(() => {
    if (!connection || !room?.id) return;

    const handleMessagesMarkedAsSeen = (
      chatRoomId: string,
      seenMessages: { id: string }[],
      viewerClerkId: string
    ) => {
      if (chatRoomId !== room.id || !Array.isArray(seenMessages)) return;
      const seenSet = new Set(seenMessages.map((s) => s.id));
      setMessages((prev) =>
        prev.map((m) =>
          seenSet.has(m.id)
            ? { ...m, wasSeen: true, seenByClerkId: viewerClerkId }
            : m
        )
      );
    };

    const handleMessageDelivered = (
      messageId: string,
      recipientId: string,
      deliveredMessage: ChatMessageDTO
    ) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                wasDelivered: true,
                wasDeliveredAt: deliveredMessage.wasDeliveredAt,
              }
            : m
        )
      );
    };

    const handleUserOffline = (
      isOnline: boolean,
      lastSeenDate: Date | string | null
    ) => {
      setOnlineStatus(isOnline ? "Online" : "");
      setLastSeen(isOnline ? null : lastSeenDate);
    };

    connection.on("MessagesMarkedAsSeen", handleMessagesMarkedAsSeen);
    connection.on("MessageDelivered", handleMessageDelivered);
    connection.on("UserOffline", handleUserOffline);

    return () => {
      connection.off("MessagesMarkedAsSeen", handleMessagesMarkedAsSeen);
      connection.off("MessageDelivered", handleMessageDelivered);
      connection.off("UserOffline", handleUserOffline);
    };
  }, [connection, room?.id]);

  // -------- Mark as seen on focus
  useFocusEffect(
    useCallback(() => {
      if (!room?.id || !userId || messages.length === 0) return;
      const unseen = messages.some((m) => !m.wasSeen && m.senderId !== userId);
      if (unseen) {
        safeInvoke("MarkMessagesAsSeen", room.id, userId).catch(() => {});
      }
      // Refresh presence
      safeInvoke("OnlineStatus", room.id, theirUserId).catch(() => {});
    }, [room?.id, userId, messages, safeInvoke, theirUserId])
  );

  const sendMessage = useCallback(async () => {
    const content = inputText.trim();
    if (!content || !room?.id || !userId || !theirUserId) return;
    await safeInvoke("SendMessage", room.id, userId, theirUserId, content);
    setInputText("");
  }, [inputText, room?.id, userId, theirUserId, safeInvoke]);

  // -------- Memoized renderItem
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessageDTO }) => (
      <MessageRow
        item={item}
        isUser={item.senderId === userId}
        themeTextColor={theme.colors.text}
        themeTextSecondary={theme.colors.textSecondary}
        themePrimary={theme.colors.primary}
      />
    ),
    [
      userId,
      theme.colors.text,
      theme.colors.textSecondary,
      theme.colors.primary,
    ]
  );

  // -------- UI
  const containerStyles = useMemo(
    () => [styles.container, { backgroundColor: theme.colors.background }],
    [theme.colors.background]
  );

  const inputContainerStyles = useMemo(
    () => [
      styles.inputContainer,
      {
        backgroundColor: theme.colors.card,
        borderTopColor: theme.colors.border,
      },
    ],
    [theme.colors.card, theme.colors.border]
  );

  const inputStyles = useMemo(
    () => [
      styles.input,
      {
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        borderColor: theme.colors.border,
      },
    ],
    [theme.colors.background, theme.colors.text, theme.colors.border]
  );

  return (
    <SafeAreaView edges={['left','right','bottom']} style={containerStyles}>
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
                    color:
                      onlineStatus === "Online"
                        ? "#4CAF50"
                        : theme.colors.textSecondary,
                  }}
                >
                  {onlineStatus}
                  {lastSeen !== null
                    ? (() => {
                        const dateObj =
                          typeof lastSeen === "string"
                            ? new Date(lastSeen)
                            : lastSeen instanceof Date
                            ? lastSeen
                            : null;
                        if (!dateObj || isNaN(dateObj.getTime())) return "";
                        const day = String(dateObj.getDate()).padStart(2, "0");
                        const month = String(dateObj.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const year = dateObj.getFullYear();
                        const hours = String(dateObj.getHours()).padStart(
                          2,
                          "0"
                        );
                        const minutes = String(dateObj.getMinutes()).padStart(
                          2,
                          "0"
                        );
                        return `Visto por último: ${day}/${month}/${year} ${hours}:${minutes}`;
                      })()
                    : ""}
                </Text>
              </View>
            </View>
          ),
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate("/(main)/messages")}
            >
              <MaterialCommunityIcons name="chevron-left" size={30} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
        onEndReachedThreshold={0.1} // with inverted, this is "near top"
        onEndReached={loadOlder}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListFooterComponent={
          hasMoreOlder ? (
            <View style={styles.emptyContainer}>
              <Text 
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Carregando mensagens...
              </Text>
            </View>
          ) : null
        }
      />

      <View style={[inputContainerStyles, styles.inputRow]}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
          extraHeight={0}
          extraScrollHeight={0}
          enableResetScrollToCoords
          enableAutomaticScroll
          keyboardOpeningTime={250}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={inputStyles}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={styles.sendButton}
            disabled={!inputText.trim()}
          >
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
  container: { flex: 1 },
  messagesList: { flex: 1 },
  messagesContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  messageContainer: { marginBottom: 12 },
  userMessageContainer: { alignItems: "flex-end" },
  otherMessageContainer: { alignItems: "flex-start" },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  userMessageBubble: { borderBottomLeftRadius: 20, borderBottomRightRadius: 4 },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  messageTime: { fontSize: 12, marginTop: 4, alignSelf: "flex-end" },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  seenIndicator: { fontSize: 12, marginLeft: 4 },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    alignItems: "center",
  },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
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
  emptyText: { fontSize: 16, textAlign: "center" },
});
