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
import ProtectedRoute from "./components/ProtectedRoute";
import Images from "./pages/Images";
import PublicRoute from "./components/PublicRoute";
import { ImageProvider } from "./context/ImageContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <MilestonesProvider>
          <ChaptersProvider>
            <StoryProvider>
            <ImageProvider>
              
              <Routes>
                <Route path="/" element={<Home />}>
                  <Route index element={<PublicRoute><Signup /></PublicRoute>} />
                  <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="milestones" element={<ProtectedRoute><Milestones /></ProtectedRoute>} />
                  <Route path="chapters" element={<ProtectedRoute><Chapters /></ProtectedRoute>} />
                  <Route path="images" element={<ProtectedRoute><Images /></ProtectedRoute>} />
                </Route>
              </Routes>
              </ImageProvider>
            </StoryProvider>
          </ChaptersProvider>
        </MilestonesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
