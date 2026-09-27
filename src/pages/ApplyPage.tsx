import { useState } from "react";
import ApplyFormModal from "../components/ApplyFormModal";

export default function ApplyPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Apply for an Internship
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill out one form — we'll contact the company on your behalf.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="font-semibold text-base mb-4">
          How the application process works
        </h2>
        <div className="space-y-4">
          {[
            {
              step: "01",
              title: "Fill in your details",
              desc: "Complete the form with your personal info, university, and the company you're applying to. Company name is auto-searched.",
            },
            {
              step: "02",
              title: "Upload one document",
              desc: "Upload either your Resume or CV, then review your application details.",
            },
            {
              step: "03",
              title: "Pay securely with Paystack",
              desc: "Pay the GH₵4 application fee using mobile money, card, USSD, or bank transfer.",
            },
            {
              step: "04",
              title: "Submit and download",
              desc: "After payment, receive your application reference and download your application letter.",
            },
            {
              step: "05",
              title: "Track your application",
              desc: "Monitor your application and payment status from your Dashboard.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #F5B731, #d9a020)",
                  color: "#1a1f3a",
                }}
              >
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="w-full py-4 rounded-2xl text-white text-base font-bold hover:opacity-90 transition-opacity shadow-lg"
        style={{ background: "linear-gradient(135deg, #2D3561, #3d4a8a)" }}
      >
        Start Application Form →
      </button>

      {showModal && <ApplyFormModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
