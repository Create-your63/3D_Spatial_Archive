import { Navigate, Route, Routes } from "react-router-dom";
import ArchivePage from "./pages/ArchivePage";
import LandingPage from "./pages/LandingPage";
import RecordPage from "./pages/RecordPage";
import ViewerPage from "./pages/ViewerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/archive" element={<ArchivePage />} />
      <Route path="/records/:id" element={<RecordPage />} />
      <Route path="/viewer/:id" element={<ViewerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
