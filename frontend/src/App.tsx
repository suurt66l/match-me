import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import TestPage from './components/pages/TestPage';
import AuthPage from './components/pages/AuthPage';
import MatcherPage from './components/pages/MatcherPage';
import ProtectedRoute from './utils/ProtectedRoute';
import { AuthProvider } from './utils/AuthContext';
import GuestRoute from './utils/GuestRoute';


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
            <Route path="/" element={ <ProtectedRoute>
                                        <MatcherPage />
                                      </ProtectedRoute>
                                    } />
            <Route path="/matcher" element={ <ProtectedRoute>
                                                <MatcherPage />
                                              </ProtectedRoute>
                                            } />
            <Route path="/test" element={ <ProtectedRoute>
                                            <TestPage />
                                          </ProtectedRoute>
                                        } />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App
