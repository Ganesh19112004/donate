import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Star, Heart, CheckCircle, Search } from "lucide-react";

const RAZORPAY_KEY_ID = "rzp_test_RmaCFr0K8J6NKZ";

export default function DonateMoney() {
  const [ngos, setNgos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [amount, setAmount] = useState("");

  const donor = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch NGOs
  useEffect(() => {
    loadNGOs();
  }, []);

  const loadNGOs = async () => {
    const { data } = await supabase
      .from("ngos")
      .select("id, name, city, state, rating, total_reviews, image_url")
      .order("name");

    setNgos(data || []);
    setLoading(false);
  };

  const filteredNGOs = ngos.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase())
  );

  const startPayment = async () => {
    if (!amount || Number(amount) < 10) {
      alert("Enter a valid amount (minimum ₹10)");
      return;
    }

    if (!selectedNGO) {
      alert("Select an NGO first!");
      return;
    }

    // Razorpay Order Creation
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Number(amount) * 100,
      currency: "INR",
      name: selectedNGO.name,
      description: "Direct Donation",

      handler: async function (response: any) {
        alert("🎉 Payment Successful!");

        await supabase.from("donations").insert({
          donor_id: donor.id,
          ngo_id: selectedNGO.id,
          category: "Money",
          amount: Number(amount),
          quantity: null,
          description: `Monetary donation of ₹${amount}`,
          status: "Completed",
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id,
          donation_type: "Drop-off"
        });

        setAmount("");
        setSelectedNGO(null);
      },

      theme: { color: "#2563eb" },
    };

    // @ts-ignore
    const rzp = new Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          <Heart /> Donate Money
        </h1>

        {/* Search NGOs */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search NGO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border pl-10 p-3 rounded-lg"
          />
        </div>

        {/* NGO LIST */}
        {loading ? (
          <p>Loading NGOs...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {filteredNGOs.map((ngo) => (
              <div
                key={ngo.id}
                onClick={() => setSelectedNGO(ngo)}
                className={`p-4 border rounded-xl shadow cursor-pointer transition ${
                  selectedNGO?.id === ngo.id
                    ? "border-blue-600 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={ngo.image_url || "/placeholder.png"}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  <div>
                    <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                      {ngo.name}
                      {ngo.verified && (
                        <CheckCircle className="text-green-600" size={16} />
                      )}
                    </h2>

                    <p className="flex items-center gap-1 text-yellow-600 text-sm">
                      <Star size={16} /> {ngo.rating || 0} ({ngo.total_reviews || 0})
                    </p>

                    <p className="flex items-center gap-1 text-gray-700 text-sm">
                      <MapPin size={14} /> {ngo.city}, {ngo.state}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedNGO && (
          <div className="mb-10 p-6 border rounded-xl bg-blue-50">
            <h3 className="text-xl font-semibold mb-3">Selected NGO</h3>
            <p className="text-blue-700 font-bold text-lg">{selectedNGO.name}</p>

            <input
              type="number"
              placeholder="Enter amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-3 w-full mt-4 rounded-lg"
            />

            <button
              onClick={startPayment}
              className="mt-4 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 w-full"
            >
              Donate ₹{amount || "0"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
