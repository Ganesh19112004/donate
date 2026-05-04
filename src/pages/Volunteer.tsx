import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Volunteer() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Volunteer with dansetu
        </h1>

        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Join hands with local NGOs and help bring positive change to your
          community. Whether it’s distributing supplies, organizing events, or
          supporting digital campaigns — every effort matters.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <CardTitle>Field Volunteer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Help NGOs on-ground by collecting, sorting, or distributing
                donated goods to people in need.
              </p>
              <Button asChild>
                <Link to="/auth">Join as Field Volunteer</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <CardTitle>Digital Volunteer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Support NGOs remotely by managing campaigns, social media, or
                technical tasks to boost outreach.
              </p>
              <Button asChild>
                <Link to="/auth">Join as Digital Volunteer</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-semibold mb-4">
            Ready to make a difference?
          </h2>
          <Button size="lg" asChild>
            <Link to="/auth">Sign Up as Volunteer</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
