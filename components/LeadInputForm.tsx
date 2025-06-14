"use client";
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
  cities: z.string().min(3, 'Enter at least one city').refine(
    (val) => val.split(/\r?\n/).map((c) => c.trim()).filter((c) => c.length > 0).length <= 25,
    { message: 'You can enter up to 25 cities per search.' }
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeadInputForm({ onSubmit }: { onSubmit?: (data: { businessCategory: string; cities: string[] }) => void }) {
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
      cities: '',
    },
  });

  const businessCategory = watch('businessCategory');
  const citiesRaw = watch('cities');
  const [categorySuggestions, setCategorySuggestions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Populate form from URL params if present
    const bc = searchParams.get('businessCategory');
    const citiesParam = searchParams.get('cities');
    if (bc) setValue('businessCategory', bc);
    if (citiesParam) setValue('cities', citiesParam);
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

  const handleCitiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('cities', e.target.value);
  };

  const onFormSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      // Split cities by line, trim, and filter out empty lines
      const cities = data.cities
        .split(/\r?\n/)
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      // Update URL params for shareable search
      const params = new URLSearchParams({
        businessCategory: data.businessCategory,
        cities: cities.join(', '),
      });
      router.replace(`?${params.toString()}`);
      if (onSubmit) await onSubmit({ businessCategory: data.businessCategory, cities });
    } catch (err: any) {
      setError(err?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Find Leads</h2>
      <p className="text-blue-700 text-sm mb-2">You will receive up to 10 results per city per page.</p>
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
        {/* Cities Input */}
        <div>
          <label className="block font-medium mb-1">Cities</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            rows={5}
            {...register('cities')}
            value={citiesRaw}
            onChange={handleCitiesChange}
            placeholder={"e.g.\nAustin, TX\nHouston, TX\nDallas, TX"}
          />
          <p className="text-xs text-gray-500 mt-1">Enter one city per line.</p>
          {errors.cities && (
            <p className="text-red-600 text-sm mt-1">{errors.cities.message}</p>
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