export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'parent' | 'admin';
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface School {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: Attachment[];
  isRead: boolean;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: User[];
  lastMessage?: Message;
  lastMessageAt: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface Print {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  category: string;
  schoolId: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  items?: string[];
  schoolId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}