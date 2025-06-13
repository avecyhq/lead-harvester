import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';

// Example categories for autocomplete
const businessCategories = [
  'Restaurant',
  'Consulting',
  'Retail',
  'Healthcare',
  'Education',
  'Real Estate',
  'Finance',
  'Technology',
  'Marketing',
  'Legal',
];

const formSchema = z.object({
  businessCategory: z.string().min(3, 'Category must be at least 3 characters'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeadInputForm({ onSubmit }: { onSubmit?: (data: FormValues) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessCategory: '',
      location: '',
    },
  });

  const businessCategory = watch('businessCategory');
  const location = watch('location');
  const [categorySuggestions, setCategorySuggestions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Populate form from URL params if present
    const bc = searchParams.get('businessCategory');
    const loc = searchParams.get('location');
    if (bc) setValue('businessCategory', bc);
    if (loc) setValue('location', loc);
    // eslint-disable-next-line
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('businessCategory', value);
    setCategorySuggestions(
      value.length > 0
        ? businessCategories.filter((cat) => cat.toLowerCase().includes(value.toLowerCase()))
        : []
    );
  };

  const handleCategorySelect = (cat: string) => {
    setValue('businessCategory', cat);
    setCategorySuggestions([]);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValue('location', e.target.value);
  };

  const onFormSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      // Update URL params for shareable search
      const params = new URLSearchParams({
        businessCategory: data.businessCategory,
        location: data.location,
      });
      router.replace(`?${params.toString()}`);
      if (onSubmit) await onSubmit(data);
    } catch (err: any) {
      setError(err?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Find Leads</h2>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Business Category Autocomplete */}
        <div className="relative">
          <label className="block font-medium mb-1">Business Category</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            {...register('businessCategory')}
            value={businessCategory}
            onChange={handleCategoryChange}
            placeholder="e.g. Restaurant, Consulting, Retail..."
            autoComplete="off"
          />
          {categorySuggestions.length > 0 && (
            <ul className="border border-gray-200 rounded mt-1 bg-white shadow absolute z-10 w-full">
              {categorySuggestions.map((cat) => (
                <li
                  key={cat}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
          {errors.businessCategory && (
            <p className="text-red-600 text-sm mt-1">{errors.businessCategory.message}</p>
          )}
        </div>
        {/* Location Input */}
        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            {...register('location')}
            value={location}
            onChange={handleLocationChange}
            placeholder="e.g. Austin, TX or All cities >10k population"
          />
          {errors.location && (
            <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center"><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>Submitting...</span>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
} 