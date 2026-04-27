const fs = require('fs');

const rawFile = './components/dashboard/ApplicationEditModal.raw.tsx';
let rawLines = fs.readFileSync(rawFile, 'utf8').split('\n');
rawLines = rawLines.map(l => '    ' + l);

const imports = `import React, { useState, useMemo } from 'react';
import { Modal, Button } from '../UIComponents';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { api } from '../../services/api';
import type { ApplicationStatus } from '../../services/api';

interface EditFormState {
  position?: string;
  department?: string;
  departmentId?: number;
  expectedSalary?: string;
  status: string;
  phone?: string;
  email?: string;
  businessUnit?: string;
  sourceChannel?: string;
  campaignTag?: string;
  height?: string;
  weight?: string;
}

interface ApplicationEditModalProps {
  editingApp: any;
  setEditingApp: (app: any | null) => void;
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  departments: any[];
  positions: any[];
  businessUnits: any[];
  channels: any[];
  currentUserId: string | null;
  currentUserName: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
  fetchData: () => void;
}

export const ApplicationEditModal: React.FC<ApplicationEditModalProps> = ({
  editingApp, setEditingApp, editForm, setEditForm,
  departments, positions, businessUnits, channels,
  currentUserId, currentUserName, showToast, fetchData
}) => {
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const editFilteredPositions = useMemo(() => {
    return positions.filter((p) => !editForm.departmentId || p.department_id === editForm.departmentId);
  }, [positions, editForm.departmentId]);

  return (
    <>
`;

const exportsEnd = `    </>
  );
};
`;

fs.writeFileSync('./components/dashboard/ApplicationEditModal.tsx', imports + rawLines.join('\n') + '\n' + exportsEnd);
console.log('ApplicationEditModal.tsx created');
