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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-4 relative" style={{ width: 900 }}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 className="text-xl font-bold mb-2">Edit Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input name="business_name" value={form.business_name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Street</label>
            <input name="street" value={form.street || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input name="city" value={form.city || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input name="state" value={form.state || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Zip</label>
              <input name="zip" value={form.zip || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input name="category" value={form.category || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input name="average_rating" value={form.average_rating ?? ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" type="number" step="0.1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reviews</label>
              <input name="number_of_reviews" value={form.number_of_reviews ?? ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" type="number" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input name="website" value={form.website || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Google Maps URL</label>
            <input name="google_maps_url" value={form.google_maps_url || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
          </div>
          <hr className="my-2" />
          <h3 className="text-base font-semibold mb-1">Enrichment Details</h3>
          <div className="grid grid-cols-6 gap-1 mb-1">
            <div>
              <label className="block text-sm font-medium text-gray-700">Owner Name</label>
              <input name="owner_name" value={form.owner_name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confidence</label>
              <input name="owner_confidence" value={form.owner_confidence ?? ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" type="number" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <input name="owner_source" value={form.owner_source || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="flex items-center">
                <input name="email" value={form.email || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
                <label className="ml-2 flex items-center text-sm font-medium text-gray-700">
                  <input name="email_verified" type="checkbox" checked={!!form.email_verified} onChange={e => setForm(prev => ({ ...prev, email_verified: e.target.checked }))} className="ml-2 align-middle" style={{ minHeight: '1.5rem' }} />
                  <span className="ml-1">Verified</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Enrichment Status</label>
              <input name="enrichment_status" value={form.enrichment_status || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
              <input name="linkedin_url" value={form.linkedin_url || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Facebook</label>
              <input name="facebook_url" value={form.facebook_url || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram</label>
              <input name="instagram_url" value={form.instagram_url || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reasoning</label>
              <input name="owner_reasoning" value={form.owner_reasoning || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sync Status</label>
              <input name="sync_status" value={form.sync_status || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 h-8 text-sm" />
            </div>
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