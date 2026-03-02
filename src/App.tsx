import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SettingsProvider } from "@/hooks/use-settings";
import { BottomNav } from "@/components/BottomNav";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { useAnalytics } from "@/hooks/use-analytics";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import MantraDetail from "./pages/MantraDetail";
import SearchPage from "./pages/SearchPage";
import Favorites from "./pages/Favorites";
import ChatPage from "./pages/ChatPage";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  useAnalytics();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        
        <Route path="/browse" element={<Browse />} />
        <Route path="/mantra/:slug" element={<MantraDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OnboardingDialog />
          <AnimatedRoutes />
          <BottomNav />
        </BrowserRouter>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
