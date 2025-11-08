import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Search, Plus, Package, LogOut } from "lucide-react";

interface NGO {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  pincode: string;
  active: boolean;
}

interface Donation {
  id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  ngos: {
    name: string;
  };
}

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchCity, setSearchCity] = useState("");
  const [searchPincode, setSearchPincode] = useState("");

  useEffect(() => {
    checkAuth();
    fetchNGOs();
    fetchMyDonations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "donor") {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "This area is for donors only.",
      });
      navigate("/");
      return;
    }

    setUser(profile);
    setLoading(false);
  };

  const fetchNGOs = async () => {
    const { data, error } = await supabase
      .from("ngos")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching NGOs:", error);
    } else {
      setNgos(data || []);
    }
  };

  const fetchMyDonations = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("donations")
      .select(`
        *,
        ngos (
          name
        )
      `)
      .eq("donor_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching donations:", error);
    } else {
      setDonations(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredNGOs = ngos.filter((ngo) => {
    const matchesCity = !searchCity || ngo.city?.toLowerCase().includes(searchCity.toLowerCase());
    const matchesPincode = !searchPincode || ngo.pincode?.includes(searchPincode);
    return matchesCity && matchesPincode;
  });

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      "Requested": "bg-yellow-500",
      "Accepted": "bg-blue-500",
      "Volunteer Assigned": "bg-purple-500",
      "Picked Up": "bg-orange-500",
      "Delivered": "bg-green-500",
      "Cancelled": "bg-red-500",
      "Rejected": "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
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
            <h1 className="text-2xl font-bold text-primary">DonateConnect</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/donor/create-donation">
              <Button variant="hero" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Donation
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* My Recent Donations */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">My Recent Donations</h2>
            <Link to="/donor/donations">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {donations.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">You haven't made any donations yet.</p>
                <Link to="/donor/create-donation">
                  <Button variant="default">Create Your First Donation</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
                <Card key={donation.id} className="shadow-card hover:shadow-elevated transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getStatusColor(donation.status)}>
                        {donation.status}
                      </Badge>
                      <Badge variant="outline">{donation.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{donation.ngos?.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {donation.description || "No description provided"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* NGO Directory */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Find NGOs</h2>

          {/* Search Filters */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search by Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Search by city..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Search by pincode..."
                    value={searchPincode}
                    onChange={(e) => setSearchPincode(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NGO Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNGOs.map((ngo) => (
              <Card key={ngo.id} className="shadow-card hover:shadow-elevated transition-all">
                <CardHeader>
                  <CardTitle>{ngo.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {ngo.city}, {ngo.state} - {ngo.pincode}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {ngo.description || "No description available"}
                  </p>
                  <Link to={`/donor/ngo/${ngo.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNGOs.length === 0 && (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No NGOs found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

export default DonorDashboard;
