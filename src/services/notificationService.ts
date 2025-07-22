import { messaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  data?: Record<string, any>;
}

export const notificationService = {
  // Request permission and get FCM token
  async requestPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        
        const messagingInstance = await messaging();
        if (!messagingInstance) {
          throw new Error('Messaging not supported');
        }
        
        const token = await getToken(messagingInstance, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
        });
        
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('Notification permission denied.');
        return null;
      }
    } catch (error) {
      console.error('Error getting notification permission:', error);
      return null;
    }
  },

  // Save FCM token to user document
  async saveFCMToken(userId: string, token: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        fcmTokens: arrayUnion(token),
        lastTokenUpdate: new Date()
      });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  },

  // Initialize notifications for the current user
  async initializeNotifications(userId: string): Promise<void> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
      }

      // Register service worker
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered successfully');

      // Request permission and get token
      const token = await this.requestPermission();
      if (token) {
        await this.saveFCMToken(userId, token);
      }

      // Listen for foreground messages
      const messagingInstance = await messaging();
      if (messagingInstance) {
        onMessage(messagingInstance, (payload) => {
          console.log('Received foreground message:', payload);
          this.showNotification({
            title: payload.notification?.title || 'FlowNote',
            body: payload.notification?.body || '新しい通知があります',
            icon: payload.notification?.icon || '/icon-192x192.png',
            url: payload.data?.url,
            data: payload.data
          });
        });
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  },

  // Show browser notification
  async showNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          badge: '/icon-72x72.png',
          tag: 'flownote',
          data: {
            url: payload.url,
            ...payload.data
          }
        });

        notification.onclick = () => {
          if (payload.url) {
            window.open(payload.url, '_blank');
          }
          notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  },

  // Check notification permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  },

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  // Send notification to specific user (backend function - placeholder)
  async sendNotificationToUser(
    userId: string,
    notification: NotificationPayload,
    type: 'message' | 'print' | 'event' | 'general' = 'general'
  ): Promise<void> {
    // This would typically be handled by a backend Cloud Function
    // For demo purposes, we'll just log it
    console.log('Sending notification to user:', userId, notification, type);
    
    // In a real implementation, you would call a backend API or Cloud Function
    // that uses the Firebase Admin SDK to send notifications
    /*
    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification,
          type
        })
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    */
  },

  // Send notification to all users in a school (backend function - placeholder)
  async sendNotificationToSchool(
    schoolId: string,
    notification: NotificationPayload,
    type: 'message' | 'print' | 'event' | 'general' = 'general'
  ): Promise<void> {
    // This would typically be handled by a backend Cloud Function
    console.log('Sending notification to school:', schoolId, notification, type);
  },

  // Create notification templates
  createMessageNotification(senderName: string, preview: string): NotificationPayload {
    return {
      title: `${senderName}からメッセージ`,
      body: preview,
      icon: '/icon-192x192.png',
      url: '/messages',
      data: {
        type: 'message',
        sender: senderName
      }
    };
  },

  createPrintNotification(title: string): NotificationPayload {
    return {
      title: '新しいプリントが配布されました',
      body: title,
      icon: '/icon-192x192.png',
      url: '/prints',
      data: {
        type: 'print',
        title
      }
    };
  },

  createEventNotification(eventTitle: string, eventDate: string): NotificationPayload {
    return {
      title: 'イベントのお知らせ',
      body: `${eventTitle} - ${eventDate}`,
      icon: '/icon-192x192.png',
      url: '/calendar',
      data: {
        type: 'event',
        title: eventTitle,
        date: eventDate
      }
    };
  }
};