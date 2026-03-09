import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Test from './components/pages/Test';
import AuthPage from './components/pages/AuthPage';
import { useState } from 'react';
import MatcherPage from './components/pages/MatcherPage';

function App() {
    const [token, setToken] = useState();

    if(!token) {
        return <AuthPage />
    }
  return (
    <div className="wrapper">
      <BrowserRouter>
        <Routes>
          <Route path="/1" element={<MatcherPage />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App
