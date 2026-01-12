import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type { ValueBand, CreateValueBandRequest } from '../../types/admin.types';

interface ValueBandsTabProps {
    valueBands: ValueBand[];
    onCreateValueBand: (data: CreateValueBandRequest) => Promise<void>;
    onUpdateValueBand: (id: number, data: Partial<CreateValueBandRequest>) => Promise<void>;
    onDeleteValueBand: (id: number) => Promise<void>;
    isLoading: boolean;
}

export function ValueBandsTab({
    valueBands,
    onCreateValueBand,
    onUpdateValueBand,
    onDeleteValueBand,
    isLoading,
}: ValueBandsTabProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<CreateValueBandRequest>({
        name: '',
        min_value: 0,
        max_value: null,
    });

    const handleAdd = async () => {
        if (!formData.name || formData.min_value < 0) {
            alert('Please provide a valid name and minimum value');
            return;
        }

        try {
            await onCreateValueBand(formData);
            setIsAdding(false);
            setFormData({ name: '', min_value: 0, max_value: null });
        } catch (error: any) {
            alert(error.message || 'Failed to create value band');
        }
    };

    const handleEdit = (band: ValueBand) => {
        setEditingId(band.id);
        setFormData({
            name: band.name,
            min_value: band.min_value,
            max_value: band.max_value,
        });
    };

    const handleUpdate = async (id: number) => {
        try {
            await onUpdateValueBand(id, formData);
            setEditingId(null);
            setFormData({ name: '', min_value: 0, max_value: null });
        } catch (error: any) {
            alert(error.message || 'Failed to update value band');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This will delete all associated approval rules.')) {
            return;
        }

        try {
            await onDeleteValueBand(id);
        } catch (error: any) {
            alert(error.message || 'Failed to delete value band');
        }
    };

    const formatCurrency = (value: number | null) => {
        if (value === null) return '∞';
        return `₹${value.toLocaleString('en-IN')}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Value Bands Configuration</h3>
                    <p className="text-sm text-gray-500">Define value ranges for approval routing</p>
                </div>
                <Button onClick={() => setIsAdding(true)} disabled={isAdding || isLoading}>
                    <Plus size={16} className="mr-2" />
                    Add Value Band
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3 text-left text-sm font-medium text-gray-600">Name</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-600">Min Value</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-600">Max Value</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-600">Range</th>
                            <th className="p-3 text-right text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isAdding && (
                            <tr className="border-b bg-blue-50">
                                <td className="p-2">
                                    <Input
                                        placeholder="e.g., Up to 10L"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </td>
                                <td className="p-2">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={formData.min_value}
                                        onChange={(e) => setFormData({ ...formData, min_value: Number(e.target.value) })}
                                    />
                                </td>
                                <td className="p-2">
                                    <Input
                                        type="number"
                                        placeholder="Leave empty for unlimited"
                                        value={formData.max_value || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                max_value: e.target.value ? Number(e.target.value) : null,
                                            })
                                        }
                                    />
                                </td>
                                <td className="p-2 text-sm text-gray-500">
                                    {formatCurrency(formData.min_value)} - {formatCurrency(formData.max_value)}
                                </td>
                                <td className="p-2">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" onClick={handleAdd} disabled={isLoading}>
                                            <Save size={14} className="mr-1" />
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setIsAdding(false);
                                                setFormData({ name: '', min_value: 0, max_value: null });
                                            }}
                                        >
                                            <X size={14} className="mr-1" />
                                            Cancel
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {valueBands.map((band) => (
                            <tr key={band.id} className="border-b hover:bg-gray-50">
                                {editingId === band.id ? (
                                    <>
                                        <td className="p-2">
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                value={formData.min_value}
                                                onChange={(e) => setFormData({ ...formData, min_value: Number(e.target.value) })}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                value={formData.max_value || ''}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        max_value: e.target.value ? Number(e.target.value) : null,
                                                    })
                                                }
                                            />
                                        </td>
                                        <td className="p-2 text-sm text-gray-500">
                                            {formatCurrency(formData.min_value)} - {formatCurrency(formData.max_value)}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" onClick={() => handleUpdate(band.id)} disabled={isLoading}>
                                                    <Save size={14} className="mr-1" />
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setFormData({ name: '', min_value: 0, max_value: null });
                                                    }}
                                                >
                                                    <X size={14} className="mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-3">
                                            <span className="font-medium text-gray-800">{band.name}</span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">{formatCurrency(band.min_value)}</td>
                                        <td className="p-3 text-sm text-gray-600">{formatCurrency(band.max_value)}</td>
                                        <td className="p-3 text-sm text-gray-500">
                                            {formatCurrency(band.min_value)} - {formatCurrency(band.max_value)}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(band)}
                                                    disabled={isLoading || editingId !== null}
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(band.id)}
                                                    disabled={isLoading || editingId !== null}
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}

                        {valueBands.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No value bands configured. Click "Add Value Band" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
