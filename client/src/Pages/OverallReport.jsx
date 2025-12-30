import React, { useEffect, useState } from "react";
import api from "../api/axios"; // Import your axios instance

// Improved Row component with better spacing and typography
const Row = ({ label, value, highlight, icon }) => (
  <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
    <div className="flex items-center space-x-3">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-gray-700 font-medium">{label}</span>
    </div>
    <span
      className={`font-semibold text-lg ${
        highlight
          ? value < 0
            ? "text-red-600"
            : "text-green-600"
          : "text-gray-900"
      }`}
    >
      {typeof value === "number"
        ? `₹ ${value.toLocaleString("en-IN")}`
        : value}
    </span>
  </div>
);

// Stat Card component for individual metrics
const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {icon && (
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <span className={`text-xl ${color}`}>{icon}</span>
        </div>
      )}
    </div>
  </div>
);

export default function OverallReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const config = {
      headers: { 
        Authorization: `Bearer ${token}` 
      },
    };

    api.get("/api/reports/overall", config)
      .then(res => {
        setReport(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load report:", err);
        alert("Failed to load report");
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const { customerSummary, supplierSummary, businessSummary } = report;

  // Calculate some derived metrics
  const customerPaymentPercentage = Math.round(
    (customerSummary.totalPaid / customerSummary.totalBilled) * 100
  );
  const supplierPaymentPercentage = Math.round(
    (supplierSummary.totalPaid / supplierSummary.totalPurchased) * 100
  );
  const netProfit = businessSummary.totalSales - businessSummary.totalPurchases;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600 mt-2">Overall financial summary and key metrics</p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Sales"
            value={`₹ ${businessSummary.totalSales.toLocaleString("en-IN")}`}
            subtitle="All time"
            icon="💰"
            color="text-green-500"
          />
          <StatCard
            title="Net Position"
            value={`₹ ${businessSummary.netPosition.toLocaleString("en-IN")}`}
            subtitle={businessSummary.netPosition >= 0 ? "In your favor" : "Net payable"}
            icon="⚖️"
            color={businessSummary.netPosition >= 0 ? "text-green-500" : "text-red-500"}
          />
          <StatCard
            title="Customer Balance"
            value={`₹ ${customerSummary.totalPending.toLocaleString("en-IN")}`}
            subtitle={`${customerPaymentPercentage}% paid`}
            icon="👥"
            color="text-blue-500"
          />
          <StatCard
            title="Supplier Balance"
            value={`₹ ${supplierSummary.totalPending.toLocaleString("en-IN")}`}
            subtitle={`${supplierPaymentPercentage}% paid`}
            icon="🏭"
            color="text-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* CUSTOMER SUMMARY */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Customers</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Financial summary from all customers
                  </p>
                </div>
                <div className="text-2xl">👥</div>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <Row
                label="Total Customers"
                value={customerSummary.totalCustomers}
                icon="👤"
              />
              <Row
                label="Total Billed Amount"
                value={customerSummary.totalBilled}
                icon="📄"
              />
              <Row
                label="Total Received"
                value={customerSummary.totalPaid}
                icon="✅"
              />
              <Row
                label="Pending Balance"
                value={customerSummary.totalPending}
                highlight
                icon="⏳"
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Payment Collection</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${customerPaymentPercentage}%` }}
                  ></div>
                </div>
                <span className="font-medium">{customerPaymentPercentage}%</span>
              </div>
            </div>
          </div>

          {/* SUPPLIER SUMMARY */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Suppliers</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Purchase and payment summary
                  </p>
                </div>
                <div className="text-2xl">🏭</div>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <Row
                label="Total Suppliers"
                value={supplierSummary.totalSuppliers}
                icon="🏢"
              />
              <Row
                label="Total Purchases"
                value={supplierSummary.totalPurchased}
                icon="🛒"
              />
              <Row
                label="Total Paid"
                value={supplierSummary.totalPaid}
                icon="💳"
              />
              <Row
                label="Pending Payments"
                value={supplierSummary.totalPending}
                highlight
                icon="📝"
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Payment Completion</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${supplierPaymentPercentage}%` }}
                  ></div>
                </div>
                <span className="font-medium">{supplierPaymentPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* BUSINESS POSITION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Business Position</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Overall financial health and performance
                </p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹ {businessSummary.totalSales.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-orange-600">🛒</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Purchases</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹ {businessSummary.totalPurchases.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${
                businessSummary.netPosition >= 0 
                  ? 'bg-green-50 border-green-100' 
                  : 'bg-red-50 border-red-100'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    businessSummary.netPosition >= 0 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    <span className={businessSummary.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ⚖️
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Balance Position</p>
                    <p className={`text-xl font-bold ${
                      businessSummary.netPosition >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      ₹ {businessSummary.netPosition.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profit/Loss Summary */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Gross Profit/Loss</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Sales minus Purchases
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${
                      netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹ {netProfit.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-medium ${
                    netProfit >= 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {netProfit >= 0 ? 'Profit' : 'Loss'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-gray-700 font-medium">Business Report</p>
              <p className="text-sm text-gray-500 mt-1">
                Generated on {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Data Source</p>
                <p className="font-medium text-blue-600">Live Database</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">Version</p>
              <p className="font-medium">v1.0.0</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Business Dashboard. All rights reserved.
              <span className="mx-2">•</span>
              For internal use only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}