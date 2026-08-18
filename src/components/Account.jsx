import React, { useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from '../firebase';

function Account({ isOpen, onClose, onSignIn }) {
  const [isLogin, setIsLogin] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!firstName.trim()) {
        newErrors.firstName = 'First name is required.';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'Last name is required.';
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const passDataToParent = (firebaseUser) => {
    if (onSignIn) {
      const finalName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
      const parts = finalName.trim().split(' ');
      let initials = 'U';
      if (parts.length > 1 && parts[0].length > 0 && parts[1].length > 0) {
        initials = (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (finalName.length > 0) {
        initials = finalName.substring(0, 2).toUpperCase();
      }

      onSignIn({
        name: finalName,
        email: firebaseUser.email,
        initials: initials,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setAuthError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        passDataToParent(userCredential.user);
      } else {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        passDataToParent({ ...userCredential.user, displayName: fullName });
      }
    } catch (error) {
      if (error.code === 'auth/invalid-api-key') {
        setAuthError('Firebase configuration missing! Please add your API keys to src/firebase.js.');
      } else {
        setAuthError(error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      passDataToParent(result.user);
    } catch (error) {
      if (error.code === 'auth/invalid-api-key') {
        setAuthError('Firebase configuration missing! Please add your API keys to src/firebase.js.');
      } else {
        setAuthError(error.message);
      }
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFirstName('');
    setLastName('');
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a] rounded-3xl shadow-2xl p-6 sm:p-8 z-10 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-white/70 hover:text-white text-2xl font-bold"
        >
          &times;
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg"
            alt="Cambodia Flag"
            className="w-6 h-4 rounded-sm object-cover"
          />
          <span className="text-lg font-medium tracking-wide">Travel Cambodia</span>
        </div>

        <h2 className="text-4xl font-extrabold text-center mb-6 tracking-wide">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {authError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200 text-sm text-center">
            {authError}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: '' })); }}
                  className={`w-full px-4 py-3 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.firstName ? 'ring-2 ring-red-400' : 'focus:ring-[#3a6b53]'}`}
                />
                {errors.firstName && <p className="text-red-300 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: '' })); }}
                  className={`w-full px-4 py-3 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.lastName ? 'ring-2 ring-red-400' : 'focus:ring-[#3a6b53]'}`}
                />
                {errors.lastName && <p className="text-red-300 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
              className={`w-full px-4 py-3 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.email ? 'ring-2 ring-red-400' : 'focus:ring-[#3a6b53]'}`}
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
              className={`w-full px-4 py-3 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.password ? 'ring-2 ring-red-400' : 'focus:ring-[#3a6b53]'}`}
            />
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 bg-[#2f5341] border border-white/60 hover:bg-[#3a6b53] text-white rounded-md font-medium transition-colors duration-200"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-6 text-center text-sm text-gray-300">
          {isLogin ? "don't have an account ? " : 'already have an account ? '}
          <button
            onClick={handleToggle}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full mt-6 py-3 flex items-center justify-center gap-3 bg-[#2f5341] border border-white/60 hover:bg-[#3a6b53] text-white rounded-md font-medium transition-colors duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {isLogin ? 'Login With Google' : 'Sign Up With Google'}
        </button>
      </div>
    </div>
  );
}

export default Account;
