import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestPage from './pages/TestPage';

const AppSimple = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/*" element={<TestPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppSimple;
