import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminRoute from "@/components/layout/AdminRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Archive from "./pages/Archive";
import ArchiveDetail from "./pages/ArchiveDetail";
import Inquiry from "./pages/Inquiry";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseRuns from "./pages/admin/AdminCourseRuns";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminFAQs from "./pages/admin/AdminFAQs";
import AdminInstructors from "./pages/admin/AdminInstructors";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLegal from "./pages/admin/AdminLegal";
import AdminHeroSlides from "./pages/admin/AdminHeroSlides";
import LegalPage from "./pages/LegalPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/kurs" element={<Courses />} />
              <Route path="/kurs/:slug" element={<CourseDetail />} />
              <Route path="/arkiv" element={<Archive />} />
              <Route path="/arkiv/:id" element={<ArchiveDetail />} />
              <Route path="/foresporsel" element={<Inquiry />} />
              <Route path="/:slug" element={<LegalPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Admin */}
            <Route
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/kurs" element={<AdminCourses />} />
              <Route path="/admin/gjennomforinger" element={<AdminCourseRuns />} />
              <Route path="/admin/foresporsel" element={<AdminLeads />} />
              <Route path="/admin/anmeldelser" element={<AdminReviews />} />
              <Route path="/admin/faq" element={<AdminFAQs />} />
              <Route path="/admin/kursholdere" element={<AdminInstructors />} />
              <Route path="/admin/innstillinger" element={<AdminSettings />} />
              <Route path="/admin/juridisk" element={<AdminLegal />} />
              <Route path="/admin/hero" element={<AdminHeroSlides />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
