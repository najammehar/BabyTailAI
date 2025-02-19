// StoryEditor.js
import React, { useEffect, useRef, useCallback } from 'react';
import { useStory } from '../context/StoryContext';
import { useChapters } from '../context/ChapterContext';
import Div1 from './Div1';

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

  const updateWordCount = useCallback((text) => {
    const currentWordCount = getWordCount(text);
    setWordCount(currentWordCount); // Update to show total word count

    // Check if we've reached a new 20-word milestone
    const remainder = currentWordCount % 20;
    const newCheckpoint = currentWordCount - remainder;
    if (newCheckpoint > lastCheckpoint) {
      setLastCheckpoint(newCheckpoint);
      return true; // Indicates we've hit a new 20-word milestone
    }
    return false;
  }, [setWordCount, setLastCheckpoint, lastCheckpoint]);

// Update useEffect for initial chapter load
useEffect(() => {
  if (chapters.length > 0 && !currentChapterId) {
    setCurrentChapterId(chapters[0].$id);
    if (editorRef.current) {
      const initialText = chapters[0].story || '';
      editorRef.current.innerText = initialText;
      const currentWordCount = getWordCount(initialText);
      setWordCount(currentWordCount);
      // Set the last checkpoint to the previous 20-word mark
      const remainder = currentWordCount % 20;
      setLastCheckpoint(currentWordCount - remainder - 20); // Subtract 20 to ensure next milestone triggers
      if (currentWordCount >= 20) {
        fetchSuggestions(initialText);
      }
    }
  }
}, [chapters, currentChapterId, updateWordCount]);

const handleChapterClick = (chapterId) => {
  setCurrentChapterId(chapterId);
  const chapter = chapters.find(ch => ch.$id === chapterId);
  if (editorRef.current && chapter) {
    const text = chapter.story || '';
    editorRef.current.innerText = text;
    const currentWordCount = getWordCount(text);
    setWordCount(currentWordCount);
    // Set the last checkpoint to the previous 20-word mark
    const remainder = currentWordCount % 20;
    setLastCheckpoint(currentWordCount - remainder - 20); // Subtract 20 to ensure next milestone triggers
    setSuggestions({ suggestion1: '', suggestion2: '' });
    if (currentWordCount >= 20) {
      fetchSuggestions(text);
    }
  }
};

  // Update handleTextChange
  const handleTextChange = async () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const hitMilestone = updateWordCount(text);

    if (text.trim() && currentChapterId) {
      debouncedSave(text, currentChapterId);
    }

    // Only fetch suggestions when we hit a 20-word milestone
    if (hitMilestone) {
      fetchSuggestions(text);
    }
  };

  const insertContent = useCallback((content) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = document.createTextNode(`${content} `);
      range.insertNode(text);
      range.collapse(false);

      // Update word count and check for milestone after inserting suggestion
      if (editorRef.current) {
        const newText = editorRef.current.innerText;
        const hitMilestone = updateWordCount(newText);
        if (hitMilestone) {
          fetchSuggestions(newText);
        }
      }
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

      if (event.key === '1') handleSuggestionClick(suggestions.suggestion1);
      else if (event.key === '2') handleSuggestionClick(suggestions.suggestion2);
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
          className="border-[1px] h-[400px] border-slate-400 p-4 overflow-y-auto z-20"
          contentEditable={chapters.length > 0}
          onInput={handleTextChange}
          suppressContentEditableWarning={true}
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
          data-placeholder={chapters.length > 0 ? "⌨️ Type here" : "Please wait for chapters to be created"}
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