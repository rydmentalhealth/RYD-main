// lib/firebase-service.ts
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Types for our data models
export interface User {
  id?: string;
  email: string;
  name?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id?: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

// Helper function to convert Firestore data to our models
const convertFirestoreDoc = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    // Convert Firestore Timestamps to JavaScript Dates
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    expiresAt: data.expiresAt?.toDate() || new Date(),
  } as T;
};

// User operations
export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(convertFirestoreDoc<User>);
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return convertFirestoreDoc<User>(userSnap as QueryDocumentSnapshot<DocumentData>);
    }
    return null;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return convertFirestoreDoc<User>(snapshot.docs[0]);
    }
    return null;
  },

  // Create new user
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const usersRef = collection(db, 'users');
    const now = new Date();
    const docRef = await addDoc(usersRef, {
      ...userData,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    
    return {
      id: docRef.id,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
  },

  // Update user
  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const userRef = doc(db, 'users', id);
    await deleteDoc(userRef);
  },

  // Get pending users
  async getPendingUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('status', '==', 'PENDING'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreDoc<User>);
  },

  // Get approved users
  async getApprovedUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('status', '==', 'APPROVED'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreDoc<User>);
  },
};

// Session operations
export const sessionService = {
  // Create session
  async createSession(sessionData: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
    const sessionsRef = collection(db, 'sessions');
    const now = new Date();
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(sessionData.expiresAt),
    });
    
    return {
      id: docRef.id,
      ...sessionData,
      createdAt: now,
    };
  },

  // Get session by token
  async getSessionByToken(token: string): Promise<Session | null> {
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('token', '==', token));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return convertFirestoreDoc<Session>(snapshot.docs[0]);
    }
    return null;
  },

  // Delete session
  async deleteSession(id: string): Promise<void> {
    const sessionRef = doc(db, 'sessions', id);
    await deleteDoc(sessionRef);
  },

  // Clean expired sessions
  async cleanExpiredSessions(): Promise<void> {
    const sessionsRef = collection(db, 'sessions');
    const now = new Date();
    const q = query(sessionsRef, where('expiresAt', '<', Timestamp.fromDate(now)));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },
};