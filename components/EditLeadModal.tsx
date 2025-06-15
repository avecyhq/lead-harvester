import React, { useState, useEffect } from 'react';
import { Lead } from '@/lib/supabase';

interface EditLeadModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSave: (updated: Partial<Lead>) => void;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ open, onClose, lead, onSave }) => {
  const [form, setForm] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead) {
      setForm(lead);
    }
  }, [lead]);

  if (!open || !lead) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 className="text-xl font-bold mb-4">Edit Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input name="business_name" value={form.business_name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Street</label>
            <input name="street" value={form.street || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input name="city" value={form.city || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input name="state" value={form.state || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Zip</label>
              <input name="zip" value={form.zip || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input name="category" value={form.category || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input name="average_rating" value={form.average_rating ?? ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" type="number" step="0.1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reviews</label>
              <input name="number_of_reviews" value={form.number_of_reviews ?? ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" type="number" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input name="website" value={form.website || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Google Maps URL</label>
            <input name="google_maps_url" value={form.google_maps_url || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal; 