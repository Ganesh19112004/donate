import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ IMPORTANT FIX
import { supabase } from "@/integrations/supabase/client";

import {
  Loader2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileDown,
} from "lucide-react";

export default function AllDonations() {
  const [loading, setLoading] = useState(true);

  const [donations, setDonations] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [ngos, setNgos] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [ngoFilter, setNGOFilter] = useState("");
  const [donorFilter, setDonorFilter] = useState("");

  const [sortBy, setSortBy] = useState("newest");

  const [page, setPage] = useState(1);
  const limit = 10;

  // Categories
  const categories = [
    "Books", "Clothes", "Food", "Money", "Electronics",
    "Toys", "Stationery", "Medical Supplies", "Furniture", "Groceries",
    "Hygiene Kits", "Other"
  ];

  /* -------------------- FETCH ALL DATA -------------------- */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [donationData, ngoData, donorData] = await Promise.all([
      supabase.from("donations").select("*").order("created_at", { ascending: false }),
      supabase.from("ngos").select("id, name"),
      supabase.from("donors").select("id, name"),
    ]);

    setDonations(donationData.data || []);
    setFiltered(donationData.data || []);
    setNgos(ngoData.data || []);
    setDonors(donorData.data || []);

    setLoading(false);
  };

  /* -------------------- FILTER + SORT LOGIC -------------------- */
  useEffect(() => {
    let data = [...donations];

    // Search
    if (search.trim()) {
      data = data.filter((d) =>
        (d.description || "").toLowerCase().includes(search.toLowerCase()) ||
        String(d.amount).includes(search) ||
        String(d.quantity).includes(search)
      );
    }

    // Filters
    if (status) data = data.filter((d) => d.status === status);
    if (category) data = data.filter((d) => d.category === category);
    if (ngoFilter) data = data.filter((d) => d.ngo_id === ngoFilter);
    if (donorFilter) data = data.filter((d) => d.donor_id === donorFilter);

    // Sorting
    if (sortBy === "newest") {
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "oldest") {
      data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === "amount-high") {
      data.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (sortBy === "amount-low") {
      data.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    }

    setFiltered(data);
    setPage(1);
  }, [search, status, category, ngoFilter, donorFilter, sortBy, donations]);

  /* -------------------- PAGINATION -------------------- */
  const totalPages = Math.ceil(filtered.length / limit);
  const currentData = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">📦 All Donations</h1>

      {/* SEARCH + FILTER BAR */}
      <div className="bg-white shadow p-5 rounded-xl mb-6 grid lg:grid-cols-5 md:grid-cols-3 gap-4 border">

        {/* Search */}
        <div className="flex items-center bg-gray-100 p-2 rounded-lg">
          <Search className="text-gray-500" size={18} />
          <input
            className="ml-2 bg-transparent outline-none w-full"
            placeholder="Search donations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status */}
        <select className="p-2 border rounded-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Status (All)</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Category */}
        <select className="p-2 border rounded-lg" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Category (All)</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* NGO */}
        <select className="p-2 border rounded-lg" value={ngoFilter} onChange={(e) => setNGOFilter(e.target.value)}>
          <option value="">NGO (All)</option>
          {ngos.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
        </select>

        {/* Donor */}
        <select className="p-2 border rounded-lg" value={donorFilter} onChange={(e) => setDonorFilter(e.target.value)}>
          <option value="">Donor (All)</option>
          {donors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        {/* Sort Options */}
        <select className="p-2 border rounded-lg" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-high">Amount: High → Low</option>
          <option value="amount-low">Amount: Low → High</option>
        </select>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          {/* NO RESULTS */}
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-20 text-lg">No donations found.</p>
          ) : (
            <>
              {/* TABLE */}
              <div className="bg-white p-6 rounded-xl shadow border overflow-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3">NGO</th>
                      <th className="p-3">Donor</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((d) => (
                      <tr key={d.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{ngos.find((n) => n.id === d.ngo_id)?.name || "—"}</td>
                        <td className="p-3">{donors.find((v) => v.id === d.donor_id)?.name || "—"}</td>
                        <td className="p-3">{d.category}</td>
                        <td className="p-3">₹{Number(d.amount || 0).toLocaleString()}</td>

                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-lg text-white ${
                              d.status === "Pending"
                                ? "bg-yellow-500"
                                : d.status === "Accepted"
                                ? "bg-blue-500"
                                : d.status === "Completed"
                                ? "bg-green-600"
                                : "bg-red-500"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>

                        <td className="p-3">{new Date(d.created_at).toLocaleDateString()}</td>

                        <td className="p-3">
                          <Link
                            to={`/admin/donation/${d.id}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Eye size={16} /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* PAGINATION */}
                <div className="flex justify-center items-center gap-3 mt-5">
                  <button
                    onClick={() => page > 1 && setPage(page - 1)}
                    className="p-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    disabled={page === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="font-semibold">
                    Page {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => page < totalPages && setPage(page + 1)}
                    className="p-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* EXPORT */}
              <div className="flex gap-3 mt-6">
                <button className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                  <FileDown size={18} /> Export CSV
                </button>
                <button className="bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                  <FileDown size={18} /> Export Excel
                </button>
                <button className="bg-yellow-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                  <FileDown size={18} /> Export PDF
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
