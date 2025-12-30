import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  PlusCircle,
  Edit3,
  Save,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; // Import your axios instance

const CustomerDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const decodedName = decodeURIComponent(name);

  /* ================= CUSTOMER INFO ================= */
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  /* ================= INVOICES ================= */
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [paidInvoices, setPaidInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);

  /* ================= ADD INVOICE ================= */
  const [showModal, setShowModal] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [invoiceEntry, setInvoiceEntry] = useState({
    invoiceNumber: "",
    totalAmount: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchCustomerData();
  }, [decodedName, token]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // Add authorization header
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const custRes = await api.get("/api/customers", config);

      if (custRes.status === 401 || custRes.status === 403) return logout();

      const customers = custRes.data;

      const foundCustomer = customers.find(
        (c) => c.name.toLowerCase() === decodedName.toLowerCase()
      );
      if (!foundCustomer) throw new Error("Customer not found");

      setCustomer(foundCustomer);

      const invRes = await api.get("/api/invoices", config);
      const invoices = invRes.data;

      const customerInvoices = invoices.filter(
        (inv) => inv.customer && inv.customer._id === foundCustomer._id
      );

      // Use same logic as supplier side - filter by STATUS not dueAmount
      const activeInvoices = customerInvoices.filter(
        (i) => i.status === "PENDING" || i.status === "PARTIALLY_PAID"
      );
      const paidInvoices = customerInvoices.filter((i) => i.status === "PAID");

      // Debug: Log one invoice to check dueAmount
      if (customerInvoices.length > 0) {
        console.log("Sample invoice:", {
          totalAmount: customerInvoices[0].totalAmount,
          paidAmount: customerInvoices[0].paidAmount,
          dueAmount: customerInvoices[0].dueAmount,
          status: customerInvoices[0].status
        });
      }

      setPendingInvoices(activeInvoices);
      setPaidInvoices(paidInvoices);
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUMMARY ================= */
  const allInvoices = [...pendingInvoices, ...paidInvoices];
  const totalInvoices = allInvoices.length;
  const totalPaid = allInvoices.reduce(
    (s, i) => s + Number(i.paidAmount || 0),
    0
  );
  const totalPending = allInvoices.reduce(
    (s, i) => s + Number(i.dueAmount || 0),
    0
  );

  const displayedInvoices =
    activeTab === "active" ? pendingInvoices : paidInvoices;

  /* ================= EDIT CUSTOMER ================= */
  const handleEditToggle = () => {
    if (isEditing) handleSaveInfo();
    else setIsEditing(true);
  };

  const handleSaveInfo = async () => {
    try {
      setSavingInfo(true);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const res = await api.put(
        `/api/customers/${customer._id}`,
        {
          name: customer.name,
          phone: customer.contactInfo?.phone,
        },
        config
      );

      const updated = res.data;
      setCustomer(updated);
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  /* ================= DELETE INVOICE ================= */
  const handleDeleteInvoice = async (invoiceId, event) => {
    event.stopPropagation(); // Prevent row click navigation
    
    if (!window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingInvoiceId(invoiceId);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await api.delete(`/api/invoices/${invoiceId}`, config);

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      fetchCustomerData();
      
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert(err.message || "Failed to delete invoice");
    } finally {
      setDeletingInvoiceId(null);
    }
  };

  /* ================= ADD INVOICE ================= */
  const handleAddInvoice = async () => {
    const amt = Number(invoiceEntry.totalAmount);
    if (!invoiceEntry.invoiceNumber) return alert("Invoice number is required");
    if (!amt || amt <= 0) return alert("Please enter a valid amount greater than 0");

    try {
      setSavingInvoice(true);
      
      // Create invoice with proper initial values
      const invoiceData = {
        customer: customer._id,
        invoiceNumber: invoiceEntry.invoiceNumber,
        totalAmount: amt,
        paidAmount: 0,
        dueAmount: amt, // This should be same as total amount initially
        invoiceDate: invoiceEntry.invoiceDate,
        notes: invoiceEntry.notes,
        status: "PENDING"
      };

      console.log("Sending invoice data:", invoiceData);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await api.post("/api/invoices", invoiceData, config);

      const createdInvoice = response.data;
      console.log("Created invoice response:", createdInvoice);

      // Check if dueAmount is correct in response
      if (createdInvoice.invoice) {
        console.log("Invoice created with dueAmount:", createdInvoice.invoice.dueAmount);
      }

      setShowModal(false);
      setInvoiceEntry({
        invoiceNumber: "",
        totalAmount: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        notes: "",
      });

      // Refresh immediately to see the new invoice
      fetchCustomerData();
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert(error.message || "Failed to create invoice");
    } finally {
      setSavingInvoice(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  if (!customer)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <AlertCircle className="text-red-600" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-700 mb-4 hover:text-blue-800"
      >
        <ArrowLeft className="mr-2" /> Back
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">
            {customer.name}
          </h1>
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
            {isEditing ? "Save" : "Edit Info"}
          </button>
        </div>

        {/* CUSTOMER INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-gray-600 mb-2">Customer Name</p>
            {isEditing ? (
              <input
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
            ) : (
              <p className="font-semibold text-blue-800">{customer.name}</p>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-gray-600 mb-2">Mobile Number</p>
            {isEditing ? (
              <input
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={customer.contactInfo?.phone || ""}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    contactInfo: {
                      ...customer.contactInfo,
                      phone: e.target.value,
                    },
                  })
                }
              />
            ) : (
              <p className="font-semibold text-blue-800">
                {customer.contactInfo?.phone || "N/A"}
              </p>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-sm text-gray-500">Total Invoices</p>
            <p className="text-2xl font-bold text-blue-700">{totalInvoices}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-blue-700">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-sm text-gray-500">Total Pending</p>
            <p className="text-2xl font-bold text-red-600">
              ₹{totalPending.toLocaleString()}
            </p>
          </div>
        </div>

        {/* TABS + ADD */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-2 font-medium transition-colors ${
                activeTab === "active"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Active ({pendingInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`px-6 py-2 font-medium transition-colors ${
                activeTab === "inactive"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Paid ({paidInvoices.length})
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" /> Add Invoice
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Invoice No.</th>
                <th className="px-4 py-3 text-center font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Paid</th>
                <th className="px-4 py-3 text-right font-semibold">Due</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="text-gray-400 mb-2" size={32} />
                      No {activeTab === "active" ? "active" : "paid"} invoices found
                    </div>
                  </td>
                </tr>
              ) : (
                displayedInvoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className="border-t hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(
                        `/customers/${encodeURIComponent(
                          customer.name
                        )}/bill/${inv._id}`
                      )
                    }
                  >
                    <td className="px-4 py-3 text-blue-600 font-medium">
                      {inv.invoiceNumber || inv._id.slice(-6)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {new Date(
                        inv.invoiceDate || inv.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ₹{Number(inv.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      ₹{Number(inv.paidAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      ₹{Number(inv.dueAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => handleDeleteInvoice(inv._id, e)}
                        disabled={deletingInvoiceId === inv._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Invoice"
                      >
                        {deletingInvoiceId === inv._id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD INVOICE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="font-semibold text-lg mb-4 text-gray-800">Add New Invoice</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  placeholder="Enter invoice number"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={invoiceEntry.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceEntry({
                      ...invoiceEntry,
                      invoiceNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter total amount"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={invoiceEntry.totalAmount}
                  onChange={(e) =>
                    setInvoiceEntry({
                      ...invoiceEntry,
                      totalAmount: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Initial due amount will be set to this value.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={invoiceEntry.invoiceDate}
                  onChange={(e) =>
                    setInvoiceEntry({
                      ...invoiceEntry,
                      invoiceDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Add any notes here"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={invoiceEntry.notes}
                  onChange={(e) =>
                    setInvoiceEntry({ ...invoiceEntry, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={savingInvoice}
              >
                Cancel
              </button>
              <button
                onClick={handleAddInvoice}
                disabled={savingInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {savingInvoice ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Creating...
                  </span>
                ) : (
                  "Create Invoice"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;