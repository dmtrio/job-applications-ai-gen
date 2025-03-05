import JobApplication from './models/JobApplication';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 5010;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-tracker';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// API Routes
// Get all job applications
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await JobApplication.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job applications', error });
  }
});

// Create a new job application
app.post('/api/jobs', async (req, res) => {
  try {
    const job = new JobApplication(req.body);
    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: 'Error creating job application', error });
  }
});

// Update a job application
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const updatedJob = await JobApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: 'Error updating job application', error });
  }
});

// Delete a job application
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const deletedJob = await JobApplication.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting job application', error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 