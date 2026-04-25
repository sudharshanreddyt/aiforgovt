export type DepartmentId = 'building' | 'fire' | 'ada' | 'zoning' | 'health' | 'mep';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'ai_reviewing'
  | 'dept_review'
  | 'approved'
  | 'conditional'
  | 'rejected'
  | 'resubmission_required';

export type DepartmentReviewStatus =
  | 'not_started'
  | 'in_queue'
  | 'ai_complete'
  | 'reviewer_assigned'
  | 'under_review'
  | 'approved'
  | 'conditional'
  | 'rejected';

export type FindingSeverity = 'critical' | 'warning' | 'info' | 'pass';

export type ReviewerAction = 'pending' | 'accepted' | 'overridden' | 'added' | 'dismissed';

export interface DepartmentConfig {
  id: DepartmentId;
  name: string;
  shortName: string;
  colorPrimary: string;
  colorDark: string;
  colorLight: string;
  colorBorder: string;
  codeAuthorities: string[];
  jurisdiction: string;
}

export interface ParcelData {
  address: string;
  ssl: string;
  zoningDistrict: string;
  overlayDistricts: string[];
  heightLimitFt: number;
  floodZone: string | null;
  historicStatus: string | null;
  ward: number;
  latitude: number;
  longitude: number;
}

export interface SubmittedDocument {
  id: string;
  applicationId: string;
  filename: string;
  documentType: 'architectural_plans' | 'mep_plans' | 'structural' | 'narrative' | 'city_form' | 'other';
  pageCount: number;
  uploadedAt: string;
  storageUrl: string;
}

export interface BoundingBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProjectSpace {
  id: string;
  name: string;
  areaSqFt: number;
  occupancyClass: string;
  occupantLoad: number;
  sheetRef: string;
}

export interface DoorEntry {
  id: string;
  location: string;
  clearWidthInches: number;
  swingDirection: string;
  isExitDoor: boolean;
  isAccessibleRoute: boolean;
  sheetRef: string;
  boundingBox: BoundingBox | null;
}

export interface EgressPath {
  id: string;
  from: string;
  to: string;
  widthInches: number;
  travelDistanceFt: number;
}

export interface PlumbingFixture {
  type: string;
  count: number;
  sheetRef: string;
}

export interface ProjectModel {
  occupancyClass: string;
  constructionType: string;
  totalAreaSqFt: number;
  floors: number;
  occupantLoad: number;
  spaces: ProjectSpace[];
  doors: DoorEntry[];
  egressPaths: EgressPath[];
  plumbingFixtures: PlumbingFixture[];
}

export interface Application {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  jurisdiction: string;
  address: string;
  projectType: string;
  projectDescription: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  parcelData: ParcelData | null;
  projectModel: ProjectModel | null;
  documents: SubmittedDocument[];
  departmentReviews: DepartmentReview[];
}

export interface Finding {
  id: string;
  applicationId: string;
  departmentId: DepartmentId;
  severity: FindingSeverity;
  title: string;
  description: string;
  codeAuthority: string;
  codeCitation: string;
  codeText: string;
  pageRef: string;
  boundingBox: BoundingBox | null;
  suggestedFix: string | null;
  aiConfidence: 'high' | 'medium' | 'low';
  reviewerAction: ReviewerAction;
  reviewerNote: string | null;
  reviewerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentReview {
  id: string;
  applicationId: string;
  departmentId: DepartmentId;
  status: DepartmentReviewStatus;
  reviewerId: string | null;
  reviewerName: string | null;
  findings: Finding[];
  decision: 'approved' | 'conditional' | 'rejected' | null;
  decisionNote: string | null;
  reviewLetterDraft: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface AIReviewRequest {
  applicationId: string;
  documentUrls: string[];
  parcelData: ParcelData;
  departments: DepartmentId[];
}

export interface AIAgentStatus {
  departmentId: DepartmentId;
  status: 'queued' | 'running' | 'complete' | 'failed';
  checksComplete: number;
  checksTotal: number;
  currentAction: string;
  elapsedMs: number;
}

export interface AIReviewProgress {
  applicationId: string;
  overallStatus: 'running' | 'complete' | 'failed';
  agents: AIAgentStatus[];
  startedAt: string;
  estimatedCompletionMs: number;
}

export interface Notification {
  id: string;
  applicantId: string;
  applicationId: string;
  departmentId: DepartmentId | null;
  type: 'dept_approved' | 'dept_conditional' | 'dept_rejected' | 'all_complete' | 'resubmission_needed';
  message: string;
  sentAt: string;
  isRead: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
