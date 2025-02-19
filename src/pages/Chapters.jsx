import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { useChapters } from "../context/ChapterContext";
import { useAuth } from "../context/AuthContext";

const Chap = () => {
  const { user } = useAuth();
  const { chapters, loading, createChapter, updateChapter } = useChapters();
  
  const chapterOptions = [
    "Waiting for Your Arrival 🎈",  
    "Your Birth Story 👶",  
    "Family and Friends 👨‍👩‍👧‍👦",  
    "Your Name 📝",  
    "First Days at Home 🏠",  
    "Growth and Milestones 📏",  
    "First Smile and Laugh 😂",  
    "First Words 📝",  
    "First Steps 👣",  
    "Favorite Foods 🍎",  
    "Sleep Patterns 🛏️",  
    "Personality and Traits 🎭",  
    "First Holidays and Traditions 🎄",  
    "Travel and Adventures ✈️",  
    "Art and Creativity 🎨",  
    "Pets and Animal Encounters 🐶",  
    "Friends and Playtimes 👫",  
    "Favorite Toys and Games 🧸",  
    "Challenges and Triumphs 🏆",  
    "Wishes for the Future 🌠",
    "other"
  ];

  const [initialChapOptions, setInitialChapOptions] = useState(chapterOptions);
  const [selectedOptions, setSelectedOptions] = useState(Array(chapterOptions.length).fill(""));
  const [newChapter, setNewChapter] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (chapters.length > 0) {
      const updatedOptions = Array(chapterOptions.length).fill("");
      chapters.forEach(chapter => {
        updatedOptions[chapter.chapterNo - 1] = chapter.name;
      });
      setSelectedOptions(updatedOptions);
    }
  }, [chapters]);

  const handleOptionChange = async (index, value) => {
    if (value && selectedOptions.includes(value)) {
      alert("This chapter has already been selected");
      return;
    }

    setLocalLoading(true);
    try {
      const chapterData = {
        userId: user.$id,
        chapterNo: index + 1,
        name: value,
        completed: false,
        story: chapters.story || ''
      };

      const existingChapter = chapters.find(c => c.chapterNo === index + 1);
      
      if (existingChapter) {
        await updateChapter(existingChapter.$id, { ...chapterData });
      } else {
        await createChapter(chapterData);
      }

      const updatedOptions = [...selectedOptions];
      updatedOptions[index] = value;
      setSelectedOptions(updatedOptions);
    } catch (error) {
      console.error('Error handling chapter selection:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAddChapter = () => {
    const trimmedNewChap = newChapter.trim();
    if (trimmedNewChap !== "" && !initialChapOptions.includes(trimmedNewChap)) {
      setInitialChapOptions((prevOptions) => [...prevOptions, trimmedNewChap]);
      setNewChapter("");
    }
  };

  const toggleCompletion = async (index) => {
    const chapter = chapters.find(c => c.chapterNo === index + 1);
    if (chapter) {
      setLocalLoading(true);
      try {
        // Only send the necessary fields for update
        const updateData = {
          userId: chapter.userId,
          chapterNo: chapter.chapterNo,
          name: chapter.name,
          completed: !chapter.completed,
          story: chapter.story || ''
        };
        
        await updateChapter(chapter.$id, updateData);
      } catch (error) {
        console.error('Error toggling completion:', error);
      } finally {
        setLocalLoading(false);
      }
    }
  };

  if (loading || localLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="ml-4 dark:bg-gray-800 dark:text-white ">
      <h1 className="flex justify-center text-l font-sm mt-2 mb-2">
        <BookOpen className="text-2xl mr-2"/>Chapters
      </h1>

      <div className="flex justify-center items-center mb-4 sticky top-0 bg-inherit z-10">
        <input
          type="text"
          className="border rounded p-2 w-1/3"
          placeholder="Add custom chapter" 
          style={{ fontSize: 'small' }}
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value)}
        />
        <button
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 text-xs"
          onClick={handleAddChapter}
          type="button"
        >
          Add Chapter
        </button>
      </div>

      <form className="grid grid-cols-2 gap-x-4 gap-y-6 mx-auto w-[90%] py-6 h-[27rem] overflow-y-auto pr-2">
        {initialChapOptions.map((option, index) => {
          const chapter = chapters.find(c => c.chapterNo === index + 1);
          return (
            <div 
              key={index}
              className={`relative w-full h-[94px] border-2 border-black rounded-lg ${
                selectedOptions[index] ? (chapter?.completed ? 'bg-green-200' : 'bg-yellow-200') : ''
              }`}
            >
              <label className="absolute top-2 left-0 right-0 text-sm font-semibold text-center">Chapter {index + 1}</label>
              <div className="absolute top-1/2 left-0 right-0 text-sm text-center -translate-y-1/2 px-2">
                {selectedOptions[index] || ""}
              </div>
              <div className="absolute bottom-1 left-2 flex items-center z-10">
                <input
                  type="checkbox"
                  className="w-3 h-3 cursor-pointer"
                  checked={chapter?.completed || false}
                  onChange={() => toggleCompletion(index)}
                  disabled={!selectedOptions[index]}
                />
                <span className="ml-1 text-[10px]">Completed</span>
              </div>
              <select
                className="absolute inset-0 w-full h-[70%] opacity-0 cursor-pointer"
                value={selectedOptions[index] || ""}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                style={{
                  whiteSpace: "normal",
                  overflow: "visible",
                  textOverflow: "ellipsis",
                }}
              >
                <option value="">Select a chapter</option>
                {initialChapOptions.map((opt, optIdx) => (
                  <option
                    key={optIdx}
                    value={opt}
                    disabled={selectedOptions.includes(opt)}
                    style={{
                      color: selectedOptions.includes(opt) ? "lightcoral" : "black",
                    }}
                  >
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </form>
    </div>
  );
};

export default Chap;