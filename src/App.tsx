import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import FileDistribution from "./pages/FileDistribution";
import ExamMode from "./pages/ExamMode";
import Attendance from "./pages/Attendance";
import Settings from "./pages/Settings";
import LabManagement from "./pages/LabManagement";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'teacher' | 'student' }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'teacher' ? '/dashboard' : '/student'} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated 
            ? <Navigate to={user?.role === 'teacher' ? '/dashboard' : '/student'} replace />
            : <Login />
        } 
      />
      
      {/* Teacher Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/files" element={
        <ProtectedRoute role="teacher"><FileDistribution /></ProtectedRoute>
      } />
      <Route path="/dashboard/exam" element={
        <ProtectedRoute role="teacher"><ExamMode /></ProtectedRoute>
      } />
      <Route path="/dashboard/attendance" element={
        <ProtectedRoute role="teacher"><Attendance /></ProtectedRoute>
      } />
      <Route path="/dashboard/labs" element={
        <ProtectedRoute role="teacher"><LabManagement /></ProtectedRoute>
      } />
      <Route path="/dashboard/settings" element={
        <ProtectedRoute role="teacher"><Settings /></ProtectedRoute>
      } />
      
      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
