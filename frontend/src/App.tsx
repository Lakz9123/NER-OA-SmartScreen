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
import CaptureRecapture from './pages/CaptureRecapture';
import RiskAnalysis from './pages/RiskAnalysis';
import PatientReport from './pages/PatientReport';
import PatientList from './pages/PatientList';
import OfflineQueue from './pages/OfflineQueue';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import ProtectedRoute from './components/ProtectedRoute';
import { syncOutbox, resetSyncingItems } from './services/syncService';
import HealthWorkerLayout from './components/HealthWorkerLayout';
import AdminLayout from './components/AdminLayout';

function App() {
  // Font families for translations are now handled globally via CSS fallbacks in tailwind.config.js

  useEffect(() => {
    // Reset stuck items on startup
    resetSyncingItems().catch(console.error);

    // Attempt automatic background sync every 30 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncOutbox(true).catch(console.error);
      }
    }, 30000);
    
    // Also try immediately when coming online
    const handleOnline = () => {
      syncOutbox(true).catch(console.error);
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
          
          {/* Health Worker Routes */}
          <Route element={<ProtectedRoute allowedRoles={['health_worker']} />}>
            <Route element={<HealthWorkerLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/register-patient" element={<Registration />} />
              <Route path="/consent" element={<Consent />} />
              <Route path="/questionnaire/part1" element={<QuestionnairePart1 />} />
              <Route path="/questionnaire/part2" element={<QuestionnairePart2 />} />
              <Route path="/questionnaire/part3" element={<QuestionnairePart3 />} />
              <Route path="/capture/setup" element={<CaptureSetup />} />
              <Route path="/capture/tracking" element={<CaptureTracking />} />
              <Route path="/capture/recapture" element={<CaptureRecapture />} />
              <Route path="/capture/review" element={<CaptureReview />} />
              <Route path="/analysis" element={<RiskAnalysis />} />
              <Route path="/report" element={<PatientReport />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/offline-queue" element={<OfflineQueue />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            </Route>
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
