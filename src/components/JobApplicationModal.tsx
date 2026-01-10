import React, { useState } from 'react';
import { X, Upload, FileText, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  company: string;
  onApplicationSubmitted?: () => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  company,
  onApplicationSubmitted
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availability: 'immediate',
    additionalInfo: ''
  });
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      // Check if user already applied to this job
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('applicant_id', user.id)
        .single();

      if (existingApplication) {
        alert('You have already applied to this job.');
        return;
      }

      // Insert job application
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          cover_letter: formData.coverLetter,
          expected_salary: formData.expectedSalary ? parseFloat(formData.expectedSalary) : null,
          availability_date: formData.availability === 'immediate' ? new Date().toISOString().split('T')[0] : null,
          additional_info: formData.additionalInfo,
          status: 'pending'
        });

      if (error) throw error;

      setSubmitted(true);
      onApplicationSubmitted?.();
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);

    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
          <p className="text-gray-600">
            Your application for <strong>{jobTitle}</strong> at <strong>{company}</strong> has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Apply for Job</h2>
            <p className="text-gray-600 mt-1">{jobTitle} at {company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter *
            </label>
            <textarea
              value={formData.coverLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Write a compelling cover letter explaining why you're the perfect candidate..."
              required
            />
          </div>

          {/* Expected Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Salary ($)
            </label>
            <input
              type="number"
              value={formData.expectedSalary}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedSalary: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 500000"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="immediate">Available Immediately</option>
              <option value="2weeks">Available in 2 weeks</option>
              <option value="1month">Available in 1 month</option>
              <option value="2months">Available in 2 months</option>
            </select>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume/CV
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="hidden"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {resume ? resume.name : 'Upload your resume (PDF, DOC, DOCX)'}
                </p>
              </label>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.coverLetter}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal;