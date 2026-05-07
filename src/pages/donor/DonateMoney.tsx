import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import {
  Heart,
  Search,
  MapPin,
  Star,
  CheckCircle,
  IndianRupee,
  Loader2,
  ShieldCheck,
  Sparkles,
  Building2,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = "rzp_test_SlNseXTPU2ceUA";

export default function DonateMoney() {
  const [ngos, setNgos] =
    useState<any[]>([]);

  const [filteredNGOs, setFilteredNGOs] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [selectedNGO, setSelectedNGO] =
    useState<any>(null);

  const [amount, setAmount] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const donor = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  /* =========================================================
     LOAD NGOs
  ========================================================= */

  useEffect(() => {
    loadNGOs();
  }, []);

  /* =========================================================
     FILTER NGOs
  ========================================================= */

  useEffect(() => {
    let filtered = ngos.filter(
      (ngo) =>
        ngo.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        ngo.city
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

    if (
      categoryFilter !== "all"
    ) {
      filtered = filtered.filter(
        (ngo) =>
          ngo.category ===
          categoryFilter
      );
    }

    setFilteredNGOs(filtered);
  }, [
    search,
    ngos,
    categoryFilter,
  ]);

  /* =========================================================
     LOAD NGOs
  ========================================================= */

  async function loadNGOs() {
    setLoading(true);

    const { data, error } =
      await supabase
        .from("ngos")
        .select("*")
        .eq("verified", true)
        .order("rating", {
          ascending: false,
        });

    if (error) {
      console.error(error);

      alert(
        "Failed to load NGOs"
      );
    }

    setNgos(data || []);

    setFilteredNGOs(data || []);

    setLoading(false);
  }

  /* =========================================================
     PAYMENT
  ========================================================= */

  async function startPayment() {
    if (!selectedNGO) {
      alert(
        "Please select NGO"
      );

      return;
    }

    if (
      !amount ||
      Number(amount) < 10
    ) {
      alert(
        "Minimum donation is ₹10"
      );

      return;
    }

    setProcessing(true);

    try {
      const options = {
        key: RAZORPAY_KEY_ID,

        amount:
          Number(amount) * 100,

        currency: "INR",

        name: selectedNGO.name,

        description:
          "Online NGO Donation",

        image:
          selectedNGO.image_url ||
          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",

        prefill: {
          name:
            donor.name ||
            donor.full_name ||
            "",

          email:
            donor.email || "",

          contact:
            donor.phone || "",
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },

        handler: async function (
          response: any
        ) {
          try {
            const { error } =
              await supabase
                .from(
                  "donations"
                )
                .insert({
                  donor_id:
                    donor.id,

                  ngo_id:
                    selectedNGO.id,

                  category:
                    "Money",

                  amount:
                    Number(
                      amount
                    ),

                  quantity:
                    null,

                  pickup_address:
                    "Online Donation",

                  description: `Online donation of ₹${amount} to ${selectedNGO.name}`,

                  status:
                    "Completed",

                  payment_id:
                    response.razorpay_payment_id,

                  donation_type:
                    "Drop-off",
                });

            if (error) {
              console.error(
                error
              );

              alert(
                "Database error"
              );

              return;
            }

            alert(
              `🎉 Successfully donated ₹${amount} to ${selectedNGO.name}`
            );

            setAmount("");

            setSelectedNGO(
              null
            );
          } catch (err) {
            console.error(
              err
            );

            alert(
              "Something went wrong"
            );
          }

          setProcessing(false);
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.open();
    } catch (e) {
      console.error(e);

      alert("Payment failed");

      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HERO */}

        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white rounded-[32px] p-8 shadow-2xl mb-8">

          <div className="absolute top-0 right-0 opacity-10">

            <Heart size={250} />
          </div>

          <div className="relative z-10">

            <div className="flex items-center gap-4 mb-4">

              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur">

                <Heart size={40} />
              </div>

              <div>

                <h1 className="text-5xl font-black">

                  Donate Money
                </h1>

                <p className="text-blue-100 mt-2 text-lg">

                  Support verified NGOs securely across India
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">

              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">

                <ShieldCheck
                  className="mb-3"
                  size={34}
                />

                <h3 className="font-bold text-xl">

                  Secure Payments
                </h3>

                <p className="text-blue-100 text-sm mt-1">

                  Razorpay encrypted gateway
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">

                <BadgeCheck
                  className="mb-3"
                  size={34}
                />

                <h3 className="font-bold text-xl">

                  Verified NGOs
                </h3>

                <p className="text-blue-100 text-sm mt-1">

                  Only trusted NGOs listed
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">

                <TrendingUp
                  className="mb-3"
                  size={34}
                />

                <h3 className="font-bold text-xl">

                  Real Impact
                </h3>

                <p className="text-blue-100 text-sm mt-1">

                  Help communities directly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER */}

        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border">

          <div className="grid md:grid-cols-4 gap-4">

            {/* SEARCH */}

            <div className="relative md:col-span-3">

              <Search
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Search NGO by name or city..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="w-full border rounded-2xl pl-12 pr-4 py-4 text-lg focus:ring-4 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* CATEGORY */}

            <select
              value={
                categoryFilter
              }
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className="border rounded-2xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-100 outline-none"
            >

              <option value="all">

                All Categories
              </option>

              <option value="Food">

                Food
              </option>

              <option value="Education">

                Education
              </option>

              <option value="Healthcare">

                Healthcare
              </option>

              <option value="Animals">

                Animals
              </option>

              <option value="Women">

                Women Support
              </option>
            </select>
          </div>
        </div>

        {/* NGO LIST */}

        {loading ? (
          <div className="flex justify-center py-24">

            <Loader2
              className="animate-spin text-blue-600"
              size={60}
            />
          </div>
        ) : filteredNGOs.length ===
          0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl">

            <Building2
              className="mx-auto text-gray-400 mb-4"
              size={70}
            />

            <p className="text-2xl font-bold text-gray-500">

              No NGOs Found
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">

            {filteredNGOs.map(
              (ngo) => (
                <div
                  key={ngo.id}
                  onClick={() =>
                    setSelectedNGO(
                      ngo
                    )
                  }
                  className={`group bg-white rounded-[30px] overflow-hidden shadow-xl border-2 cursor-pointer transition duration-300 hover:scale-[1.02]

                  ${
                    selectedNGO?.id ===
                    ngo.id
                      ? "border-blue-600 ring-4 ring-blue-100"
                      : "border-transparent"
                  }
                  `}
                >

                  {/* IMAGE */}

                  <div className="relative overflow-hidden">

                    <img
                      src={
                        ngo.image_url ||
                        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
                      }
                      className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                    />

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow">

                      <Star
                        className="text-yellow-500 fill-yellow-500"
                        size={16}
                      />

                      <span className="font-bold text-sm">

                        {ngo.rating ||
                          0}
                      </span>
                    </div>

                    {ngo.verified && (
                      <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">

                        <CheckCircle
                          size={14}
                        />

                        Verified
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="p-6">

                    <div className="flex items-center gap-2 mb-2">

                      <h2 className="text-2xl font-black text-blue-700">

                        {ngo.name}
                      </h2>
                    </div>

                    <p className="flex items-center gap-2 text-gray-600 mb-3">

                      <MapPin
                        size={16}
                      />

                      {ngo.city},{" "}
                      {ngo.state}
                    </p>

                    <p className="text-gray-600 line-clamp-3 min-h-[72px]">

                      {ngo.description ||
                        "Helping communities and people in need across India."}
                    </p>

                    {/* STATS */}

                    <div className="grid grid-cols-2 gap-3 mt-5">

                      <div className="bg-blue-50 rounded-2xl p-3">

                        <p className="text-xs text-gray-500">

                          Reviews
                        </p>

                        <p className="font-bold text-blue-700">

                          {ngo.total_reviews ||
                            0}
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-2xl p-3">

                        <p className="text-xs text-gray-500">

                          Rating
                        </p>

                        <p className="font-bold text-green-700">

                          ⭐{" "}
                          {ngo.rating ||
                            0}
                        </p>
                      </div>
                    </div>

                    {/* BUTTON */}

                    <button
                      className={`mt-6 w-full py-4 rounded-2xl font-bold text-lg transition

                      ${
                        selectedNGO?.id ===
                        ngo.id
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 hover:bg-blue-50"
                      }
                      `}
                    >

                      {selectedNGO?.id ===
                      ngo.id ? (
                        <span className="flex justify-center items-center gap-2">

                          <Sparkles
                            size={20}
                          />

                          Selected NGO
                        </span>
                      ) : (
                        "Select NGO"
                      )}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* DONATION BOX */}

        {selectedNGO && (
          <div className="mt-10 bg-white rounded-[32px] shadow-2xl p-8 border relative overflow-hidden">

            <div className="absolute top-0 right-0 opacity-5">

              <IndianRupee
                size={300}
              />
            </div>

            <div className="relative z-10">

              <div className="flex items-center gap-4 mb-6">

                <img
                  src={
                    selectedNGO.image_url ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-blue-100"
                />

                <div>

                  <h2 className="text-4xl font-black text-blue-700">

                    Donate to{" "}
                    {
                      selectedNGO.name
                    }
                  </h2>

                  <p className="text-gray-600 mt-1">

                    Your contribution creates real impact ❤️
                  </p>
                </div>
              </div>

              {/* AMOUNT */}

              <div className="relative mb-6">

                <IndianRupee
                  className="absolute left-5 top-5 text-gray-500"
                  size={24}
                />

                <input
                  type="number"
                  placeholder="Enter donation amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  className="w-full border-2 rounded-2xl pl-14 pr-4 py-5 text-2xl font-bold focus:ring-4 focus:ring-blue-100 outline-none"
                />
              </div>

              {/* QUICK BUTTONS */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

                {[
                  100,
                  500,
                  1000,
                  5000,
                ].map((amt) => (
                  <button
                    key={amt}
                    onClick={() =>
                      setAmount(
                        String(amt)
                      )
                    }
                    className={`py-4 rounded-2xl font-bold text-lg transition

                    ${
                      amount ===
                      String(amt)
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                    }
                    `}
                  >

                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* PAY BUTTON */}

              <button
                onClick={
                  startPayment
                }
                disabled={
                  processing
                }
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-5 rounded-2xl text-2xl font-black transition shadow-xl"
              >

                {processing ? (
                  <span className="flex justify-center items-center gap-3">

                    <Loader2 className="animate-spin" />

                    Processing Payment...
                  </span>
                ) : (
                  <span className="flex justify-center items-center gap-2">

                    <Heart
                      className="fill-white"
                      size={24}
                    />

                    Donate ₹
                    {amount || 0}
                  </span>
                )}
              </button>

              <p className="text-center text-gray-500 mt-4 text-sm">

                🔒 100% secure payment powered by Razorpay
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}