import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  increment,
  setDoc
} from 'firebase/firestore';
import { db } from '../Firebase/firebase';

/**
 * Get or create a chat room between two users
 */
export const getChatRoom = async (userId1, userId2) => {
  try {
    // Create a consistent chat ID (sorted user IDs)
    const chatId = [userId1, userId2].sort().join('_');
    
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      // Create new chat room
      await setDoc(chatRef, {
        participants: [userId1, userId2],
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
        [`unreadCount_${userId1}`]: 0,
        [`unreadCount_${userId2}`]: 0
      });
    }
    
    return chatId;
  } catch (error) {
    console.error('Error getting chat room:', error);
    throw error;
  }
};

/**
 * Send a message
 */
export const sendMessage = async (chatId, senderId, receiverId, text) => {
  try {
    const messageData = {
      chatId,
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false
    };
    
    // Add message to messages subcollection
    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
    
    // Update chat room with last message
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    const currentUnread = chatDoc.data()?.[`unreadCount_${receiverId}`] || 0;
    
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      [`unreadCount_${receiverId}`]: currentUnread + 1
    });
    
    return messageData;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Subscribe to messages in a chat (real-time)
 */
export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (chatId, userId) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = [];
    
    snapshot.forEach((doc) => {
      updatePromises.push(
        updateDoc(doc.ref, { read: true })
      );
    });
    
    await Promise.all(updatePromises);
    
    // Reset unread count
    await updateDoc(doc(db, 'chats', chatId), {
      [`unreadCount_${userId}`]: 0
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Get user's chat list
 */
export const getUserChats = async (userId) => {
  try {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const chats = [];
    
    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    
    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

/**
 * Subscribe to user's chats (real-time)
 */
export const subscribeToUserChats = (userId, callback) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats = [];
    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    callback(chats);
  });
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (chatId, userId) => {
  try {
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (chatDoc.exists()) {
      const data = chatDoc.data();
      return data[`unreadCount_${userId}`] || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

