// src/Pages/SupplierManagement.jsx - FULLY CONNECTED TO BACKEND
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Factory, Search, Plus, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // ✅ Auth protection

const Suppliers = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth(); // ✅ Protected route
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingSupplier, setAddingSupplier] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ 
    name: "", 
    phone: "", 
    number: "", 
    bankAccount: "", 
    ifscCode: "" 
  });

  // ✅ FETCH ALL MERCHANTS/SUPPLIERS FROM BACKEND
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:5000/api/merchants", {
        headers: {
          'Authorization': `Bearer ${token}`, // ✅ Auto token
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout(); // ✅ Auto logout
          return;
        }
        throw new Error('Failed to fetch suppliers');
      }

      const data = await response.json();
      setSuppliers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREATE NEW SUPPLIER/MERCHANT
  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim() || !newSupplier.phone.trim()) {
      alert("Name and phone are required");
      return;
    }

    try {
      setAddingSupplier(true);
      const response = await fetch("http://localhost:5000/api/merchants", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSupplier),
      });

      if (!response.ok) {
        throw new Error('Failed to create supplier');
      }

      const createdSupplier = await response.json();
      setSuppliers([createdSupplier, ...suppliers]); // ✅ Add to top
      setNewSupplier({ name: "", phone: "", number: "", bankAccount: "", ifscCode: "" });
      setShowModal(false);
    } catch (err) {
      alert("Error creating supplier: " + err.message);
    } finally {
      setAddingSupplier(false);
    }
  };

  // ✅ FILTER SUPPLIERS (Frontend search)
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    supplier.contactInfo.phone.includes(search) ||
    supplier.number?.includes(search)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-green-100 to-green-200">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
          <p className="text-xl text-green-900">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-green-200 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-900">
        Supplier Management ({suppliers.length})
      </h1>

      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button 
            onClick={fetchSuppliers}
            className="ml-auto text-green-600 hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-6 relative">
        
        {/* Search Input */}
        <div className="flex items-center border rounded-lg px-3 py-2 mb-4 bg-gray-50">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by name, phone, or number..."
            className="flex-1 outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Supplier List */}
        {filteredSuppliers.length > 0 ? (
          <ul className="space-y-3">
            {filteredSuppliers.map((supplier) => (
              <li
                key={supplier._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md hover:bg-green-50 cursor-pointer transition-all"
                onClick={() =>
                  navigate(`/suppliers/${encodeURIComponent(supplier.name)}`)
                }
              >
                <Factory className="w-6 h-6 text-green-600" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800 block truncate">{supplier.name}</span>
                  <span className="text-sm text-gray-500 block">
                    {supplier.contactInfo?.phone || 'No phone'}
                  </span>
                  {supplier.number && (
                    <span className="text-xs text-gray-500 block">
                      ID: {supplier.number}
                    </span>
                  )}
                  {supplier.totalDue > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full mt-1 inline-block">
                      ₹{supplier.totalDue.toLocaleString()} payable
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-12">No suppliers found</p>
        )}

        {/* Floating Add New Supplier Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 hover:scale-110 transition-all"
          disabled={addingSupplier}
        >
          {addingSupplier ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Modal for Adding Supplier */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-green-900">
              Add New Supplier
            </h2>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Supplier Name *"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                disabled={addingSupplier}
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                disabled={addingSupplier}
              />
              <input
                type="text"
                placeholder="Supplier Number (optional)"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={newSupplier.number}
                onChange={(e) => setNewSupplier({...newSupplier, number: e.target.value})}
                disabled={addingSupplier}
              />
              <input
                type="text"
                placeholder="Bank Account (optional)"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={newSupplier.bankAccount}
                onChange={(e) => setNewSupplier({...newSupplier, bankAccount: e.target.value})}
                disabled={addingSupplier}
              />
              <input
                type="text"
                placeholder="IFSC Code (optional)"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={newSupplier.ifscCode}
                onChange={(e) => setNewSupplier({...newSupplier, ifscCode: e.target.value.toUpperCase()})}
                disabled={addingSupplier}
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                disabled={addingSupplier}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSupplier}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={addingSupplier}
              >
                {addingSupplier ? 'Adding...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
