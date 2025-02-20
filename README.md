```jsx
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

const handleKeyDown = useCallback(
  (event) => {
    if (!editorRef.current) return;

    // Only handle keydown when 1 or 2 are pressed with no modifiers
    if ((event.key === '1' || event.key === '2') && 
        !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault(); // Prevent the key from being typed
      if (event.key === '1') handleSuggestionClick(suggestions.suggestion1);
      else if (event.key === '2') handleSuggestionClick(suggestions.suggestion2);
    }
  },
  [suggestions, handleSuggestionClick]
);