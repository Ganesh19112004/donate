import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import {
  CheckCircle,
  XCircle,
  Package,
  Loader2,
  Truck,
  Phone,
  MapPin,
  User,
} from "lucide-react";

const ManageDonations = () => {
  const [donations, setDonations] =
    useState<any[]>([]);

  const [volunteers, setVolunteers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [assigning, setAssigning] =
    useState<string | null>(null);

  const [feedback, setFeedback] =
    useState<{
      [key: string]: string;
    }>({});

  const ngo = JSON.parse(
    localStorage.getItem("user") ||
      "{}"
  );

  /* =====================================================
                      FETCH DONATIONS
     ===================================================== */

  useEffect(() => {
    if (!ngo?.id) return;

    fetchDonations();

    fetchVolunteers();
  }, []);

  const fetchDonations =
    async () => {
      setLoading(true);

      const { data, error } =
        await supabase
          .from("donations")
          .select(`
          *,
          donors (
            name,
            email,
            phone,
            address,
            image_url
          )
        `)

          .eq("ngo_id", ngo.id)

          .neq(
            "status",
            "Cancelled"
          )

          .order("created_at", {
            ascending: false,
          });

      if (!error) {
        setDonations(data || []);
      }

      setLoading(false);
    };

  /* =====================================================
                    FETCH VOLUNTEERS
     ===================================================== */

  const fetchVolunteers =
    async () => {
      let {
        data: volunteers,
      } = await supabase
        .from("volunteers")
        .select(
          "id, name, email"
        )

        .eq("ngo_id", ngo.id);

      if (
        !volunteers?.length
      ) {
        const {
          data: mapped,
        } = await supabase
          .from(
            "ngo_volunteers"
          )

          .select(`
          volunteers (
            id,
            name,
            email
          )
        `)

          .eq("ngo_id", ngo.id);

        volunteers =
          mapped?.map(
            (m: any) =>
              m.volunteers
          ) || [];
      }

      setVolunteers(
        volunteers || []
      );
    };

  /* =====================================================
                      ACCEPT
     ===================================================== */

  const handleAccept =
    async (id: string) => {
      await supabase
        .from("donations")

        .update({
          status: "Accepted",

          updated_at:
            new Date(),
        })

        .eq("id", id);

      await supabase
        .from(
          "donation_events"
        )

        .insert({
          donation_id: id,

          event:
            "Donation Accepted",

          created_by: ngo.id,
        });

      alert(
        "✅ Donation accepted!"
      );

      fetchDonations();
    };

  /* =====================================================
                      REJECT
     ===================================================== */

  const handleReject =
    async (id: string) => {
      await supabase
        .from("donations")

        .update({
          status: "Cancelled",

          updated_at:
            new Date(),
        })

        .eq("id", id);

      await supabase
        .from(
          "donation_events"
        )

        .insert({
          donation_id: id,

          event:
            "Donation Rejected",

          created_by: ngo.id,
        });

      alert(
        "❌ Donation rejected!"
      );

      fetchDonations();
    };

  /* =====================================================
                    ASSIGN VOLUNTEER
     ===================================================== */

  const handleAssignVolunteer =
    async (
      donationId: string,
      volunteerId: string
    ) => {
      if (!volunteerId)
        return;

      setAssigning(
        donationId
      );

      const {
        data: existing,
      } = await supabase
        .from(
          "volunteer_assignments"
        )

        .select(
          "id, status"
        )

        .eq(
          "donation_id",
          donationId
        )

        .maybeSingle();

      if (
        existing &&
        existing.status !==
          "Cancelled"
      ) {
        setAssigning(null);

        return alert(
          "Volunteer already assigned."
        );
      }

      if (
        existing &&
        existing.status ===
          "Cancelled"
      ) {
        await supabase
          .from(
            "volunteer_assignments"
          )

          .update({
            volunteer_id:
              volunteerId,

            status:
              "Assigned",

            updated_at:
              new Date(),
          })

          .eq(
            "id",
            existing.id
          );
      } else {
        await supabase
          .from(
            "volunteer_assignments"
          )

          .insert({
            donation_id:
              donationId,

            volunteer_id:
              volunteerId,

            ngo_id: ngo.id,

            status:
              "Assigned",
          });
      }

      await supabase
        .from("donations")

        .update({
          assigned_volunteer:
            volunteerId,

          status:
            "Assigned",

          assigned_at:
            new Date(),

          updated_at:
            new Date(),
        })

        .eq(
          "id",
          donationId
        );

      await supabase
        .from(
          "donation_events"
        )

        .insert({
          donation_id:
            donationId,

          event:
            "Volunteer Assigned",

          created_by: ngo.id,
        });

      setAssigning(null);

      alert(
        "🚚 Volunteer assigned!"
      );

      fetchDonations();
    };

  /* =====================================================
                      COMPLETE
     ===================================================== */

  const handleComplete =
    async (id: string) => {
      await supabase
        .from("donations")

        .update({
          status:
            "Completed",

          delivered_at:
            new Date(),

          updated_at:
            new Date(),

          ngo_feedback:
            feedback[id] ||
            null,
        })

        .eq("id", id);

      await supabase
        .from(
          "donation_events"
        )

        .insert({
          donation_id: id,

          event:
            "Donation Completed",

          note:
            feedback[id] ||
            null,

          created_by: ngo.id,
        });

      alert(
        "🎉 Donation completed!"
      );

      fetchDonations();
    };

  /* =====================================================
                          UI
     ===================================================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">
          📦 Manage Item Donations
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : donations.length ===
          0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
            No donations available.
          </div>
        ) : (
          <div className="grid gap-6">

            {donations.map(
              (d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border"
                >

                  <div className="grid md:grid-cols-3">

                    {/* IMAGE */}

                    <div className="bg-gray-100 flex items-center justify-center p-4">

                      {d.image_url ? (
                        <img
                          src={
                            d.image_url
                          }
                          alt="Donation"
                          className="w-full h-72 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="h-72 w-full rounded-xl bg-gray-200 flex items-center justify-center">
                          <Package
                            size={
                              40
                            }
                            className="text-gray-400"
                          />
                        </div>
                      )}

                    </div>

                    {/* DETAILS */}

                    <div className="md:col-span-2 p-6 space-y-4">

                      {/* TOP */}

                      <div className="flex justify-between items-start">

                        <div>
                          <h2 className="text-2xl font-bold text-blue-700">
                            {
                              d.item_details
                            }
                          </h2>

                          <p className="text-gray-500">
                            {
                              d.category
                            }
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            d.status ===
                            "Pending"
                              ? "bg-yellow-100 text-yellow-700"

                              : d.status ===
                                "Accepted"
                              ? "bg-blue-100 text-blue-700"

                              : d.status ===
                                "Assigned"
                              ? "bg-purple-100 text-purple-700"

                              : d.status ===
                                "Completed"
                              ? "bg-green-100 text-green-700"

                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {
                            d.status
                          }
                        </span>

                      </div>

                      {/* DONOR */}

                      <div className="bg-blue-50 rounded-xl p-4 space-y-2">

                        <h3 className="font-bold flex items-center gap-2">
                          <User
                            size={
                              18
                            }
                          />
                          Donor Details
                        </h3>

                        <p>
                          <strong>
                            Name:
                          </strong>{" "}
                          {
                            d.donors
                              ?.name
                          }
                        </p>

                        <p>
                          <strong>
                            Email:
                          </strong>{" "}
                          {
                            d.donors
                              ?.email
                          }
                        </p>

                        <p className="flex items-center gap-2">
                          <Phone
                            size={
                              16
                            }
                          />

                          {
                            d.donor_phone ||
                            "N/A"
                          }
                        </p>

                        <p className="flex items-center gap-2">
                          <MapPin
                            size={
                              16
                            }
                          />

                          {
                            d.donors
                              ?.address ||
                            "No address"
                          }
                        </p>

                      </div>

                      {/* ITEM DETAILS */}

                      <div className="grid md:grid-cols-2 gap-4">

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p>
                            <strong>
                              Quantity:
                            </strong>{" "}
                            {
                              d.quantity
                            }
                          </p>

                          <p>
                            <strong>
                              Condition:
                            </strong>{" "}
                            {
                              d.item_condition ||
                              "N/A"
                            }
                          </p>

                          <p>
                            <strong>
                              Brand:
                            </strong>{" "}
                            {d.brand ||
                              "N/A"}
                          </p>

                          <p>
                            <strong>
                              Weight:
                            </strong>{" "}
                            {d.weight ||
                              "N/A"}
                          </p>

                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p>
                            <strong>
                              Suitable For:
                            </strong>{" "}
                            {
                              d.age_group ||
                              "Everyone"
                            }
                          </p>

                          <p>
                            <strong>
                              Pickup:
                            </strong>{" "}
                            {
                              d.donation_type
                            }
                          </p>

                          <p>
                            <strong>
                              Status:
                            </strong>{" "}
                            {
                              d.status
                            }
                          </p>

                        </div>

                      </div>

                      {/* DYNAMIC FIELDS */}

                      {d.dynamic_fields &&
                        Object.keys(
                          d.dynamic_fields
                        )
                          .length >
                          0 && (
                          <div className="bg-indigo-50 p-4 rounded-xl">

                            <h3 className="font-bold mb-3">
                              Dynamic Item Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-2 text-sm">

                              {Object.entries(
                                d.dynamic_fields
                              ).map(
                                (
                                  [
                                    key,
                                    value,
                                  ]: any
                                ) => (
                                  <div
                                    key={
                                      key
                                    }
                                  >
                                    <strong>
                                      {key.replaceAll(
                                        "_",
                                        " "
                                      )}
                                      :
                                    </strong>{" "}
                                    {String(
                                      value
                                    )}
                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                      {/* DESCRIPTION */}

                      {d.description && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-bold mb-2">
                            Description
                          </h3>

                          <p className="text-gray-700">
                            {
                              d.description
                            }
                          </p>
                        </div>
                      )}

                      {/* INSTRUCTIONS */}

                      {d.instructions && (
                        <div className="bg-yellow-50 rounded-xl p-4">
                          <h3 className="font-bold mb-2">
                            Pickup Instructions
                          </h3>

                          <p>
                            {
                              d.instructions
                            }
                          </p>
                        </div>
                      )}

                      {/* ACTIONS */}

                      <div className="pt-4 border-t">

                        {d.status ===
                          "Pending" && (
                          <div className="flex gap-3">

                            <button
                              onClick={() =>
                                handleAccept(
                                  d.id
                                )
                              }
                              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                              <CheckCircle
                                size={
                                  18
                                }
                              />
                              Accept
                            </button>

                            <button
                              onClick={() =>
                                handleReject(
                                  d.id
                                )
                              }
                              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                              <XCircle
                                size={
                                  18
                                }
                              />
                              Reject
                            </button>

                          </div>
                        )}

                        {d.status ===
                          "Accepted" && (
                          <div className="space-y-3">

                            <select
                              onChange={(
                                e
                              ) =>
                                handleAssignVolunteer(
                                  d.id,
                                  e.target
                                    .value
                                )
                              }

                              disabled={
                                assigning ===
                                d.id
                              }

                              className="w-full border p-3 rounded-lg"
                            >
                              <option value="">
                                Assign Volunteer
                              </option>

                              {volunteers.map(
                                (
                                  v
                                ) => (
                                  <option
                                    key={
                                      v.id
                                    }

                                    value={
                                      v.id
                                    }
                                  >
                                    {
                                      v.name
                                    }
                                  </option>
                                )
                              )}

                            </select>

                          </div>
                        )}

                        {d.status ===
                          "Assigned" && (
                          <div className="space-y-3">

                            <textarea
                              placeholder="NGO feedback..."
                              className="w-full border p-3 rounded-lg"
                              value={
                                feedback[
                                  d.id
                                ] || ""
                              }

                              onChange={(
                                e
                              ) =>
                                setFeedback(
                                  {
                                    ...feedback,

                                    [d.id]:
                                      e
                                        .target
                                        .value,
                                  }
                                )
                              }
                            />

                            <button
                              onClick={() =>
                                handleComplete(
                                  d.id
                                )
                              }

                              className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                            >
                              <Truck
                                size={
                                  18
                                }
                              />
                              Mark Completed
                            </button>

                          </div>
                        )}

                        {d.status ===
                          "Completed" && (
                          <div className="text-green-700 font-semibold flex items-center gap-2">
                            <CheckCircle
                              size={
                                18
                              }
                            />
                            Donation Completed
                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ManageDonations;