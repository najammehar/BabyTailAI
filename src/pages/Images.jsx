import React, { useRef, useState } from 'react';
import { useImage } from '../context/ImageContext';
import { useStory } from '../context/StoryContext';
import { X, Upload, Image as ImageIcon, XCircle } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          class="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"
        ></div>
      </div>
    );
  }

  return (
    <div className={`${!showModal && 'hidden'} p-4 overflow-y-auto custom-scrollbar h-full`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Add Image</h2>
        <button>
          <XCircle className="w-6 h-6 text-slate-500 dark:text-slate-400" onClick={() => setShowModal(false)} />
        </button>
      </div>


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
    </div>
  );
};

export default Images;