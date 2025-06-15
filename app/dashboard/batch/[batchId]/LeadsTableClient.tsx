"use client";
import { useState } from "react";
import LeadTable from "@/components/LeadTable";
import EditLeadModal from "@/components/EditLeadModal";
import { Lead } from "@/lib/supabase";

interface LeadsTableClientProps {
  leads: Lead[];
  batchId: string;
}

export default function LeadsTableClient({ leads, batchId }: LeadsTableClientProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setEditModalOpen(true);
  };

  const handleSave = async (updated: Partial<Lead>) => {
    // TODO: Implement backend update
    setEditModalOpen(false);
    setSelectedLead(null);
  };

  return (
    <>
      <LeadTable leads={leads} onEdit={handleEdit} onDelete={() => {}} />
      <EditLeadModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onSave={handleSave}
      />
    </>
  );
} 