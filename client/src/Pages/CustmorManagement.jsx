// src/Pages/CustmorManagement.jsx - FULLY CONNECTED TO BACKEND
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Search, Plus, Loader2, AlertCircle } from "lucide-react"; 
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; // ✅ Axios instance

const Customers = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingCustomer, setAddingCustomer] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });

  // ✅ FETCH ALL CUSTOMERS
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCustomers(response.data);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Failed to fetch customers");
        if (err.response.status === 401 || err.response.status === 403) {
          logout();
        }
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREATE NEW CUSTOMER
  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      alert("Name and phone are required");
      return;
    }

    try {
      setAddingCustomer(true);

      const response = await api.post("/api/customers", newCustomer, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCustomers([response.data, ...customers]);
      setNewCustomer({ name: "", phone: "" });
      setShowModal(false);
    } catch (err) {
      if (err.response) {
        alert("Error creating customer: " + (err.response.data.message || "Unknown error"));
      } else {
        alert("Network error. Please try again.");
      }
    } finally {
      setAddingCustomer(false);
    }
  };

  // ✅ FILTER CUSTOMERS
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.contactInfo?.phone?.includes(search)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 to-blue-200">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-xl text-blue-900">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-900">
        Customer Management ({customers.length})
      </h1>

      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button 
            onClick={fetchCustomers}
            className="ml-auto text-blue-600 hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-6 relative">
        <div className="flex items-center border rounded-lg px-3 py-2 mb-4 bg-gray-50">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="flex-1 outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredCustomers.length > 0 ? (
          <ul className="space-y-3">
            {filteredCustomers.map((customer) => (
              <li
                key={customer._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 cursor-pointer transition-all"
                onClick={() =>
                  navigate(`/customers/${encodeURIComponent(customer.name)}`)
                }
              >
                <User className="w-6 h-6 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800 block truncate">{customer.name}</span>
                  <span className="text-sm text-gray-500 block">
                    {customer.contactInfo?.phone || 'No phone'}
                  </span>
                  {customer.totalDue > 0 && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full mt-1 inline-block">
                      ₹{customer.totalDue.toLocaleString()} due
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-12">No customers found</p>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all"
          disabled={addingCustomer}
        >
          {addingCustomer ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              Add New Customer
            </h2>
            <input
              type="text"
              placeholder="Customer Name"
              className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              disabled={addingCustomer}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              disabled={addingCustomer}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                disabled={addingCustomer}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={addingCustomer}
              >
                {addingCustomer ? 'Adding...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
