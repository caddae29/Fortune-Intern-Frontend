export type ApplicationStatus =
  | "Submitted"
  | "Under Review"
  | "Shortlisted"
  | "Accepted"
  | "Rejected"
  | "Withdrawn";
export type PaymentStatus =
  | "Payment Pending"
  | "Payment Successful"
  | "Payment Failed";

export interface ApplicationRecord {
  reference: string;
  ownerEmail: string;
  opportunity: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  studentIndexNumber: string;
  applicationDate: string;
  lastUpdated: string;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  resumeName: string;
  resumeType: string;
  resumeUploadedAt: string;
  applicationLetterAvailable: boolean;
  details?: Record<string, unknown>;
}

const storageKey = "fortune-intern-applications";

export function loadApplications(ownerEmail?: string): ApplicationRecord[] {
  try {
    const saved = localStorage.getItem(storageKey);
    const records = saved ? (JSON.parse(saved) as ApplicationRecord[]) : [];
    return ownerEmail
      ? records.filter(
          (record) =>
            record.ownerEmail === ownerEmail ||
            (!record.ownerEmail && record.applicantEmail === ownerEmail),
        )
      : records;
  } catch {
    return [];
  }
}

export function saveApplication(
  application: Omit<ApplicationRecord, "reference">,
): ApplicationRecord {
  const sequence = String(Date.now()).slice(-6).padStart(6, "0");
  const record: ApplicationRecord = {
    ...application,
    reference: `FIN-${new Date().getFullYear()}-${sequence}`,
  };
  localStorage.setItem(
    storageKey,
    JSON.stringify([record, ...loadApplications()]),
  );
  window.dispatchEvent(new Event("fortune-applications-updated"));
  return record;
}

export function downloadApplicationLetter(application: ApplicationRecord) {
  const letter = `FORTUNE INTERN NETWORK\n\nAPPLICATION LETTER\n\nDate: ${new Date(application.applicationDate).toLocaleDateString()}\nReference: ${application.reference}\nStudent Index Number: ${application.studentIndexNumber}\n\nDear Hiring Team at ${application.company},\n\nI, ${application.applicantName}, am pleased to submit my application for the ${application.opportunity} opportunity. Thank you for reviewing my application.\n\nSincerely,\n${application.applicantName}\n${application.applicantEmail}`;
  const url = URL.createObjectURL(new Blob([letter], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${application.reference}-application-letter.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
