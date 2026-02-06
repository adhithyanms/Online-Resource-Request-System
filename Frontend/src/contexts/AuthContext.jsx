import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';

import { api } from '../services/api';

const AuthContext = createContext();

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser && !localStorage.getItem('token')) {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const signIn = async (email, password) => {
    try {
      // 1. Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // 2. Sign in with Backend to get JWT
      const data = await api.post('/auth/signin', { email, password });

      const profile = {
        id: data.id,
        email: data.email,
        fullName: data.fullName || email.split('@')[0],
        role: data.role
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // 1. Sign in with Firebase
      const { user: firebaseUser } = await signInWithPopup(auth, provider);

      // 2. Sync with Backend
      const data = await api.post('/auth/google-signin', {
        email: firebaseUser.email,
        fullName: firebaseUser.displayName,
        googleId: firebaseUser.uid
      });

      const profile = {
        id: data.id,
        email: data.email,
        fullName: data.fullName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
        role: data.role
      };

      // Store in local storage to keep session
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    signIn,
    signInWithGoogle,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
