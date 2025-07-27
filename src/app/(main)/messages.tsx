import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getChats } from "@/services/chatService";
import { ChatRoomDTO } from "@/dtos/chatDto";
import { useAuth } from "@clerk/clerk-expo";
import { useChat } from "@/contexts/ChatContext"; // your context

export default function MessagesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatRoomDTO[]>([]);
  const { userId } = useAuth();
  const { latestChatRoom } = useChat(); // listen for real-time updates from context

  // Initial fetch
  const fetchChats = useCallback(async () => {
    setLoading(true);
    const result = await getChats();
    if (result.success) {
      setChats(result.value);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  // Listen to context for new chatroom events (real-time update)
  useEffect(() => {
    if (!latestChatRoom) return;
    setChats((prev) => {
      const exists = prev.find((chat) => chat.id === latestChatRoom.id);
      if (exists) {
        // Replace the updated chatroom
        return prev.map((chat) =>
          chat.id === latestChatRoom.id ? latestChatRoom : chat
        );
      } else {
        // Add to top if new
        return [latestChatRoom, ...prev];
      }
    });
  }, [latestChatRoom]);


  const renderConversationItem = ({ item }: { item: ChatRoomDTO }) => {
    const theirUser = userId === item.userAClerkId ? item.userB : item.userA;
    const hasMessages = item.messages && item.messages.length > 0;
    const unreadCount = hasMessages
      ? item.messages.filter((message) => !message.wasSeen && message.senderId !== userId).length
      : 0;
    const lastMessage = hasMessages
      ? item.messages[item.messages.length - 1]
      : null;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => {
          router.push({
            pathname: "/chat",
            params: {
              userId: theirUser.clerkId,
              userName: theirUser.name,
              petId: item.pet.id,
            },
          });
        }}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: theirUser.avatar }} style={styles.userAvatar} />
          <View style={styles.petImageContainer}>
            <Image
              source={{
                uri: item.pet.petImages ? item.pet.petImages[0].imageUrl : "",
              }}
              style={styles.petImage}
            />
          </View>
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {theirUser.name}
            </Text>
            <Text
              style={[
                styles.lastMessageTime,
                { color: theme.colors.textSecondary },
              ]}
            >
              {lastMessage
                ? lastMessage.sentAt.split("T")[1].split(".")[0]
                : ""}
            </Text>
          </View>

          <View style={styles.conversationDetails}>
            <Text style={[styles.petName, { color: theme.colors.primary }]}>
              Sobre: {item.pet.name}
            </Text>
            <Text
              style={[
                styles.lastMessage,
                { color: theme.colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {lastMessage ? lastMessage.content : "Nenhuma mensagem ainda"}
            </Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <View
            style={[
              styles.unreadBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={[styles.unreadCount, { color: theme.colors.text }]}>
              {unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="chatbubbles-outline"
        size={64}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Nenhuma conversa ainda
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        Quando você iniciar conversas sobre pets, elas aparecerão aqui
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Mensagens
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {chats.length} conversas
        </Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  petImageContainer: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden",
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  lastMessageTime: {
    fontSize: 12,
  },
  conversationDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  petName: {
    fontSize: 12,
    fontWeight: "500",
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
});
