import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Welcome to <strong>DanSetu</strong>. By using our platform, you agree to follow these terms. Our goal is to maintain a transparent and trustworthy donation ecosystem.
            </p>
            <p>
              Donors and NGOs are responsible for providing accurate information. Misuse, fraud, or policy violation may result in account suspension.
            </p>
            <p>
              DanSetu reserves the right to modify, suspend, or terminate any part of the service at any time, with or without notice.
            </p>
            <p>
              For disputes or inquiries, please contact us at <strong>support@DanSetu.org</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
