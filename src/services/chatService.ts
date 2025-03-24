import { rtdb, auth } from '@/config/firebase';
import { ref, push, onValue, query, orderByChild, startAt, get, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  isBot?: boolean;
  groupId?: string;
}

// Add support for legacy message format
export const sendMessage = async (
  groupIdOrMessage: string | {
    groupId: string;
    userId: string;
    content: string;
    isBot?: boolean;
    userName?: string;
  },
  content?: string,
  userName?: string,
  userPhotoURL?: string,
  isBot = false
): Promise<void> => {
  try {
    let groupId: string;
    let messageContent: string;
    let messageUserName: string = '';
    let messageIsBot: boolean = false;
    let userId: string;
    
    // Handle legacy format
    if (typeof groupIdOrMessage === 'object') {
      groupId = groupIdOrMessage.groupId;
      messageContent = groupIdOrMessage.content;
      messageUserName = groupIdOrMessage.userName || '';
      messageIsBot = groupIdOrMessage.isBot || false;
      userId = groupIdOrMessage.userId;
    } else {
      groupId = groupIdOrMessage;
      messageContent = content || '';
      messageUserName = userName || '';
      messageIsBot = isBot;
      userId = auth.currentUser?.uid || 'anonymous';
    }
    
    const messageRef = ref(rtdb, `chats/${groupId}/messages`);
    
    const newMessage: ChatMessage = {
      id: uuidv4(),
      content: messageContent,
      timestamp: Date.now(),
      userId,
      userName: messageUserName,
      userPhotoURL,
      isBot: messageIsBot,
      groupId
    };
    
    console.log(`[ChatService] Sending message to group ${groupId}:`, 
      messageContent.length > 50 ? `${messageContent.substring(0, 50)}...` : messageContent);
    
    await push(messageRef, newMessage);
  } catch (error) {
    console.error('[ChatService] Error sending message:', error);
    throw error;
  }
};

export const subscribeToGroupMessages = (
  groupId: string,
  callback: (messages: ChatMessage[]) => void
): () => void => {
  console.log(`[ChatService] Subscribing to messages for group ${groupId}`);
  
  // Ensure we're looking at the correct path
  const messagesRef = ref(rtdb, `chats/${groupId}/messages`);
  const messagesQuery = query(messagesRef, orderByChild('timestamp'));
  
  // Debug info - add more logging
  console.log(`[ChatService] Watching database path: chats/${groupId}/messages`);
  
  const unsubscribe = onValue(messagesQuery, (snapshot) => {
    const messages: ChatMessage[] = [];
    
    console.log(`[ChatService] Snapshot received for group ${groupId} - has children: ${snapshot.exists()}`);
    
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      
      // Debug logging for all messages
      console.log(`[ChatService] Message received - ID: ${data.id}, Content: ${
        data.content?.length > 50 ? `${data.content.substring(0, 50)}...` : data.content
      }, Time: ${new Date(data.timestamp).toLocaleTimeString()}, User: ${data.userName}`);
      
      messages.push({
        ...data,
        key: childSnapshot.key,
        groupId  // Make sure the groupId is always included
      });
    });
    
    console.log(`[ChatService] Retrieved ${messages.length} messages for group ${groupId}`);
    callback(messages);
  }, (error) => {
    console.error(`[ChatService] Error subscribing to messages:`, error);
  });
  
  return unsubscribe;
};

export const getRecentMessages = async (
  groupId: string,
  limit = 50
): Promise<ChatMessage[]> => {
  try {
    console.log(`[ChatService] Getting recent messages for group ${groupId}, limit: ${limit}`);
    
    const messagesRef = ref(rtdb, `chats/${groupId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    
    const snapshot = await get(messagesQuery);
    const messages: ChatMessage[] = [];
    
    snapshot.forEach((childSnapshot) => {
      messages.push({
        ...childSnapshot.val(),
        key: childSnapshot.key,
        groupId
      });
    });
    
    // Sort by timestamp and take the most recent messages
    const sortedMessages = messages
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
    
    console.log(`[ChatService] Retrieved ${sortedMessages.length} recent messages`);
    return sortedMessages;
  } catch (error) {
    console.error('[ChatService] Error getting recent messages:', error);
    return [];
  }
};