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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Print } from '@/types';

export const printService = {
  // Upload a new print
  async uploadPrint(
    file: File,
    title: string,
    description: string,
    category: string,
    schoolId: string,
    uploadedBy: string
  ): Promise<void> {
    const printId = doc(collection(db, 'prints')).id;
    
    // Upload file to Storage
    const storageRef = ref(storage, `prints/${schoolId}/${printId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(snapshot.ref);

    // Create print document
    const printData: Omit<Print, 'createdAt' | 'updatedAt'> = {
      id: printId,
      title,
      description,
      fileUrl,
      category,
      schoolId,
      uploadedBy,
    };

    await setDoc(doc(db, 'prints', printId), {
      ...printData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // Get prints for a school
  async getPrints(
    schoolId: string,
    category?: string,
    limitCount: number = 50
  ): Promise<Print[]> {
    let q = query(
      collection(db, 'prints'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (category && category !== 'all') {
      q = query(
        collection(db, 'prints'),
        where('schoolId', '==', schoolId),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Print;
    });
  },

  // Subscribe to prints
  subscribeToPrints(
    schoolId: string,
    callback: (prints: Print[]) => void,
    category?: string,
    limitCount: number = 50
  ) {
    let q = query(
      collection(db, 'prints'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (category && category !== 'all') {
      q = query(
        collection(db, 'prints'),
        where('schoolId', '==', schoolId),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    return onSnapshot(q, (snapshot) => {
      const prints = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Print;
      });
      callback(prints);
    });
  },

  // Update print
  async updatePrint(
    printId: string,
    updates: Partial<Pick<Print, 'title' | 'description' | 'category'>>
  ): Promise<void> {
    await updateDoc(doc(db, 'prints', printId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete print
  async deletePrint(print: Print): Promise<void> {
    // Delete file from Storage
    const fileRef = ref(storage, print.fileUrl);
    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
    }

    // Delete document from Firestore
    await deleteDoc(doc(db, 'prints', print.id));
  },

  // Get print categories for a school
  async getCategories(schoolId: string): Promise<string[]> {
    const q = query(
      collection(db, 'prints'),
      where('schoolId', '==', schoolId)
    );

    const snapshot = await getDocs(q);
    const categories = new Set<string>();
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    return Array.from(categories).sort();
  },

  // Search prints
  async searchPrints(
    schoolId: string,
    searchTerm: string,
    category?: string
  ): Promise<Print[]> {
    // Note: Firestore doesn't support full-text search
    // For production, consider using Algolia or similar service
    // For now, we'll do a simple client-side search after fetching
    
    const prints = await this.getPrints(schoolId, category, 100);
    
    if (!searchTerm) return prints;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return prints.filter(
      (print) =>
        print.title.toLowerCase().includes(lowercaseSearch) ||
        (print.description && print.description.toLowerCase().includes(lowercaseSearch))
    );
  },

  // Get recent prints (for dashboard)
  async getRecentPrints(schoolId: string, count: number = 5): Promise<Print[]> {
    const q = query(
      collection(db, 'prints'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc'),
      limit(count)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Print;
    });
  },
};