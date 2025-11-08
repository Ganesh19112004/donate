import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DonorDashboard from "./pages/donor/DonorDashboard";
import CreateDonation from "./pages/donor/CreateDonation";
import DonorDonations from "./pages/donor/DonorDonations";
import NgoDashboard from "./pages/ngo/NgoDashboard";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Pending from "./pages/Pending";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import { initEmailJS } from "./lib/emailjs";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initEmailJS();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ✅ Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ✅ Donor Routes */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/create-donation"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <CreateDonation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/donations"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <DonorDonations />
                </ProtectedRoute>
              }
            />

            {/* ✅ NGO Routes */}
            <Route
              path="/ngo/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NgoDashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ Volunteer Routes */}
            <Route
              path="/volunteer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
