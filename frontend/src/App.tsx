import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthPage from './components/pages/AuthPage';
import MatcherPage from './components/pages/MatcherPage';
import ProtectedRoute from './utils/ProtectedRoute';
import AuthProvider from './utils/AuthContext';
import GuestRoute from './utils/GuestRoute';
import RegistrationPage from './components/pages/RegistrationPage';
import ProtectedLayout from './components/templates/ProtectedLayout';
import ConnectionsPage from './components/pages/ConnectionsPage';
import ChatPage from './components/pages/ChatPage';
import ProfilePage from './components/pages/ProfilePage';
import UserProfilePage from './components/pages/UserProfilePage';
import Page404 from './components/pages/Page404';
import GuestLayout from './components/templates/GuestLayout';

// App is the root of the entire frontend.
// It wraps everything in AuthProvider so any component can access login/logout state.
// BrowserRouter enables URL-based navigation (React Router).
// Routes are split into three groups:
//   - Guest routes:     only visible when NOT logged in (login, register)
//   - Protected routes: only visible when logged in (matcher, chat, etc.)
//   - Fallback:         the 404 page for any unknown URL

function App() {
  return (
    // AuthProvider makes login/logout/token available to every component below it
    <AuthProvider>
      <div className="wrapper">
        <BrowserRouter>
          <Routes>

            {/* Pages for guests (not logged in) */}
            {/* GuestRoute redirects to "/" if the user is already logged in */}
            <Route element={<GuestRoute />}>
              <Route element={<GuestLayout />}>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/registration" element={<RegistrationPage />} />
              </Route>
            </Route>

            {/* Pages for logged-in users */}
            {/* ProtectedRoute redirects to "/login" if the user is not logged in */}
            <Route element={<ProtectedRoute />}>
              {/* ProtectedLayout renders the header and navigation bar */}
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<MatcherPage />} />
                <Route path="/matcher" element={<MatcherPage />} />
                <Route path="/connections" element={<ConnectionsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* :id is a URL parameter — e.g. /user/42 shows user #42's profile */}
                <Route path="/user/:id" element={<UserProfilePage />} />
              </Route>
            </Route>

            {/* Catch-all: any URL that didn't match above shows a 404 page */}
            <Route path="*" element={<Page404 />} />

          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App
