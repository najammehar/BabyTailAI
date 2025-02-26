```jsx
const { milestone } = useMilestones(); // Fetch milestone data

const fetchSuggestions = useCallback(async (story) => {
  if (!story?.trim() || !milestone) return;

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    console.error('Groq API key is not set');
    return;
  }

  // Constructing milestone context
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
            content: `
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
            content: 'Provide two time reference suggestions:'
          }
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
