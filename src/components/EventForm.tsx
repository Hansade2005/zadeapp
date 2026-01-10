import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Minus, Upload, Calendar, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const eventSchema = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters'),
  description: z.string().min(10, 'Event description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location: z.string().min(2, 'Location is required'),
  venue: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  max_attendees: z.number().min(1, 'Maximum attendees must be at least 1').optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<EventFormData & { images?: string[] }>;
  isEditing?: boolean;
  eventId?: string;
}

const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditing = false,
  eventId
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags || ['']);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      start_time: initialData?.start_time || '',
      end_time: initialData?.end_time || '',
      location: initialData?.location || '',
      venue: initialData?.venue || '',
      price: initialData?.price || 0,
      max_attendees: initialData?.max_attendees,
      tags: initialData?.tags || [''],
    }
  });

  const addTag = () => {
    setTags([...tags, '']);
  };

  const removeTag = (index: number) => {
    if (tags.length > 1) {
      const newTags = tags.filter((_, i) => i !== index);
      setTags(newTags);
      setValue('tags', newTags);
    }
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `event-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const eventData = {
        ...data,
        organizer_id: user.id,
        images,
        is_active: true,
        featured: false,
        current_attendees: 0,
      };

      if (isEditing && eventId) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventId);

        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) throw error;
        toast.success('Event created successfully');
      }

      reset();
      setImages([]);
      setTags(['']);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const eventCategories = [
    'Wedding',
    'Birthday Party',
    'Corporate Event',
    'Concert',
    'Festival',
    'Conference',
    'Workshop',
    'Seminar',
    'Sports Event',
    'Charity Event',
    'Religious Event',
    'Graduation',
    'Anniversary',
    'Baby Shower',
    'Retirement Party',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Event' : 'Create New Event'}
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
                Event Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Annual Company Gala"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {eventCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe your event, what attendees can expect, and any special highlights..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date *
              </label>
              <input
                {...register('start_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date *
              </label>
              <input
                {...register('end_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time *
              </label>
              <input
                {...register('start_time')}
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {errors.start_time && (
                <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                End Time *
              </label>
              <input
                {...register('end_time')}
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {errors.end_time && (
                <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          {/* Location and Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="City, State/Country"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Details
              </label>
              <input
                {...register('venue')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Grand Hotel Ballroom"
              />
              {errors.venue && (
                <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
              )}
            </div>
          </div>

          {/* Pricing and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Price (CAD$) *
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Attendees
              </label>
              <input
                {...register('max_attendees', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Leave empty for unlimited"
              />
              {errors.max_attendees && (
                <p className="mt-1 text-sm text-red-600">{errors.max_attendees.message}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags *
            </label>
            <div className="space-y-2">
              {tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., music, entertainment, networking"
                  />
                  {tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTag}
                className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Images
            </label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                </label>
                {uploadingImages && (
                  <span className="text-sm text-gray-600">Uploading...</span>
                )}
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Event image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
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
              {loading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;