import { useEffect, useState } from "react";
import {
  downloadApplicationLetter,
  loadApplications,
  type ApplicationRecord,
} from "../services/applications";

const applications = [
  {
    id: 1,
    company: "Flutterwave",
    role: "Software Engineering Intern",
    logo: "FL",
    color: "#F5B731",
    status: "interview",
    stage: "Technical Interview",
    date: "Sep 18, 2026",
    lastUpdate: "2 hours ago",
  },
  {
    id: 2,
    company: "Access Bank Ghana",
    role: "Finance Intern",
    logo: "AB",
    color: "#2D3561",
    status: "review",
    stage: "Under Review",
    date: "Sep 20, 2026",
    lastUpdate: "1 day ago",
  },
  {
    id: 3,
    company: "Andela",
    role: "Product Management Intern",
    logo: "AN",
    color: "#10B981",
    status: "offered",
    stage: "Offer Extended!",
    date: "Sep 15, 2026",
    lastUpdate: "3 days ago",
  },
  {
    id: 4,
    company: "MTN Ghana",
    role: "Marketing Intern",
    logo: "MT",
    color: "#FBBF24",
    status: "applied",
    stage: "Application Sent",
    date: "Sep 22, 2026",
    lastUpdate: "5 hours ago",
  },
  {
    id: 5,
    company: "Vodafone Ghana",
    role: "Data Analytics Intern",
    logo: "VF",
    color: "#EF4444",
    status: "rejected",
    stage: "Not Selected",
    date: "Sep 10, 2026",
    lastUpdate: "1 week ago",
  },
];

const automationLogs = [
  {
    time: "09:45 AM",
    action: "AI letter sent to Flutterwave HR (hr@flutterwave.com)",
    icon: "📧",
  },
  {
    time: "09:43 AM",
    action: "Application letter personalized for Flutterwave role",
    icon: "🤖",
  },
  {
    time: "Yesterday",
    action: "Follow-up email sent to Access Bank recruiter",
    icon: "📧",
  },
  {
    time: "Yesterday",
    action: 'Status updated: Access Bank → "Under Review"',
    icon: "🔄",
  },
  {
    time: "2 days ago",
    action: "Interview invitation received from Flutterwave",
    icon: "📩",
  },
  {
    time: "3 days ago",
    action: "Offer letter received from Andela 🎉",
    icon: "🎉",
  },
];

const statusLabel: Record<string, string> = {
  applied: "Applied",
  review: "In Review",
  interview: "Interview",
  offered: "Offered",
  rejected: "Rejected",
};
const stages = ["applied", "review", "interview", "offered"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "offers">(
    "all",
  );
  const [submittedApplications, setSubmittedApplications] = useState<
    ApplicationRecord[]
  >([]);

  useEffect(() => setSubmittedApplications(loadApplications()), []);

  const filtered = applications.filter((a) => {
    if (activeTab === "active")
      return ["applied", "review", "interview"].includes(a.status);
    if (activeTab === "offers") return a.status === "offered";
    return true;
  });

  const counts = {
    total: applications.length,
    active: applications.filter((a) =>
      ["applied", "review", "interview"].includes(a.status),
    ).length,
    offers: applications.filter((a) => a.status === "offered").length,
    interviews: applications.filter((a) => a.status === "interview").length,
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <div className="mb-5">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time tracking of your internship applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Applied",
            value: counts.total,
            icon: "📋",
            bg: "#EEF0F8",
            text: "#2D3561",
          },
          {
            label: "Active",
            value: counts.active,
            icon: "⚡",
            bg: "#FEF3C7",
            text: "#d97706",
          },
          {
            label: "Interviews",
            value: counts.interviews,
            icon: "🎤",
            bg: "#ede9fe",
            text: "#7c3aed",
          },
          {
            label: "Offers",
            value: counts.offers,
            icon: "🎉",
            bg: "#dcfce7",
            text: "#16a34a",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-border rounded-xl p-4 shadow-sm"
          >
            <div
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-lg mb-2"
              style={{ backgroundColor: s.bg }}
            >
              {s.icon}
            </div>
            <div
              className="text-2xl font-bold"
              style={{ fontFamily: "Inter, sans-serif", color: s.text }}
            >
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {submittedApplications.length > 0 && (
        <section className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-semibold text-sm mb-4">Submitted Applications</h2>
          <div className="space-y-3">
            {submittedApplications.map((application) => (
              <article
                key={application.reference}
                className="border border-border rounded-xl p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">
                      {application.opportunity}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {application.company}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(
                        application.applicationDate,
                      ).toLocaleDateString()}{" "}
                      · {application.reference}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                      {application.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-secondary text-primary font-semibold">
                      Payment {application.paymentStatus}
                    </span>
                    <button
                      onClick={() => downloadApplicationLetter(application)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white font-semibold hover:opacity-90"
                    >
                      Download Letter
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Applications */}
        <div className="lg:col-span-2">
          <div className="flex gap-1 bg-muted rounded-xl p-1 mb-4 w-fit">
            {(["all", "active", "offers"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === t ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.map((app) => {
              const currentIdx = stages.indexOf(app.status);
              return (
                <div
                  key={app.id}
                  className="bg-white border border-border rounded-2xl p-4 shadow-sm hover-lift"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: app.color,
                        color: ["#F5B731", "#FBBF24"].includes(app.color)
                          ? "#1a1f3a"
                          : "white",
                      }}
                    >
                      {app.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{app.role}</p>
                          <p className="text-xs text-muted-foreground">
                            {app.company}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium status-${app.status}`}
                        >
                          {statusLabel[app.status]}
                        </span>
                      </div>
                      {/* Progress */}
                      <div className="mt-3">
                        <div className="flex gap-1 mb-1">
                          {stages.map((s, i) => (
                            <div
                              key={s}
                              className="h-1.5 flex-1 rounded-full transition-colors"
                              style={{
                                background:
                                  app.status === "rejected"
                                    ? "#fecaca"
                                    : i <= currentIdx
                                      ? i === currentIdx
                                        ? "#F5B731"
                                        : "#10B981"
                                      : "#e5e7eb",
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">
                            {app.stage}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.lastUpdate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automation log */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <h3 className="font-semibold text-sm">Live Automation Log</h3>
          </div>
          <div className="space-y-3">
            {automationLogs.map((log, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm flex-shrink-0">
                    {log.icon}
                  </div>
                  {i < automationLogs.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1.5" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-xs text-foreground leading-relaxed">
                    {log.action}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-emerald-50 rounded-xl">
            <p className="text-xs text-emerald-700 font-medium">
              ✓ All systems running. 3 emails queued for tomorrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
