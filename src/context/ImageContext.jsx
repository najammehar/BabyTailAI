// context/ImageContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { databases, storage, appwriteConfig } from '../appwrite/config';
import { ID, Query } from 'appwrite';
import { useAuth } from './AuthContext';
import { useStory } from './StoryContext';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentChapterId } = useStory();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadImage = async (file) => {
    if (!user || !currentChapterId) return;

    try {
      // Upload to storage
      setLoading(true);
      const storageResponse = await storage.createFile(
        appwriteConfig.imagesBucketId,
        ID.unique(),
        file
      );

      // Create document
      const dbResponse = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.imagesCollectionId,
        ID.unique(),
        {
          userId: user.$id,
          chapterId: currentChapterId,
          fileId: storageResponse.$id,
          url: `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.imagesBucketId}/files/${storageResponse.$id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT}`
        }
      );

      setImages(prev => [...prev, dbResponse]);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageContext.Provider value={{ images, uploadImage, loading }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => useContext(ImageContext);