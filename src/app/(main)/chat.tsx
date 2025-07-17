import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import * as SignalR from '@microsoft/signalr';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@clerk/clerk-expo';

const CHAT_URL = process.env.EXPO_PUBLIC_CHAT_URL!;

export default function ChatScreen() {
  const { userId: theirUserId, userName: theirUserName, petId } = useLocalSearchParams<{ userId: string; userName: string; petId: string }>();
  const { userId } = useAuth();
  
  const theme = useTheme();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string,
    senderId: string,
    senderName: string,
    content: string,
    sentAt: string
  }>>([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  const connectionRef = useRef<SignalR.HubConnection | null>(null);

  useEffect(() => {
    let isMounted = true;
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(CHAT_URL)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Handle incoming messages
    connection.on('ReceiveMessage', (messageDto: any) => {
      setMessages(prev => [
        ...prev,
        {
          id: messageDto.id,
          senderId: messageDto.senderId,
          senderName: messageDto.senderName,
          content: messageDto.content,
          sentAt: messageDto.sentAt,
        },
      ]);
    });

    connection
      .start()
      .then(async () => {
        // 1. Ask backend for room (get or create)
        console.log("eu", userId);
        console.log("ele", theirUserId)
        const room = await connection.invoke('JoinPrivateChat', userId, theirUserId, petId);
        if (!room || !room.id) throw new Error("Failed to get room from backend");  
        if (!isMounted) return;

        setRoomId(room.id);

        // 2. Join the SignalR group for this room
        await connection.invoke('JoinRoomGroup', room.id);

        // 3. Fetch message history
        const history = await connection.invoke('GetMessages', room.id, 1, 50);
        if (isMounted && Array.isArray(history)) {
          setMessages(
            history.map((m: any) => ({
              id: m.id,
              senderId: m.senderId,
              senderName: m.senderName,
              content: m.content,
              sentAt: m.sentAt,
            }))
          );
        }
      })
      .catch(err => {
        console.error('SignalR Connection Error: ', err);
      });

    // Cleanup on unmount
    return () => {
      isMounted = false;
      connection.off('ReceiveMessage');
      connection.stop().catch(() => {});
      connectionRef.current = null;
    };
      
  }, [userId]);  

  const sendMessage = async () => {
    if (connectionRef.current && inputText.trim() && roomId && userId) {
      await connectionRef.current.invoke('SendMessage', roomId, userId, inputText);
      setInputText('');
      // No need to manually add to messages, since you'll receive it via 'ReceiveMessage'
    }
  };

  const renderMessage = ({ item } : any) => {
    const isUser = item.senderId === userId
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.otherMessageBubble,
          { backgroundColor: isUser ? theme.colors.primary : theme.colors.card }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? theme.colors.text : theme.colors.text }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isUser ? theme.colors.textSecondary : theme.colors.textSecondary }
          ]}>
            {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const containerStyles = [
    styles.container,
    { backgroundColor: theme.colors.background }
  ];

  const headerStyles = [
    styles.header,
    { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }
  ];

  const inputStyles = [
    styles.input,
    { 
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      borderColor: theme.colors.border
    }
  ];

  return (
    <SafeAreaView style={containerStyles}>
      {/* Header */}
      <View style={headerStyles}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: theme.colors.text }]}>
            {theirUserName || 'Chat'}
          </Text>
          <Text style={[styles.headerStatus, { color: theme.colors.textSecondary }]}>
            Online
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.colors.text} />
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
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              { backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.border }
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={inputText.trim() ? theme.colors.text : theme.colors.textSecondary}
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
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
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
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
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
    alignSelf: 'flex-end',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 