import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Test from './components/pages/Test';
import AuthPage from './components/pages/AuthPage';
import { useState } from 'react';
import MatcherPage from './components/pages/MatcherPage';


function setToken(userToken: string) {
  //LOGS
  console.log("Setting token: " + userToken)
  
  sessionStorage.setItem('token', JSON.stringify(userToken));
}

function getToken() {
  const tokenString = sessionStorage.getItem('token');

  //LOGS
  console.log("Setting token: " + tokenString)
  
  if (!tokenString) {
    return null;
  }
  const userToken = JSON.parse(tokenString);
  return userToken?.token;
}

function App() {
  const token = getToken();

  if(!token) {
    return <AuthPage setToken={setToken} />
  }

  //LOGS
  console.log("Current token" + token)
  
  return (
    <div className="wrapper">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MatcherPage />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App
