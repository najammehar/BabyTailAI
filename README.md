```jsx
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

  // ... (previous code remains the same until the suggestions section)

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

  // Rest of the component remains the same until the suggestions section
  return (
    <div>
      {/* Previous JSX remains the same */}

      {/* Updated Suggestions Section */}
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