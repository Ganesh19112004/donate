import { useState } from "react";

const Donate = () => {
  const [amount, setAmount] = useState("");
  const [ngo, setNgo] = useState("");

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Donated ₹${amount} to ${ngo || "Selected NGO"} successfully!`);
    setAmount("");
    setNgo("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Make a Donation</h1>
      <form
        onSubmit={handleDonate}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <input
          type="text"
          placeholder="NGO Name"
          value={ngo}
          onChange={(e) => setNgo(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded"
          required
        />
        <input
          type="number"
          placeholder="Donation Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700 transition"
        >
          Donate Now
        </button>
      </form>
    </div>
  );
};

export default Donate;
