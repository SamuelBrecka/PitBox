import React from 'react';
import { Router, Routes, Route } from './router/Router';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GaragePage } from './pages/GaragePage';

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-pitbox-cream text-pitbox-dark flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/garage"
            element={
              <ProtectedRoute>
                <GaragePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <footer className="border-t border-pitbox-seafoam/40 py-6 text-center text-xs text-slate-500 bg-white/40">
        PitBox &copy; {new Date().getFullYear()} &middot; Digital Service Book &middot; Built for Vehicle Enthusiasts
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
