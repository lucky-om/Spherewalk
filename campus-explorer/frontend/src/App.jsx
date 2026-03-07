import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import LocationCollector from './pages/LocationCollector';
import './index.css';

export default function App() {
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
        <Route path="/sync" element={<LocationCollector />} />
      </Routes>
    </BrowserRouter>
  );
}
