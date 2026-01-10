import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  original_price: z.number().min(0).optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  stock_quantity: z.number().min(0, 'Stock quantity must be non-negative'),
  location: z.string().optional(),
  condition: z.enum(['new', 'used', 'refurbished']),
  brand: z.string().optional(),
  warranty: z.string().optional(),
  delivery_available: z.boolean(),
  delivery_fee: z.number().min(0).optional(),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<ProductFormData>;
  initialImages?: string[];
  isEditing?: boolean;
  productId?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  initialImages = [],
  isEditing = false,
  productId
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      original_price: initialData?.original_price || undefined,
      category: initialData?.category || '',
      subcategory: initialData?.subcategory || '',
      stock_quantity: initialData?.stock_quantity || 0,
      location: initialData?.location || '',
      condition: initialData?.condition || 'new',
      brand: initialData?.brand || '',
      warranty: initialData?.warranty || '',
      delivery_available: initialData?.delivery_available || false,
      delivery_fee: initialData?.delivery_fee || 0,
      tags: initialData?.tags || '',
    }
  });

  const deliveryAvailable = watch('delivery_available');

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      setImages(prev => [...prev, ...uploadedUrls]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const productData = {
        ...data,
        seller_id: user.id,
        images,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        is_active: true,
        featured: false,
      };

      if (isEditing && productId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      reset();
      setImages([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    'Electronics',
    'Fashion',
    'Food & Drinks',
    'Home & Garden',
    'Beauty',
    'Sports',
    'Books',
    'Automotive',
    'Health & Wellness',
    'Toys & Games'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 8 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                    <div className="text-center">
                      {uploadingImages ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <span className="text-sm text-gray-500">Add Image</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">Upload up to 8 images. First image will be the main product image.</p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter product title"
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
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe your product in detail"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (CAD$) *
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (CAD$)
              </label>
              <input
                {...register('original_price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.original_price && (
                <p className="mt-1 text-sm text-red-600">{errors.original_price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                {...register('stock_quantity', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.stock_quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.stock_quantity.message}</p>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <input
                {...register('subcategory')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Smartphones, Laptops"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                {...register('brand')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Product brand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition *
              </label>
              <select
                {...register('condition')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="City, State"
              />
            </div>
          </div>

          {/* Delivery Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('delivery_available')}
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Delivery available
              </label>
            </div>

            {deliveryAvailable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Fee (CAD$)
                </label>
                <input
                  {...register('delivery_fee', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.delivery_fee && (
                  <p className="mt-1 text-sm text-red-600">{errors.delivery_fee.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              {...register('tags')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Comma-separated tags (e.g., electronics, smartphone, android)"
            />
            <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
          </div>

          {/* Warranty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warranty
            </label>
            <input
              {...register('warranty')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., 1 year manufacturer warranty"
            />
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
              {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;