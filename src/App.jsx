import React, { useState, useEffect } from 'react';
import Header, { loadUser, saveUser, clearUser } from "./components/Header"
import Search from "./components/Search"
import Footer from "./components/Footer"
import About from "./Pages/About"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./Pages/Home"
import CardPlace from "./components/CardPlace"
import Account from "./components/Account"
import AccountInfo from "./components/Account_Info"

function App() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [user, setUser] = useState(() => loadUser());

  useEffect(() => {
    if (user) {
      saveUser(user);
    } else {
      clearUser();
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Header 
        onOpenAccount={() => setIsAccountOpen(true)} 
        user={user}
        onSignOut={() => setUser(null)}
      />
      <Account 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
        onSignIn={(userData) => {
          setUser(userData);
          setIsAccountOpen(false);
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/destinaton" element={<h1></h1>} />
        <Route path="/account" element={<AccountInfo user={user} />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;