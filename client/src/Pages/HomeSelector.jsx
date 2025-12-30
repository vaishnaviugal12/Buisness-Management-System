// src/Pages/HomeSelector.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Store } from "lucide-react";
import Navbar from "./Navbar";

export default function HomeSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 py-12 bg-gradient-to-r from-blue-50 via-white to-blue-50">
        <h2 className="text-3xl md:text-5xl font-extrabold text-blue-900 leading-snug">
          Welcome 👋 <br /> Digital Business Management System
        </h2>

        <p className="mt-4 text-lg md:text-xl max-w-2xl text-gray-600">
          Choose the business category to manage customers, suppliers, invoices,
          payments, and reports in one unified platform.
        </p>

        {/* Business Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full max-w-5xl">
          
          {/* Hydraulics */}
          <div
            onClick={() => navigate("/home")}
            className="cursor-pointer bg-white rounded-2xl shadow-md p-8 border hover:shadow-xl hover:scale-105 transition group"
          >
            <div className="flex justify-center mb-4">
              <Settings className="w-14 h-14 text-blue-700 group-hover:text-blue-900" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-blue-900">
              Hydraulics
            </h3>
            <p className="text-gray-600">
              Manage hydraulic customers, service records, supplier bills,
              payments, and outstanding dues efficiently.
            </p>
          </div>

          {/* Traders */}
          <div
            onClick={() => navigate("/home")}
            className="cursor-pointer bg-white rounded-2xl shadow-md p-8 border hover:shadow-xl hover:scale-105 transition group"
          >
            <div className="flex justify-center mb-4">
              <Store className="w-14 h-14 text-green-700 group-hover:text-green-900" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-green-900">
              Traders
            </h3>
            <p className="text-gray-600">
              Handle trading operations including invoices, supplier
              transactions, receivables, and business reports.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-800 text-white text-center py-4 text-sm md:text-base">
        <p>© 2025 Jay Gajanan Hydraulic Firm. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

