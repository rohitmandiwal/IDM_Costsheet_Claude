import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Label } from '../ui/Label';
import type { VendorQuote } from './VendorComparison';

interface VendorSelectionProps {
    vendors: VendorQuote[];
    lineItemQuantity: number;
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium text-gray-800">{value}</p>
        </div>
    );
}

export function VendorSelection({ vendors, lineItemQuantity }: VendorSelectionProps) {
    const [selectedVendorId, setSelectedVendorId] = useState<string>('');

    const selectedVendor = useMemo(() => {
        if (!selectedVendorId) return null;
        return vendors.find(v => v.id.toString() === selectedVendorId) || null;
    }, [selectedVendorId, vendors]);

    const pricingBreakdown = useMemo(() => {
        if (!selectedVendor) return null;

        const negotiatedValue = selectedVendor.negotiatedQuote * lineItemQuantity;
        const gstAmount = negotiatedValue * (selectedVendor.gstRate / 100);
        const totalValue = negotiatedValue + gstAmount + selectedVendor.freight + selectedVendor.otherCharges;

        return {
            negotiatedValue,
            gstAmount,
            totalValue,
        };
    }, [selectedVendor, lineItemQuantity]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vendor Selection</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="vendor-select">Select Preferred Vendor</Label>
                        <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                            <SelectTrigger id="vendor-select">
                                <SelectValue placeholder="Choose a vendor..." />
                            </SelectTrigger>
                            <SelectContent>
                                {vendors.map((vendor) => (
                                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                        {vendor.vendorName} ({vendor.vendorCode})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedVendor && pricingBreakdown && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
    );
}
