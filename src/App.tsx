import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import ProtectedRoute from './components/ProtectedRoute';
import EditableHeader from './components/EditableHeader';
import EditableFooter from './components/EditableFooter';
import HomeEditable from './pages/HomeEditable';
import AboutEditable from './pages/AboutEditable';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Volunteer from './pages/Volunteer';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import CreateSubmission from './pages/CreateSubmission';
import Reminders from './pages/Reminders';
import AdminSetup from './pages/AdminSetup';
import AdminKbManager from './pages/AdminKbManager';
import Pricing from './pages/Pricing';
import ChatWidget from './components/ChatWidget';
import DonationWidget from './components/DonationWidget';
import AdminToggle from './components/AdminToggle';
import { useActivityLogger } from './hooks/useActivityLogger';
import { setupMigrationTools } from './utils/runMigration';
import { initScrollReveal } from './utils/scrollReveal';

const AppContent = () => {
  useActivityLogger();

  useEffect(() => {
    setupMigrationTools();
    initScrollReveal();
  }, []);

  return (
    <div className="min-h-screen app-bg">
      <EditableHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomeEditable />} />
          <Route path="/about" element={<AboutEditable />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-submission" element={<CreateSubmission />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route path="/admin/kb-manager" element={<AdminKbManager />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </main>
      <EditableFooter />
      <ChatWidget />
      <DonationWidget />
      <AdminToggle />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AdminProvider>
          <ThemeProvider>
            <Router>
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            </Router>
          </ThemeProvider>
        </AdminProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;