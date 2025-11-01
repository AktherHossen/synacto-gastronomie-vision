import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./i18n";
import { Layout } from './components/Layout';
import LoginLayout from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import POS from './pages/POS';
import Signup from './pages/Signup';
import Debug from './pages/Debug';
import KitchenDisplay from './pages/KitchenDisplay';
import Tables from './pages/Tables';
import { VendorProvider } from "@/context/VendorContext";
import { TrialBanner } from "@/components/TrialBanner";
import DeliveryIntegrationsPage from '@/pages/integrations/Delivery';
import Customers from './pages/Customers';

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginLayout />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<Menu />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="staff" element={<Staff />} />
        <Route path="customers" element={<Customers />} />
        <Route path="tables" element={<Tables />} />
        <Route path="kitchen" element={<KitchenDisplay />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="debug" element={<Debug />} />
        <Route path="integrations/delivery" element={<DeliveryIntegrationsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </>
  )
);

const App = () => {
  return (
    <VendorProvider>
      <TrialBanner />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </QueryClientProvider>
    </VendorProvider>
  );
};

export default App;
