import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { AlertCircle } from 'lucide-react';
import { historyService } from '../services/history.service';
import Swal from 'sweetalert2';

interface ChangeRequestDialogProps {
    isOpen: boolean;
    onClose: () => void;
    costSheetId: string;
    onSuccess?: () => void;
}

const REQUEST_TYPES = [
    { value: 'price_revision', label: 'Price Revision' },
    { value: 'vendor_change', label: 'Vendor Change' },
    { value: 'terms_modification', label: 'Terms Modification' },
    { value: 'specification_update', label: 'Specification Update' },
    { value: 'general_revision', label: 'General Revision' },
];

const PRIORITY_LEVELS = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

export function ChangeRequestDialog({ isOpen, onClose, costSheetId, onSuccess }: ChangeRequestDialogProps) {
    const [requestType, setRequestType] = useState('general_revision');
    const [priority, setPriority] = useState('medium');
    const [changeReason, setChangeReason] = useState('');
    const [detailedComments, setDetailedComments] = useState('');
    const [affectedFields, setAffectedFields] = useState<string[]>([]);
    const [customField, setCustomField] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddField = () => {
        if (customField.trim() && !affectedFields.includes(customField.trim())) {
            setAffectedFields([...affectedFields, customField.trim()]);
            setCustomField('');
        }
    };

    const handleRemoveField = (field: string) => {
        setAffectedFields(affectedFields.filter(f => f !== field));
    };

    const handleSubmit = async () => {
        if (!changeReason.trim()) {
            Swal.fire('Required', 'Please provide a change reason', 'warning');
            return;
        }

        if (!detailedComments.trim()) {
            Swal.fire('Required', 'Please provide detailed comments', 'warning');
            return;
        }

        try {
            setLoading(true);
            await historyService.createChangeRequest(costSheetId, {
                requestType,
                affectedFields,
                changeReason,
                detailedComments,
                priority,
            });

            await Swal.fire('Success', 'Change request created successfully', 'success');
            resetForm();
            onClose();
            onSuccess?.();
        } catch (error: any) {
            console.error('Error creating change request:', error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to create change request', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setRequestType('general_revision');
        setPriority('medium');
        setChangeReason('');
        setDetailedComments('');
        setAffectedFields([]);
        setCustomField('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="text-amber-500" size={24} />
                        Request Changes
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Request Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={requestType}
                            onChange={(e) => setRequestType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {REQUEST_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            {PRIORITY_LEVELS.map(level => (
                                <button
                                    key={level.value}
                                    onClick={() => setPriority(level.value)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${priority === level.value
                                            ? level.color + ' ring-2 ring-offset-2 ring-current'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Change Reason <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            value={changeReason}
                            onChange={(e) => setChangeReason(e.target.value)}
                            placeholder="Briefly explain why this change is needed..."
                            rows={3}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Detailed Comments <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            value={detailedComments}
                            onChange={(e) => setDetailedComments(e.target.value)}
                            placeholder="Provide detailed instructions on what needs to be changed and how..."
                            rows={5}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Be specific about what fields or sections need modification
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Affected Fields (Optional)
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={customField}
                                onChange={(e) => setCustomField(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
                                placeholder="e.g., Unit Price, Payment Terms..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Button onClick={handleAddField} variant="outline" type="button">
                                Add
                            </Button>
                        </div>
                        {affectedFields.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {affectedFields.map((field, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                                        onClick={() => handleRemoveField(field)}
                                    >
                                        {field} ×
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                            <div className="text-sm text-amber-800">
                                <p className="font-semibold mb-1">Important</p>
                                <p>
                                    This will change the cost sheet status to "Change Requested" and notify the initiator.
                                    The initiator will need to make the requested changes and resubmit for approval.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !changeReason.trim() || !detailedComments.trim()}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {loading ? 'Submitting...' : 'Submit Change Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
