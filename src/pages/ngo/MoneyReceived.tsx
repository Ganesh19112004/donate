import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export default function MoneyReceived() {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadMoneyData();
  }, []);

  const loadMoneyData = async () => {
    if (!ngo?.id) return;

    const { data } = await supabase
      .from("donations")
      .select(`
        id,
        amount,
        created_at,
        category,
        donor_id,
        donors(name, email)
      `)
      .eq("ngo_id", ngo.id)
      .gt("amount", 0)
      .order("created_at", { ascending: false });

    setList(data || []);

    const totalAmount = data?.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0
    );

    setTotal(totalAmount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-6">
        💰 Money Received Summary
      </h1>

      <Card className="p-6 mb-10 shadow-lg bg-white">
        <p className="text-xl font-semibold text-gray-700">
          Total Donations Received:
        </p>
        <p className="text-4xl font-bold text-green-600 mt-2">
          ₹{total}
        </p>
      </Card>

      <h2 className="text-2xl font-bold mb-4">All Donors</h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Donor Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Category</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No money donations yet.
                </td>
              </tr>
            )}

            {list.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{item.donors?.name || "Unknown"}</td>
                <td className="p-3">{item.donors?.email}</td>
                <td className="p-3 text-green-700 font-bold">₹{item.amount}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
