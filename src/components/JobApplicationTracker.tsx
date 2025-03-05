import { Edit, Link, Save, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { JobApplication } from '../types/job';
import { api } from '../services/api';

const JobApplicationTracker = () => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [formData, setFormData] = useState<Omit<JobApplication, '_id'>>({
    company: '',
    companyUrl: '',
    position: '',
    jobPostingUrl: '',
    applicationDate: '',
    status: 'applied',
    description: '',
    parsedJobDetails: null
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load jobs from API on initial render
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (err) {
      setError('Failed to load job applications');
      console.error('Error loading jobs:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const parseJobPosting = async () => {
    const { jobPostingUrl } = formData;
    
    if (!jobPostingUrl) {
      setError('Please provide a job posting URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Proxy server to handle CORS and fetch job posting content
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(jobPostingUrl));
      
      if (!response.ok) {
        throw new Error('Failed to fetch job posting');
      }

      const htmlContent = await response.text();
      const parsedDetails = extractJobDetails(htmlContent);

      setFormData(prev => ({
        ...prev,
        parsedJobDetails: parsedDetails,
        description: parsedDetails.description || prev.description
      }));
    } catch (err) {
      setError('Error parsing job posting: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Basic job details extraction (can be expanded)
  const extractJobDetails = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Try various common selectors for job details
    const extractText = (selectors: string[]) => {
      for (let selector of selectors) {
        const element = doc.querySelector(selector);
        if (element) return element.textContent?.trim() || null;
      }
      return null;
    };

    return {
      title: extractText([
        'h1.job-title', 
        'title', 
        'h1', 
        'meta[property="og:title"]'
      ]),
      description: extractText([
        '.job-description', 
        '#job-description', 
        '.description', 
        'article', 
        'main'
      ]),
      company: extractText([
        'meta[property="og:site_name"]', 
        '.company-name', 
        'h2.company'
      ])
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        // Update existing job
        const updatedJob = await api.updateJob(editingId, formData);
        setJobs(prev => prev.map(job => job._id === editingId ? updatedJob : job));
        setEditingId(null);
      } else {
        // Add new job
        const newJob = await api.createJob(formData);
        setJobs(prev => [...prev, newJob]);
      }

      // Reset form
      setFormData({
        company: '',
        companyUrl: '',
        position: '',
        jobPostingUrl: '',
        applicationDate: '',
        status: 'applied',
        description: '',
        parsedJobDetails: null
      });
    } catch (err) {
      setError('Failed to save job application');
      console.error('Error saving job:', err);
    }
  };

  const handleEdit = (job: JobApplication) => {
    setFormData(job);
    setEditingId(job._id || null);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteJob(id);
      setJobs(prev => prev.filter(job => job._id !== id));
    } catch (err) {
      setError('Failed to delete job application');
      console.error('Error deleting job:', err);
    }
  };

  const getStatusClass = (status: JobApplication['status']) => {
    const statusClasses = {
      applied: 'bg-blue-500',
      interview: 'bg-yellow-500',
      offer: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return statusClasses[status] || 'bg-gray-500';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Job Application Tracker
      </h1>

      {/* Job Application Form */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-gray-50 p-6 rounded-lg mb-6"
      >
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label 
              htmlFor="company" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Company Name
            </label>
            <div className="flex items-center">
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company Name"
              />
              <input
                type="url"
                id="companyUrl"
                value={formData.companyUrl}
                onChange={handleInputChange}
                className="ml-2 w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company URL"
              />
            </div>
          </div>
          <div>
            <label 
              htmlFor="position" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Job Position
            </label>
            <div className="flex items-center">
              <input
                type="text"
                id="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Job Position"
              />
              <input
                type="url"
                id="jobPostingUrl"
                value={formData.jobPostingUrl}
                onChange={handleInputChange}
                className="ml-2 w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Job Posting URL"
              />
              <button
                type="button"
                onClick={parseJobPosting}
                disabled={isLoading}
                className="ml-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Parsing...</span>
                ) : (
                  <Search size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}

        {formData.parsedJobDetails && (
          <div className="bg-green-50 p-4 rounded-md mb-4">
            <h3 className="font-bold mb-2">Parsed Job Details</h3>
            {formData.parsedJobDetails.title && (
              <p><strong>Title:</strong> {formData.parsedJobDetails.title}</p>
            )}
            {formData.parsedJobDetails.company && (
              <p><strong>Company:</strong> {formData.parsedJobDetails.company}</p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label 
              htmlFor="applicationDate" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Application Date
            </label>
            <input
              type="date"
              id="applicationDate"
              value={formData.applicationDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label 
              htmlFor="status" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Application Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job Description / Notes
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Add any relevant notes about the job application"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
        >
          <Save className="mr-2" /> 
          {editingId ? 'Update Job Application' : 'Add Job Application'}
        </button>
      </form>

      {/* Job List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Your Job Applications
        </h2>

        {jobs.length === 0 ? (
          <p className="text-center text-gray-500">No job applications added yet</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div 
                key={job._id} 
                className="bg-gray-50 p-4 rounded-lg shadow-sm relative"
              >
                <span 
                  className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold text-white rounded ${getStatusClass(job.status)}`}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                  {job.company}
                  {job.companyUrl && (
                    <a 
                      href={job.companyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <Link size={16} />
                    </a>
                  )}
                </h3>
                
                <div className="mb-2">
                  <strong>Position:</strong> {job.position}
                  {job.jobPostingUrl && (
                    <a 
                      href={job.jobPostingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <Link size={16} />
                    </a>
                  )}
                </div>
                
                <div className="mb-2">
                  <strong>Application Date:</strong> {job.applicationDate}
                </div>
                
                {job.description && (
                  <div className="mb-4 text-gray-600">
                    <strong>Notes:</strong> {job.description}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(job)}
                    className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition flex items-center"
                  >
                    <Edit className="mr-2" size={16} /> Edit
                  </button>
                  
                  <button
                    onClick={() => job._id && handleDelete(job._id)}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition flex items-center"
                  >
                    <Trash2 className="mr-2" size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicationTracker; 