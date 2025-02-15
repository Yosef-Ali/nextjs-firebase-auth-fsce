'use client';
import { useState, useEffect } from 'react';
import { Media } from '@/app/types/media';
import MediaGrid from '@/app/dashboard/_components/MediaGrid';
import { storage } from '@/lib/firebase';
import { ref, listAll, getDownloadURL, StorageReference } from 'firebase/storage';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
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
import { getMetadata } from 'firebase/storage';
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
    // Implement thumbnail generation logic here
    return null;
  },
};

interface MediaLibraryProps {
    selectionMode?: boolean;
    onSelect?: (item: { url: string }) => void;
    onClose?: () => void;
    selectedItems?: string[];
    onSelectionChange?: (items: string[]) => void;
}

export default function MediaLibrary({
    selectionMode = false,
    onSelect,
    onClose,
    selectedItems = [],
    onSelectionChange
}: MediaLibraryProps) {
    const [items, setItems] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch media items from Firebase Storage
    useEffect(() => {
        async function fetchMediaItems() {
            setIsLoading(true);
            try {
                const storageRef = ref(storage, 'resources');
                const result = await listAll(storageRef);

                const mediaItems = await Promise.all(
                    result.items.map(async (item: StorageReference) => {
                        const url = await getDownloadURL(item);
                        const name = item.name.split('-')[0]; // Remove timestamp from name
                        console.log(`Fetched media item: ${name}, URL: ${url}`);
                        return {
                            id: item.name,
                            url,
                            name,
                            type: item.name.split('.').pop()?.toLowerCase() || '',
                            createdAt: Date.now(),
                        };
                    })
                );

                setItems(mediaItems);
            } catch (error) {
                console.error('Error fetching media items:', error);
                toast.error('Failed to load media items');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMediaItems();
    }, []);

    const handleSelect = (id: string, selected: boolean) => {
        const media = items.find(item => item.id === id);
        if (!media) return;
        if (onSelect) {
            onSelect({ url: media.url });
        }
        if (onSelectionChange) {
            const newSelectedItems = selected
                ? [...selectedItems, id]
                : selectedItems.filter(itemId => itemId !== id);
            onSelectionChange(newSelectedItems);
        }
    };

    return (
        <div className="h-full">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : (
                <MediaGrid
                    items={items}
                    selectable={selectionMode}
                    selectedItems={selectedItems}
                    onSelect={handleSelect}
                />
            )}
        </div>
    );
}