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

  const fetchImages = async () => {
    if (!user || !currentChapterId) {
        setImages([]);
        return;
    }
    
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.imagesCollectionId,
        [
          Query.equal('userId', user.$id),
          Query.equal('chapterId', currentChapterId)
        ]
      );
      setImages(response.documents);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const uploadImage = async (file) => {
    if (!user || !currentChapterId) return;

    try {
      // Upload to storage
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
    }
  };

  const deleteImage = async (imageId, fileId) => {
    try {
      await storage.deleteFile(appwriteConfig.imagesBucketId, fileId);
      await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.imagesCollectionId, imageId);
      setImages(prev => prev.filter(img => img.$id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  useEffect(() => {
    if (user && currentChapterId) fetchImages();
  }, [user, currentChapterId]);

  return (
    <ImageContext.Provider value={{ images, uploadImage, deleteImage }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => useContext(ImageContext);