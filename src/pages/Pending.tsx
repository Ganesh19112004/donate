import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full shadow-elevated">
        <CardHeader className="text-center">
          <Clock className="h-10 w-10 text-primary mx-auto mb-3" />
          <CardTitle className="text-2xl">Your Account is Under Review</CardTitle>
          <CardDescription>
            Thank you for registering! Our team will review your details soon.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center mt-4 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm text-center">
            You’ll receive an email once your account is approved.
          </p>

          <Link to="/" className="text-sm text-primary hover:underline">
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
