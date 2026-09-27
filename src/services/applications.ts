export interface ApplicationRecord {
  reference: string;
  opportunity: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  applicationDate: string;
  status: "Submitted";
  paymentStatus: "Paid";
  paymentReference: string;
  resumeName: string;
}

const storageKey = "fortune-intern-applications";

export function loadApplications(): ApplicationRecord[] {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as ApplicationRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveApplication(
  application: Omit<ApplicationRecord, "reference">,
): ApplicationRecord {
  const record = {
    ...application,
    reference: `FIN-${Date.now().toString(36).toUpperCase()}`,
  };
  localStorage.setItem(
    storageKey,
    JSON.stringify([record, ...loadApplications()]),
  );
  return record;
}

export function downloadApplicationLetter(application: ApplicationRecord) {
  const letter = `FORTUNE INTERN NETWORK\n\nAPPLICATION LETTER\n\nDate: ${new Date(application.applicationDate).toLocaleDateString()}\nReference: ${application.reference}\n\nDear Hiring Team at ${application.company},\n\nI, ${application.applicantName}, am pleased to submit my application for the ${application.opportunity} opportunity. Thank you for reviewing my application.\n\nSincerely,\n${application.applicantName}\n${application.applicantEmail}`;
  const url = URL.createObjectURL(new Blob([letter], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${application.reference}-application-letter.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
