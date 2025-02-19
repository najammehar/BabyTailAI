import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Milestones from "./pages/Milestones";
import { AuthProvider } from "./context/AuthContext";
import Chapters from "./pages/Chapters";
import { MilestonesProvider } from "./context/MilestonesContext";
import { ChaptersProvider } from "./context/ChapterContext";
import { StoryProvider } from "./context/StoryContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <MilestonesProvider>
          <ChaptersProvider>
            <StoryProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />}>
                  <Route index element={<Signup />} />
                  <Route path="login" element={<Login />} />
                  <Route path="milestones" element={<Milestones />} />
                  <Route path="chapters" element={<Chapters />} />
                </Route>
              </Routes>
            </StoryProvider>
          </ChaptersProvider>
        </MilestonesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
