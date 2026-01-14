import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/Select';
import { Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';
import type {
    ApprovalRule,
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
    onCreateRule: (data: CreateApprovalRuleRequest) => Promise<void>;
    onUpdateRule: (id: number, data: CreateApprovalRuleRequest) => Promise<void>;
    onDeleteRule: (id: number) => Promise<void>;
    isLoading: boolean;
}

interface MatrixRow {
    id: number; // local generic ID for keying (could be negative for new rows)
    ruleId: number | null; // null for new
    minValue: number;
    maxValue: number;
    category: CategoryType | null;
    levels: Record<number, RoleType | null>; // 1-6
    isDeleted?: boolean;
    isNew?: boolean;
}

export function ApprovalMatrixTab({
    approvalRules,
    onCreateRule,
    onUpdateRule,
    onDeleteRule,
    isLoading: parentLoading,
}: ApprovalMatrixTabProps) {
    const [rows, setRows] = useState<MatrixRow[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize rows from props
    useEffect(() => {
        const initialRows: MatrixRow[] = approvalRules.map((rule) => {
            const levelMap: Record<number, RoleType | null> = {};
            // Initialize all levels 1-6 to null
            for (let i = 1; i <= 6; i++) levelMap[i] = null;
            // Fill from rule
            rule.approver_levels?.forEach((l) => {
                levelMap[l.level] = l.approver_role;
            });

            return {
                id: rule.id, // Use rule ID as stable key for existing
                ruleId: rule.id,
                minValue: rule.min_value,
                maxValue: rule.max_value || 0,
                category: rule.category,
                levels: levelMap,
                isNew: false,
            };
        });

        // Sort by Min Value then Category
        initialRows.sort((a, b) => {
            if (a.minValue !== b.minValue) return a.minValue - b.minValue;
            return (a.category || '').localeCompare(b.category || '');
        });

        setRows(initialRows);
    }, [approvalRules]);

    const addMatrixRow = () => {
        const newId = Math.min(0, ...rows.map((r) => r.id)) - 1; // Negative ID for temp
        const newRow: MatrixRow = {
            id: newId,
            ruleId: null,
            minValue: 0,
            maxValue: 0,
            category: 'technical', // default
            levels: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
            isNew: true,
        };
        setRows([...rows, newRow]);
    };

    const deleteMatrixRow = (id: number) => {
        if (confirm('Are you sure you want to delete this row? This action cannot be undone.')) {
            // Find the row
            const row = rows.find(r => r.id === id);
            if (row && row.ruleId) {
                if (row.ruleId) {
                    onDeleteRule(row.ruleId).catch(err => {
                        alert('Failed to delete rule: ' + err.message);
                    });
                }
            }
            setRows(rows.filter((r) => r.id !== id));
        }
    };

    const updateRow = (id: number, updates: Partial<MatrixRow>) => {
        setRows(rows.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    };

    const handleLevelChange = (rowId: number, level: number, role: RoleType | null) => {
        const row = rows.find((r) => r.id === rowId);
        if (!row) return;
        const newLevels = { ...row.levels, [level]: role };
        updateRow(rowId, { levels: newLevels });
    };

    const saveMatrix = async () => {
        setIsSaving(true);
        setError(null);
        try {
            // Process Rows (Create or Update)
            await Promise.all(rows.map(async (row) => {
                // Formatting Levels
                const approvers: CreateApproverLevelRequest[] = Object.entries(row.levels)
                    .filter(([_, role]) => role !== null)
                    .map(([level, role]) => ({
                        level: Number(level),
                        approver_role: role!,
                    }));

                if (row.isNew) {
                    // NEW ROW
                    const ruleData: CreateApprovalRuleRequest = {
                        min_value: row.minValue,
                        max_value: row.maxValue === 0 ? null : row.maxValue,
                        category: row.category!,
                        approvers: approvers,
                    };
                    await onCreateRule(ruleData);
                } else {
                    // EXISTING ROW
                    if (row.ruleId) {
                        const ruleData: CreateApprovalRuleRequest = {
                            min_value: row.minValue,
                            max_value: row.maxValue === 0 ? null : row.maxValue,
                            category: row.category!,
                            approvers: approvers,
                        };
                        await onUpdateRule(row.ruleId, ruleData);
                    }
                }
            }));

            alert('Matrix saved successfully!');
            // Force reload to sync everything cleanly
            window.location.reload();

        } catch (err: any) {
            setError(err.message || 'Failed to save matrix');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Approval Matrix Configuration</h3>
                    <p className="text-sm text-gray-500 mt-1">Define approval workflows based on value bands and categories</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={addMatrixRow} disabled={isSaving || parentLoading}>
                        <Plus size={16} className="mr-2" />
                        Add Rule
                    </Button>
                    <Button className="bg-black text-white hover:bg-gray-800" onClick={saveMatrix} disabled={isSaving || parentLoading}>
                        {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                        Save Matrix
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2 border border-red-200">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#fbfcff] text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 min-w-[200px]">Value Band (₹)</th>
                            <th className="px-4 py-3 min-w-[140px]">Category</th>
                            {[1, 2, 3, 4, 5, 6].map((l) => (
                                <th key={l} className="px-4 py-3 min-w-[140px]">Level {l}</th>
                            ))}
                            <th className="px-4 py-3 text-center w-[80px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {rows.map((row) => (
                            <tr key={row.id} className="group hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={row.minValue}
                                            onChange={(e) => updateRow(row.id, { minValue: Number(e.target.value) })}
                                            className="h-8 w-24 text-sm"
                                            min={0}
                                        />
                                        <span className="text-gray-400">-</span>
                                        <Input
                                            type="number"
                                            value={row.maxValue}
                                            onChange={(e) => updateRow(row.id, { maxValue: Number(e.target.value) })}
                                            className="h-8 w-24 text-sm"
                                            min={0}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Select
                                        value={row.category || ''}
                                        onValueChange={(val) => updateRow(row.id, { category: val as CategoryType })}
                                    >
                                        <SelectTrigger className="h-8 text-sm w-full">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ALL_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {CATEGORY_DISPLAY_NAMES[cat]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </td>
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                    <td key={level} className="px-4 py-3">
                                        <Select
                                            value={row.levels[level] || 'none'}
                                            onValueChange={(val) => handleLevelChange(row.id, level, val === 'none' ? null : (val as RoleType))}
                                        >
                                            <SelectTrigger className="h-8 text-xs w-full">
                                                <SelectValue placeholder="-" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">-</SelectItem>
                                                {APPROVER_ROLES.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {ROLE_DISPLAY_NAMES[role]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteMatrixRow(row.id)}
                                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-gray-500">
                                    No approval rules configured. Click "Add Rule" to begin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
