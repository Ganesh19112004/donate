import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import {
  Building2,
  CreditCard,
  Landmark,
  Smartphone,
  Save,
  ShieldCheck,
} from "lucide-react";

export default function NGOBankDetails() {
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
    upi_id: "",
    phone_number: "",
    pan_number: "",
  });

  useEffect(() => {
    loadBankDetails();
  }, []);

  async function loadBankDetails() {
    if (!ngo?.id) return;

    setLoading(true);

    const { data } = await supabase
      .from("ngo_bank_details")
      .select("*")
      .eq("ngo_id", ngo.id)
      .single();

    if (data) {
      setForm({
        account_holder_name:
          data.account_holder_name || "",

        bank_name:
          data.bank_name || "",

        account_number:
          data.account_number || "",

        ifsc_code:
          data.ifsc_code || "",

        branch_name:
          data.branch_name || "",

        upi_id:
          data.upi_id || "",

        phone_number:
          data.phone_number || "",

        pan_number:
          data.pan_number || "",
      });
    }

    setLoading(false);
  }

  async function saveBankDetails() {
    if (
      !form.account_holder_name ||
      !form.bank_name ||
      !form.account_number ||
      !form.ifsc_code
    ) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);

    const payload = {
      ngo_id: ngo.id,

      ...form,

      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("ngo_bank_details")
      .upsert(payload, {
        onConflict: "ngo_id",
      });

    if (error) {
      console.error(error);
      alert("Failed to save bank details");
      setSaving(false);
      return;
    }

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);

    setSaving(false);
  }

  function updateField(
    field: string,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-2xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl mb-8">

          <div className="flex items-center gap-3 mb-3">
            <Landmark size={38} />

            <h1 className="text-4xl font-bold">
              NGO Bank Details
            </h1>
          </div>

          <p className="text-blue-100 text-lg">
            Add your NGO bank account where future real donations will be received.
          </p>
        </div>

        {/* SECURITY NOTICE */}

        <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5 mb-8">

          <div className="flex gap-3">

            <ShieldCheck className="text-yellow-600" />

            <div>
              <h2 className="font-bold text-yellow-700">
                Test Mode Active
              </h2>

              <p className="text-sm text-yellow-700 mt-1">
                Payments are currently stored only in database using Razorpay test mode.
                Real bank transfers will be enabled later.
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="grid md:grid-cols-2 gap-6">

            {/* Account Holder */}

            <div>
              <label className="font-semibold text-gray-700">
                Account Holder Name *
              </label>

              <div className="relative mt-2">

                <Building2
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  value={form.account_holder_name}
                  onChange={(e) =>
                    updateField(
                      "account_holder_name",
                      e.target.value
                    )
                  }
                  placeholder="NGO Trust Name"
                  className="w-full border rounded-xl pl-12 pr-4 py-4"
                />
              </div>
            </div>

            {/* Bank Name */}

            <div>
              <label className="font-semibold text-gray-700">
                Bank Name *
              </label>

              <div className="relative mt-2">

                <Landmark
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  value={form.bank_name}
                  onChange={(e) =>
                    updateField(
                      "bank_name",
                      e.target.value
                    )
                  }
                  placeholder="State Bank of India"
                  className="w-full border rounded-xl pl-12 pr-4 py-4"
                />
              </div>
            </div>

            {/* Account Number */}

            <div>
              <label className="font-semibold text-gray-700">
                Account Number *
              </label>

              <div className="relative mt-2">

                <CreditCard
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  value={form.account_number}
                  onChange={(e) =>
                    updateField(
                      "account_number",
                      e.target.value
                    )
                  }
                  placeholder="1234567890"
                  className="w-full border rounded-xl pl-12 pr-4 py-4"
                />
              </div>
            </div>

            {/* IFSC */}

            <div>
              <label className="font-semibold text-gray-700">
                IFSC Code *
              </label>

              <input
                type="text"
                value={form.ifsc_code}
                onChange={(e) =>
                  updateField(
                    "ifsc_code",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="SBIN0001234"
                className="w-full border rounded-xl px-4 py-4 mt-2 uppercase"
              />
            </div>

            {/* Branch */}

            <div>
              <label className="font-semibold text-gray-700">
                Branch Name
              </label>

              <input
                type="text"
                value={form.branch_name}
                onChange={(e) =>
                  updateField(
                    "branch_name",
                    e.target.value
                  )
                }
                placeholder="Mumbai Main Branch"
                className="w-full border rounded-xl px-4 py-4 mt-2"
              />
            </div>

            {/* UPI */}

            <div>
              <label className="font-semibold text-gray-700">
                UPI ID
              </label>

              <div className="relative mt-2">

                <Smartphone
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  value={form.upi_id}
                  onChange={(e) =>
                    updateField(
                      "upi_id",
                      e.target.value
                    )
                  }
                  placeholder="ngo@upi"
                  className="w-full border rounded-xl pl-12 pr-4 py-4"
                />
              </div>
            </div>

            {/* Phone */}

            <div>
              <label className="font-semibold text-gray-700">
                Phone Number
              </label>

              <input
                type="text"
                value={form.phone_number}
                onChange={(e) =>
                  updateField(
                    "phone_number",
                    e.target.value
                  )
                }
                placeholder="+91 9876543210"
                className="w-full border rounded-xl px-4 py-4 mt-2"
              />
            </div>

            {/* PAN */}

            <div>
              <label className="font-semibold text-gray-700">
                PAN Number
              </label>

              <input
                type="text"
                value={form.pan_number}
                onChange={(e) =>
                  updateField(
                    "pan_number",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="ABCDE1234F"
                className="w-full border rounded-xl px-4 py-4 mt-2 uppercase"
              />
            </div>
          </div>

          {/* SAVE BUTTON */}

          <button
            onClick={saveBankDetails}
            disabled={saving}
            className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-xl font-bold transition"
          >
            {saving ? (
              "Saving..."
            ) : (
              <span className="flex justify-center items-center gap-2">
                <Save size={22} />
                Save Bank Details
              </span>
            )}
          </button>

          {/* SUCCESS */}

          {saved && (
            <div className="mt-5 bg-green-100 text-green-700 p-4 rounded-xl text-center font-semibold">
              ✅ Bank details saved successfully
            </div>
          )}
        </div>
      </div>
    </div>
  );
}