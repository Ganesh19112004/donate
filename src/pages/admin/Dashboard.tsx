import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/admin/ngos"
          className="bg-blue-600 text-white p-6 rounded-lg text-center shadow hover:bg-blue-700 transition"
        >
          Manage NGOs
        </Link>

        <Link
          to="/admin/donors"
          className="bg-green-600 text-white p-6 rounded-lg text-center shadow hover:bg-green-700 transition"
        >
          Manage Donors
        </Link>

        <Link
          to="/admin/volunteers"
          className="bg-purple-600 text-white p-6 rounded-lg text-center shadow hover:bg-purple-700 transition"
        >
          Manage Volunteers
        </Link>
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-600">
          Welcome, Admin! Use these tools to oversee NGOs, Donors, and Volunteers.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
