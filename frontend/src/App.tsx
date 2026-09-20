import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import Consent from './pages/Consent';
import QuestionnairePart1 from './pages/QuestionnairePart1';
import QuestionnairePart2 from './pages/QuestionnairePart2';
import QuestionnairePart3 from './pages/QuestionnairePart3';
import CaptureSetup from './pages/CaptureSetup';
import CaptureTracking from './pages/CaptureTracking';
import CaptureReview from './pages/CaptureReview';
import RiskAnalysis from './pages/RiskAnalysis';
import PatientReport from './pages/PatientReport';
import PatientList from './pages/PatientList';
import OfflineQueue from './pages/OfflineQueue';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { syncOutbox } from './services/syncService';

function App() {
  useEffect(() => {
    // Attempt automatic background sync every 30 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncOutbox().catch(console.error);
      }
    }, 30000);
    
    // Also try immediately when coming online
    const handleOnline = () => {
      syncOutbox().catch(console.error);
    };
    window.addEventListener('online', handleOnline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 1. Login Screen */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* 2. Dashboard / Home Screen */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* 3. Patient Registration Screen */}
            <Route path="/register-patient" element={<Registration />} />
            
            {/* 4. Consent & Privacy Screen */}
            <Route path="/consent" element={<Consent />} />
            
            {/* 5, 6, 7. Symptom Questionnaire Screens */}
            <Route path="/questionnaire/part1" element={<QuestionnairePart1 />} />
            <Route path="/questionnaire/part2" element={<QuestionnairePart2 />} />
            <Route path="/questionnaire/part3" element={<QuestionnairePart3 />} />
            
            {/* 8, 9, 10. Gait Capture Screens */}
            <Route path="/capture/setup" element={<CaptureSetup />} />
            <Route path="/capture/tracking" element={<CaptureTracking />} />
            <Route path="/capture/review" element={<CaptureReview />} />
            
            {/* 11, 12. Analysis & Report Screens */}
            <Route path="/analysis" element={<RiskAnalysis />} />
            <Route path="/report" element={<PatientReport />} />
            
            {/* 13. Patient Records / History Screen */}
            <Route path="/patients" element={<PatientList />} />
            
            {/* 14. Offline Queue & Sync Status Screen */}
            <Route path="/offline-queue" element={<OfflineQueue />} />
            
            {/* 15. User Settings & Profile Screen */}
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
