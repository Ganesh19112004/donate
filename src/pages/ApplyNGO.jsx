import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ApplyNGO = () => {
  const [formData, setFormData] = useState({
    ngo_name: "",
    email: "",
    password: "",
    registration_number: "",
    pan_number: "",
    aadhar_number: "",
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ===========================
     ✅ VERIFY USING SUPABASE
     =========================== */
  const verifyWithDatabase = async () => {
    const { data, error } = await supabase
      .from("verified_ngos")
      .select("*")
      .eq("registration_number", formData.registration_number.trim())
      .eq("ngo_name", formData.ngo_name.trim())
      .maybeSingle();

    if (error) {
      console.error("Verification error:", error);
      return false;
    }

    return !!data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    /* 1️⃣ Check if already applied */
    const { data: existing } = await supabase
      .from("ngo_applications")
      .select("id")
      .eq("email", formData.email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      alert("You have already applied.");
      setLoading(false);
      return;
    }

    /* 2️⃣ Verify against verified_ngos table */
    const isValid = await verifyWithDatabase();

    if (!isValid) {
      alert("Invalid Registration Number or NGO Name");
      setLoading(false);
      return;
    }

    /* 3️⃣ Upload Photo */
    let photoUrl = "";
    if (photo) {
      const { data, error } = await supabase.storage
        .from("ngo-documents")
        .upload(`photos/${Date.now()}-${photo.name}`, photo);

      if (error) {
        alert("Photo upload failed");
        setLoading(false);
        return;
      }

      photoUrl = data.path;
    }

    /* 4️⃣ Save Application */
    const { error } = await supabase.from("ngo_applications").insert({
      ...formData,
      email: formData.email.trim().toLowerCase(),
      photo_url: photoUrl,
      status: "pending",
    });

    if (error) {
      alert("Submission failed");
    } else {
      alert("Application submitted! Waiting for admin approval.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          Apply for NGO Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="ngo_name"
            placeholder="NGO Name"
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="email"
            type="email"
            placeholder="Official Email"
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="password"
            type="password"
            placeholder="Create Password"
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="registration_number"
            placeholder="Government Registration Number"
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="pan_number"
            placeholder="PAN Number"
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="aadhar_number"
            placeholder="Aadhar Number"
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="file"
            onChange={(e) => setPhoto(e.target.files[0])}
            required
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Verifying..." : "Submit Application"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ApplyNGO;
