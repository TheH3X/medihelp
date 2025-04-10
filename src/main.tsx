// start the app always with '/' route
import { Toaster as Sonner } from "@/components/ui/sonner";

import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { TooltipProvider } from "./components/ui/tooltip";

import { ThemeProvider } from "./components/layout/theme-provider";
import "./index.css";
import Index from "./pages";
import LoginForm from "./pages/login";
import SignupForm from "./pages/signup";
import Logout from "./pages/logout";
import CalculatorPage from "./pages/calculator/[id]";
import AlgorithmPage from "./pages/algorithm/[id]";
import AdminDashboard from "./pages/admin";
import CalculatorEditor from "./pages/admin/calculator/[id]";
import ParameterDictionary from "./pages/admin/parameters";
import ImportExport from "./pages/admin/import-export";
import Documentation from "./pages/admin/documentation";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/calculator/:id' element={<CalculatorPage />} />
            <Route path='/algorithm/:id' element={<AlgorithmPage />} />
            <Route path='/login' element={<LoginForm />} />
            <Route path='/signup' element={<SignupForm />} />
            <Route path='/logout' element={<Logout />} />
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/admin/calculator/:id' element={<CalculatorEditor />} />
            <Route path='/admin/parameters' element={<ParameterDictionary />} />
            <Route path='/admin/import-export' element={<ImportExport />} />
            <Route path='/admin/documentation' element={<Documentation />} />
          </Routes>
        </BrowserRouter>
        <Sonner />
        <Toaster />
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);