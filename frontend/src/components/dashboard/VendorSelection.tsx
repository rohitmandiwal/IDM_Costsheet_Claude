import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { AlertTriangle } from 'lucide-react';
import type { VendorQuote } from './VendorComparison';

interface VendorSelectionProps {
    vendors: VendorQuote[];
    lineItemQuantity: number;
    selectedVendorId: string;
    onVendorSelect: (id: string) => void;
    readOnly?: boolean;
    existingDeviation?: {
        deviation_type: string;
        remarks: string;
    } | null;
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium text-gray-800">{value}</p>
        </div>
    );
}

export function VendorSelection({ vendors, lineItemQuantity, selectedVendorId, onVendorSelect, readOnly = false, existingDeviation = null }: VendorSelectionProps) {
    const [justification, setJustification] = useState(existingDeviation?.remarks || '');

    // Calculate totals to find L1
    const vendorsWithTotals = useMemo(() => {
        return vendors.map(v => {
            const negotiatedValue = v.negotiatedQuote * lineItemQuantity;
            const taxAmount = negotiatedValue * (v.gstRate / 100);
            const totalValue = negotiatedValue + taxAmount + v.freight + v.otherCharges;
            return { ...v, totalValue };
        });
    }, [vendors, lineItemQuantity]);

    const l1Vendor = useMemo(() => {
        if (vendorsWithTotals.length === 0) return null;
        return vendorsWithTotals.reduce((prev, current) => (prev.totalValue < current.totalValue ? prev : current));
    }, [vendorsWithTotals]);

    const selectedVendor = useMemo(() => {
        if (!selectedVendorId) return null;
        return vendorsWithTotals.find(v => v.id.toString() === selectedVendorId) || null;
    }, [selectedVendorId, vendorsWithTotals]);

    const isL1Selected = selectedVendor && l1Vendor && selectedVendor.id === l1Vendor.id;
    const isDeviation = selectedVendor && !isL1Selected;

    const pricingBreakdown = useMemo(() => {
        if (!selectedVendor) return null;
        const negotiatedValue = selectedVendor.negotiatedQuote * lineItemQuantity;
        const gstAmount = negotiatedValue * (selectedVendor.gstRate / 100);

        return {
            negotiatedValue,
            gstAmount,
            totalValue: selectedVendor.totalValue,
        };
    }, [selectedVendor, lineItemQuantity]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Vendor Selection</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="vendor-select">Select Preferred Vendor</Label>
                            <Select value={selectedVendorId} onValueChange={onVendorSelect} disabled={readOnly}>
                                <SelectTrigger id="vendor-select">
                                    <SelectValue placeholder="Choose a vendor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendorsWithTotals.map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                            {vendor.vendorName} ({vendor.vendorCode})
                                            {l1Vendor && vendor.id === l1Vendor.id ? ' - L1 Vendor' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedVendor && pricingBreakdown && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-800 mb-3">Pricing Breakdown</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <InfoItem
                                        label="Unit Price (Negotiated)"
                                        value={`₹${selectedVendor.negotiatedQuote.toLocaleString()}`}
                                    />
                                    <InfoItem
                                        label="Quantity"
                                        value={lineItemQuantity}
                                    />
                                    <InfoItem
                                        label="Base Value"
                                        value={`₹${pricingBreakdown.negotiatedValue.toLocaleString()}`}
                                    />
                                    <InfoItem
                                        label={`GST (${selectedVendor.gstRate}%)`}
                                        value={`₹${pricingBreakdown.gstAmount.toLocaleString()}`}
                                    />
                                    <InfoItem
                                        label="Freight"
                                        value={`₹${selectedVendor.freight.toLocaleString()}`}
                                    />
                                    <InfoItem
                                        label="Other Charges"
                                        value={`₹${selectedVendor.otherCharges.toLocaleString()}`}
                                    />
                                    <div className="col-span-2">
                                        <InfoItem
                                            label="Total Value"
                                            value={`₹${pricingBreakdown.totalValue.toLocaleString()}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {!selectedVendorId && (
                            <p className="text-sm text-gray-500">
                                Select a vendor from the comparison table above to view pricing details.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {isDeviation && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-amber-800">
                            <AlertTriangle size={20} />
                            <CardTitle className="text-lg">Deviation Analysis Required</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-amber-800">
                                You have selected <strong>{selectedVendor?.vendorName}</strong>, which is not the L1 vendor (<strong>{l1Vendor?.vendorName}</strong>).
                                The price difference is Approximately <strong>₹{((selectedVendor?.totalValue || 0) - (l1Vendor?.totalValue || 0)).toLocaleString()}</strong>.
                                Please provide a justification for this deviation.
                            </p>

                            <div className="space-y-2">
                                <Label htmlFor="justification" className="text-amber-900">Justification / Reason for Deviation *</Label>
                                <Textarea
                                    id="justification"
                                    placeholder="Explain why the L1 vendor was not selected..."
                                    className="bg-white border-amber-300 focus:border-amber-500 min-h-[100px]"
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
