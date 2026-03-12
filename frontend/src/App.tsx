import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import TestPage from './components/pages/TestPage';
import AuthPage from './components/pages/AuthPage';
import MatcherPage from './components/pages/MatcherPage';
import ProtectedRoute from './utils/ProtectedRoute';
import { AuthProvider } from './utils/AuthContext';
import GuestRoute from './utils/GuestRoute';
import RegistrationPage from './components/pages/RegistrationPage';
import ProtectedLayout from './components/templates/ProtectedLayout';


function App() {
  return (
    <AuthProvider>
      <div className="wrapper">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={ <GuestRoute> 
                                              <AuthPage /> 
                                            </GuestRoute> 
                                          } />
            <Route path="/registration" element={ <GuestRoute> 
                                                    <RegistrationPage />
                                                  </GuestRoute> 
                                                } />
            <Route element={ <ProtectedRoute> <ProtectedLayout /> </ProtectedRoute>}>
              <Route path="/" element={<MatcherPage /> } />
              <Route path="/matcher" element={<MatcherPage />} />
              <Route path="/test" element={ <TestPage /> } />
            </Route>

          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App
