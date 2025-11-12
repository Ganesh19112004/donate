import React, { useEffect, useState } from "react";

interface Donation {
  id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
}

const DonorDonations: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    // TODO: Replace with Supabase fetch logic later
    setDonations([
      {
        id: "1",
        category: "Clothes",
        description: "Winter jackets and sweaters",
        status: "Pending",
        created_at: "2025-11-10",
      },
      {
        id: "2",
        category: "Books",
        description: "Old school books for children",
        status: "Completed",
        created_at: "2025-11-08",
      },
    ]);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Donations</h1>

      {donations.length === 0 ? (
        <p className="text-gray-600">No donations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-xl">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 border-b">#</th>
                <th className="px-4 py-3 border-b">Category</th>
                <th className="px-4 py-3 border-b">Description</th>
                <th className="px-4 py-3 border-b">Status</th>
                <th className="px-4 py-3 border-b">Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d, index) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{index + 1}</td>
                  <td className="px-4 py-2 border-b">{d.category}</td>
                  <td className="px-4 py-2 border-b">{d.description}</td>
                  <td
                    className={`px-4 py-2 border-b font-medium ${
                      d.status === "Completed"
                        ? "text-green-600"
                        : d.status === "Pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {d.status}
                  </td>
                  <td className="px-4 py-2 border-b">{d.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DonorDonations;
