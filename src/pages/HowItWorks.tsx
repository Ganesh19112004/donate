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
  CheckCircle2,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-16 px-6 text-gray-800">

      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <h1 className="text-4xl font-extrabold mb-4">
          How <span className="text-primary">DenaSetu</span> Works
        </h1>
        <p className="text-lg text-gray-600">
          Discover how donations, NGOs, and volunteers connect to create real impact.
        </p>
      </div>

      {/* TIMELINE OR CARDS */}
      <div className="grid gap-10 max-w-5xl mx-auto">

        {/* STEP 1 */}
        <Card className="shadow-lg border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            <CardTitle>1. Join the Platform</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            Create an account as a Donor, NGO, or Volunteer.  
            Customize your profile and start interacting instantly.
          </CardContent>
        </Card>

        {/* STEP 2 */}
        <Card className="shadow-lg border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center gap-3">
            <MapPin className="h-7 w-7 text-primary" />
            <CardTitle>2. Discover Nearby NGOs</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            View verified NGOs near you, explore categories, and understand what help they need.
          </CardContent>
        </Card>

        {/* STEP 3 */}
        <Card className="shadow-lg border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center gap-3">
            <HandHeart className="h-7 w-7 text-primary" />
            <CardTitle>3. Donate or Volunteer</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            Donate items, money, or volunteer for tasks assigned by NGOs.  
            All actions are securely tracked inside your dashboard.
          </CardContent>
        </Card>

        {/* STEP 4 */}
        <Card className="shadow-lg border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center gap-3">
            <TrendingUp className="h-7 w-7 text-primary" />
            <CardTitle>4. Track Donation Journey</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            From pickup → delivery → NGO confirmation → feedback,  
            you can see the entire progress of your contribution.
          </CardContent>
        </Card>

        {/* STEP 5 */}
        <Card className="shadow-lg border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <CardTitle>5. Verified & Transparent</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            All NGOs are verified, and you can view their ratings, reviews, gallery, and updates.
          </CardContent>
        </Card>

      </div>

      {/* VIDEO OR illus SECTION */}
      <div className="max-w-4xl mx-auto mt-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb"
            alt="DenaSetu community"
            className="w-full h-[300px] object-cover"
          />
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-3">A Community Built on Trust</h2>
            <p className="text-gray-600">
              DenaSetu connects people who want to help with NGOs that need support.
              Our mission is to make giving simple, direct, and transparent.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="max-w-3xl mx-auto mt-20">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>

        <div className="space-y-4">
          <Card>
            <CardContent className="py-4">
              <p className="font-medium">📌 Is DenaSetu free?</p>
              <p className="text-gray-600">Yes. It is 100% free for donors and volunteers.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <p className="font-medium">📌 Are NGOs verified?</p>
              <p className="text-gray-600">Yes. Every NGO must complete verification before listing.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <p className="font-medium">📌 Can I track my donations?</p>
              <p className="text-gray-600">
                Absolutely. You can track every donation in your dashboard.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <Link to="/auth">
          <Button size="lg" className="px-10 py-6 shadow-lg text-lg">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* FOOTER SPACING */}
      <div className="mb-20"></div>
    </div>
  );
}
