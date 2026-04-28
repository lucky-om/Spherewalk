/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
/* Coded by Lucky */
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import SphereGuideFAB from './components/SphereGuideFAB';
import Landing from './pages/Landing';
import ARNavigation from './pages/ARNavigation';
import VirtualTour from './pages/VirtualTour';
import AIAssistant from './pages/AIAssistant';
import CampusMap from './pages/CampusMap';
import AdminDashboard from './pages/AdminDashboard';
import Emergency from './pages/Emergency';
import VisitorTour from './pages/VisitorTour';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Error404 from './pages/Error404';
import useStore from './store/useStore';
import './index.css';

export default function App() {
  const logout = useStore(s => s.logout);

  // Auto-logout when the API interceptor fires a 401 (expired/invalid token)
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:session-expired', handler);
    return () => window.removeEventListener('auth:session-expired', handler);
  }, [logout]);

  return (
    <BrowserRouter>
      <Navbar />
      <SphereGuideFAB />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ar-navigation" element={<ARNavigation />} />
        <Route path="/virtual-tour" element={<VirtualTour />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/campus-map" element={<CampusMap />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/visitor-tour" element={<VisitorTour />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
      <SpeedInsights />
    </BrowserRouter>
  );
}

