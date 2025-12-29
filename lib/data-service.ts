// Data Service Abstraction Layer
// Currently uses localStorage, but can easily be switched to API calls

export type TimeSlot = {
  time: string;
  item: string;
  opAuto: string;
  counter: string;
  goodQty: string;
  rejectsQty: string;
  comments: string;
  qcCheck: string;
};

export type FormSubmission = {
  id: string;
  date: string;
  machineNumber: string;
  startupCleared: string;
  mqrSignOff: string;
  timeSlots: TimeSlot[];
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
};

export type CreateFormSubmissionData = Omit<FormSubmission, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateFormSubmissionData = Partial<CreateFormSubmissionData>;

// Storage key for localStorage
const STORAGE_KEY = 'form_submissions';

// Error handling utility
class DataError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DataError';
  }
}

// Utility functions for localStorage operations
const storage = {
  get: (): FormSubmission[] => {
    try {
      if (typeof window === 'undefined') {
        console.log('Window is undefined, returning empty array');
        return [];
      }
      
      // Check if localStorage is available
      try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
      } catch (e) {
        console.error('localStorage is not available:', e);
        throw new DataError('localStorage is not available. Check browser settings.', 'STORAGE_UNAVAILABLE');
      }
      
      console.log('Reading from localStorage with key:', STORAGE_KEY);
      const data = localStorage.getItem(STORAGE_KEY);
      console.log('Raw data from localStorage:', data);
      
      if (!data) {
        console.log('No data found in localStorage, returning empty array');
        return [];
      }
      
      const parsed = JSON.parse(data);
      console.log('Parsed data:', parsed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      if (error instanceof DataError) throw error;
      throw new DataError('Failed to read data from storage', 'STORAGE_READ_ERROR');
    }
  },

  set: (data: FormSubmission[]): void => {
    try {
      if (typeof window === 'undefined') {
        console.log('Window is undefined, cannot save to localStorage');
        return;
      }
      
      // Check if localStorage is available
      try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
      } catch (e) {
        console.error('localStorage is not available:', e);
        throw new DataError('localStorage is not available. Check browser settings.', 'STORAGE_UNAVAILABLE');
      }
      
      console.log('Saving to localStorage:', data);
      const jsonString = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, jsonString);
      console.log('Successfully saved to localStorage');
      
      // Verify it was saved
      const verify = localStorage.getItem(STORAGE_KEY);
      console.log('Verification - saved data:', verify);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      if (error instanceof DataError) throw error;
      throw new DataError('Failed to write data to storage', 'STORAGE_WRITE_ERROR');
    }
  },

  clear: (): void => {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw new DataError('Failed to clear storage', 'STORAGE_CLEAR_ERROR');
    }
  }
};

// Generate unique ID
function generateId(): string {
  return Math.random().toString(16).slice(2) + '-' + Date.now().toString(16);
}

// Get current timestamp
function now(): string {
  return new Date().toISOString();
}

// Data Service Interface
export interface IFormSubmissionService {
  getAll(): Promise<FormSubmission[]>;
  getById(id: string): Promise<FormSubmission | null>;
  create(data: CreateFormSubmissionData): Promise<FormSubmission>;
  update(id: string, data: UpdateFormSubmissionData): Promise<FormSubmission>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<FormSubmission[]>;
  filterByStatus(status: 'all' | 'Active' | 'Inactive'): Promise<FormSubmission[]>;
}

// LocalStorage Implementation
class LocalStorageFormSubmissionService implements IFormSubmissionService {
  
  async getAll(): Promise<FormSubmission[]> {
    try {
      const data = storage.get();
      return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string): Promise<FormSubmission | null> {
    try {
      const data = storage.get();
      return data.find(item => item.id === id) || null;
    } catch (error) {
      throw error;
    }
  }

  async create(data: CreateFormSubmissionData): Promise<FormSubmission> {
    try {
      console.log('Creating new submission with data:', data);
      const currentData = storage.get();
      console.log('Current data from storage:', currentData);
      
      const newSubmission: FormSubmission = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };

      console.log('New submission created:', newSubmission);
      const updatedData = [newSubmission, ...currentData];
      console.log('Updated data array:', updatedData);
      
      storage.set(updatedData);
      console.log('Create operation completed successfully');

      return newSubmission;
    } catch (error) {
      console.error('Error in create function:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateFormSubmissionData): Promise<FormSubmission> {
    try {
      const currentData = storage.get();
      const index = currentData.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new DataError('Submission not found', 'NOT_FOUND');
      }

      const updatedSubmission: FormSubmission = {
        ...currentData[index],
        ...data,
        id, // Ensure ID doesn't change
        updatedAt: now(),
      };

      currentData[index] = updatedSubmission;
      storage.set(currentData);

      return updatedSubmission;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const currentData = storage.get();
      const filteredData = currentData.filter(item => item.id !== id);
      
      if (filteredData.length === currentData.length) {
        throw new DataError('Submission not found', 'NOT_FOUND');
      }

      storage.set(filteredData);
    } catch (error) {
      throw error;
    }
  }

  async search(query: string): Promise<FormSubmission[]> {
    try {
      const data = storage.get();
      const normalizedQuery = query.trim().toLowerCase();
      
      if (!normalizedQuery) return data;

      return data.filter(item => {
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
      throw error;
    }
  }

  async filterByStatus(status: 'all' | 'Active' | 'Inactive'): Promise<FormSubmission[]> {
    try {
      const data = storage.get();
      
      if (status === 'all') return data;
      
      return data.filter(item => item.status === status);
    } catch (error) {
      throw error;
    }
  }
}

// API Implementation (Commented out for future use)
/*
class ApiFormSubmissionService implements IFormSubmissionService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/form-submissions') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new DataError(error.message || 'Request failed', 'API_ERROR');
    }

    return response.json();
  }

  async getAll(): Promise<FormSubmission[]> {
    return this.request<FormSubmission[]>('');
  }

  async getById(id: string): Promise<FormSubmission | null> {
    try {
      return this.request<FormSubmission>(`/${id}`);
    } catch (error) {
      if (error instanceof DataError && error.code === 'NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateFormSubmissionData): Promise<FormSubmission> {
    return this.request<FormSubmission>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateFormSubmissionData): Promise<FormSubmission> {
    return this.request<FormSubmission>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request(`/${id}`, { method: 'DELETE' });
  }

  async search(query: string): Promise<FormSubmission[]> {
    return this.request<FormSubmission[]>(`/search?q=${encodeURIComponent(query)}`);
  }

  async filterByStatus(status: 'all' | 'Active' | 'Inactive'): Promise<FormSubmission[]> {
    if (status === 'all') return this.getAll();
    return this.request<FormSubmission[]>(`/filter?status=${status}`);
  }
}
*/

// Factory function to get the appropriate service
export function createFormSubmissionService(): IFormSubmissionService {
  // Switch between localStorage and API here
  // For localStorage: return new LocalStorageFormSubmissionService();
  // For API: return new ApiFormSubmissionService();
  
  return new LocalStorageFormSubmissionService();
}

// Export singleton instance
export const formSubmissionService = createFormSubmissionService();

// Utility functions for common operations
export const formSubmissionUtils = {
  // Initialize with sample data if storage is empty
  initializeSampleData: async (): Promise<void> => {
    try {
      const existing = await formSubmissionService.getAll();
      if (existing.length > 0) return; // Already has data

      const sampleData: CreateFormSubmissionData = {
        date: new Date().toISOString().split('T')[0],
        machineNumber: 'M-001',
        startupCleared: 'John Doe',
        mqrSignOff: 'K. Valentyn',
        timeSlots: [
          { time: '08h00', item: 'Sample Item 1', opAuto: 'OP', counter: '100', goodQty: '95', rejectsQty: '5', comments: 'All good', qcCheck: 'Passed' },
          { time: '10h00', item: 'Sample Item 2', opAuto: 'AUTO', counter: '200', goodQty: '190', rejectsQty: '10', comments: 'Running smoothly', qcCheck: 'Passed' },
          { time: '12h00', item: 'Sample Item 3', opAuto: 'OP', counter: '150', goodQty: '145', rejectsQty: '5', comments: 'No issues', qcCheck: 'Passed' },
          { time: '14h00', item: 'Sample Item 4', opAuto: 'AUTO', counter: '180', goodQty: '175', rejectsQty: '5', comments: 'Good quality', qcCheck: 'Passed' },
          { time: '16h00', item: 'Sample Item 5', opAuto: 'OP', counter: '120', goodQty: '115', rejectsQty: '5', comments: 'End of shift', qcCheck: 'Passed' },
        ],
        status: 'Active',
      };

      await formSubmissionService.create(sampleData);
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  },

  // Export data to JSON
  exportData: async (): Promise<string> => {
    try {
      const data = await formSubmissionService.getAll();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      throw error;
    }
  },

  // Import data from JSON
  importData: async (jsonData: string): Promise<void> => {
    try {
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data)) {
        throw new DataError('Invalid data format', 'INVALID_FORMAT');
      }

      // Validate data structure
      const validData = data.filter(item => 
        item.id && 
        item.date && 
        item.machineNumber && 
        Array.isArray(item.timeSlots)
      );

      storage.set(validData);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new DataError('Invalid JSON format', 'INVALID_JSON');
      }
      throw error;
    }
  },

  // Clear all data
  clearAllData: async (): Promise<void> => {
    try {
      storage.clear();
    } catch (error) {
      throw error;
    }
  },
};
