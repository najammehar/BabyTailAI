// StoryEditor.js
import React, { useEffect, useRef, useCallback } from 'react';
import { useStory } from '../context/StoryContext';
import { useChapters } from '../context/ChapterContext';
import Div1 from './Div1';
import { useAuth } from '../context/AuthContext';

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

  return (
    <div>
      {/* Chapter Selection */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        <div className='font-bold text-xl'>Chapters:</div>
        {chapters.map((chapter) => (
          <button
            key={chapter.$id}
            onClick={() => handleChapterClick(chapter.$id)}
            className={`size-6 rounded whitespace-nowrap text-sm ${currentChapterId === chapter.$id
              ? 'border-2'
              : 'hover:border'
              } ${chapter?.completed ? 'bg-green-200' : 'bg-yellow-200'}`}
          >
            {chapter.chapterNo}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <Div1 />

      {/* Text Editor */}
      <div className="mb-4 mt-1">
        <div
          ref={editorRef}
          className="border-[1px] h-[400px] border-slate-400 p-4 overflow-y-auto z-20 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
          contentEditable={chapters.length > 0 || user ? true : false}
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
      <div className="text-sm text-gray-600 mb-4 flex items-center gap-4">
        <span>Word Count: {wordCount}</span>
        {saveStatus && (
          <span className={`italic ${saveStatus === 'Saved' ? 'text-green-600' :
            saveStatus === 'Error saving' ? 'text-red-600' :
              'text-blue-600'
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
            className="p-3 bg-white border border-slate-400 min-h-[60px] text-left hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!suggestions.suggestion1}
          >
            <span className="font-medium mr-2">1:</span>
            {suggestions.suggestion1 || 'Waiting for suggestions...'}
          </button>
          <button
            onClick={() => handleSuggestionClick(suggestions.suggestion2)}
            className="p-3 bg-white border border-slate-400 min-h-[60px] text-left hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!suggestions.suggestion2}
          >
            <span className="font-medium mr-2">2:</span>
            {suggestions.suggestion2 || 'Waiting for suggestions...'}
          </button>
        </div>
      </div>

      {/* Bottom Progress Bar */}
    </div>
  );
};

export default StoryEditor;