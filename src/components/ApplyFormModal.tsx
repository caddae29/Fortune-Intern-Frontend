import { useState } from "react";
import {
  downloadApplicationLetter,
  saveApplication,
} from "../services/applications";

const universities = [
  "University of Ghana",
  "KNUST",
  "University of Cape Coast",
  "Ashesi University",
  "University of Education, Winneba",
  "University for Development Studies",
  "University of Health and Allied Sciences",
  "University of Professional Studies, Accra",
  "Ghana Institute of Management and Public Administration (GIMPA)",
  "University of Energy and Natural Resources",
  "University of Mines and Technology",
  "Accra Technical University",
  "Other",
];
const partnerCompanies = [
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
const years = [
  "Level 100",
  "Level 200",
  "Level 300",
  "Level 400",
  "Level 500",
  "Other",
];

type PaystackWindow = typeof window & {
  PaystackPop?: {
    setup: (options: Record<string, unknown>) => { openIframe: () => void };
  };
};
function loadPaystack() {
  const w = window as PaystackWindow;
  if (w.PaystackPop) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

interface Props {
  prefilledCompany?: string;
  prefilledRole?: string;
  ownerEmail?: string;
  onClose: () => void;
  onViewApplications?: () => void;
  onBackDashboard?: () => void;
}
export default function ApplyFormModal({
  prefilledCompany = "",
  prefilledRole = "",
  ownerEmail = "",
  onClose,
  onViewApplications,
  onBackDashboard,
}: Props) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    email: ownerEmail,
    institution: "",
    otherInstitution: "",
    program: "",
    year: "",
    indexNumber: "",
    companyName: prefilledCompany,
    companyAddress: "",
    suggestedCompany: "",
  });
  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const validate = () => {
    const required: Array<keyof typeof form> = [
      "firstName",
      "lastName",
      "gender",
      "phone",
      "email",
      "institution",
      "program",
      "year",
      "indexNumber",
      "companyName",
      "companyAddress",
    ];
    const missing = required.find((key) => !form[key].trim());
    if (missing) return "Please complete all required fields.";
    if (form.institution === "Other" && !form.otherInstitution.trim())
      return "Please specify your institution.";
    if (!/^0\d{9}$/.test(form.phone))
      return "Enter a valid Ghanaian phone number using 10 digits.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return "Please enter a valid email address.";
    if (!/^\d{7,8}$/.test(form.indexNumber.trim()))
      return "Enter a valid 7- or 8-digit index number.";
    return "";
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    setLoading(true);
    const paystack = window as PaystackWindow;
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (publicKey && (await loadPaystack()) && paystack.PaystackPop) {
      paystack.PaystackPop.setup({
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
              value: `${form.firstName} ${form.lastName}`,
            },
            {
              display_name: "Index Number",
              variable_name: "index_number",
              value: form.indexNumber,
            },
          ],
        },
        callback: (response: { reference: string }) =>
          complete(response.reference),
        onClose: () => setLoading(false),
      }).openIframe();
      return;
    }
    setLoading(false);
    setError(
      "Secure payment is currently unavailable. Please try again later.",
    );
  };
  const complete = (paymentReference: string) => {
    const now = new Date().toISOString();
    const application = saveApplication({
      ownerEmail: ownerEmail || form.email.trim().toLowerCase(),
      opportunity: prefilledRole || "Internship Application",
      company: form.companyName,
      applicantName: `${form.firstName} ${form.lastName}`.trim(),
      applicantEmail: form.email,
      studentIndexNumber: form.indexNumber.trim(),
      applicationDate: now,
      lastUpdated: now,
      status: "Submitted",
      paymentStatus: "Payment Successful",
      paymentReference,
      resumeName: resume?.name || "",
      resumeType: resume ? "PDF" : "Not uploaded",
      resumeUploadedAt: resume ? now : "",
      applicationLetterAvailable: true,
      details: { personalInformation: form, paymentAmount: 4, currency: "GHS" },
    });
    setReference(application.reference);
    setLoading(false);
    setStep("success");
  };
  if (step === "success")
    return (
      <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center">
          <h2 className="text-2xl font-bold">
            Application Submitted Successfully
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            Your internship application has been submitted successfully.
          </p>
          <p className="text-sm font-semibold text-emerald-700 mt-3">
            Your payment of GH₵4 has been received.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Reference: {reference}
          </p>
          <button
            onClick={onViewApplications || onClose}
            className="w-full mt-6 py-3 rounded-xl bg-primary text-white font-semibold"
          >
            View My Applications
          </button>
          <button
            onClick={onBackDashboard || onClose}
            className="w-full mt-3 py-3 rounded-xl border border-border text-sm font-semibold"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() =>
              downloadApplicationLetter({
                reference,
                ownerEmail: ownerEmail || form.email,
                opportunity: prefilledRole || "Internship Application",
                company: form.companyName,
                applicantName: `${form.firstName} ${form.lastName}`.trim(),
                applicantEmail: form.email,
                studentIndexNumber: form.indexNumber,
                applicationDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                status: "Submitted",
                paymentStatus: "Payment Successful",
                paymentReference: reference,
                resumeName: resume?.name || "",
                resumeType: "PDF",
                resumeUploadedAt: new Date().toISOString(),
                applicationLetterAvailable: true,
              })
            }
            className="mt-4 text-xs text-primary underline"
          >
            Download Application Letter
          </button>
        </div>
      </div>
    );
  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">Complete Internship Application</h2>
          <button
            onClick={onClose}
            aria-label="Close application form"
            className="text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-7">
          <Section title="Personal Information">
            <Field
              label="First Name *"
              instruction="Enter your official first name as it appears on your student ID or legal documents."
              value={form.firstName}
              onChange={(v) => set("firstName", v)}
            />
            <Field
              label="Last Name *"
              instruction="Enter your official family name/surname."
              value={form.lastName}
              onChange={(v) => set("lastName", v)}
            />
            <Select
              label="Gender *"
              instruction="Select your gender (Options: Male / Female)."
              value={form.gender}
              onChange={(v) => set("gender", v)}
              options={["Male", "Female"]}
            />
            <Field
              label="Phone Number *"
              instruction="Enter a valid active phone number (digits only, e.g., 054XXXXXXX)."
              value={form.phone}
              onChange={(v) => set("phone", v.replace(/\D/g, ""))}
              placeholder="054XXXXXXX"
            />
            <Field
              label="Email Address *"
              instruction="Enter your primary active email address where you will receive your internship letter."
              value={form.email}
              onChange={(v) => set("email", v)}
              type="email"
            />
          </Section>
          <Section title="Academic Information">
            <Select
              label="Institution Name *"
              instruction={
                'Select your university — top 12 in Ghana listed first. Choose "Other" to specify.'
              }
              value={form.institution}
              onChange={(v) => set("institution", v)}
              options={universities}
            />
            <>
              {form.institution === "Other" && (
                <Field
                  label="Specify Institution *"
                  value={form.otherInstitution}
                  onChange={(v) => set("otherInstitution", v)}
                />
              )}
            </>
            <Field
              label="Program / Course of Study *"
              instruction="Enter your exact course of study (e.g., Geomatics Engineering)."
              value={form.program}
              onChange={(v) => set("program", v)}
            />
            <Select
              label="Year of Study *"
              instruction="Select your current academic year."
              value={form.year}
              onChange={(v) => set("year", v)}
              options={years}
            />
            <Field
              label="Index Number *"
              instruction="Enter your official student ID or registration index number."
              value={form.indexNumber}
              onChange={(v) => set("indexNumber", v.replace(/\s/g, ""))}
              placeholder="1234567"
              inputMode="numeric"
            />
          </Section>
          <Section title="Company / Placement Information">
            <Field
              label="Company / Organization Name *"
              instruction="Enter the host company or organization name where you are doing your internship."
              value={form.companyName}
              onChange={(v) => set("companyName", v)}
            />
            <Field
              label="Company Address *"
              instruction="Enter the complete postal or physical address of the host company."
              value={form.companyAddress}
              onChange={(v) => set("companyAddress", v)}
            />
            <Select
              label="Suggested Company for Internship"
              instruction="Select your preferred company placement from the partner list."
              value={form.suggestedCompany}
              onChange={(v) => set("suggestedCompany", v)}
              options={partnerCompanies}
            />
            <div>
              <label className="block text-sm font-semibold">
                Upload Resume (PDF) – Optional
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Upload your resume in PDF format.
              </p>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="mt-3 block w-full text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.type !== "application/pdf") {
                    setError("Resume must be a PDF file.");
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    setError("Resume must be smaller than 5MB.");
                    return;
                  }
                  setResume(file);
                  setError("");
                }}
              />
              {resume ? (
                <p className="text-xs text-emerald-700 mt-2">
                  Uploaded: {resume.name}{" "}
                  <button
                    type="button"
                    onClick={() => setResume(null)}
                    className="underline ml-2"
                  >
                    Remove / replace
                  </button>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  Not uploaded
                </p>
              )}
            </div>
          </Section>
          <Section title="Payment & Submission">
            <p className="text-sm font-semibold">
              One-time application fee: GH₵4
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Paid on submission
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-3" role="alert">
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="w-full mt-5 py-3.5 rounded-xl bg-primary text-white font-bold disabled:opacity-60"
            >
              {loading
                ? "Opening secure payment..."
                : "Pay and Submit · GH₵4 →"}
            </button>
          </Section>
        </form>
      </div>
    </div>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-base font-bold text-primary border-b border-border pb-2 mb-4">
        {title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}
function Field({
  label,
  instruction,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  instruction?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric";
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {instruction && (
        <span className="block text-xs text-muted-foreground mt-1">
          {instruction}
        </span>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        className="mt-2 w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2"
      />
    </label>
  );
}
function Select({
  label,
  instruction,
  value,
  onChange,
  options,
}: {
  label: string;
  instruction?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {instruction && (
        <span className="block text-xs text-muted-foreground mt-1">
          {instruction}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
      >
        <option value="">— Select —</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
