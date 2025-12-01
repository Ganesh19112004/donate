import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  Users,
  HeartHandshake,
  Gift,
  Cpu,
  RefreshCcw,
  Loader2,
  MessageSquare,
  ClipboardList,
  Search,
  Star,
  AlertCircle,
  MapPin,
} from "lucide-react";

export default function SystemMonitor() {
  const [loading, setLoading] = useState(false);

  const [ngos, setNgos] = useState<any[]>([]);
  const [filteredNGOs, setFilteredNGOs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [selectedNGO, setSelectedNGO] = useState<string>("");
  const [ngoDetails, setNGODetails] = useState<any>(null);

  const [activeTab, setActiveTab] = useState("overview");

  const [system, setSystem] = useState({
    donations: 0,
    totalValue: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,

    totalVolunteers: 0,
    activeVolunteers: 0,
    totalDonors: 0,
    activeCampaigns: 0,

    messages: 0,
    unreadMessages: 0,

    events: 0,
    alerts: 0,
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [volunteerActivity, setVolunteerActivity] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  /* -------------------- LOAD NGOS -------------------- */
  useEffect(() => {
    loadNGOs();
  }, []);

  const loadNGOs = async () => {
    const { data } = await supabase.from("ngos").select("id,name");
    if (data) {
      setNgos(data);
      setFilteredNGOs(data);
    }
  };

  /* -------------------- NGO SEARCH -------------------- */
  useEffect(() => {
    setFilteredNGOs(
      ngos.filter((n) =>
        n.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, ngos]);

  /* -------------------- LOAD SYSTEM DATA -------------------- */
  useEffect(() => {
    if (!selectedNGO) return;
    loadSystemData(selectedNGO);
  }, [selectedNGO]);

  const loadSystemData = async (ngo_id: string) => {
    setLoading(true);

    /* --- NGO DETAILS --- */
    const { data: ngoInfo } = await supabase
      .from("ngos")
      .select("*")
      .eq("id", ngo_id)
      .single();
    setNGODetails(ngoInfo);

    /* --- Fetch donation IDs --- */
    const { data: donationIdsRaw } = await supabase
      .from("donations")
      .select("id")
      .eq("ngo_id", ngo_id);

    const donationIds = donationIdsRaw?.map((d) => d.id) || [];

    /* --- Donation list --- */
    const { data: donationsList } = await supabase
      .from("donations")
      .select("*")
      .eq("ngo_id", ngo_id);

    /* --- Events --- */
    const { data: events } = await supabase
      .from("donation_events")
      .select("*")
      .in("donation_id", donationIds.length ? donationIds : ["00000000-0000-0000-0000-000000000000"])
      .order("created_at", { ascending: false })
      .limit(10);

    /* --- Volunteers --- */
    const { data: volList } = await supabase
      .from("ngo_volunteers")
      .select("volunteer_id")
      .eq("ngo_id", ngo_id);

    const { data: activeVols } = await supabase
      .from("volunteers")
      .select("id")
      .eq("status", "Available")
      .in("id", volList?.map((v) => v.volunteer_id) || []);

    /* --- Donor count --- */
    const { count: donorCount } = await supabase
      .from("donations")
      .select("donor_id", { count: "exact", head: true })
      .eq("ngo_id", ngo_id);

    /* --- Campaigns --- */
    const { count: campaignCount } = await supabase
      .from("ngo_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("ngo_id", ngo_id)
      .eq("status", "Active");

    /* --- Messages --- */
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("receiver_id", ngo_id)
      .order("created_at", { ascending: false })
      .limit(15);

    const unread = msgs?.filter((m) => m.read_status === false).length || 0;

    /* --- Volunteer activity --- */
    const { data: volAct } = await supabase
      .from("volunteer_activity")
      .select("*")
      .limit(10)
      .order("created_at", { ascending: false });

    /* ---------------- CALCULATE STATS ---------------- */
    const pending = donationsList?.filter((d) => d.status === "Pending").length || 0;
    const accepted = donationsList?.filter((d) => d.status === "Accepted").length || 0;
    const completed = donationsList?.filter((d) => d.status === "Completed").length || 0;
    const cancelled = donationsList?.filter((d) => d.status === "Cancelled").length || 0;

    const totalValue = donationsList?.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;

    setSystem({
      donations: donationsList?.length || 0,
      totalValue,
      pending,
      accepted,
      completed,
      cancelled,

      totalVolunteers: volList?.length || 0,
      activeVolunteers: activeVols?.length || 0,
      totalDonors: donorCount || 0,
      activeCampaigns: campaignCount || 0,

      messages: msgs?.length || 0,
      unreadMessages: unread,

      events: events?.length || 0,
      alerts: pending > 10 ? 1 : 0,
    });

    setRecentEvents(events || []);
    setMessages(msgs || []);
    setVolunteerActivity(volAct || []);

    setLoading(false);
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="p-8 min-h-screen bg-gray-100 space-y-10">
      <h1 className="text-4xl font-bold text-blue-700">System Monitor</h1>

      {/* SEARCH + DROPDOWN */}
      <div className="flex gap-4">
        <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow w-1/3 border">
          <Search size={20} className="text-gray-500" />
          <input
            className="ml-3 outline-none w-full"
            placeholder="Search NGO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="p-3 border rounded-lg bg-white shadow"
          value={selectedNGO}
          onChange={(e) => setSelectedNGO(e.target.value)}
        >
          <option value="">Select NGO</option>
          {filteredNGOs.map((ngo) => (
            <option key={ngo.id} value={ngo.id}>
              {ngo.name}
            </option>
          ))}
        </select>

        {selectedNGO && (
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            onClick={() => loadSystemData(selectedNGO)}
          >
            <RefreshCcw size={18} /> Reload
          </button>
        )}
      </div>

      {/* IF NOT SELECTED */}
      {!selectedNGO && (
        <div className="mt-24 text-center text-lg text-gray-600">
          Select an NGO to start monitoring.
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={38} />
        </div>
      )}

      {/* DATA */}
      {!loading && selectedNGO && (
        <>
          {/* TOP TABS */}
          <div className="flex gap-4 border-b pb-2 mt-8">
            {["overview", "donations", "volunteers", "messages", "events"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md font-semibold ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              )
            )}
          </div>

          {/* --------------------- OVERVIEW TAB --------------------- */}
          {activeTab === "overview" && ngoDetails && (
            <div className="space-y-8 mt-6">
              {/* NGO INFO */}
              <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-bold mb-4">{ngoDetails.name}</h2>

                <div className="grid md:grid-cols-3 gap-4">
                  <Info label="Email" value={ngoDetails.email} />
                  <Info label="City" value={ngoDetails.city} />
                  <Info
                    label="Rating"
                    value={
                      ngoDetails.rating
                        ? `${ngoDetails.rating} ⭐ (${ngoDetails.total_reviews})`
                        : "No rating"
                    }
                  />
                </div>
              </div>

              {/* OVERVIEW CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <SysCard label="Donations" value={system.donations} icon={<Gift />} color="yellow" />
                <SysCard label="Donors" value={system.totalDonors} icon={<Users />} color="green" />
                <SysCard label="Volunteers" value={system.totalVolunteers} icon={<HeartHandshake />} color="purple" />
                <SysCard label="Campaigns" value={system.activeCampaigns} icon={<ClipboardList />} color="blue" />
              </div>

              {/* Alerts */}
              {system.alerts > 0 && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg flex gap-2 items-center">
                  <AlertCircle /> High pending donations! (More than 10)
                </div>
              )}
            </div>
          )}

          {/* --------------------- DONATION TAB --------------------- */}
          {activeTab === "donations" && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Donation Statistics</h2>

              <div className="grid grid-cols-4 gap-6">
                <SmallCard label="Pending" value={system.pending} color="yellow" />
                <SmallCard label="Accepted" value={system.accepted} color="blue" />
                <SmallCard label="Completed" value={system.completed} color="green" />
                <SmallCard label="Cancelled" value={system.cancelled} color="red" />
              </div>

              <div className="mt-6">
                <WideCard title="Total Value" value={`₹${system.totalValue}`} icon={<Gift />} color="green" />
              </div>
            </div>
          )}

          {/* --------------------- VOLUNTEER TAB --------------------- */}
          {activeTab === "volunteers" && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <WideCard title="Total Volunteers" value={system.totalVolunteers} icon={<Users />} color="purple" />
                <WideCard title="Active Volunteers" value={system.activeVolunteers} icon={<Cpu />} color="green" />
                <WideCard title="Activities Logged" value={volunteerActivity.length} icon={<Activity />} color="blue" />
              </div>

              <Section title="Recent Volunteer Activity" icon={<Cpu />}>
                {volunteerActivity.map((v, i) => (
                  <Item key={i} text={v.action} date={v.created_at} />
                ))}
              </Section>
            </div>
          )}

          {/* --------------------- MESSAGES TAB --------------------- */}
          {activeTab === "messages" && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <WideCard title="Total Messages" value={system.messages} icon={<MessageSquare />} color="purple" />
                <WideCard title="Unread Messages" value={system.unreadMessages} icon={<AlertCircle />} color="red" />
                <WideCard title="Latest Message" value={messages[0]?.message || "No messages"} icon={<MessageSquare />} color="blue" />
              </div>

              <Section title="Latest Messages" icon={<MessageSquare />}>
                {messages.map((m, i) => (
                  <Item key={i} text={m.message} date={m.created_at} />
                ))}
              </Section>
            </div>
          )}

          {/* --------------------- EVENTS TAB --------------------- */}
          {activeTab === "events" && (
            <div className="mt-6">
              <Section title="Recent Events" icon={<Activity />}>
                {recentEvents.map((e, i) => (
                  <Item key={i} text={e.event} date={e.created_at} />
                ))}
              </Section>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Info({ label, value }: any) {
  return (
    <div className="p-3 bg-gray-100 rounded-lg">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-lg font-semibold">{value || "—"}</p>
    </div>
  );
}

function SysCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border flex gap-4 items-center">
      <div className={`text-${color}-600 text-3xl`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function SmallCard({ label, value, color }: any) {
  return (
    <div className={`bg-${color}-100 p-6 rounded-xl text-${color}-700 text-center shadow`}>
      <p className="text-sm">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function WideCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 border rounded-xl shadow flex gap-4 items-center">
      <div className={`text-${color}-600 text-3xl`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
        <span className="text-xl">{icon}</span> {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Item({ text, date }: any) {
  return (
    <div className="bg-gray-50 p-3 border rounded-lg flex justify-between">
      <span>{text}</span>
      <span className="text-sm text-gray-500">
        {new Date(date).toLocaleString()}
      </span>
    </div>
  );
}
