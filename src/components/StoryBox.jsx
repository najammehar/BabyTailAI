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
        deserializeContent(chapters[0].story || '');
        const currentWordCount = getWordCount(editorRef.current.innerText);
        setWordCount(currentWordCount);

        if (currentWordCount >= 20) {
          fetchSuggestions(editorRef.current.innerText);
        }
      }
    }
  }, [chapters, currentChapterId, setCurrentChapterId, setWordCount, user, fetchSuggestions]);

  const handleChapterClick = (chapterId) => {
    setCurrentChapterId(chapterId);
    const chapter = chapters.find(ch => ch.$id === chapterId);
    if (editorRef.current && chapter) {
      deserializeContent(chapter.story || '');
      const currentWordCount = getWordCount(editorRef.current.innerText);
      setWordCount(currentWordCount);
      setSuggestions({ suggestion1: '', suggestion2: '' });

      if (currentWordCount >= 20) {
        fetchSuggestions(editorRef.current.innerText);
      }
    }
  };

    // Helper function to serialize editor content
    const serializeContent = () => {
      if (!editorRef.current) return '';
      
      const content = [];
      editorRef.current.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'IMG') {
          // Save image with its attributes
          content.push({
            type: 'image',
            src: node.src,
            className: node.className,
            width: node.width,
            height: node.height
          });
        } else if (node.nodeType === Node.TEXT_NODE) {
          content.push({
            type: 'text',
            content: node.textContent
          });
        }
      });
      
      return JSON.stringify(content);
    };
  
    // Helper function to deserialize content
    const deserializeContent = (serializedContent) => {
      if (!editorRef.current) return;
      
      editorRef.current.innerHTML = '';
      
      try {
        const content = JSON.parse(serializedContent);
        content.forEach(item => {
          if (item.type === 'image') {
            const img = new Image();
            img.src = item.src;
            img.className = item.className;
            img.width = item.width;
            img.height = item.height;
            editorRef.current.appendChild(img);
          } else if (item.type === 'text') {
            const textNode = document.createTextNode(item.content);
            editorRef.current.appendChild(textNode);
          }
        });
      } catch (error) {
        console.error('Error deserializing content:', error);
        editorRef.current.innerText = serializedContent || '';
      }
    };

  // Update handleTextChange
  const handleTextChange = async () => {
    if (!editorRef.current || !user) return;

    const serializedContent = serializeContent();
    const textContent = editorRef.current.innerText || '';
    const shouldFetchSuggestions = updateWordCount(textContent);

    // Save the serialized content
    if (serializedContent && currentChapterId) {
      debouncedSave(serializedContent, currentChapterId);
    }

    // Fetch suggestions if we've hit a new milestone
    if (shouldFetchSuggestions) {
      fetchSuggestions(textContent);
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

  return (
    <div className="text-slate-700 dark:text-slate-200">
      {/* Chapter Selection */}
      <div className="flex items-center gap-4 mb-1 overflow-x-auto custom-scrollbar pb-2 w-[85%]">
        <div className="font-bold whitespace-nowrap">Chapters:</div>
        <div className="flex gap-1 flex-nowrap">
          {chapters.map((chapter) => (
            <button
              key={chapter.$id}
              onClick={() => handleChapterClick(chapter.$id)}
              className={`
                min-w-5 h-5
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
      <div className="flex mb-2 mt-1 relative">
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
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-4">
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
      <div className="mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleSuggestionClick(suggestions.suggestion1)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 min-h-[45px] text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!suggestions.suggestion1}
          >
            <span className="font-medium mr-2">1:</span>
            {suggestions.suggestion1 || 'Waiting for suggestions...'}
          </button>
          <button
            onClick={() => handleSuggestionClick(suggestions.suggestion2)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 min-h-[45px] text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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