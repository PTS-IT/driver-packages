export type PensionPotType = "workplace" | "personal" | "defined_benefit" | "state" | "other";

export type PensionPotStatus = "active" | "transferred" | "closed";

export interface PensionPot {
  id: string;
  provider: string;
  type: PensionPotType;
  estimatedValue: number | null;
  referenceNumber: string;
  lastUpdated: string; // ISO date, when the user last checked this pot's value
  contactPhone: string;
  contactEmail: string;
  notes: string;
  status: PensionPotStatus;
}

export type LeadStatus = "not_started" | "researching" | "contacted" | "found" | "dead_end";

export interface LostPensionLead {
  id: string;
  employerName: string;
  approxStartYear: string;
  approxEndYear: string;
  providerNameIfKnown: string;
  status: LeadStatus;
  notes: string;
}

export interface ChecklistState {
  [stepId: string]: boolean;
}
