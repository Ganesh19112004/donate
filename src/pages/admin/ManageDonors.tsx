const ManageDonors = () => {
  const donors = [
    { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", donations: 5 },
    { id: 2, name: "Priya Singh", email: "priya@gmail.com", donations: 2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Manage Donors</h1>

      <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3">Name</th>
            <th className="border p-3">Email</th>
            <th className="border p-3">Donations</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {donors.map((donor) => (
            <tr key={donor.id}>
              <td className="border p-3">{donor.name}</td>
              <td className="border p-3">{donor.email}</td>
              <td className="border p-3 text-center">{donor.donations}</td>
              <td className="border p-3 text-center">
                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
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

export default ManageDonors;
