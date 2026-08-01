import React, { useState, useEffect } from 'react';
import Header, { loadUser, saveUser, clearUser, enrichUserFromDb } from "./components/Header"
import Search from "./components/Search"
import Footer from "./components/Footer"
import About from "./Pages/About"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from "./Pages/Home"
import CardPlace from "./components/CardPlace"
import Account from "./components/Account"
import AccountInfo from "./components/Account_Info"
import ExploreDetail from "./Pages/ExploreDetail"
import { migrateDataToFirestore } from "./data/migrate";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function App() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [user, setUser] = useState(() => loadUser());

  useEffect(() => {
    migrateDataToFirestore();
  }, []);

  useEffect(() => {
    if (user) {
      saveUser(user);
    } else {
      clearUser();
    }
  }, [user]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header 
        onOpenAccount={() => setIsAccountOpen(true)} 
        user={user}
        onSignOut={() => setUser(null)}
      />
      <Account 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
        onSignIn={(userData) => {
          setUser(enrichUserFromDb(userData));
          setIsAccountOpen(false);
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/destinaton" element={<Navigate to="/" replace />} />
        <Route path="/explore/:placeName" element={<ExploreDetail />} />
        <Route path="/account" element={<AccountInfo user={user} onUpdateUser={setUser} onSignOut={() => setUser(null)} />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;