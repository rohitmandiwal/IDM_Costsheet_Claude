import { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type {
    ApprovalRule,
    ValueBand,
    CreateApprovalRuleRequest,
    CreateApproverLevelRequest,
} from '../../types/admin.types';
import {
    APPROVER_ROLES,
    ALL_CATEGORIES,
    ROLE_DISPLAY_NAMES,
    CATEGORY_DISPLAY_NAMES,
    type RoleType,
    type CategoryType,
} from '../../constants/admin.constants';

interface ApprovalMatrixTabProps {
    approvalRules: ApprovalRule[];
    valueBands: ValueBand[];
    onCreateRule: (data: CreateApprovalRuleRequest) => Promise<void>;
    onUpdateRule: (id: number, data: CreateApprovalRuleRequest) => Promise<void>;
    onDeleteRule: (id: number) => Promise<void>;
    isLoading: boolean;
}

export function ApprovalMatrixTab({
    approvalRules,
    valueBands,
    onCreateRule,
    onUpdateRule,
    onDeleteRule,
    isLoading,
}: ApprovalMatrixTabProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<{
        value_band_id: number | null;
        category: CategoryType | null;
        levels: Record<number, RoleType | null>;
    }>({
        value_band_id: null,
        category: null,
        levels: {},
    });

    // Flatten rules for table display but keep them sorted by band and category
    const sortedRules = useMemo(() => {
        return [...approvalRules].sort((a, b) => {
            const bandA = valueBands.find(v => v.id === a.value_band_id);
            const bandB = valueBands.find(v => v.id === b.value_band_id);
            if (!bandA || !bandB) return 0;
            // Sort by min_value
            if (bandA.min_value !== bandB.min_value) {
                return bandA.min_value - bandB.min_value;
            }
            // Then by category (technical first usually preferred, or alphabetical)
            return a.category.localeCompare(b.category);
        });
    }, [approvalRules, valueBands]);

    const handleLevelChange = (level: number, role: RoleType | null) => {
        setFormData((prev) => ({
            ...prev,
            levels: { ...prev.levels, [level]: role },
        }));
    };

    const buildApproversArray = (): CreateApproverLevelRequest[] => {
        const approvers: CreateApproverLevelRequest[] = [];
        Object.entries(formData.levels).forEach(([level, role]) => {
            if (role) {
                approvers.push({
                    level: Number(level),
                    approver_role: role,
                });
            }
        });
        return approvers.sort((a, b) => a.level - b.level);
    };

    const handleAdd = async () => {
        if (!formData.value_band_id || !formData.category) {
            alert('Please select value band and category');
            return;
        }

        const approvers = buildApproversArray();
        if (approvers.length === 0) {
            alert('Please assign at least one approver level');
            return;
        }

        try {
            await onCreateRule({
                value_band_id: formData.value_band_id,
                category: formData.category,
                approvers,
            });
            setIsAdding(false);
            setFormData({ value_band_id: null, category: null, levels: {} });
        } catch (error: any) {
            alert(error.message || 'Failed to create approval rule');
        }
    };

    const handleEdit = (rule: ApprovalRule) => {
        setEditingId(rule.id);
        const levels: Record<number, RoleType | null> = {};
        rule.approver_levels?.forEach((level) => {
            levels[level.level] = level.approver_role;
        });
        setFormData({
            value_band_id: rule.value_band_id,
            category: rule.category,
            levels,
        });
    };

    const handleUpdate = async (id: number) => {
        if (!formData.value_band_id || !formData.category) {
            alert('Please select value band and category');
            return;
        }

        const approvers = buildApproversArray();
        if (approvers.length === 0) {
            alert('Please assign at least one approver level');
            return;
        }

        try {
            await onUpdateRule(id, {
                value_band_id: formData.value_band_id,
                category: formData.category,
                approvers,
            });
            setEditingId(null);
            setFormData({ value_band_id: null, category: null, levels: {} });
        } catch (error: any) {
            alert(error.message || 'Failed to update approval rule');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this approval rule?')) {
            return;
        }

        try {
            await onDeleteRule(id);
        } catch (error: any) {
            alert(error.message || 'Failed to delete approval rule');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsAdding(false);
        setFormData({ value_band_id: null, category: null, levels: {} });
    };

    const getBandName = (bandId: number) => {
        const band = valueBands.find(b => b.id === bandId);
        return band ? band.name : 'Unknown Band';
    };

    const getBandRange = (bandId: number) => {
        const band = valueBands.find(b => b.id === bandId);
        if (!band) return '';
        const min = band.min_value.toLocaleString('en-IN');
        const max = band.max_value ? band.max_value.toLocaleString('en-IN') : '∞';
        return `₹${min} - ₹${max}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Approval Matrix Configuration</h3>
                    <p className="text-sm text-gray-500">Define approval workflows based on value bands and categories</p>
                </div>
                <Button onClick={() => setIsAdding(true)} disabled={isAdding || isLoading || editingId !== null}>
                    <Plus size={16} className="mr-2" />
                    Add Rule
                </Button>
            </div>

            {isAdding && (
                <div className="mb-4 p-4 border border-blue-300 rounded-lg bg-blue-50">
                    <h4 className="font-semibold mb-3">New Approval Rule</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Value Band</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={formData.value_band_id || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, value_band_id: e.target.value ? Number(e.target.value) : null })
                                }
                            >
                                <option value="">Select value band</option>
                                {valueBands.map((band) => (
                                    <option key={band.id} value={band.id}>
                                        {band.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={formData.category || ''}
                                onChange={(e) => setFormData({ ...formData, category: (e.target.value as CategoryType) || null })}
                            >
                                <option value="">Select category</option>
                                {ALL_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {CATEGORY_DISPLAY_NAMES[cat]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Approver Levels</label>
                        <div className="grid grid-cols-6 gap-2">
                            {[1, 2, 3, 4, 5, 6].map((level) => (
                                <div key={level}>
                                    <label className="block text-xs text-gray-600 mb-1">Level {level}</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md text-xs"
                                        value={formData.levels[level] || ''}
                                        onChange={(e) => handleLevelChange(level, (e.target.value as RoleType) || null)}
                                    >
                                        <option value="">-</option>
                                        {APPROVER_ROLES.map((role) => (
                                            <option key={role} value={role}>
                                                {ROLE_DISPLAY_NAMES[role]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button onClick={handleAdd} disabled={isLoading}>
                            <Save size={14} className="mr-1" />
                            Save Rule
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                            <X size={14} className="mr-1" />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="w-full bg-white text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                        <tr>
                            <th className="p-3 w-48">Value Band</th>
                            <th className="p-3 w-32">Category</th>
                            <th className="p-3">Level 1</th>
                            <th className="p-3">Level 2</th>
                            <th className="p-3">Level 3</th>
                            <th className="p-3">Level 4</th>
                            <th className="p-3">Level 5</th>
                            <th className="p-3">Level 6</th>
                            <th className="p-3 w-20 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedRules.map((rule) => {
                            const isEditing = editingId === rule.id;
                            const levelsMap: Record<number, string> = {};
                            rule.approver_levels?.forEach(l => levelsMap[l.level] = ROLE_DISPLAY_NAMES[l.approver_role]);

                            return (
                                <tr key={rule.id} className="hover:bg-gray-50">
                                    <td className="p-3 align-top">
                                        <div className="font-medium text-gray-900">{getBandName(rule.value_band_id)}</div>
                                        <div className="text-xs text-gray-500">{getBandRange(rule.value_band_id)}</div>
                                    </td>

                                    {isEditing ? (
                                        <td className="p-3 align-top" colSpan={8}>
                                            <div className="flex flex-col gap-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold mb-1">Category</label>
                                                        <select
                                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                                            value={formData.category || ''}
                                                            onChange={(e) => setFormData({ ...formData, category: (e.target.value as CategoryType) || null })}
                                                        >
                                                            {ALL_CATEGORIES.map((cat) => (
                                                                <option key={cat} value={cat}>
                                                                    {CATEGORY_DISPLAY_NAMES[cat]}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold mb-1">Approver Levels</label>
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {[1, 2, 3, 4, 5, 6].map((level) => (
                                                            <div key={level}>
                                                                <label className="block text-[10px] text-gray-500 mb-1">L{level}</label>
                                                                <select
                                                                    className="w-full p-1.5 border border-gray-300 rounded text-xs"
                                                                    value={formData.levels[level] || ''}
                                                                    onChange={(e) => handleLevelChange(level, (e.target.value as RoleType) || null)}
                                                                >
                                                                    <option value="">-</option>
                                                                    {APPROVER_ROLES.map((role) => (
                                                                        <option key={role} value={role}>
                                                                            {ROLE_DISPLAY_NAMES[role]}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => handleUpdate(rule.id)} disabled={isLoading}>
                                                        <Save size={14} className="mr-1" /> Save
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                                                        <X size={14} className="mr-1" /> Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="p-3 align-top">
                                                <span className={`px-2 py-1 text-xs rounded-full ${rule.category === 'technical' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                    {CATEGORY_DISPLAY_NAMES[rule.category]}
                                                </span>
                                            </td>
                                            {[1, 2, 3, 4, 5, 6].map(level => (
                                                <td key={level} className="p-3 align-top text-xs text-gray-600">
                                                    {levelsMap[level] ? (
                                                        <div className="bg-gray-100 px-2 py-1 rounded border border-gray-200 inline-block whitespace-nowrap">
                                                            {levelsMap[level]}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            ))}
                                            <td className="p-3 align-top text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)} disabled={isLoading || editingId !== null}>
                                                        <Edit2 size={14} className="text-gray-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} disabled={isLoading || editingId !== null}>
                                                        <Trash2 size={14} className="text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                        {sortedRules.length === 0 && (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-gray-500">
                                    No approval rules configured. Click "Add Rule" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
