const ManageNGOs = () => {
  const ngos = [
    { id: 1, name: "Helping Hands", city: "Mumbai", status: "Active" },
    { id: 2, name: "Care4Health", city: "Delhi", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Manage NGOs</h1>

      <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3">Name</th>
            <th className="border p-3">City</th>
            <th className="border p-3">Status</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ngos.map((ngo) => (
            <tr key={ngo.id}>
              <td className="border p-3">{ngo.name}</td>
              <td className="border p-3">{ngo.city}</td>
              <td className="border p-3">{ngo.status}</td>
              <td className="border p-3 text-center">
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageNGOs;
