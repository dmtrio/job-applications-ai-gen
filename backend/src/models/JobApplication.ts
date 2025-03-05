import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema: Schema = new Schema({
  company: { type: String, required: true },
  companyUrl: { type: String },
  position: { type: String, required: true },
  jobPostingUrl: { type: String },
  applicationDate: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['applied', 'interview', 'offer', 'rejected'],
    default: 'applied'
  },
  description: { type: String },
  parsedJobDetails: {
    title: String,
    description: String,
    company: String
  }
}, {
  timestamps: true
});

export default mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema); 