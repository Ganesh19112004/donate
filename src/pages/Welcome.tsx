import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Welcome = () => {
  const { state } = useLocation();
  const user = state?.user;
  const role = state?.role;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle>Welcome, {user?.name || "User"} 👋</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            You are signed in as <strong>{role?.toUpperCase()}</strong>.
          </p>
          <Link
            to="/"
            className="text-blue-600 hover:underline"
          >
            Go to Homepage
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;
