import { useState, useEffect } from 'react';
import { Settings, Users, DollarSign, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { ValueBandsTab } from '../components/admin/ValueBandsTab';
import { ApprovalMatrixTab } from '../components/admin/ApprovalMatrixTab';
import { UserAssignmentTab } from '../components/admin/UserAssignmentTab';
import { adminService } from '../services/admin.service';
import type {
    ValueBand,
    ApprovalRule,
    User,
    CreateValueBandRequest,
    CreateApprovalRuleRequest,
    CreateUserRequest,
    UpdateUserRequest,
} from '../types/admin.types';

type TabType = 'value-bands' | 'approval-matrix' | 'users';

export function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('value-bands');
    const [valueBands, setValueBands] = useState<ValueBand[]>([]);
    const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [bandsData, rulesData, usersData] = await Promise.all([
                adminService.getValueBands(),
                adminService.getApprovalRules(),
                adminService.getUsers(),
            ]);
            setValueBands(bandsData);
            setApprovalRules(rulesData);
            setUsers(usersData);
        } catch (err: any) {
            setError(err.message || 'Failed to load admin data');
            console.error('Failed to fetch admin data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================
    // VALUE BANDS HANDLERS
    // ============================================================

    const handleCreateValueBand = async (data: CreateValueBandRequest) => {
        setIsLoading(true);
        try {
            const newBand = await adminService.createValueBand(data);
            setValueBands([...valueBands, newBand]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateValueBand = async (id: number, data: Partial<CreateValueBandRequest>) => {
        setIsLoading(true);
        try {
            const updated = await adminService.updateValueBand(id, data);
            setValueBands(valueBands.map((b) => (b.id === id ? updated : b)));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteValueBand = async (id: number) => {
        setIsLoading(true);
        try {
            await adminService.deleteValueBand(id);
            setValueBands(valueBands.filter((b) => b.id !== id));
            // Also remove associated approval rules
            setApprovalRules(approvalRules.filter((r) => r.value_band_id !== id));
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================
    // APPROVAL RULES HANDLERS
    // ============================================================

    const handleCreateApprovalRule = async (data: CreateApprovalRuleRequest) => {
        setIsLoading(true);
        try {
            const newRule = await adminService.createApprovalRule(data);
            setApprovalRules([...approvalRules, newRule]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateApprovalRule = async (id: number, data: CreateApprovalRuleRequest) => {
        setIsLoading(true);
        try {
            const updated = await adminService.updateApprovalRule(id, data);
            setApprovalRules(approvalRules.map((r) => (r.id === id ? updated : r)));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteApprovalRule = async (id: number) => {
        setIsLoading(true);
        try {
            await adminService.deleteApprovalRule(id);
            setApprovalRules(approvalRules.filter((r) => r.id !== id));
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================
    // USER HANDLERS
    // ============================================================

    const handleCreateUser = async (data: CreateUserRequest) => {
        setIsLoading(true);
        try {
            const newUser = await adminService.createUser(data);
            setUsers([...users, newUser]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUser = async (id: number, data: UpdateUserRequest) => {
        setIsLoading(true);
        try {
            const updated = await adminService.updateUser(id, data);
            setUsers(users.map((u) => (u.id === id ? updated : u)));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (id: number) => {
        setIsLoading(true);
        try {
            await adminService.deleteUser(id);
            setUsers(users.filter((u) => u.id !== id));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Settings</h1>
                <p className="text-sm text-gray-500 mb-6">Configure approval workflows, value bands, and user roles</p>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-medium text-red-800">Error loading admin data</p>
                            <p className="text-sm text-red-600">{error}</p>
                            <button
                                onClick={fetchAllData}
                                className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex border-b mb-6">
                    <TabButton
                        icon={<DollarSign size={16} />}
                        label="Value Bands"
                        isActive={activeTab === 'value-bands'}
                        onClick={() => setActiveTab('value-bands')}
                    />
                    <TabButton
                        icon={<Settings size={16} />}
                        label="Approval Matrix"
                        isActive={activeTab === 'approval-matrix'}
                        onClick={() => setActiveTab('approval-matrix')}
                    />
                    <TabButton
                        icon={<Users size={16} />}
                        label="User Assignment"
                        isActive={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                </div>

                <Card className="p-6">
                    {activeTab === 'value-bands' && (
                        <ValueBandsTab
                            valueBands={valueBands}
                            onCreateValueBand={handleCreateValueBand}
                            onUpdateValueBand={handleUpdateValueBand}
                            onDeleteValueBand={handleDeleteValueBand}
                            isLoading={isLoading}
                        />
                    )}

                    {activeTab === 'approval-matrix' && (
                        <ApprovalMatrixTab
                            approvalRules={approvalRules}
                            valueBands={valueBands}
                            onCreateRule={handleCreateApprovalRule}
                            onUpdateRule={handleUpdateApprovalRule}
                            onDeleteRule={handleDeleteApprovalRule}
                            isLoading={isLoading}
                        />
                    )}

                    {activeTab === 'users' && (
                        <UserAssignmentTab
                            users={users}
                            onCreateUser={handleCreateUser}
                            onUpdateUser={handleUpdateUser}
                            onDeleteUser={handleDeleteUser}
                            isLoading={isLoading}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
}

const TabButton = ({
    icon,
    label,
    isActive,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
    >
        {icon}
        {label}
    </button>
);