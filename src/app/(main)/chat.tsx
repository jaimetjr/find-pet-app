import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@clerk/clerk-expo";
import { ChatMessageDTO, ChatRoomDTO } from "@/dtos/chatDto";
import { useChat } from "@/contexts/ChatContext";
import * as SignalR from '@microsoft/signalr';

export default function ChatScreen() {
  const {
    userId: theirUserId,
    userName: theirUserName,
    petId,
  } = useLocalSearchParams<{
    userId: string;
    userName: string;
    petId: string;
  }>();
  const { userId } = useAuth();
  const { safeInvoke, connectionState } = useChat();
  const theme = useTheme();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [room, setRoom] = useState<ChatRoomDTO | null>(null);

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
            ? { ...msg, wasDelivered: true, wasDeliveredAt: deliveredMessage.wasDeliveredAt }
            : msg
        )
      );
    };

    connection.on("MessagesMarkedAsSeen", handleMessagesMarkedAsSeen);
    connection.on("MessageDelivered", handleMessageDelivered);

    return () => {
      connection.off("MessagesMarkedAsSeen", handleMessagesMarkedAsSeen);
      connection.off("MessageDelivered", handleMessageDelivered);
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
    }, [room?.id, userId, messages, safeInvoke])
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
      statusIconColor = '#007AFF'; // iOS blue, or pick your preferred blue
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
              backgroundColor: isUser ? theme.colors.primary : theme.colors.card,
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
              style={[styles.messageTime, { color: theme.colors.textSecondary }]}
            >
              {new Date(item.sentAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {isUser && (
              <Text
                style={[
                  styles.seenIndicator,
                  { color: statusIconColor },
                ]}
              >
                {statusIcon}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const containerStyles = [
    styles.container,
    { backgroundColor: theme.colors.background },
  ];

  const headerStyles = [
    styles.header,
    {
      backgroundColor: theme.colors.card,
      borderBottomColor: theme.colors.border,
    },
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

  return (
    <SafeAreaView style={containerStyles}>
      {/* Header */}
      <View style={headerStyles}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/messages")}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: theme.colors.text }]}>
            {theirUserName || "Chat"}
          </Text>
          <Text
            style={[styles.headerStatus, { color: theme.colors.textSecondary }]}
          >
            Online
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
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

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={inputContainerStyles}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={inputStyles}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim()
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={
                inputText.trim()
                  ? theme.colors.text
                  : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderTopWidth: 1,
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
