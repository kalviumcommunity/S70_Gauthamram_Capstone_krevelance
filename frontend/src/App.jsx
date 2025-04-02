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
import Notifications from './pages/Notifications';


const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
        <Toaster/>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/upload" element={<Upload/>} />
            <Route path="/settings" element={<Settings />}/>
             <Route path="/analysis" element={<Analysis/>}/>
             <Route path="/reports" element={<Reports/>} />
             <Route path="/about" element={<About/>} />
             <Route path="/pricing" element={<Pricing/>} />
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/signup" element={<Signup/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/notification" element={<Notifications/>} />

            <Route path="*" element={<NotFound/>} /> 
          </Routes>
        </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

