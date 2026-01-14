import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';
import type { VendorQuote } from './VendorComparison';
import Swal from 'sweetalert2';

interface VendorSelectionProps {
    vendors: VendorQuote[];
    lineItemQuantity: number;
    selectedVendorId: string;
    onVendorSelect: (id: string) => void;
    readOnly?: boolean;
}

export function VendorSelection({ vendors, lineItemQuantity, selectedVendorId, onVendorSelect, readOnly = false }: VendorSelectionProps) {
    const selectedVendor = useMemo(() => {
        if (!selectedVendorId) return null;
        return vendors.find(v => v.id.toString() === selectedVendorId) || null;
    }, [selectedVendorId, vendors]);

    const pricing = useMemo(() => {
        if (!selectedVendor) return { before: 0, after: 0 };

        const beforeUnit = selectedVendor.originalQuote || 0;
        const afterUnit = selectedVendor.negotiatedQuote || 0;

        const beforeTotal = beforeUnit * lineItemQuantity;
        const afterTotal = afterUnit * lineItemQuantity;

        // Landed costs
        const taxBefore = beforeTotal * (selectedVendor.gstRate / 100);
        const taxAfter = afterTotal * (selectedVendor.gstRate / 100);

        return {
            before: beforeTotal + taxBefore + (selectedVendor.freight || 0) + (selectedVendor.otherCharges || 0),
            after: afterTotal + taxAfter + (selectedVendor.freight || 0) + (selectedVendor.otherCharges || 0)
        };
    }, [selectedVendor, lineItemQuantity]);

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 text-lg mb-6">Vendor Selection & Finalization</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Select Finalized Vendor</label>
                    <Select value={selectedVendorId} onValueChange={onVendorSelect} disabled={readOnly}>
                        <SelectTrigger className="h-10 bg-gray-50/50">
                            <SelectValue placeholder="Choose vendor..." />
                        </SelectTrigger>
                        <SelectContent>
                            {vendors.map((v, idx) => (
                                <SelectItem key={v.id} value={v.id.toString()}>
                                    {v.vendorName || `Vendor ${idx + 1} `} ({v.vendorCode || 'N/A'})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Final Price Before Negotiation</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <Input
                            value={pricing.before.toLocaleString()}
                            readOnly
                            className="h-10 pl-7 bg-gray-50/50 border-gray-200 font-semibold"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Final Price After Negotiation</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <Input
                            value={pricing.after.toLocaleString()}
                            readOnly
                            className="h-10 pl-7 bg-gray-50/50 border-gray-200 font-bold text-lg text-primary"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Supporting Documents</p>
                    <div className="relative">
                        <input
                            type="file"
                            id="compliance-upload"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    Swal.fire({
                                        title: 'Uploading...',
                                        text: file.name,
                                        timer: 1000,
                                        showConfirmButton: false,
                                        didOpen: () => Swal.showLoading()
                                    });
                                }
                            }}
                            disabled={readOnly}
                        />
                        <Button
                            variant="outline"
                            onClick={() => document.getElementById('compliance-upload')?.click()}
                            disabled={readOnly}
                            className="w-full h-10 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 uppercase tracking-widest text-[10px]"
                        >
                            <Plus size={14} className="mr-2" /> Upload Document
                        </Button>
                    </div>
                </div>
            </div>

            {/* Finalized Supplier Summary Table */}
            {selectedVendor && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Finalized Supplier
                    </h4>
                    <div className="bg-white rounded-md overflow-hidden border border-green-200">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-green-100 border-b border-green-200">
                                    <th className="text-left py-2 px-4 text-xs font-bold text-gray-700">Vendor Code</th>
                                    <th className="text-left py-2 px-4 text-xs font-bold text-gray-700">Vendor Name</th>
                                    <th className="text-right py-2 px-4 text-xs font-bold text-gray-700">Per Unit</th>
                                    <th className="text-right py-2 px-4 text-xs font-bold text-gray-700">Value</th>
                                    <th className="text-right py-2 px-4 text-xs font-bold text-gray-700">Total Value</th>
                                    <th className="text-left py-2 px-4 text-xs font-bold text-gray-700">Tax Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 px-4 text-sm text-gray-900">
                                        {selectedVendor.vendorCode || '-'}
                                    </td>
                                    <td className="py-2 px-4 text-sm text-gray-900">
                                        {selectedVendor.vendorName}
                                    </td>
                                    <td className="py-2 px-4 text-sm text-gray-900 text-right">
                                        ₹{selectedVendor.negotiatedQuote.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-4 text-sm text-gray-900 text-right">
                                        ₹{(selectedVendor.negotiatedQuote * lineItemQuantity).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-4 text-sm text-right">
                                        <strong className="text-green-700">
                                            ₹{pricing.after.toLocaleString()}
                                        </strong>
                                    </td>
                                    <td className="py-2 px-4 text-sm text-gray-900">
                                        {selectedVendor.taxCode || '-'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
