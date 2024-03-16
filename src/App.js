import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/landingPage';
import AnnotatorPage from './pages/annotatorPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/annotator/:name" element={<AnnotatorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;