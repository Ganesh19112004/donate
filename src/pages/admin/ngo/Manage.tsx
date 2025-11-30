// src/pages/admin/ngo/Manage.tsx
import { useEffect, useState, Fragment } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail,
  Star,
  Users,
  Gift,
  Layers,
  Loader2,
  Settings,
  CheckCircle,
  XCircle,
  KeyRound,
  Trash2,
  BarChart3,
  Eye,
  Search,
  MessageSquare,
  Image,
} from "lucide-react";

/**
 * AdminNGOManager (Advanced)
 * Full-featured management view for an NGO:
 * - Overview + analytics
 * - Edit details
 * - Account controls (verify / reset / disable / delete)
 * - Donations table (pagination, search, status update)
 * - Volunteers list
 * - Campaigns list
 * - Gallery, Reviews, Followers, Posts tabs
 *
 * NOTE: adapt column names if your DB differs slightly.
 */

export default function AdminNGOManager() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // NGO + impact
  const [ngo, setNgo] = useState<any>(null);
  const [impact, setImpact] = useState<any>({});

  // page UI
  const [activeTab, setActiveTab] = useState<
    "overview" | "donations" | "volunteers" | "campaigns" | "gallery" | "reviews" | "followers" | "posts" | "messages"
  >("overview");

  // edit form
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    image_url: "",
    description: "",
  });

  /* -------------------- LISTS & UI STATES -------------------- */
  // donations
  const [donations, setDonations] = useState<any[]>([]);
  const [donationsPage, setDonationsPage] = useState(1);
  const [donationsPerPage] = useState(10);
  const [donationsTotal, setDonationsTotal] = useState(0);
  const [donationSearch, setDonationSearch] = useState("");
  const [donationLoading, setDonationLoading] = useState(false);

  // volunteers
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);

  // campaigns
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  // gallery / reviews / followers / posts / messages
  const [gallery, setGallery] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // modal state
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);

  /* -------------------- LOAD NGO + IMPACT -------------------- */
  useEffect(() => {
    if (!id) return;
    const loadAll = async () => {
      setLoading(true);
      try {
        // 1) NGO profile
        const { data: ngoData, error: ngoErr } = await supabase
          .from("ngos")
          .select("*")
          .eq("id", id)
          .single();

        if (ngoErr) throw ngoErr;
        setNgo(ngoData);
        setForm({
          name: ngoData.name || "",
          email: ngoData.email || "",
          phone: ngoData.phone || "",
          address: ngoData.address || "",
          city: ngoData.city || "",
          state: ngoData.state || "",
          country: ngoData.country || "",
          website: ngoData.website || "",
          facebook: ngoData.facebook || "",
          instagram: ngoData.instagram || "",
          twitter: ngoData.twitter || "",
          image_url: ngoData.image_url || "",
          description: ngoData.description || "",
        });

        // 2) impact (primary analytics)
        /* ---------------- REAL NGO IMPACT STATS ---------------- */
let totalDonations = 0;
let totalDonors = 0;
let totalVolunteers = 0;
let activeCampaigns = 0;

// Donations count
const { count: donationCount } = await supabase
  .from("donations")
  .select("id", { count: "exact", head: true })
  .eq("ngo_id", id);

totalDonations = donationCount || 0;

// Unique donors
const { count: donorCount } = await supabase
  .from("donations")
  .select("donor_id", { count: "exact", head: true })
  .eq("ngo_id", id);

totalDonors = donorCount || 0;

// Volunteers count
const { count: volCount } = await supabase
  .from("ngo_volunteers")
  .select("volunteer_id", { count: "exact", head: true })
  .eq("ngo_id", id);

totalVolunteers = volCount || 0;

// Campaigns count
const { count: campCount } = await supabase
  .from("ngo_campaigns")
  .select("id", { count: "exact", head: true })
  .eq("ngo_id", id);

activeCampaigns = campCount || 0;

// Set unified impact summary
setImpact({
  total_donations: totalDonations,
  total_donors: totalDonors,
  total_volunteers: totalVolunteers,
  active_campaigns: activeCampaigns,
});

        // 3) initial lists (small loads)
        fetchDonations(1, donationSearch);
        fetchVolunteers();
        fetchCampaigns();
        fetchGallery();
        fetchReviews();
        fetchFollowers();
        fetchPosts();
        fetchMessages();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Load NGO error", e);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* -------------------- FETCH FUNCTIONS -------------------- */
  // Donations: paginated + searchable
  const fetchDonations = async (page = 1, search = "") => {
    if (!id) return;
    setDonationLoading(true);
    try {
      const offset = (page - 1) * donationsPerPage;

      // Use RLS safe select: select all columns
      let query = supabase
        .from("donations")
        .select("id, donor_id, amount, category, quantity, status, created_at, image_url, description", {
          count: "exact",
        })
        .eq("ngo_id", id)
        .order("created_at", { ascending: false })
        .range(offset, offset + donationsPerPage - 1);

      if (search && search.trim().length > 0) {
        // simple search on category / description
        query = query.ilike("category", `%${search}%`);
      }

      const { data, count } = await query;

      setDonations(data || []);
      setDonationsTotal(count || 0);
      setDonationsPage(page);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("fetchDonations", e);
    } finally {
      setDonationLoading(false);
    }
  };

  // Volunteers (list recent volunteers for this NGO)
  const fetchVolunteers = async () => {
    if (!id) return;
    setVolunteersLoading(true);
    try {
      // prefer table ngo_volunteers join volunteers
      const { data } = await supabase
        .from("ngo_volunteers")
        .select("volunteer_id, joined_at, volunteers(name, email, phone, image_url)")
        .eq("ngo_id", id)
        .order("joined_at", { ascending: false })
        .limit(200);

      // flatten
      const list = (data || []).map((r: any) => ({
        id: r.volunteer_id,
        joined_at: r.joined_at,
        ...(r.volunteers || {}),
      }));

      setVolunteers(list);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("fetchVolunteers", e);
    } finally {
      setVolunteersLoading(false);
    }
  };

  // Campaigns
  const fetchCampaigns = async () => {
    if (!id) return;
    setCampaignsLoading(true);
    try {
      const { data } = await supabase
        .from("ngo_campaigns")
        .select("*")
        .eq("ngo_id", id)
        .order("created_at", { ascending: false });

      setCampaigns(data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("fetchCampaigns", e);
    } finally {
      setCampaignsLoading(false);
    }
  };

  // Gallery
  const fetchGallery = async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from("ngo_gallery")
        .select("*")
        .eq("ngo_id", id)
        .order("created_at", { ascending: false })
        .limit(100);
      setGallery(data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("fetchGallery", e);
    }
  };

  // Reviews
  const fetchReviews = async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from("ngo_reviews")
        .select("id, donor_id, rating, review, created_at, donors(name, email)")
        .eq("ngo_id", id)
        .order("created_at", { ascending: false });
      // flatten donors
      const list = (data || []).map((r: any) => ({ ...r, donor: r.donors || null }));
      setReviews(list);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("fetchReviews", e);
    }
  };

  // Followers
  const fetchFollowers = async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from("ngo_followers")
        .select("id, donor_id, created_at, donors(name, email)")
        .eq("ngo_id", id)
        .order("created_at", { ascending: false });
      const list = (data || []).map((r: any) => ({ ...r, donor: r.donors || null }));
      setFollowers(list);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("fetchFollowers", e);
    }
  };

  // Posts
  const fetchPosts = async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from("ngo_posts")
        .select("*")
        .eq("ngo_id", id)
        .order("created_at", { ascending: false });

      setPosts(data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("fetchPosts", e);
    }
  };

  // Messages (admin can view messages sent to NGO)
  const fetchMessages = async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`receiver_id.eq.${id},sender_id.eq.${id}`)
        .order("created_at", { ascending: false })
        .limit(200);
      setMessages(data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("fetchMessages", e);
    }
  };

  /* -------------------- ACTIONS -------------------- */
  // Save NGO edits
  const saveChanges = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("ngos").update(form).eq("id", id);
      if (error) throw error;
      // refresh profile
      const { data: ngoData } = await supabase.from("ngos").select("*").eq("id", id).single();
      setNgo(ngoData);
      alert("NGO updated successfully");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("saveChanges", e);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // verify/unverify
  const toggleVerify = async (targetState: boolean) => {
    if (!id) return;
    try {
      await supabase.from("ngos").update({ verified: targetState }).eq("id", id);
      setNgo((p: any) => ({ ...p, verified: targetState }));
      alert(targetState ? "NGO Verified" : "NGO Unverified");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("toggleVerify", e);
      alert("Operation failed");
    }
  };

  // reset password
  const resetPassword = async () => {
    if (!id) return;
    const newPass = prompt("Enter new password (will save in plain text in current schema):");
    if (!newPass) return;
    try {
      await supabase.from("ngos").update({ password: newPass }).eq("id", id);
      alert("Password reset");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("resetPassword", e);
      alert("Failed to reset password");
    }
  };

  // disable NGO
  const disableNGO = async () => {
    if (!id) return;
    if (!confirm("Disable this NGO (it will not be able to accept new donations)?")) return;
    try {
      await supabase.from("ngos").update({ active: false }).eq("id", id);
      setNgo((p: any) => ({ ...p, active: false }));
      alert("NGO disabled");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("disableNGO", e);
      alert("Failed to disable NGO");
    }
  };

  // delete NGO
  const deleteNGO = async () => {
    if (!id) return;
    if (!confirm("Delete this NGO permanently? This will remove related records depending on DB cascade rules.")) return;
    try {
      await supabase.from("ngos").delete().eq("id", id);
      alert("NGO deleted");
      navigate("/admin/ngos");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("deleteNGO", e);
      alert("Failed to delete NGO");
    }
  };

  /* -------------------- DONATION ACTIONS -------------------- */
  // Update donation status
  const updateDonationStatus = async (donationId: string, status: string) => {
    try {
      await supabase.from("donations").update({ status }).eq("id", donationId);
      // insert into donation_events
      await supabase.from("donation_events").insert({
        donation_id: donationId,
        event: `Status changed to ${status}`,
        note: null,
      });
      // refresh
      fetchDonations(donationsPage, donationSearch);
      alert("Donation updated");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("updateDonationStatus", e);
      alert("Failed to update donation");
    }
  };

  // Assign volunteer to donation (simple)
  const assignVolunteer = async (donationId: string, volunteerId: string | null) => {
    try {
      await supabase.from("donations").update({ assigned_volunteer: volunteerId, assigned_at: volunteerId ? new Date() : null }).eq("id", donationId);
      if (volunteerId) {
        // create volunteer_assignment row
        await supabase.from("volunteer_assignments").insert({
          volunteer_id: volunteerId,
          donation_id: donationId,
          ngo_id: id,
          status: "Assigned",
        });
      }
      fetchDonations(donationsPage, donationSearch);
      alert("Assignment updated");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("assignVolunteer", e);
      alert("Failed to assign volunteer");
    }
  };

  /* -------------------- CAMPAIGN ACTIONS -------------------- */
  const toggleCampaignStatus = async (campaignId: string, status: string) => {
    try {
      await supabase.from("ngo_campaigns").update({ status }).eq("id", campaignId);
      fetchCampaigns();
      alert("Campaign status updated");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("toggleCampaignStatus", e);
      alert("Failed to update campaign");
    }
  };

  /* -------------------- UI RENDERS -------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* header */}
      <div className="flex items-center gap-6">
        <img src={ngo?.image_url || "/placeholder.png"} className="w-28 h-28 rounded-xl border object-cover" />
        <div>
          <h1 className="text-3xl font-bold text-blue-700">{ngo?.name}</h1>
          <div className="flex gap-4 items-center mt-1">
            <div className="flex items-center gap-1 text-gray-700"><Mail size={16} /> {ngo?.email}</div>
            <div className="flex items-center gap-1 text-yellow-600"><Star size={16} /> {ngo?.rating || 0}</div>
            <div className="text-sm text-gray-500">Created: {new Date(ngo?.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <button onClick={() => setActiveTab("overview")} className="px-3 py-2 rounded-lg bg-gray-100">Overview</button>
          <button onClick={() => setActiveTab("donations")} className="px-3 py-2 rounded-lg bg-blue-600 text-white">Donations</button>
          <button onClick={() => setActiveTab("volunteers")} className="px-3 py-2 rounded-lg bg-gray-100">Volunteers</button>
          <button onClick={() => setActiveTab("campaigns")} className="px-3 py-2 rounded-lg bg-gray-100">Campaigns</button>
          <button onClick={() => setActiveTab("gallery")} className="px-3 py-2 rounded-lg bg-gray-100">Gallery</button>
        </div>
      </div>

      {/* top stats */}
      <div className="grid grid-cols-4 gap-4">
        <CardStat title="Total Donations" value={impact?.total_donations || 0} icon={<Gift />} />
        <CardStat title="Total Donors" value={impact?.total_donors || 0} icon={<Users />} />
        <CardStat title="Volunteers" value={impact?.total_volunteers || 0} icon={<Users />} />
        <CardStat title="Active Campaigns" value={impact?.active_campaigns || 0} icon={<Layers />} />
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl shadow p-6">
        {activeTab === "overview" && (
          <OverviewTab
            ngo={ngo}
            impact={impact}
            form={form}
            setForm={setForm}
            saving={saving}
            saveChanges={saveChanges}
            toggleVerify={toggleVerify}
            resetPassword={resetPassword}
            disableNGO={disableNGO}
            deleteNGO={deleteNGO}
            refreshAll={() => {
              fetchDonations(donationsPage, donationSearch);
              fetchVolunteers();
              fetchCampaigns();
              fetchGallery();
              fetchReviews();
              fetchFollowers();
              fetchPosts();
              fetchMessages();
            }}
          />
        )}

        {activeTab === "donations" && (
          <DonationsTab
            donations={donations}
            loading={donationLoading}
            page={donationsPage}
            perPage={donationsPerPage}
            total={donationsTotal}
            onPageChange={(p) => fetchDonations(p, donationSearch)}
            onSearch={(s) => {
              setDonationSearch(s);
              fetchDonations(1, s);
            }}
            volunteers={volunteers}
            updateDonationStatus={updateDonationStatus}
            assignVolunteer={assignVolunteer}
            refresh={() => fetchDonations(donationsPage, donationSearch)}
          />
        )}

        {activeTab === "volunteers" && (
          <VolunteersTab volunteers={volunteers} loading={volunteersLoading} refresh={fetchVolunteers} />
        )}

        {activeTab === "campaigns" && (
          <CampaignsTab campaigns={campaigns} loading={campaignsLoading} toggleCampaignStatus={toggleCampaignStatus} refresh={fetchCampaigns} />
        )}

        {activeTab === "gallery" && <GalleryTab gallery={gallery} refresh={fetchGallery} ngoId={id!} />}

        {activeTab === "reviews" && <ReviewsTab reviews={reviews} refresh={fetchReviews} />}

        {activeTab === "followers" && <FollowersTab followers={followers} refresh={fetchFollowers} />}

        {activeTab === "posts" && <PostsTab posts={posts} refresh={fetchPosts} ngoId={id!} />}

        {activeTab === "messages" && <MessagesTab messages={messages} refresh={fetchMessages} />}
      </div>
    </div>
  );
}

/* -------------------- UI Subcomponents -------------------- */

function CardStat({ title, value, icon }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4 border">
      <div className="text-blue-600 text-2xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

/* -------------------- Overview Tab -------------------- */
function OverviewTab({
  ngo,
  impact,
  form,
  setForm,
  saving,
  saveChanges,
  toggleVerify,
  resetPassword,
  disableNGO,
  deleteNGO,
  refreshAll,
}: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h3 className="text-xl font-semibold mb-3">Edit NGO</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(form).map((k) => (
              <div key={k}>
                <label className="text-sm text-gray-600 capitalize">{k}</label>
                <input
                  className="w-full p-2 border rounded-lg"
                  value={form[k] || ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={saveChanges} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-lg" onClick={refreshAll}>
              Refresh
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Account Controls</h3>

          <div className="grid gap-3">
            <button onClick={() => toggleVerify(!ngo.verified)} className={`py-2 rounded-lg ${ngo.verified ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
              {ngo.verified ? "Unverify NGO" : "Verify NGO"}
            </button>

            <button onClick={resetPassword} className="py-2 rounded-lg bg-orange-600 text-white">Reset Password</button>

            <button onClick={disableNGO} className="py-2 rounded-lg bg-black text-white">Disable NGO</button>

            <button onClick={deleteNGO} className="py-2 rounded-lg bg-red-700 text-white">Delete NGO</button>
          </div>
        </div>
      </div>

      {/* analytics summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold">₹{impact?.total_value || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow">
          <p className="text-sm text-gray-500">Top Category</p>
          <p className="text-2xl font-bold">{impact?.top_category || "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow">
          <p className="text-sm text-gray-500">Monthly Growth</p>
          <p className="text-2xl font-bold">{impact?.monthly_growth_percent ?? 0}%</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Donations Tab -------------------- */
function DonationsTab({
  donations,
  loading,
  page,
  perPage,
  total,
  onPageChange,
  onSearch,
  volunteers,
  updateDonationStatus,
  assignVolunteer,
  refresh,
}: any) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / perPage));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 border rounded-lg p-2">
          <Search size={16} />
          <input
            placeholder="Search by category..."
            onChange={(e) => onSearch(e.target.value)}
            className="outline-none"
          />
        </div>

        <div className="text-sm text-gray-600">Total: {total || 0}</div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : donations.length === 0 ? (
        <div className="p-8 text-center text-gray-600">No donations found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Status</th>
                <th className="p-3">Donor</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((d: any) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{d.category}</td>
                  <td className="p-3">{d.amount ? `₹${d.amount}` : "—"}</td>
                  <td className="p-3">{d.quantity || "-"}</td>
                  <td className="p-3"><StatusBadge status={d.status} /></td>
                  <td className="p-3 text-sm text-gray-600">{d.donor_id || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => updateDonationStatus(d.id, "Accepted")} className="px-3 py-1 rounded bg-green-600 text-white">Accept</button>
                      <button onClick={() => updateDonationStatus(d.id, "Completed")} className="px-3 py-1 rounded bg-blue-600 text-white">Complete</button>
                      <select
                        onChange={(e) => assignVolunteer(d.id, e.target.value || null)}
                        className="border rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="">Assign volunteer</option>
                        {volunteers.map((v: any) => (
                          <option key={v.id} value={v.id}>{v.name || v.email}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Showing page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 rounded bg-gray-100">Prev</button>
              <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded bg-gray-100">Next</button>
              <button onClick={refresh} className="px-3 py-1 rounded bg-blue-600 text-white">Refresh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Volunteers Tab -------------------- */
function VolunteersTab({ volunteers, loading, refresh }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Volunteers</h3>
        <button className="px-3 py-1 bg-gray-100 rounded" onClick={refresh}>Refresh</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin" /></div>
      ) : volunteers.length === 0 ? (
        <div className="text-gray-600 p-6">No volunteers found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {volunteers.map((v: any) => (
            <div key={v.id} className="bg-white p-4 rounded-xl border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={v.image_url || "/placeholder.png"} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold">{v.name || v.email}</div>
                  <div className="text-sm text-gray-500">{v.email}</div>
                  <div className="text-xs text-gray-400">Joined: {v.joined_at ? new Date(v.joined_at).toLocaleDateString() : "—"}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded">Profile</button>
                <button className="px-3 py-1 bg-gray-100 rounded">Message</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- Campaigns Tab -------------------- */
function CampaignsTab({ campaigns, loading, toggleCampaignStatus, refresh }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Campaigns</h3>
        <div>
          <button onClick={refresh} className="px-3 py-1 bg-gray-100 rounded">Refresh</button>
          <Link to="/admin/create-campaign" className="ml-2 px-3 py-1 bg-blue-600 text-white rounded">Create Campaign</Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin" /></div>
      ) : campaigns.length === 0 ? (
        <div className="text-gray-600 p-6">No campaigns found.</div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c: any) => (
            <div key={c.id} className="bg-white p-4 rounded-xl border flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.title || "Untitled"}</div>
                <div className="text-sm text-gray-500">{c.summary || c.description || "-"}</div>
                <div className="text-xs text-gray-400">Status: {c.status}</div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => toggleCampaignStatus(c.id, c.status === "Active" ? "Paused" : "Active")} className="px-3 py-1 rounded bg-gray-100">
                  {c.status === "Active" ? "Pause" : "Activate"}
                </button>
                <Link to={`/admin/ngo/${c.ngo_id}/campaign/${c.id}/edit`} className="px-3 py-1 rounded bg-blue-600 text-white">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- Gallery Tab -------------------- */
function GalleryTab({ gallery, refresh, ngoId }: any) {
  const remove = async (id: string) => {
    if (!confirm("Delete media item?")) return;
    try {
      await supabase.from("ngo_gallery").delete().eq("id", id);
      alert("Deleted");
      refresh();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("delete gallery", e);
      alert("Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gallery</h3>
        <Link to={`/admin/ngo/${ngoId}/gallery/new`} className="px-3 py-1 bg-blue-600 text-white rounded">Add Media</Link>
      </div>

      {gallery.length === 0 ? (
        <div className="text-gray-600 p-6">No media yet.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {gallery.map((g: any) => (
            <div key={g.id} className="bg-white rounded-xl overflow-hidden border">
              <img src={g.media_url} className="w-full h-44 object-cover" />
              <div className="p-3">
                <div className="text-sm font-semibold">{g.title || "Untitled"}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => window.open(g.media_url, "_blank")} className="px-3 py-1 bg-gray-100 rounded">View</button>
                  <button onClick={() => remove(g.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- Reviews Tab -------------------- */
function ReviewsTab({ reviews, refresh }: any) {
  const remove = async (id: string) => {
    if (!confirm("Delete review?")) return;
    try {
      await supabase.from("ngo_reviews").delete().eq("id", id);
      alert("Deleted");
      refresh();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("delete review", e);
      alert("Failed");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Reviews</h3>
      {reviews.length === 0 ? <div className="text-gray-600 p-6">No reviews yet.</div> : (
        <div className="grid gap-3">
          {reviews.map((r: any) => (
            <div key={r.id} className="bg-white p-4 rounded-xl border">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{r.donor?.name || r.donor_id}</div>
                  <div className="text-sm text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="text-yellow-600">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} />)}</div>
              </div>
              <div className="mt-2 text-gray-700">{r.review}</div>
              <div className="mt-3">
                <button onClick={() => remove(r.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- Followers Tab -------------------- */
function FollowersTab({ followers, refresh }: any) {
  const remove = async (id: string) => {
    if (!confirm("Remove follower?")) return;
    try {
      await supabase.from("ngo_followers").delete().eq("id", id);
      alert("Removed");
      refresh();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("remove follower", e);
      alert("Failed");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Followers</h3>
      {followers.length === 0 ? <div className="text-gray-600 p-6">No followers yet.</div> : (
        <div className="grid gap-3">
          {followers.map((f: any) => (
            <div key={f.id} className="bg-white p-4 rounded-xl border flex justify-between">
              <div>
                <div className="font-semibold">{f.donor?.name || f.donor_id}</div>
                <div className="text-sm text-gray-500">{f.donor?.email}</div>
              </div>
              <div>
                <button onClick={() => remove(f.id)} className="px-3 py-1 bg-red-600 text-white rounded">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- Posts Tab -------------------- */
function PostsTab({ posts, refresh, ngoId }: any) {
  const remove = async (id: string) => {
    if (!confirm("Delete post?")) return;
    try {
      await supabase.from("ngo_posts").delete().eq("id", id);
      alert("Deleted");
      refresh();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("delete post", e);
      alert("Failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Posts</h3>
        <Link to={`/admin/ngo/${ngoId}/posts/new`} className="px-3 py-1 bg-blue-600 text-white rounded">New Post</Link>
      </div>

      {posts.length === 0 ? <div className="text-gray-600 p-6">No posts yet.</div> : (
        <div className="grid gap-3">
          {posts.map((p: any) => (
            <div key={p.id} className="bg-white p-4 rounded-xl border">
              <div className="flex justify-between">
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <div className="mt-2 text-gray-700">{p.content}</div>
              <div className="mt-3 flex gap-2">
                <Link to={`/admin/ngo/${p.ngo_id}/posts/${p.id}/edit`} className="px-3 py-1 bg-gray-100 rounded">Edit</Link>
                <button onClick={() => remove(p.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- Messages Tab -------------------- */
function MessagesTab({ messages, refresh }: any) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Messages</h3>
      {messages.length === 0 ? <div className="text-gray-600 p-6">No messages found.</div> : (
        <div className="grid gap-3">
          {messages.map((m: any) => (
            <div key={m.id} className="bg-white p-4 rounded-xl border">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">From: {m.sender_role} ({m.sender_id})</div>
                  <div className="text-sm text-gray-500">To: {m.receiver_role} ({m.receiver_id})</div>
                </div>
                <div className="text-sm text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="mt-2 text-gray-700">{m.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- Small helpers -------------------- */
function StatusBadge({ status }: any) {
  const map: any = {
    Pending: "bg-yellow-100 text-yellow-700",
    Accepted: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Assigned: "bg-purple-100 text-purple-700",
  };
  return <span className={`px-3 py-1 rounded-full text-sm ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
}
