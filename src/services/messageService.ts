import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Message, Conversation, User } from '@/types';

export const messageService = {
  // Get or create a conversation between users
  async getOrCreateConversation(participantIds: string[]): Promise<string> {
    // Sort participant IDs to ensure consistent conversation ID
    const sortedIds = [...participantIds].sort();
    const conversationId = sortedIds.join('_');

    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      // Create new conversation
      await setDoc(conversationRef, {
        id: conversationId,
        participants: sortedIds,
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return conversationId;
  },

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    attachments?: File[]
  ): Promise<void> {
    const messageId = doc(collection(db, 'messages')).id;
    const attachmentUrls = [];

    // Upload attachments if any
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        const storageRef = ref(storage, `messages/${conversationId}/${messageId}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        attachmentUrls.push({
          id: doc(collection(db, 'temp')).id,
          url,
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }
    }

    // Create message
    const message: Omit<Message, 'createdAt' | 'updatedAt'> = {
      id: messageId,
      conversationId,
      senderId,
      senderName,
      content,
      attachments: attachmentUrls,
      isRead: false,
      readBy: [senderId],
    };

    await setDoc(doc(db, 'messages', messageId), {
      ...message,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update conversation's last message
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: message,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // Get messages for a conversation
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ) {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Message;
      });
      callback(messages);
    });
  },

  // Get user's conversations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const conversations: Conversation[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Get participant details
      const participantDetails: User[] = [];
      for (const participantId of data.participants) {
        const userDoc = await getDoc(doc(db, 'users', participantId));
        if (userDoc.exists()) {
          participantDetails.push(userDoc.data() as User);
        }
      }

      // Count unread messages
      const unreadQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', data.id),
        where('readBy', 'not-array-contains', userId)
      );
      const unreadSnapshot = await getDocs(unreadQuery);
      const unreadCount = unreadSnapshot.size;

      conversations.push({
        ...data,
        participantDetails,
        unreadCount,
        lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Conversation);
    }

    return conversations;
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('readBy', 'not-array-contains', userId)
    );

    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        readBy: arrayUnion(userId),
        isRead: true,
        updatedAt: serverTimestamp(),
      })
    );

    await Promise.all(batch);
  },

  // Subscribe to conversations
  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const conversations: Conversation[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Get participant details
        const participantDetails: User[] = [];
        for (const participantId of data.participants) {
          const userDoc = await getDoc(doc(db, 'users', participantId));
          if (userDoc.exists()) {
            participantDetails.push(userDoc.data() as User);
          }
        }

        // Count unread messages
        const unreadQuery = query(
          collection(db, 'messages'),
          where('conversationId', '==', data.id),
          where('readBy', 'not-array-contains', userId)
        );
        const unreadSnapshot = await getDocs(unreadQuery);
        const unreadCount = unreadSnapshot.size;

        conversations.push({
          ...data,
          participantDetails,
          unreadCount,
          lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Conversation);
      }

      callback(conversations);
    });
  },
};