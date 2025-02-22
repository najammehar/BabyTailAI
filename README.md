```jsx
// Images.jsx
import React, { useRef, useState } from 'react';
import { useImage } from '../context/ImageContext';
import { useStory } from '../context/StoryContext';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

const Images = () => {
  const { uploadImage, loading } = useImage();
  const { currentChapterId } = useStory();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && currentChapterId) {
      await uploadImage(file);
      // Only reset the value if the ref exists
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && currentChapterId && file.type.startsWith('image/')) {
      await uploadImage(file);
    }
  };

  if(loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${!showModal && 'hidden'} p-4 overflow-y-auto custom-scrollbar h-full lg:h-[522px]`}>
      <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Chapter Images</h2>
      
      {/* Upload Area */}
      <div
        className={`
          relative
          border-2 border-dashed
          rounded-lg
          p-8
          mb-6
          text-center
          transition-colors
          ${currentChapterId 
            ? 'border-blue-400 dark:border-blue-500 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer'
            : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 cursor-not-allowed'
          }
          ${isDragging ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-slate-800/50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => currentChapterId && fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
          disabled={!currentChapterId}
        />
        
        <div className="flex flex-col items-center gap-2">
          {currentChapterId ? (
            <>
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Click here to browse image
              </p>
            </>
          ) : (
            <>
              <div className="bg-gray-200 dark:bg-slate-700 p-3 rounded-full">
                <ImageIcon className="w-6 h-6 text-gray-400 dark:text-slate-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Select a chapter to upload images
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Modified part of StoryEditor.jsx - useEffect for images
useEffect(() => {
  // Check if images array exists and has items
  if (images?.length > 0 && editorRef.current) {
    const img = new Image();
    
    img.onload = () => {
      img.className = "float-right ml-7 mb-7 w-[170px] h-[235px] object-cover rounded-md shadow-md";
      
      const editor = editorRef.current;
      if (!editor) return; // Safety check

      const firstChild = editor.firstChild;

      if (!firstChild) {
        editor.appendChild(img);
      } else {
        editor.insertBefore(img, firstChild);
      }

      const selection = window.getSelection();
      const range = document.createRange();
      range.setStartAfter(img);
      selection.removeAllRanges();
      selection.addRange(range);
      
      handleTextChange();
    };

    img.src = images[images.length - 1].url;
  }
}, [images]);

// ImageContext.jsx
export const ImageProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentChapterId } = useStory();
  const [images, setImages] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(false);

  const uploadImage = async (file) => {
    if (!user || !currentChapterId) return;

    try {
      setLoading(true);
      const storageResponse = await storage.createFile(
        appwriteConfig.imagesBucketId,
        ID.unique(),
        file
      );

      const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.imagesBucketId}/files/${storageResponse.$id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT}`;

      const dbResponse = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.imagesCollectionId,
        ID.unique(),
        {
          userId: user.$id,
          chapterId: currentChapterId,
          fileId: storageResponse.$id,
          url: imageUrl
        }
      );

      // Update images array with new image
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