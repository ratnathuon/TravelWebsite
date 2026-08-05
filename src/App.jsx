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
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [user, setUser] = useState(() => loadUser());
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    migrateDataToFirestore();
  }, []);

  useEffect(() => {
    const handleOpenAccountModal = () => setIsAccountOpen(true);
    window.addEventListener("openAccountModal", handleOpenAccountModal);
    return () => window.removeEventListener("openAccountModal", handleOpenAccountModal);
  }, []);

  useEffect(() => {
    const handleToast = (e) => {
      const msg = typeof e.detail === "string" ? e.detail : e.detail?.message;
      if (msg) {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    };
    window.addEventListener("showToast", handleToast);
    return () => window.removeEventListener("showToast", handleToast);
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
      {/* Global Toast notification at bottom right */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#28623a] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in font-poppins text-sm font-medium">
          <span>{toastMessage}</span>
        </div>
      )}
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