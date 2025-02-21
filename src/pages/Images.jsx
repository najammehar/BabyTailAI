import React, { useRef, useState } from 'react';
import { useImage } from '../context/ImageContext';
import { useStory } from '../context/StoryContext';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

const Images = () => {
  const { images, uploadImage, deleteImage } = useImage();
  const { currentChapterId } = useStory();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && currentChapterId) {
      await uploadImage(file);
      fileInputRef.current.value = '';
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

  return (
    <div className="p-4 overflow-y-auto h-full lg:h-[522px]">
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
        onClick={() => currentChapterId && fileInputRef.current.click()}
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
  
      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div 
            key={image.$id} 
            className="relative group rounded-lg shadow-sm hover:shadow-md dark:shadow-slate-800 transition-shadow bg-white dark:bg-slate-800"
          >
            <img
              src={image.url}
              alt="Chapter content"
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => deleteImage(image.$id, image.fileId)}
              className="cursor-pointer absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm transition-colors"
              title="Delete image"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Images;