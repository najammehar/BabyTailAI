import React from "react";
import { Outlet } from "react-router-dom";
import StoryBox from "../components/StoryBox";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen -mt-16 flex items-center justify-center">
        <div
          class="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"
        ></div>

      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="relative w-full p-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
      <div className="absolute top-2 right-2">
        {user ? (
          <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-green-700 flex items-center justify-center">
            <span className="text-white">{user.name.charAt(0)}</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-red-600 dark:bg-red-700 flex items-center justify-center">
            <span className="text-white dark:text-slate-200">?</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-2/3 overflow-y-auto">
          <StoryBox />
        </div>
        <div className="w-full lg:w-1/3 overflow-y-auto border border-slate-400 dark:border-slate-600 mt-[44px] bg-white dark:bg-slate-800 h-[493px]">
          <Outlet />
        </div>
      </div>
    </div>
    </>
  );
}

export default Home;