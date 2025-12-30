import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, Truck, BarChart2, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import api from "../api/axios";

export default function Home() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    customers: 0,
    totalReceivables: 0,
    overdueInvoices: 0
  });
  const [loading, setLoading] = useState(true);

  // ✅ FETCH LIVE DASHBOARD DATA
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const response = await api.get("/api/reports/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboardData(response.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // Use default data if API fails
        setDashboardData({
          customers: 0,
          totalReceivables: 0,
          overdueInvoices: 0
        });
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token, logout]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-white to-blue-50 font-sans">
      {/* Fixed Navbar at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content - Adjusted for Navbar height */}
      <main className="flex-1 pt-24 flex flex-col justify-center items-center text-center px-6 py-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-blue-900 leading-snug">
          Welcome 👋 <br /> Manage Your Business with Ease
        </h2>
        <p className="mt-4 text-lg md:text-xl max-w-2xl text-gray-600">
          Track Customers, Suppliers, and Payments in one simple dashboard. 
          Easy to use, designed for business owners.
        </p>

        

        {/* Cards Section - Exact same as before */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-5xl">
          <div
            onClick={() => navigate("/customers")}
            className="cursor-pointer bg-white rounded-2xl shadow-md p-8 border hover:shadow-xl hover:scale-105 transition group"
          >
            <div className="flex justify-center mb-4">
              <Users className="w-12 h-12 text-blue-700 group-hover:text-blue-900" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-blue-900">
              Customer Management
            </h3>
            <p className="text-gray-600">
              View and manage customer records, purchases, payments, and dues.
            </p>
          </div>

          <div
            onClick={() => navigate("/suppliers")}
            className="cursor-pointer bg-white rounded-2xl shadow-md p-8 border hover:shadow-xl hover:scale-105 transition group"
          >
            <div className="flex justify-center mb-4">
              <Truck className="w-12 h-12 text-green-700 group-hover:text-green-900" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-green-900">
              Supplier Management
            </h3>
            <p className="text-gray-600">
              Record supplier bills, payments, and outstanding balances.
            </p>
          </div>

          <div
            onClick={() => navigate("/reports")}
            className="cursor-pointer bg-white rounded-2xl shadow-md p-8 border hover:shadow-xl hover:scale-105 transition group"
          >
            <div className="flex justify-center mb-4">
              <BarChart2 className="w-12 h-12 text-purple-700 group-hover:text-purple-900" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-purple-900">
              Reports & Analytics
            </h3>
            <p className="text-gray-600">
              Generate financial summaries, track payments, and analyze growth.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-blue-800 text-white text-center py-4 text-sm md:text-base">
        <p>© 2025 Jay GAJANAN Hydraulic Firm. All Rights Reserved.</p>
      </footer>
    </div>
  );
}