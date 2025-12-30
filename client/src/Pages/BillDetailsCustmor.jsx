import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, PlusCircle, Edit3, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BillDetailsCustomer = () => {
  const { id } = useParams(); // invoice id
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editId, setEditId] = useState(null);
  const [entry, setEntry] = useState({
    date: "",
    itemName: "",
    description: "",
    amount: "",
    method: "CASH",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBillData();
  }, [id]);

  const fetchBillData = async () => {
    try {
      setLoading(true);

      const invRes = await fetch(`http://localhost:5000/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!invRes.ok) throw new Error();
      const invData = await invRes.json();
      setInvoice(invData.invoice);

      const itemsRes = await fetch(
        `http://localhost:5000/api/invoice-items/invoice/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPurchaseHistory(itemsRes.ok ? await itemsRes.json() : []);

      const payRes = await fetch(
        `http://localhost:5000/api/payments/invoice/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentHistory(payRes.ok ? await payRes.json() : []);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE INVOICE AMOUNTS ================= */
  const updateInvoiceAmounts = async (totalPurchase, totalPaid) => {
    try {
      const dueAmount = totalPurchase - totalPaid;
      
      // Determine status based on amounts
      let status = "PENDING";
      if (totalPaid >= totalPurchase) {
        status = "PAID";
      } else if (totalPaid > 0) {
        status = "PARTIALLY_PAID";
      }

      const updatedInvoice = {
        totalAmount: totalPurchase, // This will be sum of purchase items
        paidAmount: totalPaid,
        dueAmount: dueAmount,
        status: status
      };

      const response = await fetch(`http://localhost:5000/api/invoices/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInvoice),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice");
      }

      // Update local state
      setInvoice(prev => ({
        ...prev,
        ...updatedInvoice
      }));
    } catch (error) {
      console.error("Failed to update invoice amounts:", error);
    }
  };

  /* ================= TOTALS ================= */
  const totalPurchase = purchaseHistory.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalPaid = paymentHistory.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const balanceDue = totalPurchase - totalPaid;

  // Update invoice amounts whenever purchase/payment history changes
  useEffect(() => {
    if (invoice && (totalPurchase > 0 || totalPaid > 0)) {
      updateInvoiceAmounts(totalPurchase, totalPaid);
    }
  }, [totalPurchase, totalPaid]);

  /* ================= MODAL ================= */
  const openModal = (type, row = null) => {
    setModalType(type);
    if (row) {
      setEditId(row._id);
      setEntry({
        date: new Date(row.paymentDate || row.itemDate).toISOString().split("T")[0],
        itemName: row.itemName || "",
        description: row.note || row.description || "",
        amount: row.amount,
        method: row.method || "CASH",
      });
    } else {
      setEditId(null);
      setEntry({
        date: new Date().toISOString().split("T")[0],
        itemName: "",
        description: "",
        amount: "",
        method: "CASH",
      });
    }
    setShowModal(true);
  };

  /* ================= DELETE ITEM/PAYMENT ================= */
  const handleDeleteItem = async (itemId, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === "purchase" ? "item" : "payment"}?`)) {
      return;
    }

    try {
      const endpoint = type === "purchase" 
        ? `http://localhost:5000/api/invoice-items/${itemId}`
        : `http://localhost:5000/api/payments/${itemId}`;
      
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to delete ${type}`);

      // Refresh data
      fetchBillData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const handleSave = async () => {
    const amount = Number(entry.amount);
    if (!entry.date || amount <= 0) return alert("Invalid data");

    try {
      setSaving(true);

      if (modalType === "purchase") {
        const payload = { 
          invoice: id, 
          itemDate: entry.date, 
          itemName: entry.itemName, 
          amount, 
          description: entry.description 
        };
        const url = editId
          ? `http://localhost:5000/api/invoice-items/${editId}`
          : "http://localhost:5000/api/invoice-items";
        
        const method = editId ? "PUT" : "POST";
        
        const res = await fetch(url, {
          method,
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to save item");
      }

      if (modalType === "paid") {
        const payload = { 
          invoice: id, 
          paymentDate: entry.date, 
          amount, 
          method: entry.method, 
          note: entry.description 
        };
        const url = editId
          ? `http://localhost:5000/api/payments/${editId}`
          : "http://localhost:5000/api/payments";
        
        const method = editId ? "PUT" : "POST";
        
        const res = await fetch(url, {
          method,
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to save payment");
      }

      // Refresh all data
      await fetchBillData();
      setShowModal(false);
      setEditId(null);
    } catch (error) {
      alert(error.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= TABLE ================= */
  const renderTable = (title, data, type) => {
    const tableTotal = data.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    return (
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6 mb-6">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold text-blue-800">{title}</h2>
          <button
            onClick={() => openModal(type)}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <PlusCircle size={16} /> {type === "paid" ? "Add Payment" : "Add Item"}
          </button>
        </div>

        <table className="w-full border text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">{type === "paid" ? "Note" : "Item"}</th>
              {type === "paid" && <th className="p-2">Mode</th>}
              <th className="p-2 text-right">Amount</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((r) => (
                <tr key={r._id} className="border-t hover:bg-blue-50">
                  <td className="p-2">{new Date(r.paymentDate || r.itemDate).toLocaleDateString()}</td>
                  <td className="p-2">{r.note || r.itemName}</td>
                  {type === "paid" && <td className="p-2">{r.method}</td>}
                  <td className="p-2 text-right">₹{Number(r.amount).toFixed(2)}</td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openModal(type, r)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(r._id, type)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={type === "paid" ? 5 : 4} className="p-4 text-center text-gray-500">
                  No records
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={type === "paid" ? 3 : 2} className="p-2">Total</td>
              <td className="p-2 text-right">₹{Number(tableTotal).toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  if (!invoice)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <AlertCircle className="text-red-600" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {/* BACK */}
      <button onClick={() => navigate(-1)} className="flex items-center text-blue-700 mb-4">
        <ArrowLeft className="mr-2" /> Back
      </button>

      {/* HEADER */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Invoice Details</h1>
        <p className="text-gray-600">Customer: {invoice.customer?.name}</p>
        <p className="text-gray-600">Invoice #: {invoice.invoiceNumber || invoice._id.slice(-6)}</p>
        <p className="text-gray-600 mt-2">Date: {new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString()}</p>
      </div>

      {/* SUMMARY */}
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-600 mb-1">Total Amount</p>
          <p className="text-xl font-bold">₹{Number(totalPurchase).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-600 mb-1">Total Paid</p>
          <p className="text-xl font-bold text-green-600">₹{Number(totalPaid).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-600 mb-1">Balance Due</p>
          <p className="text-xl font-bold text-red-600">₹{Number(balanceDue).toFixed(2)}</p>
        </div>
      </div>

      {/* TABLES */}
      {renderTable("Purchase History", purchaseHistory, "purchase")}
      {renderTable("Payment History", paymentHistory, "paid")}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="font-semibold mb-4">
              {editId ? (modalType === "paid" ? "Edit Payment" : "Edit Item") : modalType === "paid" ? "Add Payment" : "Add Item"}
            </h2>

            <input
              type="date"
              className="w-full border p-2 mb-2"
              value={entry.date}
              onChange={(e) => setEntry({ ...entry, date: e.target.value })}
            />

            {modalType === "purchase" && (
              <input
                type="text"
                placeholder="Item Name"
                className="w-full border p-2 mb-2"
                value={entry.itemName}
                onChange={(e) => setEntry({ ...entry, itemName: e.target.value })}
              />
            )}

            {modalType === "paid" && (
              <select
                className="w-full border p-2 mb-2"
                value={entry.method}
                onChange={(e) => setEntry({ ...entry, method: e.target.value })}
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">CARD</option>
                <option value="BANK_TRANSFER">BANK_TRANSFER</option>
              </select>
            )}

            <input
              type="text"
              placeholder="Description / Note"
              className="w-full border p-2 mb-2"
              value={entry.description}
              onChange={(e) => setEntry({ ...entry, description: e.target.value })}
            />

            <input
              type="number"
              placeholder="Amount"
              className="w-full border p-2 mb-4"
              value={entry.amount}
              onChange={(e) => setEntry({ ...entry, amount: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillDetailsCustomer;