import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export const eventService = {
  // Create a new event
  async createEvent(
    title: string,
    description: string,
    date: Date,
    location: string,
    items: string[],
    schoolId: string,
    createdBy: string
  ): Promise<void> {
    const eventId = doc(collection(db, 'events')).id;
    
    const eventData: Omit<Event, 'createdAt' | 'updatedAt'> = {
      id: eventId,
      title,
      description,
      date,
      location,
      items,
      schoolId,
      createdBy,
    };

    await setDoc(doc(db, 'events', eventId), {
      ...eventData,
      date: Timestamp.fromDate(date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // Get events for a specific month
  async getEventsForMonth(schoolId: string, date: Date): Promise<Event[]> {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const q = query(
      collection(db, 'events'),
      where('schoolId', '==', schoolId),
      where('date', '>=', Timestamp.fromDate(monthStart)),
      where('date', '<=', Timestamp.fromDate(monthEnd)),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Event;
    });
  },

  // Get events for a specific year
  async getEventsForYear(schoolId: string, year: number): Promise<Event[]> {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));

    const q = query(
      collection(db, 'events'),
      where('schoolId', '==', schoolId),
      where('date', '>=', Timestamp.fromDate(yearStart)),
      where('date', '<=', Timestamp.fromDate(yearEnd)),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Event;
    });
  },

  // Subscribe to events for a specific month
  subscribeToEventsForMonth(
    schoolId: string,
    date: Date,
    callback: (events: Event[]) => void
  ) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const q = query(
      collection(db, 'events'),
      where('schoolId', '==', schoolId),
      where('date', '>=', Timestamp.fromDate(monthStart)),
      where('date', '<=', Timestamp.fromDate(monthEnd)),
      orderBy('date', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event;
      });
      callback(events);
    });
  },

  // Update event
  async updateEvent(
    eventId: string,
    updates: Partial<Pick<Event, 'title' | 'description' | 'date' | 'location' | 'items'>>
  ): Promise<void> {
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(doc(db, 'events', eventId), updateData);
  },

  // Delete event
  async deleteEvent(eventId: string): Promise<void> {
    await deleteDoc(doc(db, 'events', eventId));
  },

  // Get upcoming events (for dashboard)
  async getUpcomingEvents(schoolId: string, count: number = 5): Promise<Event[]> {
    const now = new Date();
    
    const q = query(
      collection(db, 'events'),
      where('schoolId', '==', schoolId),
      where('date', '>=', Timestamp.fromDate(now)),
      orderBy('date', 'asc'),
      limit(count)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Event;
    });
  },

  // Get events for today
  async getTodaysEvents(schoolId: string): Promise<Event[]> {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const q = query(
      collection(db, 'events'),
      where('schoolId', '==', schoolId),
      where('date', '>=', Timestamp.fromDate(todayStart)),
      where('date', '<=', Timestamp.fromDate(todayEnd)),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Event;
    });
  },

  // Search events
  async searchEvents(
    schoolId: string,
    searchTerm: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Event[]> {
    let q = query(
      collection(db, 'events'),
      where('schoolId', '==', schoolId),
      orderBy('date', 'desc')
    );

    if (startDate) {
      q = query(
        collection(db, 'events'),
        where('schoolId', '==', schoolId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        orderBy('date', 'asc')
      );
    }

    if (endDate && startDate) {
      q = query(
        collection(db, 'events'),
        where('schoolId', '==', schoolId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );
    }

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Event;
    });

    // Filter by search term (client-side)
    if (!searchTerm) return events;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(lowercaseSearch) ||
        event.description.toLowerCase().includes(lowercaseSearch) ||
        (event.location && event.location.toLowerCase().includes(lowercaseSearch))
    );
  },
};