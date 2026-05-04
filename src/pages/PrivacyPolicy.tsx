import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              At <strong>DanSetu</strong>, your privacy is our top priority. We collect only the necessary information to facilitate donations, verify NGOs, and enhance your experience.
            </p>
            <p>
              We do not share or sell your data to third parties. Your information is securely stored and used strictly for verified NGO partnerships and transparency purposes.
            </p>
            <p>
              You can request data deletion or account removal anytime by contacting our support team.
            </p>
            <p>
              For questions about data protection, please reach us at <strong>support@DanSetu.org</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
