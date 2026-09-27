import { useState, useEffect } from "react";
import {
  saveApplication,
  downloadApplicationLetter,
} from "../services/applications";

const allCompanies = [
  "Flutterwave",
  "Access Bank Ghana",
  "Andela",
  "MTN Ghana",
  "Vodafone Ghana",
  "GCB Bank",
  "Hubtel",
  "Farmerline",
  "Ecobank Ghana",
  "Stanbic Bank Ghana",
  "Absa Ghana",
  "Fidelity Bank Ghana",
  "AirtelTigo Ghana",
  "Ghana Revenue Authority",
  "Agricultural Development Bank",
  "TechGhana",
  "Jumia Ghana",
  "Zipline Ghana",
  "mPharma",
  "Zooto",
  "Paystack Ghana",
  "Interswitch Ghana",
  "Omni Bank",
];

const ghanaUniversities = [
  "Academic City University College",
  "Accra Institute of Technology",
  "Accra Technical University",
  "African University College of Communications",
  "Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development",
  "All Nations University",
  "Ashesi University",
  "Baldwin University College",
  "BlueCrest University College",
  "Bolgatanga Technical University",
  "C. K. Tedam University of Technology and Applied Sciences",
  "Cape Coast Technical University",
  "Catholic University of Ghana",
  "Central University",
  "Christian Service University College",
  "Data Link Institute of Business and Technology",
  "Dominion University College",
  "Ensign Global College",
  "Ghana Baptist University College",
  "Ghana Christian University College",
  "Ghana Communication Technology University",
  "Ghana Institute of Journalism",
  "Ghana Institute of Languages",
  "Ghana Institute of Management and Public Administration (GIMPA)",
  "Ghana Institute of Surveying and Mapping",
  "Ghana Technology University College",
  "Garden City University College",
  "Heritage Christian University College",
  "Ho Technical University",
  "Jayee University College",
  "KAAF University College",
  "Kessben University College",
  "Koforidua Technical University",
  "Knutsford University College",
  "Kwame Nkrumah University of Science and Technology (KNUST)",
  "Kumasi Technical University",
  "Lancaster University Ghana",
  "Methodist University Ghana",
  "Mountcrest University College",
  "Pentecost University",
  "Presbyterian University Ghana",
  "Radford University College",
  "Regent University College of Science and Technology",
  "Regional Maritime University",
  "Simon Diedong Dombo University of Business and Integrated Development Studies",
  "Sunyani Technical University",
  "Takoradi Technical University",
  "Tamale Technical University",
  "University College of Management Studies",
  "University for Development Studies",
  "University of Cape Coast",
  "University of Education, Winneba",
  "University of Energy and Natural Resources",
  "University of Ghana",
  "University of Health and Allied Sciences",
  "University of Mines and Technology",
  "University of Professional Studies, Accra",
  "Valley View University",
  "Wa Technical University",
  "Webster University Ghana",
  "West End University College",
  "Wisconsin International University College",
  "Zenith University College",
  "Other",
];

const internshipTypes = [
  "Software Engineering",
  "Finance",
  "Marketing",
  "Data Analytics",
  "Product Management",
  "Operations",
  "Human Resources",
  "Legal",
  "Design/UX",
  "Research",
  "Communications",
  "Accounting",
  "Other",
];

type PaystackWindow = typeof window & {
  PaystackPop?: {
    setup: (options: Record<string, unknown>) => { openIframe: () => void };
  };
};

function loadPaystackInline() {
  const paystackWindow = window as PaystackWindow;
  if (paystackWindow.PaystackPop) return Promise.resolve(true);

  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-fin-paystack]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.dataset.finPaystack = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

interface ApplyFormModalProps {
  prefilledCompany?: string;
  prefilledRole?: string;
  ownerEmail?: string;
  onClose: () => void;
}

export default function ApplyFormModal({
  prefilledCompany = "",
  prefilledRole = "",
  ownerEmail = "",
  onClose,
}: ApplyFormModalProps) {
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [universitySuggestions, setUniversitySuggestions] = useState<string[]>(
    [],
  );
  const [universityMenuOpen, setUniversityMenuOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    studentIndexNumber: "",
    university: "",
    programme: "",
    level: "",
    company: prefilledCompany,
    role: prefilledRole || "",
    type: "",
    coverNote: "",
    gpa: "",
    availability: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [indexError, setIndexError] = useState("");

  useEffect(() => {
    if (form.company.length >= 2 && !prefilledCompany) {
      const matches = allCompanies
        .filter((c) => c.toLowerCase().includes(form.company.toLowerCase()))
        .slice(0, 5);
      setCompanySuggestions(matches);
    } else {
      setCompanySuggestions([]);
    }
  }, [form.company, prefilledCompany]);

  useEffect(() => {
    const query = form.university.trim().toLowerCase();
    const matches = query
      ? ghanaUniversities.filter((university) =>
          university.toLowerCase().includes(query),
        )
      : ghanaUniversities;
    setUniversitySuggestions(matches);
  }, [form.university]);

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const indexNumber = form.studentIndexNumber.trim();
    if (!/^\d{7,8}$/.test(indexNumber)) {
      setIndexError(
        "Enter a valid 7- or 8-digit student index number, for example 1234567.",
      );
      return;
    }
    if (!resumeFile) {
      setFileError("Please upload one Resume or CV before continuing.");
      return;
    }
    setStep("payment");
  };

  const completeApplication = (reference: string) => {
    const application = saveApplication({
      opportunity: form.role || form.type,
      ownerEmail: ownerEmail || form.email.trim().toLowerCase(),
      company: form.company,
      applicantName: form.fullName,
      applicantEmail: form.email,
      studentIndexNumber: form.studentIndexNumber.trim(),
      applicationDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: "Submitted",
      paymentStatus: "Payment Successful",
      paymentReference: reference,
      resumeName: resumeFile?.name || "",
      resumeType: resumeFile?.name.toLowerCase().endsWith(".docx")
        ? "DOCX"
        : resumeFile?.name.toLowerCase().endsWith(".doc")
          ? "DOC"
          : "PDF",
      resumeUploadedAt: new Date().toISOString(),
      applicationLetterAvailable: true,
    });
    setPaymentReference(application.reference);
    setStep("success");
  };

  const handlePayment = async () => {
    setLoading(true);
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    const paystackWindow = window as PaystackWindow;

    if (
      publicKey &&
      (await loadPaystackInline()) &&
      paystackWindow.PaystackPop
    ) {
      setLoading(false);
      paystackWindow.PaystackPop.setup({
        key: publicKey,
        email: form.email,
        amount: 400,
        currency: "GHS",
        ref: `FIN-${Date.now()}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Applicant",
              variable_name: "applicant",
              value: form.fullName,
            },
            {
              display_name: "Company",
              variable_name: "company",
              value: form.company,
            },
          ],
        },
        callback: (response: { reference: string }) => {
          completeApplication(response.reference);
        },
        onClose: () => setLoading(false),
      }).openIframe();
      return;
    }

    await new Promise((r) => setTimeout(r, 1400));
    completeApplication(`FIN-DEMO-${Date.now().toString().slice(-6)}`);
    setLoading(false);
    setStep("success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto slide-in">
        {step === "form" ? (
          <>
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2
                  className="font-bold text-lg"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Apply for Internship
                </h2>
                {prefilledCompany && (
                  <p className="text-xs text-muted-foreground">
                    {prefilledRole} @ {prefilledCompany}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Personal details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Personal Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field
                    label="Full Name *"
                    value={form.fullName}
                    onChange={(v) => set("fullName", v)}
                    placeholder="Kwame Asante"
                    required
                  />
                  <Field
                    label="Email Address *"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    placeholder="kwame@email.com"
                    type="email"
                    required
                  />
                  <Field
                    label="Phone Number *"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    placeholder="+233 20 000 0000"
                    required
                  />
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Index Number *
                    </label>
                    <input
                      value={form.studentIndexNumber}
                      required
                      inputMode="numeric"
                      maxLength={8}
                      onChange={(event) => {
                        set(
                          "studentIndexNumber",
                          event.target.value.replace(/\s/g, ""),
                        );
                        setIndexError("");
                      }}
                      placeholder="Enter your student index number"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2"
                    />
                    {indexError && (
                      <p className="text-xs text-red-600 mt-1.5" role="alert">
                        {indexError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Level *
                    </label>
                    <select
                      value={form.level}
                      required
                      onChange={(e) => set("level", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2"
                    >
                      <option value="">Select level</option>
                      {["100", "200", "300", "400", "Graduate"].map((l) => (
                        <option key={l}>Level {l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-semibold mb-1.5">
                      University *
                    </label>
                    <input
                      value={form.university}
                      required
                      onFocus={() => setUniversityMenuOpen(true)}
                      onBlur={() =>
                        setTimeout(() => setUniversityMenuOpen(false), 150)
                      }
                      onChange={(e) => {
                        set("university", e.target.value);
                        setUniversityMenuOpen(true);
                      }}
                      placeholder="Start typing your university..."
                      autoComplete="off"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2"
                    />
                    {universityMenuOpen && universitySuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-xl shadow-xl z-30 overflow-y-auto mt-1 max-h-56">
                        <p className="sticky top-0 bg-secondary px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Ghana universities
                        </p>
                        {universitySuggestions.map((university) => (
                          <button
                            key={university}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              set("university", university);
                              setUniversityMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-secondary transition-colors border-b border-border last:border-0"
                          >
                            {university}
                          </button>
                        ))}
                      </div>
                    )}
                    {universityMenuOpen &&
                      universitySuggestions.length === 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-xl shadow-lg z-30 mt-1 px-4 py-3 text-xs text-muted-foreground">
                          No matching university. Select “Other” or check the
                          spelling.
                        </div>
                      )}
                  </div>
                  <Field
                    label="Programme / Major"
                    value={form.programme}
                    onChange={(v) => set("programme", v)}
                    placeholder="Computer Science"
                  />
                </div>
              </div>

              {/* Internship details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Internship Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Company search */}
                  <div className="relative sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1.5">
                      Company Name *
                    </label>
                    <input
                      value={form.company}
                      required
                      onChange={(e) => set("company", e.target.value)}
                      placeholder="Type to search companies..."
                      readOnly={!!prefilledCompany}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2"
                    />
                    {companySuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-xl shadow-lg z-20 overflow-hidden mt-1">
                        {companySuggestions.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              set("company", c);
                              setCompanySuggestions([]);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Internship Type *
                    </label>
                    <select
                      value={form.type}
                      required
                      onChange={(e) => set("type", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2"
                    >
                      <option value="">Select type</option>
                      {internshipTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <Field
                    label="Specific Role Title"
                    value={form.role}
                    onChange={(v) => set("role", v)}
                    placeholder="e.g. Software Engineering Intern"
                  />
                  <Field
                    label="CGPA"
                    value={form.gpa}
                    onChange={(v) => set("gpa", v)}
                    placeholder="e.g. 3.5 / 4.0"
                  />
                  <Field
                    label="Availability (Start Date)"
                    value={form.availability}
                    onChange={(v) => set("availability", v)}
                    placeholder="e.g. October 1, 2026"
                  />
                </div>
              </div>

              {/* Cover note */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Cover Note
                </h3>
                <textarea
                  value={form.coverNote}
                  onChange={(e) => set("coverNote", e.target.value)}
                  placeholder="Briefly explain why you want this internship and what you'd bring to the team (2–3 sentences)..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 resize-none"
                />
              </div>

              {/* Resume */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Resume / CV
                </h3>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                  <svg
                    className="w-8 h-8 text-muted-foreground mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Upload either your Resume or CV. Please upload only one
                    document.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, or DOCX (max 5MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const allowed = [
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ];
                      if (
                        !allowed.includes(file.type) ||
                        file.size > 5 * 1024 * 1024
                      ) {
                        setResumeFile(null);
                        setFileError(
                          "Please select a PDF, DOC, or DOCX file no larger than 5MB.",
                        );
                        return;
                      }
                      setResumeFile(file);
                      setFileError("");
                    }}
                  />
                </label>
                {resumeFile && (
                  <div className="flex items-center justify-between gap-3 text-xs text-emerald-700 mt-2 font-medium">
                    <span>
                      ✓ {resumeFile.name} (
                      {resumeFile.type === "application/pdf"
                        ? "PDF"
                        : resumeFile.name.toLowerCase().endsWith(".docx")
                          ? "DOCX"
                          : "DOC"}
                      )
                    </span>
                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="text-primary underline"
                    >
                      Remove / replace
                    </button>
                  </div>
                )}
                {fileError && (
                  <p className="text-xs text-red-600 mt-1.5" role="alert">
                    {fileError}
                  </p>
                )}
              </div>

              <div className="bg-gold-light border border-amber-200 rounded-xl p-4 text-sm">
                <p className="font-semibold text-amber-800 mb-1">
                  AI-assisted application
                </p>
                <p className="text-amber-700 text-xs">
                  After submission, our AI will draft a personalized internship
                  letter and send a professional email to{" "}
                  {form.company || "the company"}'s HR department on your
                  behalf.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #2D3561, #3d4a8a)",
                  }}
                >
                  Continue to secure payment
                </button>
              </div>
            </form>
          </>
        ) : step === "payment" ? (
          <div className="p-6 sm:p-8">
            <button
              onClick={() => setStep("form")}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
            >
              ← Back to application
            </button>
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5">
              <svg
                className="w-7 h-7 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v2m-4-2V8a4 4 0 118 0v3m-9 10h10a2 2 0 002-2v-6a2 2 0 00-2-2H11a2 2 0 00-2 2v6a2 2 0 002 2zM3 7h4m-4 4h4m-4 4h4"
                />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Final step
            </p>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Pay before submission
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Your application is ready. Complete the one-time fee securely with
              Paystack before FIN sends it to {form.company}.
            </p>

            <div className="border border-border rounded-2xl overflow-hidden mb-5">
              <div className="p-4 bg-muted/30 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {form.role || form.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.company}
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary">
                  Ready
                </span>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application Fee</span>
                  <span className="font-semibold">GH₵4</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">GH₵4</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-primary mb-1">
                Included with this application
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI-edited internship letter, CV delivery, email to the company
                on your behalf, and live status tracking.
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 gradient-hero"
            >
              {loading
                ? "Opening secure checkout..."
                : "Pay GH₵4 with Paystack"}
            </button>
            <p className="text-center text-[11px] text-muted-foreground mt-3">
              Card, mobile money, bank transfer and USSD supported.
            </p>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl"
              style={{
                background: "linear-gradient(135deg, #F5B731, #d9a020)",
              }}
            >
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Application Submitted Successfully
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Your application for <strong>{form.role || form.type}</strong> has
              been submitted successfully.
            </p>
            <div className="bg-secondary rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Opportunity:</span>{" "}
                {form.role || form.type}
              </div>
              <div>
                <span className="text-muted-foreground">Reference:</span>{" "}
                {paymentReference}
              </div>
              <div>
                <span className="text-muted-foreground">Submission date:</span>{" "}
                {new Date().toLocaleDateString()}
              </div>
              <div>
                <span className="text-muted-foreground">
                  Application status:
                </span>{" "}
                Submitted
              </div>
              <div>
                <span className="text-muted-foreground">Payment status:</span>{" "}
                Paid
              </div>
            </div>
            <button
              onClick={() =>
                downloadApplicationLetter({
                  reference: paymentReference,
                  ownerEmail: ownerEmail || form.email.trim().toLowerCase(),
                  opportunity: form.role || form.type,
                  company: form.company,
                  applicantName: form.fullName,
                  applicantEmail: form.email,
                  studentIndexNumber: form.studentIndexNumber.trim(),
                  applicationDate: new Date().toISOString(),
                  lastUpdated: new Date().toISOString(),
                  status: "Submitted",
                  paymentStatus: "Payment Successful",
                  paymentReference,
                  resumeName: resumeFile?.name || "",
                  resumeType: "Resume / CV",
                  resumeUploadedAt: new Date().toISOString(),
                  applicationLetterAvailable: true,
                })
              }
              className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:opacity-90 transition-opacity mb-3"
            >
              Download Application Letter
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(135deg, #2D3561, #3d4a8a)",
              }}
            >
              Back to Programs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2"
      />
    </div>
  );
}
