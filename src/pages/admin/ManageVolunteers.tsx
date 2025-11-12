const ManageVolunteers = () => {
  const volunteers = [
    { id: 1, name: "Karan Mehta", joined: "2025-09-01", assignedNGO: "Helping Hands" },
    { id: 2, name: "Neha Verma", joined: "2025-10-15", assignedNGO: "Care4Health" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Manage Volunteers</h1>

      <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3">Name</th>
            <th className="border p-3">Joined</th>
            <th className="border p-3">Assigned NGO</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((vol) => (
            <tr key={vol.id}>
              <td className="border p-3">{vol.name}</td>
              <td className="border p-3">{vol.joined}</td>
              <td className="border p-3">{vol.assignedNGO}</td>
              <td className="border p-3 text-center">
                <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageVolunteers;
