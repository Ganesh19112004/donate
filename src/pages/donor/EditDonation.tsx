import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

import {
  Loader2,
  ArrowLeft,
  Save,
  Package,
} from "lucide-react";

const EditDonation = () => {
  const { id } =
    useParams<{ id: string }>();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [donation, setDonation] =
    useState<any>(null);

  /* ---------------- FORM ---------------- */

  const [form, setForm] = useState({
    category: "Books",

    quantity: "",

    description: "",

    donor_phone: "",

    instructions: "",

    item_condition: "",

    item_details: "",

    brand: "",

    age_group: "",

    weight: "",

    donation_type: "Pickup",
  });

  /* ------------ DYNAMIC FIELDS ------------ */

  const [dynamicFields, setDynamicFields] =
    useState<any>({
      size: "",

      gender: "",

      subject: "",

      language: "",

      class_level: "",

      material: "",

      dimensions: "",

      working_condition: "",

      warranty: "",

      expiry_date: "",

      sterilized: "",

      toy_age: "",

      season: "",
    });

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    if (!id) return;

    const fetchDonation =
      async () => {
        setLoading(true);

        const { data, error } =
          await supabase
            .from("donations")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
          alert(
            "Failed to load donation"
          );

          navigate(
            "/donor/dashboard"
          );

          return;
        }

        setDonation(data);

        setForm({
          category:
            data.category || "Books",

          quantity:
            data.quantity || "",

          description:
            data.description || "",

          donor_phone:
            data.donor_phone || "",

          instructions:
            data.instructions || "",

          item_condition:
            data.item_condition || "",

          item_details:
            data.item_details || "",

          brand:
            data.brand || "",

          age_group:
            data.age_group || "",

          weight:
            data.weight || "",

          donation_type:
            data.donation_type ||
            "Pickup",
        });

        setDynamicFields(
          data.dynamic_fields || {}
        );

        setLoading(false);
      };

    fetchDonation();
  }, [id, navigate]);

  /* ---------------- SAVE ---------------- */

  const handleSave = async (
    e: any
  ) => {
    e.preventDefault();

    if (!donation) return;

    if (
      donation.status !==
      "Pending"
    ) {
      alert(
        "Cannot edit after NGO accepts donation."
      );

      return;
    }

    setSaving(true);

    try {
      const { error } =
        await supabase
          .from("donations")
          .update({
            category:
              form.category,

            quantity: Number(
              form.quantity
            ),

            description:
              form.description,

            donor_phone:
              form.donor_phone,

            instructions:
              form.instructions,

            item_condition:
              form.item_condition,

            item_details:
              form.item_details,

            brand: form.brand,

            age_group:
              form.age_group,

            weight:
              form.weight,

            donation_type:
              form.donation_type,

            dynamic_fields:
              dynamicFields,

            updated_at:
              new Date().toISOString(),
          })

          .eq("id", donation.id);

      if (error) throw error;

      /* EVENT LOG */

      await supabase
        .from("donation_events")
        .insert({
          donation_id:
            donation.id,

          event:
            "Donation Edited",

          note:
            "Donor updated donation details",
        });

      alert(
        "✅ Donation updated successfully!"
      );

      navigate(
        `/donor/details/${donation.id}`
      );
    } catch (err: any) {
      alert(
        err.message ||
          "Failed to save"
      );
    }

    setSaving(false);
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="p-10">
        Donation not found
      </div>
    );
  }

  /* ===================================================
                           UI
     =================================================== */

  return (
    <div className="min-h-screen bg-blue-50 p-6">

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="flex items-center gap-2 text-blue-600"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <h1 className="text-2xl font-bold text-blue-700">
            Edit Donation
          </h1>

        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6"
        >

          {/* CATEGORY */}

          <div>
            <label className="font-semibold flex items-center gap-2">
              <Package size={18} />
              Donation Category
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              {[
                "Books",
                "Clothes",
                "School Supplies",
                "Electronics",
                "Mobiles",
                "Laptops",
                "Furniture",
                "Medical Equipment",
                "Wheelchairs",
                "Blankets",
                "Toys",
                "Sports Equipment",
                "Kitchen Items",
                "Baby Care",
                "Hygiene Products",
                "Other",
              ].map((cat) => (
                <option key={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ITEM DETAILS */}

          <div>
            <label className="font-semibold">
              Item Details
            </label>

            <input
              type="text"
              value={
                form.item_details
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  item_details:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
              placeholder="Example: Winter Jackets / Dell Laptop / School Books"
            />
          </div>

          {/* DYNAMIC CATEGORY FIELDS */}

          {form.category ===
            "Books" && (
            <div className="grid grid-cols-2 gap-4">

              <input
                placeholder="Subject"
                value={
                  dynamicFields.subject ||
                  ""
                }
                onChange={(e) =>
                  setDynamicFields({
                    ...dynamicFields,
                    subject:
                      e.target.value,
                  })
                }
                className="p-3 border rounded-lg"
              />

              <input
                placeholder="Class Level"
                value={
                  dynamicFields.class_level ||
                  ""
                }
                onChange={(e) =>
                  setDynamicFields({
                    ...dynamicFields,
                    class_level:
                      e.target.value,
                  })
                }
                className="p-3 border rounded-lg"
              />

            </div>
          )}

          {form.category ===
            "Clothes" && (
            <div className="grid grid-cols-2 gap-4">

              <input
                placeholder="Size"
                value={
                  dynamicFields.size ||
                  ""
                }
                onChange={(e) =>
                  setDynamicFields({
                    ...dynamicFields,
                    size:
                      e.target.value,
                  })
                }
                className="p-3 border rounded-lg"
              />

              <input
                placeholder="Gender"
                value={
                  dynamicFields.gender ||
                  ""
                }
                onChange={(e) =>
                  setDynamicFields({
                    ...dynamicFields,
                    gender:
                      e.target.value,
                  })
                }
                className="p-3 border rounded-lg"
              />

            </div>
          )}

          {[
            "Electronics",
            "Mobiles",
            "Laptops",
          ].includes(
            form.category
          ) && (
            <div className="grid grid-cols-2 gap-4">

              <input
                placeholder="Working Condition"
                value={
                  dynamicFields.working_condition ||
                  ""
                }
                onChange={(e) =>
                  setDynamicFields({
                    ...dynamicFields,
                    working_condition:
                      e.target.value,
                  })
                }
                className="p-3 border rounded-lg"
              />

              <input
                placeholder="Warranty"
                value={
                  dynamicFields.warranty ||
                  ""
                }
                onChange={(e) =>
                  setDynamicFields({
                    ...dynamicFields,
                    warranty:
                      e.target.value,
                  })
                }
                className="p-3 border rounded-lg"
              />

            </div>
          )}

          {/* CONDITION */}

          <div>
            <label className="font-semibold">
              Item Condition
            </label>

            <select
              value={
                form.item_condition
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  item_condition:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option value="">
                Select Condition
              </option>

              <option>
                Brand New
              </option>

              <option>
                Like New
              </option>

              <option>
                Good
              </option>

              <option>
                Used
              </option>
            </select>
          </div>

          {/* BRAND */}

          <div>
            <label className="font-semibold">
              Brand / Company
            </label>

            <input
              type="text"
              value={form.brand}
              onChange={(e) =>
                setForm({
                  ...form,
                  brand:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* AGE GROUP */}

          <div>
            <label className="font-semibold">
              Suitable For
            </label>

            <select
              value={
                form.age_group
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  age_group:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option>
                Children
              </option>

              <option>
                Teenagers
              </option>

              <option>
                Adults
              </option>

              <option>
                Senior Citizens
              </option>

              <option>
                Everyone
              </option>
            </select>
          </div>

          {/* QUANTITY */}

          <div>
            <label className="font-semibold">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={
                form.quantity
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* WEIGHT */}

          <div>
            <label className="font-semibold">
              Estimated Weight
            </label>

            <input
              type="text"
              value={form.weight}
              onChange={(e) =>
                setForm({
                  ...form,
                  weight:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* PICKUP */}

          <div>
            <label className="font-semibold">
              Pickup Preference
            </label>

            <select
              value={
                form.donation_type
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  donation_type:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option>
                Pickup
              </option>

              <option>
                Drop-off
              </option>

              <option>
                Either
              </option>
            </select>
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="font-semibold">
              Description
            </label>

            <textarea
              value={
                form.description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* INSTRUCTIONS */}

          <div>
            <label className="font-semibold">
              Pickup Instructions
            </label>

            <textarea
              value={
                form.instructions
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  instructions:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* PHONE */}

          <div>
            <label className="font-semibold">
              Donor Phone
            </label>

            <input
              value={
                form.donor_phone
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  donor_phone:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* SAVE */}

          <div className="flex gap-4">

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="border px-6 py-3 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default EditDonation;