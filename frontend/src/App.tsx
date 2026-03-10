import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import TestPage from './components/pages/TestPage';
import AuthPage from './components/pages/AuthPage';
import MatcherPage from './components/pages/MatcherPage';
import useToken from './utils/useToken';
import ProtectedRoute from './utils/ProtectedRoute';


function App() {
  const { token, setToken } = useToken();

  //LOGS
  console.log("Current token" + token)
  
  return (
    <div className="wrapper">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={ token 
              ? <Navigate to="/" replace />  //Redirect authorized user to the MainPage
              : <AuthPage setToken={setToken} /> 
            }
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute token={token}>
                <MatcherPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/matcher" 
            element={
              <ProtectedRoute token={token}>
                <MatcherPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/test" 
            element={
              <ProtectedRoute token={token}>
                <TestPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App
