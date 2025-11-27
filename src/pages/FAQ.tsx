import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [search, setSearch] = useState("");

  const faqs = [
    {
      q: "How does DenaSetu work?",
      a: "DenaSetu connects donors, NGOs, and volunteers through a verified digital platform. Donors post items, NGOs accept donations, and volunteers assist with pickup and delivery.",
    },
    {
      q: "Is DenaSetu free to use?",
      a: "Yes! DenaSetu is 100% free for donors and volunteers. NGOs complete a simple verification process before activation.",
    },
    {
      q: "Can I donate money or only items?",
      a: "You can donate both. NGOs may accept monetary contributions via verified channels or physical goods like books, clothes, or electronics.",
    },
    {
      q: "How are NGOs verified?",
      a: "Every NGO submits legal registration documents (such as 12A/80G/FCRA certificates). Our team verifies authenticity before approval.",
    },
    {
      q: "Can I volunteer without donating?",
      a: "Absolutely! Volunteers can help with pickups, deliveries, campaigns, or community events without donating items.",
    },
    {
      q: "How do I track my donation?",
      a: "Once an NGO accepts your donation, you can track its status—from pickup to delivery—via your dashboard timeline.",
    },
    {
      q: "Can NGOs post campaigns?",
      a: "Yes, registered NGOs can create campaigns, upload gallery images, request volunteers, and manage donations.",
    },
    {
      q: "How does DenaSetu ensure safety?",
      a: "Each donor, volunteer, and NGO goes through an account verification process. All actions are tracked in the system.",
    },
  ];

  const filteredFAQ = faqs.filter((f) =>
    f.q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16 px-4">
      <div className="container mx-auto max-w-4xl">

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-3">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about donations, NGOs, volunteers, and the DenaSetu platform.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 mb-10 shadow-md border border-border/60 bg-card/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search your question..."
              className="focus:ring-2 ring-primary transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>

        {/* FAQ List */}
        <Accordion type="single" collapsible className="space-y-4">

          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((faq, idx) => (
              <Card
                key={idx}
                className="p-2 shadow-sm hover:shadow-md transition rounded-xl border border-border/50"
              >
                <AccordionItem value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mb-4 opacity-60" />
              <p className="text-lg">No results found for your question.</p>
            </div>
          )}

        </Accordion>
      </div>
    </div>
  );
}
