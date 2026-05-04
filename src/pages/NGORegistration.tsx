import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NGORegistration() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-6 text-center">Register Your NGO</h1>
        <p className="text-muted-foreground text-center mb-8">
          Join dansetu to connect with donors and volunteers who care about your cause.
        </p>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Must be a verified non-profit or charitable organization.</li>
              <li>Provide a valid registration certificate.</li>
              <li>Include your NGO’s mission, contact info, and address.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link to="/auth">
            <Button size="lg">Start Registration</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
