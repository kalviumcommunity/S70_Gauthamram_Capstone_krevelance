import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Index from "./pages/index";
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Reports from './pages/Reports';
import Analysis from './pages/Analysis';
import Upload from './pages/Upload';
import Settings from './pages/Settings';

import SelectSector from './pages/SelectSector';
import AuthCallback from './pages/AuthCallback';
import ConfirmDeleteAccountPage from './pages/ConfirmDeleteAccountPage';
import TaxInfo from './pages/TaxInfo';
import ChangePassword from './pages/ChangePassword';
import ProtectedRoute from './components/auth/ProtectedRoute';


const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          import ProtectedRoute from './components/auth/ProtectedRoute';

          // ... 

          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/select-sector" element={<SelectSector />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/tax-info" element={<ProtectedRoute><TaxInfo /></ProtectedRoute>} />
          <Route path="/confirm-delete-account" element={<ProtectedRoute><ConfirmDeleteAccountPage /></ProtectedRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/change-password" element={<ChangePassword />} />

          <Route path="/confirm-delete-account" element={<ConfirmDeleteAccountPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

