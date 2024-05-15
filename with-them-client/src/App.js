import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import DiscoverPage from './pages/DiscoverPage';
import CreateGroupPage from './pages/CreateGroupPage'; 
import GroupInPage from './pages/GroupInPage';
import MyGroupPage from './pages/MyGroupPage'; 
import ReviewPage from './pages/ReviewPage'; 
import SettingsPage from './pages/SettingsPage';



import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/discover" element={<DiscoverPage />} /> 
        <Route path="/createGroup" element={<CreateGroupPage />} />         
        <Route path="/myGroup" element={<MyGroupPage />} /> 
        <Route path="/groupIn" element={<GroupInPage />} /> 
        <Route path="/review" element={<ReviewPage />} /> 
        <Route path="/settings" element={<SettingsPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
