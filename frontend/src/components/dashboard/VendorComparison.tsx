import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/Table';
import { Plus, Save } from 'lucide-react';
import { costSheetService } from '../../services/costSheet.service';
import Swal from 'sweetalert2';

export interface VendorQuote {
    id: number;
    vendorId?: number;
    vendorName: string;
    vendorCode: string;
    taxCode?: string;
    originalQuote: number;
    negotiatedQuote: number;
    gstRate: number;
    freight: number;
    otherCharges: number;
    paymentTerms?: string;
    deliveryTerms?: string;
    exchangeRate?: number;
    quoteValidityDate?: string;
    vendorType?: 'new' | 'existing';
}

interface VendorComparisonProps {
    lineItemId: number;
    lineItemQuantity: number;
    vendors: VendorQuote[];
    onVendorsUpdate: (vendors: VendorQuote[]) => void;
    readOnly?: boolean;
}

export function VendorComparison({ lineItemId, lineItemQuantity, vendors: initialVendors, onVendorsUpdate, readOnly = false }: VendorComparisonProps) {
    const [localVendors, setLocalVendors] = useState<VendorQuote[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalVendors(initialVendors);
    }, [initialVendors]);

    const handleCellChange = (index: number, field: keyof VendorQuote, value: any) => {
        const updated = [...localVendors];
        updated[index] = { ...updated[index], [field]: value };
        setLocalVendors(updated);
    };

    const calculateTotals = (v: VendorQuote) => {
        const originalValue = (v.originalQuote || 0) * lineItemQuantity;
        const negotiatedValue = (v.negotiatedQuote || 0) * lineItemQuantity;
        const taxAmount = (negotiatedValue * (v.gstRate || 0)) / 100;

        // Final Landed Cost After Original (Simplified as original + estimated tax + freight + other)
        const grandTotalOriginal = originalValue + (originalValue * (v.gstRate || 0) / 100) + (v.freight || 0) + (v.otherCharges || 0);

        // Final Landed Cost After Negotiation
        const grandTotalNegotiated = negotiatedValue + taxAmount + (v.freight || 0) + (v.otherCharges || 0);

        return {
            originalValue,
            negotiatedValue,
            taxAmount,
            grandTotalOriginal,
            grandTotalNegotiated
        };
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises = localVendors.map(v => {
                const payload = {
                    vendor_name: v.vendorName,
                    vendor_code: v.vendorCode,
                    tax_code: v.taxCode,
                    r0_quoted_per_unit: v.originalQuote,
                    r1_negotiated_per_unit: v.negotiatedQuote,
                    gst: v.gstRate,
                    freight: v.freight,
                    other_charges: v.otherCharges,
                };

                if (v.id && !v.id.toString().startsWith('temp')) {
                    return costSheetService.updateVendorQuotation(v.id, payload);
                } else {
                    return costSheetService.createVendorQuotation(lineItemId, {
                        ...payload,
                        vendor_id: v.vendorId || 1 // Fallback or handle selection
                    });
                }
            });

            await Promise.all(promises);
            Swal.fire({
                title: 'Saved!',
                text: 'Vendor comparison data has been updated.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            onVendorsUpdate(localVendors);
        } catch (error) {
            console.error('Failed to save vendor comparison:', error);
            Swal.fire('Error', 'Failed to save vendor comparison data.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const addVendorRow = () => {
        const newVendor: VendorQuote = {
            id: Date.now(), // Temp ID
            vendorName: '',
            vendorCode: '',
            originalQuote: 0,
            negotiatedQuote: 0,
            gstRate: 18,
            freight: 0,
            otherCharges: 0,
            vendorType: 'new'
        };
        setLocalVendors([...localVendors, newVendor]);
    };

    const lowestNegotiatedTotal = Math.min(...localVendors.map(v => calculateTotals(v).grandTotalNegotiated).filter(t => t > 0));

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Vendor Comparison</h3>
                    <p className="text-xs text-gray-500">Best price highlighted in green • Scroll horizontally for all fields</p>
                </div>
                {!readOnly && (
                    <Button variant="outline" size="sm" onClick={addVendorRow} className="text-primary border-gray-200 hover:bg-gray-50">
                        <Plus size={16} className="mr-1" /> Add Vendor
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="min-w-[120px]">Vendor</TableHead>
                            <TableHead className="min-w-[180px]">Vendor Name</TableHead>
                            <TableHead className="min-w-[120px]">Vendor Code</TableHead>
                            <TableHead className="min-w-[120px]">Tax Code</TableHead>
                            <TableHead className="min-w-[150px]">Original Quote Per Unit</TableHead>
                            <TableHead className="min-w-[120px]">Value</TableHead>
                            <TableHead className="min-w-[180px]">After Negotiation Per Unit Price</TableHead>
                            <TableHead className="min-w-[150px]">After Negotiation Value</TableHead>
                            <TableHead className="min-w-[100px]">GST %</TableHead>
                            <TableHead className="min-w-[120px]">Tax Amount</TableHead>
                            <TableHead className="min-w-[120px]">Freight</TableHead>
                            <TableHead className="min-w-[120px]">Other Charges</TableHead>
                            <TableHead className="min-w-[150px] bg-orange-50 font-bold">Grand Total After Original</TableHead>
                            <TableHead className="min-w-[150px] bg-blue-50 font-bold">Grand Total After Negotiation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {localVendors.map((vendor, index) => {
                            const totals = calculateTotals(vendor);
                            const isL1 = totals.grandTotalNegotiated === lowestNegotiatedTotal && totals.grandTotalNegotiated > 0;

                            return (
                                <TableRow key={vendor.id} className={isL1 ? 'bg-green-50/50' : ''}>
                                    <TableCell className="font-semibold text-gray-700">Vendor {index + 1}</TableCell>
                                    <TableCell>
                                        <Input
                                            value={vendor.vendorName}
                                            onChange={e => handleCellChange(index, 'vendorName', e.target.value)}
                                            readOnly={readOnly}
                                            className="h-9"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={vendor.vendorCode}
                                            onChange={e => handleCellChange(index, 'vendorCode', e.target.value)}
                                            readOnly={readOnly}
                                            className="h-9"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={vendor.taxCode}
                                            placeholder="Tax"
                                            onChange={e => handleCellChange(index, 'taxCode', e.target.value)}
                                            readOnly={readOnly}
                                            className="h-9"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                            <Input
                                                type="number"
                                                value={vendor.originalQuote}
                                                onChange={e => handleCellChange(index, 'originalQuote', parseFloat(e.target.value) || 0)}
                                                readOnly={readOnly}
                                                className="h-9 pl-6"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 font-medium">₹{totals.originalValue.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                            <Input
                                                type="number"
                                                value={vendor.negotiatedQuote}
                                                onChange={e => handleCellChange(index, 'negotiatedQuote', parseFloat(e.target.value) || 0)}
                                                readOnly={readOnly}
                                                className="h-9 pl-6 bg-white font-semibold"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 font-medium">₹{totals.negotiatedValue.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={vendor.gstRate}
                                                onChange={e => handleCellChange(index, 'gstRate', parseFloat(e.target.value) || 0)}
                                                readOnly={readOnly}
                                                className="h-9 pr-6"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">₹{totals.taxAmount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                            <Input
                                                type="number"
                                                value={vendor.freight}
                                                onChange={e => handleCellChange(index, 'freight', parseFloat(e.target.value) || 0)}
                                                readOnly={readOnly}
                                                className="h-9 pl-6"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                            <Input
                                                type="number"
                                                value={vendor.otherCharges}
                                                onChange={e => handleCellChange(index, 'otherCharges', parseFloat(e.target.value) || 0)}
                                                readOnly={readOnly}
                                                className="h-9 pl-6"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="bg-orange-50/50 font-bold text-gray-800">
                                        ₹{totals.grandTotalOriginal.toLocaleString() || '0'}
                                    </TableCell>
                                    <TableCell className={`bg-gray-50/50 font-bold text-lg ${isL1 ? 'text-green-700' : 'text-primary'}`}>
                                        ₹{totals.grandTotalNegotiated.toLocaleString() || '0'}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {!readOnly && (
                <div className="mt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 h-10 px-6"
                    >
                        {isSaving ? 'Saving...' : (
                            <>
                                <Save size={18} className="mr-2" /> Save Vendor Comparison
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
