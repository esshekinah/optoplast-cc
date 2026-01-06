// Firestore Data Service Implementation
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  FormSubmission, 
  CreateFormSubmissionData, 
  UpdateFormSubmissionData, 
  IFormSubmissionService,
  DataError 
} from './data-service';

const COLLECTION_NAME = 'form_submissions';

// Convert Firestore document to FormSubmission
function docToFormSubmission(docSnapshot: any): FormSubmission {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
  };
}

// Firestore Implementation
export class FirestoreFormSubmissionService implements IFormSubmissionService {
  
  async getAll(): Promise<FormSubmission[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(docToFormSubmission);
    } catch (error) {
      console.error('Error getting all submissions:', error);
      throw new DataError('Failed to fetch submissions', 'FIRESTORE_READ_ERROR');
    }
  }

  async getById(id: string): Promise<FormSubmission | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docToFormSubmission(docSnap);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting submission by ID:', error);
      throw new DataError('Failed to fetch submission', 'FIRESTORE_READ_ERROR');
    }
  }

  async create(data: CreateFormSubmissionData): Promise<FormSubmission> {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      
      // Get the created document to return it with the ID
      const createdDoc = await getDoc(docRef);
      if (!createdDoc.exists()) {
        throw new DataError('Failed to retrieve created submission', 'FIRESTORE_CREATE_ERROR');
      }
      
      return docToFormSubmission(createdDoc);
    } catch (error) {
      console.error('Error creating submission:', error);
      if (error instanceof DataError) throw error;
      throw new DataError('Failed to create submission', 'FIRESTORE_CREATE_ERROR');
    }
  }

  async update(id: string, data: UpdateFormSubmissionData): Promise<FormSubmission> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new DataError('Submission not found', 'NOT_FOUND');
      }

      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);
      
      // Get the updated document
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new DataError('Failed to retrieve updated submission', 'FIRESTORE_UPDATE_ERROR');
      }
      
      return docToFormSubmission(updatedDoc);
    } catch (error) {
      console.error('Error updating submission:', error);
      if (error instanceof DataError) throw error;
      throw new DataError('Failed to update submission', 'FIRESTORE_UPDATE_ERROR');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new DataError('Submission not found', 'NOT_FOUND');
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting submission:', error);
      if (error instanceof DataError) throw error;
      throw new DataError('Failed to delete submission', 'FIRESTORE_DELETE_ERROR');
    }
  }

  async search(query: string): Promise<FormSubmission[]> {
    try {
      // Note: Firestore doesn't have full-text search built-in
      // This is a basic implementation that gets all docs and filters client-side
      // For production, consider using Algolia or similar for better search
      
      const allSubmissions = await this.getAll();
      const normalizedQuery = query.trim().toLowerCase();
      
      if (!normalizedQuery) return allSubmissions;

      return allSubmissions.filter(item => {
        const searchableText = [
          item.machineNumber,
          item.date,
          item.startupCleared,
          item.mqrSignOff,
          ...item.timeSlots.map(slot => slot.item),
        ].filter(Boolean).join(' ').toLowerCase();

        return searchableText.includes(normalizedQuery);
      });
    } catch (error) {
      console.error('Error searching submissions:', error);
      throw new DataError('Failed to search submissions', 'FIRESTORE_SEARCH_ERROR');
    }
  }

  async filterByStatus(status: 'all' | 'Active' | 'Inactive'): Promise<FormSubmission[]> {
    try {
      if (status === 'all') {
        return this.getAll();
      }

      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(docToFormSubmission);
    } catch (error) {
      console.error('Error filtering submissions by status:', error);
      throw new DataError('Failed to filter submissions', 'FIRESTORE_FILTER_ERROR');
    }
  }
}

// Export singleton instance
export const firestoreFormSubmissionService = new FirestoreFormSubmissionService();