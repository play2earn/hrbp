// Dashboard shared type definitions

export interface DashboardProps {
    role: 'admin' | 'mod';
    onLogout: () => void;
}

export interface AppFilters {
    search: string;
    position: string;
    bu: string;
    channel: string;
    status: string;
    assignment: string;
}

export interface EditFormState {
    position: string;
    department: string;
    departmentId: number;
    expectedSalary: string;
    phone: string;
    email: string;
    status: string;
    businessUnit: string;
    sourceChannel: string;
    campaignTag: string;
    height: string;
    weight: string;
}

export interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error';
}

export interface ActionMenuState {
    id: string;
    x: number;
    y: number;
    openUp: boolean;
}

export interface ConfirmStatusRevertState {
    activeStatus: string;
    executeSaveEdit?: () => Promise<void>;
}
