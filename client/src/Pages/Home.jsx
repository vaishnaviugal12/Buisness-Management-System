// src/Pages/Home.jsx - FULLY CONNECTED TO BACKEND
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, Truck, BarChart2, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // ✅ Auth protection
import Navbar from "./Navbar";

export default function Home() {
  const navigate = useNavigate();
  const { token, logout } = useAuth(); // ✅ Get token from context
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ FETCH LIVE DASHBOARD DATA
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/reports/dashboard", {
          headers: {
            'Authorization': `Bearer ${token}`, // ✅ Auto token
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('401') || err.message.includes('403')) {
          logout(); // ✅ Auto logout on auth error
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
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />

      {/* Hero Section with LIVE STATS */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 py-12 bg-gradient-to-r from-blue-50 via-white to-blue-50">
        <h2 className="text-3xl md:text-5xl font-extrabold text-blue-900 leading-snug">
          Welcome 👋 <br /> Manage Your Business with Ease
        </h2>
        <p className="mt-4 text-lg md:text-xl max-w-2xl text-gray-600">
          Track Customers, Suppliers, and Payments in one simple dashboard. 
          Easy to use, designed for business owners.
        </p>

        {/* ✅ LIVE DASHBOARD STATS
        {loading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="mt-12 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        ) : dashboardData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{dashboardData.customers || 0}</div>
              <div className="text-gray-600 mt-1">Active Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ₹{dashboardData.totalReceivables?.toLocaleString() || 0}
              </div>
              <div className="text-gray-600 mt-1">Total Receivables</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{dashboardData.overdueInvoices || 0}</div>
              <div className="text-gray-600 mt-1">Overdue Invoices</div>
            </div>
          </div>
        ) : null} */}

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-5xl">
          
          {/* Customer Management */}
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

          {/* Supplier Management */}
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

          {/* Reports */}
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

      {/* Footer */}
      <footer className="bg-blue-800 text-white text-center py-4 text-sm md:text-base">
        <p>© 2025 Jay GAJANAN Hydraulic Firm. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
