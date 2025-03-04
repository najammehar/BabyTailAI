import React, { createContext, useContext, useState, useCallback } from 'react';
import { useChapters } from './ChapterContext';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { useMilestones } from './MilestonesContext';

const StoryContext = createContext();

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStory must be used within StoryProvider');
  }
  return context;
};

export const StoryProvider = ({ children }) => {
  const [suggestions, setSuggestions] = useState({ suggestion1: '', suggestion2: '' });
  const [wordCount, setWordCount] = useState(0);
  const [lastCheckpoint, setLastCheckpoint] = useState(0);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const { updateChapter, chapters } = useChapters();
  const [saveStatus, setSaveStatus] = useState('');

  const debouncedSave = useCallback(
    debounce(async (text, chapterId) => {
      if (!text?.trim() || !chapterId) return;
      setSaveStatus('Saving...'); // Add this
      try {
        await updateChapter(chapterId, { story: text });
        setSaveStatus('Saved'); // Add this
        setTimeout(() => setSaveStatus(''), 2000); // Clear after 2 seconds
      } catch (error) {
        console.error('Error saving chapter:', error);
        setSaveStatus('Error saving'); // Add this
      }
    }, 3000),
    [updateChapter]
  );

  const { milestone } = useMilestones();

  const fetchSuggestions = useCallback(async (story) => {
    if (!story?.trim() || !milestone) return;
    
    // Get the last sentence or partial sentence
    // const sentences = story.trim().split(/[.!?]+\s+/);
    // let lastSentence = sentences[sentences.length - 1];
    
    // If the last sentence is too long, take only the last 30 words
    // const words = lastSentence.split(/\s+/);
    // if (words.length > 30) {
    //   lastSentence = words.slice(-30).join(' ');
    // }

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      console.error('Groq API key is not set');
      return;
    }

    const milestoneContext = `
    Relation: ${milestone.relation}
    Name: ${milestone.name}
    Gender: ${milestone.sex}
    Date of Birth: ${milestone.dateOfBirth}
    Hometown: ${milestone.hometown}
    Ethnicity: ${milestone.ethnicity}
    Family Members: ${milestone.familyMembers}
    Special Traditions: ${milestone.specialTraditions}
    Favorite Memories: ${milestone.favoriteMemories}
    Parent Wishes: ${milestone.parentWishes}
  `.trim();

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content:  `
              Based on the following context and the provided story, generate exactly two distinct time reference suggestions. 
              Each suggestion must be 5 to 7 words long, contextually relevant, and align with the writing style and tone. 
              Respond with only two time references separated by a newline.

              CONTEXT:
              ${milestoneContext}

              STORY:
              ${story}
            `
            },
            {
              role: 'user',
              content: 'Provide two time reference suggestions:',
            },
          ],
          temperature: 0.7,
          max_tokens: 50,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.choices && response.data.choices.length > 0) {
        let content = response.data.choices[0].message.content;
        // Split into lines and clean up
        const lines = content.split('\n').map(line => 
          line.replace(/^\d+[\):.]\s*|^[-*]\s*/, '').trim()
        ).filter(line => line);

        setSuggestions({
          suggestion1: lines[0] || '',
          suggestion2: lines[1] || '',
        });
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, [milestone]);

  const value = {
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
    saveStatus,
    setSaveStatus,
  };

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
};