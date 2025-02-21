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
    <div>
      <h1 className="flex justify-center text-lg font-bold font-sm mb-2 mt-4">
        <BookOpen className="text-2xl mr-2 text-slate-700 dark:text-slate-200"/>
        Chapters
      </h1>

      <div className="flex justify-center items-center mb-4 sticky top-0 bg-inherit z-10">
        <input
          type="text"
          className="border border-slate-300 dark:border-slate-600 rounded p-2 w-1/3 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 
                   placeholder:text-slate-400 dark:placeholder:text-slate-500"
          placeholder="Add custom chapter" 
          style={{ fontSize: 'small' }}
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value)}
        />
        <button
          className="ml-4 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded shadow 
                   hover:bg-blue-600 dark:hover:bg-blue-700 text-xs transition-colors"
          onClick={handleAddChapter}
          type="button"
        >
          Add Chapter
        </button>
      </div>

      <form className="grid grid-cols-2 gap-x-4 gap-y-6 mx-auto w-[90%] py-6 h-[27rem] 
                    overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 
                    dark:scrollbar-thumb-slate-600 scrollbar-track-gray-100 
                    dark:scrollbar-track-slate-800">
        {initialChapOptions.map((option, index) => {
          const chapter = chapters.find(c => c.chapterNo === index + 1);
          return (
            <div 
              key={index}
              className={`relative w-full h-[94px] border-2 
                         ${selectedOptions[index] 
                           ? (chapter?.completed 
                             ? 'border-green-500 dark:border-green-600 bg-green-200 dark:bg-green-900/30' 
                             : 'border-yellow-500 dark:border-yellow-600 bg-yellow-200 dark:bg-yellow-900/30') 
                           : 'border-slate-400 dark:border-slate-600'} 
                         rounded-lg transition-colors`}
            >
              <label className="absolute top-2 left-0 right-0 text-sm font-semibold text-center">
                Chapter {index + 1}
              </label>
              <div className="absolute top-1/2 left-0 right-0 text-sm text-center -translate-y-1/2 px-2">
                {selectedOptions[index] || ""}
              </div>
              <div className="absolute bottom-1 left-2 flex items-center z-10">
                <input
                  type="checkbox"
                  className="w-3 h-3 cursor-pointer accent-green-600 dark:accent-green-500"
                  checked={chapter?.completed || false}
                  onChange={() => toggleCompletion(index)}
                  disabled={!selectedOptions[index]}
                />
                <span className="ml-1 text-[10px] text-slate-700 dark:text-slate-300">
                  Completed
                </span>
              </div>
              <select
                className="absolute inset-0 w-full h-[70%] opacity-0 cursor-pointer 
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200"
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
                    className={selectedOptions.includes(opt) 
                      ? 'text-red-300 dark:text-red-400' 
                      : 'text-slate-900 dark:text-slate-200'}
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