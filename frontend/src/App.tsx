import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { syncOutbox, resetSyncingItems } from './services/syncService';
import HealthWorkerLayout from './components/HealthWorkerLayout';
import AdminLayout from './components/AdminLayout';
import { useTranslation } from 'react-i18next';

// Lazy loaded pages for performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Registration = lazy(() => import('./pages/Registration'));
const Consent = lazy(() => import('./pages/Consent'));
const QuestionnairePart1 = lazy(() => import('./pages/QuestionnairePart1'));
const QuestionnairePart2 = lazy(() => import('./pages/QuestionnairePart2'));
const QuestionnairePart3 = lazy(() => import('./pages/QuestionnairePart3'));
const CaptureSetup = lazy(() => import('./pages/CaptureSetup'));
const CaptureTracking = lazy(() => import('./pages/CaptureTracking'));
const CaptureReview = lazy(() => import('./pages/CaptureReview'));
const CaptureRecapture = lazy(() => import('./pages/CaptureRecapture'));
const RiskAnalysis = lazy(() => import('./pages/RiskAnalysis'));
const PatientReport = lazy(() => import('./pages/PatientReport'));
const PatientList = lazy(() => import('./pages/PatientList'));
const OfflineQueue = lazy(() => import('./pages/OfflineQueue'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.body.classList.remove('font-sans', 'font-hi', 'font-as', 'font-mni');
    if (['hi', 'as', 'mni'].includes(i18n.language)) {
      document.body.classList.add(`font-${i18n.language}`);
    } else {
      document.body.classList.add('font-sans');
    }
  }, [i18n.language]);

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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
