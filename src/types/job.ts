export interface JobApplication {
  _id?: string;
  company: string;
  companyUrl?: string;
  position: string;
  jobPostingUrl?: string;
  applicationDate: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  description?: string;
  parsedJobDetails?: {
    title?: string;
    description?: string;
    company?: string;
  };
  createdAt?: string;
  updatedAt?: string;
} 