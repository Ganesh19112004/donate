import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 py-16 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Heading */}
        <h1 className="text-4xl font-extrabold mb-6 text-center">
          Contact <span className="text-primary">DenaSetu</span>
        </h1>

        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Reach out to us through the contact details below.  
          We’re always here to help!
        </p>

        <div className="flex justify-center">
          <Card className="shadow-xl border border-border/60 backdrop-blur-md bg-card/70 w-full md:w-2/3">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-center">
                Contact Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">

              {/* Phone */}
              <div className="flex items-start gap-4">
                <Phone className="text-primary h-6 w-6" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-muted-foreground">+91 90048 98301</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <Mail className="text-primary h-6 w-6" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground">ganesh.17478@sakec.ac.in</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <MapPin className="text-primary h-6 w-6" />
                <div>
                  <p className="font-semibold">Office Address</p>
                  <p className="text-muted-foreground">
                    DenaSetu HQ, Mumbai, Maharashtra, India
                  </p>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border shadow">
                <img
                  src="https://maps.googleapis.com/maps/api/staticmap?center=Mumbai&zoom=10&size=600x300&key=YOUR_API_KEY"
                  alt="Map preview"
                  className="w-full h-40 object-cover opacity-80"
                />
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
