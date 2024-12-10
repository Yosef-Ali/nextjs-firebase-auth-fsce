import { db, storage } from '@/lib/firebase';
import { Media, CreateMediaInput, MediaFilter } from '@/app/types/media';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  orderBy,
  startAfter,
  limit,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const COLLECTION_NAME = 'media';
const STORAGE_PATH = 'media';

export const mediaService = {
  async getMedia(filter?: MediaFilter, lastDoc?: any, pageSize: number = 20): Promise<{ items: Media[]; lastDoc: any }> {
    const mediaRef = collection(db, COLLECTION_NAME);
    let q = query(mediaRef, orderBy('createdAt', 'desc'));

    // Apply filters
    if (filter) {
      if (filter.type) {
        q = query(q, where('type', '==', filter.type));
      }
      if (filter.uploadedBy) {
        q = query(q, where('uploadedBy', '==', filter.uploadedBy));
      }
      if (filter.tags && filter.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filter.tags));
      }
      if (filter.startDate) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(filter.startDate)));
      }
      if (filter.endDate) {
        q = query(q, where('createdAt', '<=', Timestamp.fromDate(filter.endDate)));
      }
    }

    // Apply pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    q = query(q, limit(pageSize));

    const querySnapshot = await getDocs(q);
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    const items = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        type: data.type || 'image',
        url: data.url || '',
        thumbnailUrl: data.thumbnailUrl || '',
        size: data.size || 0,
        mimeType: data.mimeType || '',
        width: data.width,
        height: data.height,
        duration: data.duration,
        tags: data.tags || [],
        alt: data.alt || '',
        caption: data.caption || '',
        uploadedBy: data.uploadedBy || '',
        uploadedByEmail: data.uploadedByEmail || '',
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Media;
    });

    return { items, lastDoc: lastVisible };
  },

  async uploadMedia(file: File, input: Omit<CreateMediaInput, 'url' | 'size' | 'mimeType'>): Promise<Media> {
    // Create a unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
    const path = `${STORAGE_PATH}/${input.type}/${filename}`;

    // Upload file to Firebase Storage
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Create media document
    const now = serverTimestamp();
    const mediaData = {
      ...input,
      url,
      size: file.size,
      mimeType: file.type,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), mediaData);
    const currentDate = new Date();

    return {
      id: docRef.id,
      ...input,
      url,
      size: file.size,
      mimeType: file.type,
      createdAt: currentDate,
      updatedAt: currentDate,
    } as Media;
  },

  async updateMedia(id: string, media: Partial<Media>): Promise<void> {
    const mediaRef = doc(db, COLLECTION_NAME, id);
    const updateData = {
      ...media,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(mediaRef, updateData);
  },

  async deleteMedia(id: string): Promise<void> {
    // Get the media document
    const mediaRef = doc(db, COLLECTION_NAME, id);
    const mediaDoc = await getDocs(query(collection(db, COLLECTION_NAME), where('id', '==', id)));
    const mediaData = mediaDoc.docs[0]?.data();

    if (mediaData?.url) {
      // Delete the file from storage
      const fileRef = ref(storage, mediaData.url);
      await deleteObject(fileRef);

      // Delete thumbnail if exists
      if (mediaData.thumbnailUrl) {
        const thumbnailRef = ref(storage, mediaData.thumbnailUrl);
        await deleteObject(thumbnailRef);
      }
    }

    // Delete the document
    await deleteDoc(mediaRef);
  },

  async generateThumbnail(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) {
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type, 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  },
};
