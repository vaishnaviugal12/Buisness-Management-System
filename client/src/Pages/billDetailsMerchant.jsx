import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Loader2, Edit3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BillDetailsMerchant = () => {
  const { name, invoice } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const decodedName = decodeURIComponent(name);

  const [invoiceData, setInvoiceData] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [paidHistory, setPaidHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editId, setEditId] = useState(null);
  const [entry, setEntry] = useState({
    date: "",
    description: "",
    amount: "",
    itemName: "",
    method: "CASH",
  });
  const [savingEntry, setSavingEntry] = useState(false);

  useEffect(() => {
    fetchBillData();
  }, [invoice]);

  const fetchBillData = async () => {
    try {
      setLoading(true);

      // Fetch invoice details
      const invoiceRes = await fetch(
        `http://localhost:5000/api/merchant-invoices/${invoice}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!invoiceRes.ok) throw new Error("Invoice not found");
      setInvoiceData(await invoiceRes.json());

      // Fetch payments
      const paymentsRes = await fetch(
        `http://localhost:5000/api/merchant-payments/invoice/${invoice}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (paymentsRes.ok) setPaidHistory(await paymentsRes.json());

      // Fetch purchase items
      const itemsRes = await fetch(
        `http://localhost:5000/api/merchant-invoice-items/invoice/${invoice}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (itemsRes.ok) setPurchaseHistory(await itemsRes.json());
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const totalPurchase = purchaseHistory.reduce(
    (sum, i) => sum + Number(i.amount || 0),
    0
  );

  const totalPaid = paidHistory.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const totalPending = totalPurchase - totalPaid;

  const openModal = (type, row = null) => {
    setModalType(type);
    if (row) {
      setEditId(row._id);
      setEntry({
        date: new Date(row.paymentDate || row.itemDate)
          .toISOString()
          .split("T")[0],
        description: row.note || row.description || "",
        amount: row.amount || "",
        itemName: row.itemName || "",
        method: row.method || "CASH",
      });
    } else {
      setEditId(null);
      setEntry({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        itemName: "",
        method: "CASH",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    const amountNum = Number(entry.amount);
    if (!entry.date || amountNum <= 0) return alert("Invalid data");

    try {
      setSavingEntry(true);

      if (modalType === "paid") {
        const payload = {
          paymentDate: entry.date,
          amount: amountNum,
          note: entry.description,
          method: entry.method,
        };
        const url = editId
          ? `http://localhost:5000/api/merchant-payments/${editId}`
          : "http://localhost:5000/api/merchant-payments";

        await fetch(url, {
          method: editId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editId ? payload : { ...payload, merchantInvoice: invoice }),
        });
      }

      if (modalType === "purchase") {
        const payload = {
          itemDate: entry.date,
          itemName: entry.itemName,
          amount: amountNum,
          description: entry.description,
        };
        const url = editId
          ? `http://localhost:5000/api/merchant-invoice-items/${editId}`
          : "http://localhost:5000/api/merchant-invoice-items";

        await fetch(url, {
          method: editId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editId ? payload : { ...payload, merchantInvoice: invoice }),
        });
      }

      await fetchBillData();
      setShowModal(false);
      setEditId(null);
    } finally {
      setSavingEntry(false);
    }
  };

  const renderTable = (title, data, type) => (
    <div className="mb-6">
      <div className="flex justify-between mb-3">
        <h2 className="font-semibold text-green-800">{title}</h2>
        <button
          onClick={() => openModal(type)}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1"
        >
          <Plus size={16} /> {type === "paid" ? "Add Payment" : "Add Item"}
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">{type === "paid" ? "Note" : "Item"}</th>
            {type === "paid" && <th className="p-2">Mode</th>}
            <th className="p-2 text-right">Amount</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.length ? (
            data.map((r) => (
              <tr key={r._id} className="border-b hover:bg-green-50">
                <td className="p-2">{new Date(r.paymentDate || r.itemDate).toLocaleDateString()}</td>
                <td className="p-2">{r.note || r.itemName}</td>
                {type === "paid" && <td className="p-2">{r.method}</td>}
                <td className="p-2 text-right">₹{r.amount}</td>
                <td className="p-2 text-center">
                  <button onClick={() => openModal(type, r)}>
                    <Edit3 size={16} className="text-blue-600" />
                  </button>
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
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-green-700 mb-4"
      >
        <ArrowLeft className="mr-2" /> Back
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Bill Details</h1>
          <p className="text-gray-600">
            Supplier: <span className="font-semibold">{decodedName}</span>
          </p>
          {invoiceData && (
            <p className="text-gray-600 mt-1">
  Bill Number: <span className="font-semibold">{invoiceData?.invoice?.billNumber}</span>
</p>
          )}
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div className="border p-4 rounded">
            <p>Total Purchase</p>
            <p className="text-xl font-bold">₹{totalPurchase}</p>
          </div>
          <div className="border p-4 rounded">
            <p>Total Paid</p>
            <p className="text-xl font-bold text-green-700">₹{totalPaid}</p>
          </div>
          <div className="border p-4 rounded">
            <p>Balance Due</p>
            <p className="text-xl font-bold text-red-600">₹{totalPending}</p>
          </div>
        </div>

        {/* TABLES */}
        {renderTable("Purchase History", purchaseHistory, "purchase")}
        {renderTable("Payment History", paidHistory, "paid")}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="font-semibold mb-4">
              {editId
                ? modalType === "paid"
                  ? "Edit Payment"
                  : "Edit Item"
                : modalType === "paid"
                ? "Add Payment"
                : "Add Item"}
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
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="OTHER">OTHER</option>
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
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={handleSave} disabled={savingEntry} className="px-4 py-2 bg-green-600 text-white rounded">
                {savingEntry ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillDetailsMerchant;
