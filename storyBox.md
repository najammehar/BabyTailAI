```jsx
// StoryEditor.js
import React, { useEffect, useRef, useCallback } from 'react';
import { useStory } from '../context/StoryContext';
import { useChapters } from '../context/ChapterContext';
import Div1 from './Div1';
import { useAuth } from '../context/AuthContext';
import { useImage } from '../context/ImageContext';

const getWordCount = (text) =>
  text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

const StoryEditor = () => {
  const {
    suggestions,
    setSuggestions,
    wordCount,
    setWordCount,
    lastCheckpoint,
    setLastCheckpoint,
    currentChapterId,
    setCurrentChapterId,
    debouncedSave,
    fetchSuggestions,
    saveStatus
  } = useStory();

  const { chapters } = useChapters();
  const editorRef = useRef(null);
  const { user } = useAuth();
  const { images } = useImage();

  // Clear content when user logs out
  useEffect(() => {
    if (!user) {
      if (editorRef.current) {
        editorRef.current.innerText = '';
      }
      setWordCount(0);
      setLastCheckpoint(0);
      setCurrentChapterId(null);
      setSuggestions({ suggestion1: '', suggestion2: '' });
    }
  }, [user, setWordCount, setLastCheckpoint, setCurrentChapterId, setSuggestions]);

  const checkWordCountMilestone = useCallback((currentCount, prevCount) => {
    // Check if we've crossed a multiple of 20
    const prevMilestone = Math.floor(prevCount / 20) * 20;
    const currentMilestone = Math.floor(currentCount / 20) * 20;

    return currentMilestone > prevMilestone && currentCount >= 20;
  }, []);

  const updateWordCount = useCallback((text) => {
    const currentWordCount = getWordCount(text);
    const shouldFetchSuggestions = checkWordCountMilestone(currentWordCount, wordCount);

    setWordCount(currentWordCount);

    return shouldFetchSuggestions;
  }, [wordCount, checkWordCountMilestone, setWordCount]);


  // Initial chapter load
  useEffect(() => {
    if (chapters.length > 0 && !currentChapterId && user) {
      setCurrentChapterId(chapters[0].$id);
      if (editorRef.current) {
        const initialText = chapters[0].story || '';
        editorRef.current.innerText = initialText;
        const currentWordCount = getWordCount(initialText);
        setWordCount(currentWordCount);

        // Fetch initial suggestions if word count >= 20
        if (currentWordCount >= 20) {
          fetchSuggestions(initialText);
        }
      }
    }
  }, [chapters, currentChapterId, setCurrentChapterId, setWordCount, user, fetchSuggestions]);

  const handleChapterClick = (chapterId) => {
    setCurrentChapterId(chapterId);
    const chapter = chapters.find(ch => ch.$id === chapterId);
    if (editorRef.current && chapter) {
      const text = chapter.story || '';
      editorRef.current.innerText = text;
      const currentWordCount = getWordCount(text);
      setWordCount(currentWordCount);
      setSuggestions({ suggestion1: '', suggestion2: '' });

      // Fetch suggestions for the new chapter if word count >= 20
      if (currentWordCount >= 20) {
        fetchSuggestions(text);
      }
    }
  };

  // Update handleTextChange
  const handleTextChange = async () => {
    if (!editorRef.current || !user) return;

    const text = editorRef.current.innerText || '';
    const shouldFetchSuggestions = updateWordCount(text);

    // Save the content
    if (text.trim() && currentChapterId) {
      debouncedSave(text, currentChapterId);
    }

    // Fetch suggestions if we've hit a new milestone
    if (shouldFetchSuggestions) {
      fetchSuggestions(text);
    }
  };

  const insertContent = useCallback((content) => {
    if (!editorRef.current) return;

    // Get the current text content
    const currentText = editorRef.current.innerText;

    // Add the new content at the end with a space
    editorRef.current.innerText = currentText + (currentText ? ' ' : '') + content;

    // Move cursor to the end
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(editorRef.current);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    // Check for new milestone after inserting suggestion
    const newText = editorRef.current.innerText;
    const shouldFetchSuggestions = updateWordCount(newText);
    if (shouldFetchSuggestions) {
      fetchSuggestions(newText);
    }
  }, [updateWordCount, fetchSuggestions]);

  const handleSuggestionClick = useCallback((suggestion) => {
    if (!suggestion) return;

    // Focus the editor before inserting content
    if (editorRef.current) {
      editorRef.current.focus();
    }

    insertContent(suggestion.trim());
    setSuggestions({ suggestion1: '', suggestion2: '' });
  }, [insertContent, setSuggestions]);

  const handleKeyDown = useCallback(
    (event) => {
      if (!editorRef.current) return;

      // Only handle keydown when 1 or 2 are pressed with no modifiers
      if ((event.key === '1' || event.key === '2') &&
        !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
        if (event.key === '1') handleSuggestionClick(suggestions.suggestion1);
        else if (event.key === '2') handleSuggestionClick(suggestions.suggestion2);
      }
    },
    [suggestions, handleSuggestionClick]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentChapter = chapters.find(ch => ch.$id === currentChapterId);

  useEffect(() => {
    if (images.length > 0 && editorRef.current) {
      const img = new Image();
      
      img.onload = () => {
        img.className = "float-right ml-7 mb-7 w-[170px] h-[235px] object-cover rounded-md shadow-md";
        
        const editor = editorRef.current;
        const firstChild = editor.firstChild;

        // Insert the image at the beginning of the editor
        if (!firstChild) {
          editor.appendChild(img);
        } else {
          editor.insertBefore(img, firstChild);
        }

        // Place cursor after the image
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStartAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger text change to save content
        handleTextChange();
      };

      // Set the image source to the latest uploaded image
      img.src = images[images.length - 1].url;
    }
  }, [images]);

  return (
    <div className="text-slate-700 dark:text-slate-200">
      {/* Chapter Selection */}
      <div className="flex items-center gap-4 mb-4 overflow-x-auto custom-scrollbar pb-2 w-[90%]">
        <div className="font-bold text-xl whitespace-nowrap">Chapters:</div>
        <div className="flex gap-2 flex-nowrap">
          {chapters.map((chapter) => (
            <button
              key={chapter.$id}
              onClick={() => handleChapterClick(chapter.$id)}
              className={`
                min-w-6 h-6
                rounded
                flex items-center justify-center
                text-sm
                transition-all
                ${currentChapterId === chapter.$id
                  ? 'border-2 border-slate-400 dark:border-slate-500'
                  : 'hover:border hover:border-slate-300 dark:hover:border-slate-600'
                }
                ${chapter?.completed 
                  ? 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-200' 
                  : 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200'}
              `}
            >
              {chapter.chapterNo}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <Div1 />

      {/* Text Editor */}
      {/* <div className="flex mb-4 mt-1 relative">
        <div
          ref={editorRef}
          className={`border-[1px] h-[400px] ${images.length> 0 ? 'w-3/5 border-r-0': 'w-full'} border-slate-400 dark:border-slate-600 p-4 overflow-y-auto z-20 custom-scrollbar bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 dark:empty:before:text-slate-500`}
          contentEditable={chapters.length > 0 && user ? true : false}
          onInput={handleTextChange}
          suppressContentEditableWarning={true}
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
          data-placeholder={user ? (chapters.length > 0 ? "⌨️ Type here" : "Add a chapter to start writing") : "Please Login to start writing"}
        />
        {images.length > 0 && (
        <div className='border border-l-0 border-slate-400 dark:border-slate-600 h-[400px] overflow-y-auto custom-scrollbar w-2/5 p-4 bg-white dark:bg-slate-800'>
          <div className="grid grid-cols-1 gap-2">
            {images.map((image) => (
              <img
                key={image.$id}
                src={image.url}
                alt="Chapter content"
                className="w-full h-60 object-cover rounded cursor-pointer"
                onClick={() => { }}
              />
            ))}
          </div>
        </div>
        )}
      </div> */}
      <div className="flex mb-4 mt-1 relative">
        <div
          ref={editorRef}
          className="w-full border border-slate-400 dark:border-slate-600 p-4 h-[400px] overflow-y-auto z-20 custom-scrollbar bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 dark:empty:before:text-slate-500"
          contentEditable={chapters.length > 0 && user ? true : false}
          onInput={handleTextChange}
          suppressContentEditableWarning={true}
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
          data-placeholder={user ? (chapters.length > 0 ? "⌨️ Type here" : "Add a chapter to start writing") : "Please Login to start writing"}
        />
      </div>


      {/* Word Count */}
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-4">
        <span>Word Count: {wordCount}</span>
        {saveStatus && (
          <span className={`italic ${
            saveStatus === 'Saved' ? 'text-green-600 dark:text-green-400' :
            saveStatus === 'Error saving' ? 'text-red-600 dark:text-red-400' :
            'text-blue-600 dark:text-blue-400'
          }`}>
            {saveStatus}
          </span>
        )}
      </div>

      <Div1 />

      {/* Suggestions */}
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleSuggestionClick(suggestions.suggestion1)}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 min-h-[60px] text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!suggestions.suggestion1}
          >
            <span className="font-medium mr-2">1:</span>
            {suggestions.suggestion1 || 'Waiting for suggestions...'}
          </button>
          <button
            onClick={() => handleSuggestionClick(suggestions.suggestion2)}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 min-h-[60px] text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!suggestions.suggestion2}
          >
            <span className="font-medium mr-2">2:</span>
            {suggestions.suggestion2 || 'Waiting for suggestions...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryEditor;