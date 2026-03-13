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
import ConnectionsPage from './components/pages/ConnectionsPage';
import ChatPage from './components/pages/ChatPage';
import ProfilePage from './components/pages/ProfilePage';


function App() {
  return (
    <AuthProvider>
      <div className="wrapper">
        <BrowserRouter>
          <Routes>

            { /* Pages for Unauthorized Users */}
            <Route element={ <GuestRoute /> }>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/registration" element={<RegistrationPage />} />
            </Route>

            { /* Pages for Authorized Users */}
            <Route element={ <ProtectedRoute /> }>
              <Route element={ <ProtectedLayout /> }>
                <Route path="/" element={<MatcherPage /> } />
                <Route path="/matcher" element={<MatcherPage />} />
                <Route path="/connections" element={ <ConnectionsPage /> } />
                <Route path="/chat" element={ <ChatPage /> } />
                <Route path="/profile" element={ <ProfilePage /> } />
              </Route>
            </Route>

            <Route path="*" element={ <GuestRoute> 
                                              <AuthPage /> 
                                            </GuestRoute> 
                                          } />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App
