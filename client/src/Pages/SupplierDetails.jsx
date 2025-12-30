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

const SupplierDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const decodedName = decodeURIComponent(name);

  /* ================= SUPPLIER INFO ================= */
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  /* ================= BILLS ================= */
  const [pendingBills, setPendingBills] = useState([]);
  const [paidBills, setPaidBills] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);

  /* ================= ADD BILL ================= */
  const [showBillModal, setShowBillModal] = useState(false);
  const [savingBill, setSavingBill] = useState(false);
  const [newBill, setNewBill] = useState({
    billNumber: "",
    billDate: new Date().toISOString().split("T")[0],
    amount: "",
  });

  useEffect(() => {
    fetchSupplierData();
  }, [decodedName, token]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);

      const suppliersRes = await fetch("http://localhost:5000/api/merchants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const suppliers = await suppliersRes.json();

      const foundSupplier = suppliers.find(
        (s) => s.name.toLowerCase() === decodedName.toLowerCase()
      );
      if (!foundSupplier) throw new Error("Supplier not found");
      setSupplierInfo(foundSupplier);

      const invoicesRes = await fetch(
        "http://localhost:5000/api/merchant-invoices",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const invoices = await invoicesRes.json();

      const supplierInvoices = invoices.filter(
        (inv) => inv.merchant && inv.merchant._id === foundSupplier._id
      );

      setPendingBills(
        supplierInvoices.filter(
          (b) => b.status === "PENDING" || b.status === "PARTIALLY_PAID"
        )
      );
      setPaidBills(supplierInvoices.filter((b) => b.status === "PAID"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const allBills = [...pendingBills, ...paidBills];
  const totalPurchase = allBills.reduce(
    (sum, b) => sum + Number(b.totalAmount || 0),
    0
  );
  const totalPaid = allBills.reduce(
    (sum, b) => sum + Number(b.paidAmount || 0),
    0
  );
  const totalPending = allBills.reduce(
    (sum, b) => sum + Number(b.dueAmount || 0),
    0
  );

  const handleSaveBill = async () => {
    if (!newBill.billNumber || !newBill.amount) {
      alert("Bill number and amount are required");
      return;
    }

    try {
      setSavingBill(true);

      await fetch("http://localhost:5000/api/merchant-invoices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant: supplierInfo._id,
          billNumber: newBill.billNumber,
          totalAmount: Number(newBill.amount),
          paidAmount: 0,
          dueAmount: Number(newBill.amount),
          billDate: newBill.billDate,
        }),
      });

      setShowBillModal(false);
      setNewBill({ billNumber: "", billDate: new Date().toISOString().split("T")[0], amount: "" });
      fetchSupplierData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingBill(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) handleSaveInfo();
    else setIsEditing(true);
  };

  const handleSaveInfo = async () => {
    try {
      setSavingInfo(true);
      const res = await fetch(
        `http://localhost:5000/api/merchants/${supplierInfo._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplierInfo),
        }
      );
      const updated = await res.json();
      setSupplierInfo(updated);
      setIsEditing(false);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/merchant-invoices/${invoiceId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete invoice");
      setPendingBills((prev) => prev.filter((b) => b._id !== invoiceId));
      setPaidBills((prev) => prev.filter((b) => b._id !== invoiceId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete invoice");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );

  if (!supplierInfo)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
    );

  const displayedBills = activeTab === "active" ? pendingBills : paidBills;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-green-700 mb-4"
      >
        <ArrowLeft className="mr-2" /> Back
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-800">{supplierInfo.name}</h1>
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
            {isEditing ? "Save" : "Edit Info"}
          </button>
        </div>

        {/* SUPPLIER DETAILS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded">
            <p className="text-gray-600 mb-1">Supplier Name</p>
            {isEditing ? (
              <input
                className="w-full border p-2 rounded"
                value={supplierInfo.name}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, name: e.target.value })}
              />
            ) : (
              <p className="font-semibold">{supplierInfo.name}</p>
            )}
          </div>

          <div className="p-4 bg-green-50 rounded">
            <p className="text-gray-600 mb-1">Bank Account</p>
            {isEditing ? (
              <input
                className="w-full border p-2 rounded"
                value={supplierInfo.bankAccount || ""}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, bankAccount: e.target.value })}
              />
            ) : (
              <p className="font-semibold">{supplierInfo.bankAccount || "N/A"}</p>
            )}
          </div>

          <div className="p-4 bg-green-50 rounded">
            <p className="text-gray-600 mb-1">IFSC Code</p>
            {isEditing ? (
              <input
                className="w-full border p-2 rounded uppercase"
                value={supplierInfo.ifscCode || ""}
                onChange={(e) =>
                  setSupplierInfo({ ...supplierInfo, ifscCode: e.target.value.toUpperCase() })
                }
              />
            ) : (
              <p className="font-semibold">{supplierInfo.ifscCode || "N/A"}</p>
            )}
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-sm text-gray-500">Total Purchase</p>
            <p className="text-2xl font-bold text-green-700">₹{totalPurchase.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-blue-700">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-sm text-gray-500">Total Pending</p>
            <p className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString()}</p>
          </div>
        </div>

        {/* TABS + ADD */}
        <div className="flex justify-between mb-4">
          <div>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 ${activeTab === "active" ? "bg-green-600 text-white" : "bg-gray-200"}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`px-4 py-2 ${activeTab === "inactive" ? "bg-green-600 text-white" : "bg-gray-200"}`}
            >
              Paid
            </button>
          </div>

          <button
            onClick={() => setShowBillModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded"
          >
            <PlusCircle size={18} className="mr-2" /> Add Bill
          </button>
        </div>

        {/* BILL TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Bill No</th>
                <th className="px-4 py-2 text-center">Date</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Paid</th>
                <th className="px-4 py-2 text-right">Due</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedBills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">
                    No bills found
                  </td>
                </tr>
              ) : (
                displayedBills.map((b) => (
                  <tr
                    key={b._id}
                    className="border-t hover:bg-green-50"
                  >
                    <td
                      className="px-4 py-2 text-blue-600 font-medium cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/suppliers/${encodeURIComponent(supplierInfo.name)}/bills/${b._id}`
                        )
                      }
                    >
                      {b.billNumber}
                    </td>
                    <td className="px-4 py-2 text-center">{new Date(b.billDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">₹{Number(b.totalAmount).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-green-700">₹{Number(b.paidAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-red-600">₹{Number(b.dueAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">
                      <Trash2
                        size={18}
                        color="red"
                        onClick={() => handleDeleteInvoice(b._id)}
                        className="cursor-pointer"
                        title="Delete Invoice"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BILL MODAL */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-semibold mb-4">Add Bill</h2>

            <input
              type="text"
              placeholder="Bill Number"
              className="w-full border p-2 mb-3"
              value={newBill.billNumber}
              onChange={(e) => setNewBill({ ...newBill, billNumber: e.target.value })}
            />

            <input
              type="date"
              className="w-full border p-2 mb-3"
              value={newBill.billDate}
              onChange={(e) => setNewBill({ ...newBill, billDate: e.target.value })}
            />

            <input
              type="number"
              placeholder="Amount"
              className="w-full border p-2 mb-4"
              value={newBill.amount}
              onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBillModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBill}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                {savingBill ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDetails;

