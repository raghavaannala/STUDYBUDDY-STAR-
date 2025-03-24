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
    userPhotoURL?: string;
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
    let messageUserPhotoURL: string = '';
    let messageIsBot: boolean = false;
    let userId: string;
    
    // Handle legacy format
    if (typeof groupIdOrMessage === 'object') {
      groupId = groupIdOrMessage.groupId;
      messageContent = groupIdOrMessage.content;
      messageUserName = groupIdOrMessage.userName || '';
      messageUserPhotoURL = groupIdOrMessage.userPhotoURL || '';
      messageIsBot = groupIdOrMessage.isBot || false;
      userId = groupIdOrMessage.userId;
    } else {
      groupId = groupIdOrMessage;
      messageContent = content || '';
      messageUserName = userName || '';
      messageUserPhotoURL = userPhotoURL || '';
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
      userPhotoURL: messageUserPhotoURL,
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
  
  // Use orderByChild with timestamp for proper ordering
  const messagesQuery = query(messagesRef, orderByChild('timestamp'));
  
  // Debug info - add more logging
  console.log(`[ChatService] Watching database path: chats/${groupId}/messages`);
  
  const unsubscribe = onValue(messagesQuery, (snapshot) => {
    const messages: ChatMessage[] = [];
    
    console.log(`[ChatService] Snapshot received for group ${groupId} - has children: ${snapshot.exists()}`);
    
    if (!snapshot.exists()) {
      console.log(`[ChatService] No messages found for group ${groupId}`);
      callback([]); // Return empty array for empty chat
      return;
    }
    
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      
      // If data is malformed, skip this message
      if (!data || !data.content) {
        console.warn(`[ChatService] Skipping malformed message data:`, data);
        return;
      }
      
      // Debug logging for all messages
      console.log(`[ChatService] Message received - ID: ${data.id || childSnapshot.key}, Content: ${
        data.content?.length > 50 ? `${data.content.substring(0, 50)}...` : data.content
      }, Time: ${new Date(data.timestamp || 0).toLocaleTimeString()}, User: ${data.userName || 'Unknown'}`);
      
      // Ensure we have an ID even if the original message didn't include one
      const messageId = data.id || childSnapshot.key || uuidv4();
      
      // Ensure timestamp is a valid number
      const timestamp = typeof data.timestamp === 'number' ? data.timestamp : Date.now();
      
      messages.push({
        ...data,
        id: messageId,
        timestamp: timestamp, 
        groupId: groupId, // Ensure groupId is always set
        userName: data.userName || 'Anonymous', // Ensure userName is always set
        userId: data.userId || 'unknown' // Ensure userId is always set
      });
    });
    
    // Sort messages by timestamp before returning
    const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log(`[ChatService] Retrieved ${sortedMessages.length} sorted messages for group ${groupId}`);
    callback(sortedMessages);
  }, (error) => {
    console.error(`[ChatService] Error subscribing to messages:`, error);
    // If subscription fails, return empty array
    callback([]);
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

// Add a new function to clear all messages for a group
export const clearChatForGroup = async (groupId: string): Promise<boolean> => {
  try {
    console.log(`[ChatService] Clearing all messages for group ${groupId}`);
    
    // Reference to the messages for this group
    const messagesRef = ref(rtdb, `chats/${groupId}/messages`);
    
    // Get existing messages first
    const snapshot = await get(messagesRef);
    if (!snapshot.exists()) {
      console.log(`[ChatService] No messages found for group ${groupId}`);
      return true; // No messages to delete is still successful
    }
    
    // Count how many messages we're deleting
    let messageCount = 0;
    snapshot.forEach(() => {
      messageCount++;
    });
    console.log(`[ChatService] Found ${messageCount} messages to delete`);
    
    try {
      // Instead of deleting one by one, set the entire messages node to null
      // This is more efficient and less prone to errors
      await set(messagesRef, null);
      
      // Verify the deletion was successful
      const verifySnapshot = await get(messagesRef);
      const success = !verifySnapshot.exists();
      
      if (success) {
        console.log(`[ChatService] Successfully cleared ${messageCount} messages for group ${groupId}`);
        return true;
      } else {
        console.error(`[ChatService] Failed to clear messages for group ${groupId} - messages still exist`);
        return false;
      }
    } catch (deleteError) {
      console.error('[ChatService] Error during messages deletion:', deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error('[ChatService] Error clearing chat messages:', error);
    throw error;
  }
};