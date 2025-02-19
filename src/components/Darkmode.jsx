import React, { useEffect } from 'react';


function App() {
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      document.documentElement.classList.add(storedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  };

  return (
      <>
      <button onClick={toggleTheme} className="mt-5 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer">
        Toggle Dark Mode
      </button>
      </>
  );
}

export default App;

