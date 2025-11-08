import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, Building2, Users, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PendingNGO {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingNGOs, setPendingNGOs] = useState<PendingNGO[]>([]);
  const [stats, setStats] = useState({ totalNGOs: 0, totalDonors: 0, totalDonations: 0 });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has admin role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!userRole) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You don't have admin privileges.",
      });
      navigate("/");
      return;
    }

    setUser(session.user);
    await fetchPendingNGOs();
    await fetchStats();
    setLoading(false);
  };

  const fetchPendingNGOs = async () => {
    const { data, error } = await supabase
      .from("ngos")
      .select(`
        *,
        profiles!ngos_profile_id_fkey (
          full_name,
          phone
        )
      `)
      .eq("active", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending NGOs:", error);
    } else {
      setPendingNGOs(data as any || []);
    }
  };

  const fetchStats = async () => {
    const [ngosRes, donorsRes, donationsRes] = await Promise.all([
      supabase.from("ngos").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "donor"),
      supabase.from("donations").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      totalNGOs: ngosRes.count || 0,
      totalDonors: donorsRes.count || 0,
      totalDonations: donationsRes.count || 0,
    });
  };

  const handleApproveNGO = async (ngoId: string, profileId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("ngos")
      .update({
        active: true,
        approved_by: session.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", ngoId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve NGO.",
      });
    } else {
      toast({
        title: "Success",
        description: "NGO approved successfully!",
      });
      
      // Log audit entry
      await supabase.from("audit_logs").insert({
        actor_id: session.user.id,
        action: "NGO_APPROVED",
        target_table: "ngos",
        target_id: ngoId,
        details: { ngo_id: ngoId, profile_id: profileId },
      });

      fetchPendingNGOs();
      fetchStats();
    }
  };

  const handleRejectNGO = async (ngoId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("ngos")
      .delete()
      .eq("id", ngoId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject NGO.",
      });
    } else {
      toast({
        title: "NGO rejected",
        description: "The NGO application has been rejected and removed.",
      });

      // Log audit entry
      await supabase.from("audit_logs").insert({
        actor_id: session.user.id,
        action: "NGO_REJECTED",
        target_table: "ngos",
        target_id: ngoId,
        details: { ngo_id: ngoId },
      });

      fetchPendingNGOs();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage platform & approvals</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total NGOs
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.totalNGOs}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donors
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{stats.totalDonors}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donations
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{stats.totalDonations}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending-ngos" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="pending-ngos">
              Pending NGOs
              {pendingNGOs.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingNGOs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-ngos">
            <h2 className="text-2xl font-bold mb-6">Pending NGO Approvals</h2>

            {pendingNGOs.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending NGO applications.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {pendingNGOs.map((ngo) => (
                  <Card key={ngo.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{ngo.name}</CardTitle>
                          <CardDescription>
                            Applied on {new Date(ngo.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Description:</p>
                          <p className="text-sm text-muted-foreground">
                            {ngo.description || "No description provided"}
                          </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Contact Person:</p>
                            <p className="text-sm text-muted-foreground">{ngo.profiles?.full_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Phone:</p>
                            <p className="text-sm text-muted-foreground">
                              {ngo.profiles?.phone || "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Address:</p>
                          <p className="text-sm text-muted-foreground">
                            {ngo.address}, {ngo.city}, {ngo.state} - {ngo.pincode}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="success"
                            onClick={() => handleApproveNGO(ngo.id, ngo.profiles?.full_name)}
                          >
                            Approve NGO
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleRejectNGO(ngo.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="donations">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">All Donations</h2>
              {allDonations.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No donations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allDonations.map((donation) => (
                    <Card key={donation.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold capitalize">{donation.category}</h3>
                            <Badge className={getStatusColor(donation.status)}>
                              {donation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Donor:</strong> {donation.donor?.full_name || 'Unknown'} ({donation.donor?.email})
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>NGO:</strong> {donation.ngo?.name || 'Not assigned'} - {donation.ngo?.city}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Created:</strong> {format(new Date(donation.created_at), "PPP")}
                          </p>
                          {donation.amount && (
                            <p className="text-sm font-medium mt-2">
                              Amount: ₹{donation.amount}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <h2 className="text-2xl font-bold mb-6">System Overview</h2>
            <Card className="shadow-card">
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  Additional system management features coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
