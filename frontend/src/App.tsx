import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
import Page404 from './components/pages/Page404';
import GuestLayout from './components/templates/GuestLayout';


function App() {
  return (
    <AuthProvider>
      <div className="wrapper">
        <BrowserRouter>
          <Routes>
            { /* Pages for Unauthorized Users */ }
            <Route element={ <GuestRoute /> }> 
              <Route element={ <GuestLayout /> }> 
                <Route path="/login" element={<AuthPage />} />
                <Route path="/registration" element={<RegistrationPage />} />
              </Route>
            </Route>

            { /* Pages for Authorized Users */ }
            <Route element={ <ProtectedRoute /> }>
              <Route element={ <ProtectedLayout /> }> 
                <Route path="/" element={<MatcherPage /> } />
                <Route path="/matcher" element={<MatcherPage />} />
                <Route path="/connections" element={ <ConnectionsPage /> } />
                <Route path="/chat" element={ <ChatPage /> } />
                <Route path="/profile" element={ <ProfilePage /> } />
              </Route>
            </Route>

            { /* Pages for not existing pages */ }
            <Route path="*" element={  <Page404 /> } />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App
