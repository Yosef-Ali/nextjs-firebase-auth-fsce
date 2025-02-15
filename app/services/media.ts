import { db, storage } from '@/lib/firebase';
import { Media, CreateMediaInput, MediaFilter } from '@/app/types/media';
import {
  collection,
  query,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'firebase/storage';
import { serializeData } from '@/app/utils/serialization';

const COLLECTION_NAME = 'media';
const STORAGE_PATH = 'media';
const STORAGE_PATHS = ['media/images', 'posts', 'partners', 'resources', 'uploads'];

export const mediaService = {
  async getMedia(): Promise<{ items: Media[]; lastDoc: any }> {
    try {
      console.log('Starting media fetch...');
      // Get items from Firestore
      const mediaRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(mediaRef);

      // Get items from Storage
      const storageItems: Media[] = [];
      for (const path of STORAGE_PATHS) {
        try {
          const storageRef = ref(storage, path);
          const result = await listAll(storageRef);

          const items = await Promise.all(
            result.items.map(async (item) => {
              try {
                const url = await getDownloadURL(item);
                const metadata = await getMetadata(item);
                return serializeData({
                  id: item.name,
                  name: item.name,
                  type: 'image',
                  url,
                  size: metadata.size,
                  mimeType: metadata.contentType || 'image/jpeg',
                  createdAt: metadata.timeCreated ? new Date(metadata.timeCreated) : new Date(),
                  updatedAt: metadata.updated ? new Date(metadata.updated) : new Date(),
                  uploadedBy: metadata.customMetadata?.uploadedBy || '',
                  uploadedByEmail: metadata.customMetadata?.uploadedByEmail || '',
                }) as Media;
              } catch (error) {
                console.error(`Error processing storage item ${item.name}:`, error);
                return null;
              }
            })
          );

          storageItems.push(...items.filter((item): item is Media => item !== null));
        } catch (error) {
          console.error(`Error fetching from path ${path}:`, error);
        }
      }

      // Merge Firestore and Storage items
      const firestoreItems = snapshot.docs.map(doc => serializeData({
        id: doc.id,
        ...doc.data()
      })) as Media[];

      const allItems = [...firestoreItems, ...storageItems];

      // Remove duplicates based on URL
      const uniqueItems = Array.from(new Map(allItems.map(item => [item.url, item])).values());

      console.log('Total items found:', uniqueItems.length);

      return {
        items: uniqueItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      console.error('Error in getMedia:', error);
      throw error;
    }
  },

  async uploadMedia(file: File, input: Omit<CreateMediaInput, 'url' | 'size' | 'mimeType'>): Promise<Media> {
    // Create a unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
    const path = `${STORAGE_PATH}/images/${filename}`; // Always store in images folder

    // Upload file to Firebase Storage
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Create media document with explicit type
    const now = serverTimestamp();
    const mediaData = {
      type: 'image', // Always set type as image
      name: file.name,
      description: input.description || '',
      url,
      size: file.size,
      mimeType: file.type,
      tags: input.tags || [],
      alt: input.alt || '',
      caption: input.caption || '',
      uploadedBy: input.uploadedBy,
      uploadedByEmail: input.uploadedByEmail,
      createdAt: now,
      updatedAt: now,
    };

    console.log('Creating media document:', mediaData);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), mediaData);
    const currentDate = new Date();

    return serializeData({
      id: docRef.id,
      ...mediaData,
      createdAt: currentDate,
      updatedAt: currentDate,
    }) as Media;
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
    const mediaDoc = await getDoc(mediaRef);
    const mediaData = mediaDoc.data();

    if (!mediaDoc.exists()) {
      throw new Error('Media not found');
    }

    if (mediaData?.url) {
      // Delete the file from storage
      const fileRef = ref(storage, mediaData.url);
      try {
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
        // Continue with document deletion even if storage deletion fails
      }

      // Delete thumbnail if exists
      if (mediaData.thumbnailUrl) {
        const thumbnailRef = ref(storage, mediaData.thumbnailUrl);
        try {
          await deleteObject(thumbnailRef);
        } catch (error) {
          console.error('Error deleting thumbnail from storage:', error);
        }
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
