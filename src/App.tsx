import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// 🔐 Protected Route Wrapper
import ProtectedRoute from "./components/ProtectedRoute";

// 🌍 Public Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import HowItWorks from "./pages/HowItWorks";
import ContactUs from "./pages/ContactUs";
import ImpactStories from "./pages/ImpactStories";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/common/About";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
// ⭐ NEW — Nearby NGOs Page
import NearbyNGOsPage from "./pages/NearbyNGOs";

// 💖 Donor Pages
import DonorDashboard from "./pages/donor/Dashboard";
import CreateDonation from "./pages/donor/CreateDonation";
import DonorProfile from "./pages/donor/Profile";
import DonationHistory from "./pages/donor/DonationHistory";
import DonationDetails from "./pages/donor/DonationDetails";
import EditDonation from "./pages/donor/EditDonation";
import ViewNGOs from "./pages/donor/ViewNGOs";
import DonorSettings from "./pages/donor/Settings";
import Favorites from "./pages/donor/Favorites";
import MyImpact from "./pages/donor/MyImpact";
import MessageCenter from "./pages/donor/MessageCenter";

// 🏢 NGO Pages
import NGODashboard from "./pages/ngo/Dashboard";
import CreateCampaign from "./pages/ngo/CreateCampaign";
import ManageDonations from "./pages/ngo/ManageDonations";
import PendingDonations from "./pages/ngo/PendingDonations";
import Volunteers from "./pages/ngo/Volunteers";
import NGOMessages from "./pages/ngo/Messages";
import NGOImpact from "./pages/ngo/Impact";
import Campaigns from "./pages/ngo/Campaigns";
import Reports from "./pages/ngo/Reports";
import NGOProfile from "./pages/ngo/Profile";
import NGOGallery from "./pages/ngo/Gallery";
import NGOReviews from "./pages/ngo/Reviews";
import NGOPosts from "./pages/ngo/Posts";
import NGOLogout from "./pages/ngo/Logout";
import DonationDetailsNGO from "./pages/ngo/DonationDetails";

// 🤝 Volunteer Pages
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import AssignedTasks from "./pages/volunteer/AssignedTasks";
import VolunteerImpact from "./pages/volunteer/VolunteerImpact";
import VolunteerMessages from "./pages/volunteer/VolunteerMessages";
import VolunteerProfile from "./pages/volunteer/VolunteerProfile";
import VolunteerLogout from "./pages/volunteer/VolunteerLogout";
import JoinNGO from "./pages/volunteer/JoinNGO";
import Activity from "./pages/volunteer/Activity";
import Leaderboard from "./pages/volunteer/Leaderboard";
import ReportsVolunteer from "./pages/volunteer/Reports";

// 👑 Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageNGOs from "./pages/admin/ManageNGOs";
import ManageDonors from "./pages/admin/ManageDonors";
import ManageVolunteers from "./pages/admin/ManageVolunteers";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    console.log("✅ DenaSetu App Initialized");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>

            {/* 🌍 PUBLIC ROUTES */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/impact" element={<ImpactStories />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* ⭐ NEW Nearby NGOs Route */}
            <Route path="/nearby-ngos" element={<NearbyNGOsPage />} />
            <Route path="/faq" element={<FAQ />} />

            {/* 💖 DONOR ROUTES */}
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
              path="/donor/profile"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <DonorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/history"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <DonationHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/details/:id"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <DonationDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/edit-donation/:id"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <EditDonation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/messages"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <MessageCenter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/view-ngos"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <ViewNGOs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/settings"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <DonorSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/favorites"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/impact"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <MyImpact />
                </ProtectedRoute>
              }
            />

            {/* 🏢 NGO ROUTES */}
            <Route
              path="/ngo/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NGODashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/create"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <CreateCampaign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/manage"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <ManageDonations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/pending"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <PendingDonations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/volunteers"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <Volunteers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ngo/messages"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NGOMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/impact"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NGOImpact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/campaigns"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <Campaigns />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/donation/:id"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <DonationDetailsNGO />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/reports"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/profile"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NGOProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/gallery"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NGOGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/reviews"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NGOReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/posts"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NGOPosts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/logout"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NGOLogout />
                </ProtectedRoute>
              }
            />

            {/* 🤝 VOLUNTEER ROUTES */}
            <Route
              path="/volunteer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/tasks"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <AssignedTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/impact"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <VolunteerImpact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/join-ngo"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <JoinNGO />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/activity"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <Activity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/leaderboard"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/reports"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <ReportsVolunteer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/messages"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <VolunteerMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/profile"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <VolunteerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/logout"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <VolunteerLogout />
                </ProtectedRoute>
              }
            />

            {/* 👑 ADMIN ROUTES */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ngos"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageNGOs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/donors"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageDonors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/volunteers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageVolunteers />
                </ProtectedRoute>
              }
            />

            {/* 🚫 404 PAGE */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
