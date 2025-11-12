import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";

const Reports = () => {
  const [report, setReport] = useState<any[]>([]);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("donations")
        .select("category, amount, status, created_at")
        .eq("ngo_id", ngo.id);
      setReport(data || []);
    };
    fetchData();
  }, []);

  const exportCSV = () => {
    const csv = [
      ["Category", "Amount", "Status", "Date"].join(","),
      ...report.map((r) =>
        [r.category, r.amount, r.status, r.created_at].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ngo_report.csv";
    a.click();
  };

  return (
    <div className="p-8 bg-blue-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          <FileText /> Reports & Analytics
        </h1>
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          Export as CSV
        </button>
        {report.length === 0 ? (
          <p>No data found.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.category}</td>
                  <td className="p-3">{r.amount || "—"}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
