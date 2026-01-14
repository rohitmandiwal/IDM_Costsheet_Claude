import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { AlertCircle } from 'lucide-react';

interface DeviationAnalysisProps {
    deviation?: {
        raised_by_name?: string;
        deviation_type?: string;
        approved_by_name?: string;
        remarks?: string;
    } | null;
    readOnly?: boolean;
    onChange?: (field: string, value: string) => void;
}

export function DeviationAnalysis({ deviation, readOnly = false, onChange }: DeviationAnalysisProps) {
    // Use local state to make inputs truly controlled
    const [raisedBy, setRaisedBy] = useState('Manual Entry');
    const [deviationType, setDeviationType] = useState('');
    const [approvedBy, setApprovedBy] = useState('');
    const [remarks, setRemarks] = useState('');

    // Sync with prop changes
    useEffect(() => {
        if (deviation) {
            setRaisedBy(deviation.raised_by_name || 'Manual Entry');
            setDeviationType(deviation.deviation_type || '');
            setApprovedBy(deviation.approved_by_name || '');
            setRemarks(deviation.remarks || '');
        } else {
            // Reset to default if deviation prop becomes null/undefined
            setRaisedBy('Manual Entry');
            setDeviationType('');
            setApprovedBy('');
            setRemarks('');
        }
    }, [deviation]);

    const handleFieldChange = (field: string, value: string) => {
        // Update local state immediately
        switch (field) {
            case 'raised_by_name':
                setRaisedBy(value);
                break;
            case 'deviation_type':
                setDeviationType(value);
                break;
            case 'approved_by_name':
                setApprovedBy(value);
                break;
            case 'remarks':
                setRemarks(value);
                break;
        }
        // Notify parent
        onChange?.(field, value);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4 text-orange-600">
                <AlertCircle size={18} />
                <h3 className="font-semibold text-gray-800 text-lg">Deviation Analysis</h3>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-amber-800 mb-4">Deviation Approval (If any)</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Raised By</label>
                        <Input
                            value={raisedBy}
                            onChange={(e) => handleFieldChange('raised_by_name', e.target.value)}
                            readOnly={readOnly}
                            className="bg-white border-gray-200 h-10"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Deviation Type</label>
                        <Select
                            value={deviationType}
                            onValueChange={(val) => handleFieldChange('deviation_type', val)}
                            disabled={readOnly}
                        >
                            <SelectTrigger className="h-10 bg-white border-gray-200">
                                <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="price_increase">Price Increase</SelectItem>
                                <SelectItem value="specification_change">Specification Change</SelectItem>
                                <SelectItem value="urgent_requirement">Urgent Requirement</SelectItem>
                                <SelectItem value="limited_suppliers">Limited Suppliers</SelectItem>
                                <SelectItem value="quality_upgrade">Quality Upgrade</SelectItem>
                                <SelectItem value="currency_fluctuation">Currency Fluctuation</SelectItem>
                                <SelectItem value="market_conditions">Market Conditions</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Approved By</label>
                        <Input
                            value={approvedBy}
                            placeholder="Name and Link"
                            onChange={(e) => handleFieldChange('approved_by_name', e.target.value)}
                            readOnly={readOnly}
                            className="bg-white border-gray-200 h-10"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Justification / Remarks</label>
                    <textarea
                        className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24"
                        placeholder="Provide detailed justification for this selection..."
                        value={remarks}
                        onChange={(e) => handleFieldChange('remarks', e.target.value)}
                        disabled={readOnly}
                    />
                    {!readOnly && (
                        <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
                            * Mandatory for non-L1 or single source selections.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
