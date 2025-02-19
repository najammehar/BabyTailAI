import React from "react";
import { Outlet } from "react-router-dom";
import StoryBox from "../components/StoryBox";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div className="relative w-full p-4">
      <div className="absolute top-4 right-4">
        {user ? (
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white">{user.name.charAt(0)}</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-red-600">?</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-2/3 overflow-y-auto">
          <StoryBox />
        </div>
          <div className="w-full lg:w-1/3 overflow-y-auto border border-slate-400 mt-14">
            <Outlet />
          </div>
      </div>
    </div>
  );
}

export default Home;
