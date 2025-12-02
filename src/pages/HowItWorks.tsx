import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  HandHeart,
  MapPin,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-6 text-gray-800">

      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          How <span className="text-primary">DenaSetu</span> Works
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          A simple and transparent platform that connects donors, volunteers, and NGOs 
          to create real, measurable impact.
        </p>
      </div>

      {/* STEPS */}
      <div className="grid gap-10 max-w-4xl mx-auto">
        
        {/* STEP CARD TEMPLATE */}
        {[
          {
            title: "Join the Platform",
            icon: <Users className="h-7 w-7 text-primary" />,
            text: "Create an account as a Donor or Volunteer. Set up your profile and start contributing instantly.",
          },
          {
            title: "Discover Nearby NGOs",
            icon: <MapPin className="h-7 w-7 text-primary" />,
            text: "Explore verified NGOs near you, understand their needs, and choose where you want to help.",
          },
          {
            title: "Donate or Volunteer",
            icon: <HandHeart className="h-7 w-7 text-primary" />,
            text: "Donate items, funds, or your time. All contributions are tracked securely in your dashboard.",
          },
          {
            title: "Track Your Impact",
            icon: <TrendingUp className="h-7 w-7 text-primary" />,
            text: "Monitor donation progress — from pickup, delivery, NGO verification, to beneficiary feedback.",
          },
          {
            title: "Verified & Transparent",
            icon: <ShieldCheck className="h-7 w-7 text-primary" />,
            text: "All NGOs go through a strict verification process, ensuring authenticity, safety, and trust.",
          },
        ].map((step, idx) => (
          <Card
            key={idx}
            className="shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 rounded-xl bg-white/90 backdrop-blur"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">{step.icon}</div>
              <CardTitle className="text-xl font-semibold">{`${idx + 1}. ${step.title}`}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-[15px] leading-relaxed">
              {step.text}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* IMAGE / ILLUSTRATION */}
      <div className="max-w-4xl mx-auto mt-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <img
            src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb"
            alt="DenaSetu community"
            className="w-full h-[320px] object-cover"
          />
          <div className="p-7">
            <h2 className="text-3xl font-bold mb-3">A Community Built on Trust</h2>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              DenaSetu empowers giving by making it simple and meaningful.
              Our system ensures transparency at every step — connecting people who wish to help with NGOs that truly need support.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="max-w-3xl mx-auto mt-24">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>

        <div className="space-y-5">
          {[
            {
              q: "Is DenaSetu free?",
              a: "Yes! Donors and volunteers can use the platform completely free of cost.",
            },
            {
              q: "Are NGOs verified?",
              a: "Absolutely. Each NGO undergoes a verification check before appearing on the platform.",
            },
            {
              q: "Can I track my donations?",
              a: "Yes. You can monitor the full progress of every donation in real time from your dashboard.",
            },
          ].map((faq, i) => (
            <Card key={i} className="border rounded-xl shadow-md">
              <CardContent className="py-4">
                <p className="font-medium text-gray-800">{faq.q}</p>
                <p className="text-gray-600 text-[15px]">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-20">
        <Link to="/auth">
          <Button
            size="lg"
            className="px-12 py-6 text-lg shadow-lg hover:shadow-2xl transition-all"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="mb-14"></div>
    </div>
  );
}
