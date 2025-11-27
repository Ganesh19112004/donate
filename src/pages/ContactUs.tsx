import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Heading */}
        <h1 className="text-4xl font-extrabold mb-6 text-center">
          Contact <span className="text-primary">DenaSetu</span>
        </h1>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Have a question, feedback, or need assistance? We're here to help.
          Reach out to us anytime!
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* LEFT: Contact Info */}
          <Card className="shadow-xl border border-border/60 backdrop-blur-md bg-card/70">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Contact Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Phone className="text-primary h-6 w-6" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="text-primary h-6 w-6" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">support@denasetu.org</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="text-primary h-6 w-6" />
                  <div>
                    <p className="font-semibold">Office Address</p>
                    <p className="text-muted-foreground">
                      DenaSetu HQ, Mumbai, Maharashtra, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Fake Map preview */}
              <div className="rounded-xl overflow-hidden border shadow">
                <img
                  src="https://maps.googleapis.com/maps/api/staticmap?center=Mumbai&zoom=10&size=600x300&key=YOUR_API_KEY"
                  alt="Map preview"
                  className="w-full h-40 object-cover opacity-80"
                />
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Contact Form */}
          <Card className="shadow-xl border border-border/60 backdrop-blur-lg bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Send Us a Message</CardTitle>
            </CardHeader>

            <CardContent>
              {submitted ? (
                <div className="text-center py-12">
                  <p className="text-2xl font-bold text-green-600">Message Sent! 🎉</p>
                  <p className="text-muted-foreground mt-2">
                    We will get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    required
                    className="transition-all focus:ring-2 ring-primary"
                  />
                  <Input
                    placeholder="Your Email"
                    type="email"
                    required
                    className="transition-all focus:ring-2 ring-primary"
                  />
                  <Textarea
                    placeholder="Write your message here..."
                    rows={5}
                    required
                    className="transition-all focus:ring-2 ring-primary"
                  />

                  <Button
                    className="w-full flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition"
                    type="submit"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
