import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PreviewPage from './pages/PreviewPage';
import GamePage from './pages/GamePage';
import FreeModesSelect from './pages/FreeModesSelect';
import FreeModeSetup from './pages/FreeModeSetup';
import FreeModeBoard from './pages/FreeModeBoard';
import FreeModeResult from './pages/FreeModeResult';
import TutorialPage from './pages/TutorialPage';
import SavedWorksMenu from './pages/SavedWorksMenu';
import SongPage from './pages/SongPage';
import TipsPage from './pages/TipsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/free-modes" element={<FreeModesSelect />} />
        <Route path="/free-setup" element={<FreeModeSetup />} />
        <Route path="/free-board" element={<FreeModeBoard />} />
        <Route path="/free-result" element={<FreeModeResult />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/saved-works" element={<SavedWorksMenu />} />
        <Route path="/song" element={<SongPage />} />
        <Route path="/tips" element={<TipsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
