import { JobApplication } from '../types/job';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  async getJobs(): Promise<JobApplication[]> {
    const response = await fetch(`${API_URL}/jobs`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return response.json();
  },

  async createJob(job: Omit<JobApplication, '_id'>): Promise<JobApplication> {
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });
    if (!response.ok) {
      throw new Error('Failed to create job');
    }
    return response.json();
  },

  async updateJob(id: string, job: Partial<JobApplication>): Promise<JobApplication> {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });
    if (!response.ok) {
      throw new Error('Failed to update job');
    }
    return response.json();
  },

  async deleteJob(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete job');
    }
  },
}; 