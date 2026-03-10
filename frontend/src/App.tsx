import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Test from './components/pages/Test';
import AuthPage from './components/pages/AuthPage';
import MatcherPage from './components/pages/MatcherPage';
import useToken from './utils/useToken';


function App() {
  const { token, setToken } = useToken();

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
