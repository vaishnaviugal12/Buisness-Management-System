// App.jsx - FIXED WITH BROWSERROUTER
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'; // ✅ ADDED BrowserRouter
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from "./Pages/Login";
import Home from './Pages/Home';
import Customers from './Pages/CustmorManagement';
import Suppliers from './Pages/SupplierManagement';
import CustomerDetails from './Pages/CustmorDetails';
import SupplierDetails from './Pages/SupplierDetails';

import BillDetailsMerchant from './Pages/billDetailsMerchant';
import BillDetailsCustomer from './Pages/BillDetailsCustmor';
import HomeSelector from './Pages/HomeSelector';
import OverallReport from './Pages/OverallReport';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return token ? children : <Navigate to="/" replace />;
};

function AppContent() {
  return (
    <div className=''>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* ALL PROTECTED ROUTES */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/select" 
          element={
            <ProtectedRoute>
                <HomeSelector />
            </ProtectedRoute>
          }
/>


        {/* Customer Management Routes */}
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers/:name" 
          element={
            <ProtectedRoute>
              <CustomerDetails />
            </ProtectedRoute>
          } 
        />
        <Route path="/customers/:name/bill/:id" element={<BillDetailsCustomer />} />

       

        {/* Supplier Management Routes */}
        <Route 
          path="/suppliers" 
          element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/suppliers/:name" 
          element={
            <ProtectedRoute>
              <SupplierDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/suppliers/:name/bills/:invoice" 
          element={
            <ProtectedRoute>
              <BillDetailsMerchant />
            </ProtectedRoute>} 
        />
        
        {/* Reports */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <OverallReport />
            </ProtectedRoute>
          } 
        />
        

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter> {/* ✅ WRAP EVERYTHING IN BrowserRouter */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
