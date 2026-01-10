import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  company: z.string().min(2, 'Company name is required'),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  experience_level: z.enum(['entry', 'mid', 'senior', 'executive']),
  category: z.string().min(1, 'Category is required'),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  salary_currency: z.string().min(1, 'Currency is required'),
  application_deadline: z.string(),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  skills_required: z.array(z.string()).min(1, 'At least one skill is required'),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<JobFormData>;
  isEditing?: boolean;
  jobId?: string;
}

const JobForm: React.FC<JobFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditing = false,
  jobId
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState<string[]>(initialData?.requirements || ['']);
  const [skills, setSkills] = useState<string[]>(initialData?.skills_required || ['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || '',
      company: initialData?.company || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      job_type: initialData?.job_type || 'full-time',
      experience_level: initialData?.experience_level || 'entry',
      category: initialData?.category || '',
      salary_min: initialData?.salary_min,
      salary_max: initialData?.salary_max,
      salary_currency: initialData?.salary_currency || 'NGN',
      application_deadline: initialData?.application_deadline || '',
      requirements: initialData?.requirements || [''],
      skills_required: initialData?.skills_required || [''],
    }
  });

  const jobType = watch('job_type');

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      const newReqs = requirements.filter((_, i) => i !== index);
      setRequirements(newReqs);
      setValue('requirements', newReqs);
    }
  };

  const updateRequirement = (index: number, value: string) => {
    const newReqs = [...requirements];
    newReqs[index] = value;
    setRequirements(newReqs);
    setValue('requirements', newReqs);
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      const newSkills = skills.filter((_, i) => i !== index);
      setSkills(newSkills);
      setValue('skills_required', newSkills);
    }
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
    setValue('skills_required', newSkills);
  };

  const onSubmit: SubmitHandler<JobFormData> = async (data) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const jobData = {
        ...data,
        employer_id: user.id,
        application_deadline: data.application_deadline ? new Date(data.application_deadline).toISOString() : null,
        is_active: true,
        featured: false,
      };

      if (isEditing && jobId) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobId);

        if (error) throw error;
        toast.success('Job updated successfully');
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert(jobData);

        if (error) throw error;
        toast.success('Job posted successfully');
      }

      reset();
      setRequirements(['']);
      setSkills(['']);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const jobCategories = [
    'Technology',
    'Marketing',
    'Sales',
    'Finance',
    'Healthcare',
    'Education',
    'Engineering',
    'Design',
    'Legal',
    'Human Resources',
    'Operations',
    'Customer Service',
    'Construction',
    'Manufacturing',
    'Transportation',
    'Hospitality',
    'Real Estate',
    'Consulting',
    'Research',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Job Posting' : 'Post New Job'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Senior Software Engineer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                {...register('company')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your company name"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type *
              </label>
              <select
                {...register('job_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level *
              </label>
              <select
                {...register('experience_level')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {jobCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Location and Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="City, State, Canada"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline
              </label>
              <input
                {...register('application_deadline')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Salary (CAD$)
              </label>
              <input
                {...register('salary_min', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Salary (CAD$)
              </label>
              <input
                {...register('salary_max', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                {...register('salary_currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="CAD">CAD (C$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Job Requirements *
            </label>
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={`Requirement ${index + 1}`}
                />
                {requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Requirement</span>
            </button>
            {errors.requirements && (
              <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
            )}
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Required Skills *
            </label>
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={`Skill ${index + 1}`}
                />
                {skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
            {errors.skills_required && (
              <p className="mt-1 text-sm text-red-600">{errors.skills_required.message}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Job' : 'Post Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;