import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Gallery from "./pages/Gallery";
import PlayZone from "./pages/PlayZone";
import BirthdayCard from "./pages/BirthdayCard";
import Homecoming from "./pages/Homecoming";
import Wishes from "./pages/Wishes";
import NotFound from "./pages/NotFound";
import PhotoBooth from "./pages/PhotoBooth";
import DublinGuide from "./pages/DublinGuide";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/play" element={<PlayZone />} />
          <Route path="/photobooth" element={<PhotoBooth />} />
          <Route path="/dublin-guide" element={<DublinGuide />} />
          <Route path="/card" element={<BirthdayCard />} />
          <Route path="/homecoming" element={<Homecoming />} />
          <Route path="/wishes" element={<Wishes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
