import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/Table';
import { PlusCircle, X } from 'lucide-react';

export interface VendorQuote {
    id: number;
    vendorName: string;
    vendorCode: string;
    originalQuote: number;
    negotiatedQuote: number;
    gstRate: number;
    freight: number;
    otherCharges: number;
    paymentTerms?: string;
    deliveryTerms?: string;
    exchangeRate?: number;
    quoteValidityDate?: string;
    vendorId?: number;
}

interface VendorComparisonProps {
    lineItemQuantity: number;
    vendors: VendorQuote[];
    setVendors: React.Dispatch<React.SetStateAction<VendorQuote[]>>;
    readOnly?: boolean;
}

export function VendorComparison({ lineItemQuantity, vendors, setVendors, readOnly = false }: VendorComparisonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculate derived values for each vendor
    const vendorsWithTotals = vendors.map(v => {
        const negotiatedValue = v.negotiatedQuote * lineItemQuantity;
        const taxAmount = negotiatedValue * (v.gstRate / 100);
        const totalValue = negotiatedValue + taxAmount + v.freight + v.otherCharges;
        return {
            ...v,
            negotiatedValue,
            taxAmount,
            totalValue
        };
    });

    const lowestTotal = Math.min(...vendorsWithTotals.map(v => v.totalValue).filter(v => v > 0));

    const handleAddVendor = (newVendor: VendorQuote) => {
        setVendors(prev => [...prev, { ...newVendor, id: prev.length + 1 }]);
        setIsModalOpen(false);
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-semibold text-gray-800">Vendor Comparison</h3>
                    <p className="text-xs text-gray-500">Best price (L1) highlighted in green.</p>
                </div>
                {!readOnly && (
                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                        <PlusCircle size={16} className="mr-2" />Add Vendor
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-48 bg-gray-50">Parameters</TableHead>
                            {vendorsWithTotals.map(vendor => (
                                <TableHead key={vendor.id} className={`text-center min-w-[150px] ${vendor.totalValue === lowestTotal ? 'bg-green-50 border-t-2 border-green-500' : ''}`}>
                                    <div className="font-bold text-gray-800">{vendor.vendorName}</div>
                                    <div className="text-xs font-normal text-gray-500">{vendor.vendorCode}</div>
                                    {vendor.totalValue === lowestTotal && <div className="text-xs font-bold text-green-600 mt-1">L1 Vendor</div>}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium bg-gray-50">Original Quote (Unit)</TableCell>
                            {vendorsWithTotals.map(vendor => (
                                <TableCell key={vendor.id} className="text-center text-gray-500">₹{vendor.originalQuote.toLocaleString()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium bg-gray-50">Negotiated Quote (Unit)</TableCell>
                            {vendorsWithTotals.map(vendor => (
                                <TableCell key={vendor.id} className="text-center font-semibold">₹{vendor.negotiatedQuote.toLocaleString()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium bg-gray-50">Value (Qty: {lineItemQuantity})</TableCell>
                            {vendorsWithTotals.map(vendor => (
                                <TableCell key={vendor.id} className="text-center text-gray-600">₹{vendor.negotiatedValue.toLocaleString()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium bg-gray-50">GST (%)</TableCell>
                            {vendorsWithTotals.map(vendor => (
                                <TableCell key={vendor.id} className="text-center">{vendor.gstRate}%</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium bg-gray-50">Tax Amount</TableCell>
                            {vendorsWithTotals.map(vendor => (
                                <TableCell key={vendor.id} className="text-center text-gray-600">₹{vendor.taxAmount.toLocaleString()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium bg-gray-50">Freight</TableCell>
                            {vendorsWithTotals.map(vendor => (
                                <TableCell key={vendor.id} className="text-center text-gray-600">₹{vendor.freight.toLocaleString()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium bg-gray-50">Other Charges</TableCell>
                            {vendorsWithTotals.map(vendor => (
                                <TableCell key={vendor.id} className="text-center text-gray-600">₹{vendor.otherCharges.toLocaleString()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow className="bg-gray-100 border-t-2 border-gray-300">
                            <TableCell className="font-bold">Total Landed Cost</TableCell>
                            {vendorsWithTotals.map(vendor => (
                                <TableCell key={vendor.id} className={`text-center font-bold text-lg ${vendor.totalValue === lowestTotal ? 'text-green-700' : 'text-gray-800'}`}>
                                    ₹{vendor.totalValue.toLocaleString()}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {isModalOpen && <AddVendorModal onAdd={handleAddVendor} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}

function AddVendorModal({ onClose, onAdd }: { onClose: () => void, onAdd: (vendor: VendorQuote) => void }) {
    const [formData, setFormData] = useState<Partial<VendorQuote>>({
        vendorName: '',
        vendorCode: '',
        originalQuote: 0,
        negotiatedQuote: 0,
        gstRate: 18,
        freight: 0,
        otherCharges: 0
    });

    const handleChange = (field: keyof VendorQuote, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (formData.vendorName && formData.negotiatedQuote !== undefined) {
            // Basic validation
            const newVendor = {
                ...formData,
                id: 0, // Assigned by parent
                vendorCode: formData.vendorCode || 'NEW-V',
                originalQuote: Number(formData.originalQuote) || 0,
                negotiatedQuote: Number(formData.negotiatedQuote) || 0,
                gstRate: Number(formData.gstRate) || 0,
                freight: Number(formData.freight) || 0,
                otherCharges: Number(formData.otherCharges) || 0,
            } as VendorQuote;
            onAdd(newVendor);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Add New Vendor Quote</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Vendor Name *</label>
                        <Input
                            placeholder="Enter vendor name..."
                            value={formData.vendorName}
                            onChange={e => handleChange('vendorName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Vendor Code</label>
                        <Input
                            placeholder="Optional code"
                            value={formData.vendorCode}
                            onChange={e => handleChange('vendorCode', e.target.value)}
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md col-span-2 grid grid-cols-2 gap-4">
                        <h4 className="col-span-2 font-semibold text-blue-800 text-sm">Pricing Details</h4>
                        <div>
                            <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Original Quote (Unit Price)</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.originalQuote}
                                onChange={e => handleChange('originalQuote', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Negotiated Quote (Unit Price) *</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.negotiatedQuote}
                                onChange={e => handleChange('negotiatedQuote', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 col-span-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">GST Rate (%)</label>
                            <Input
                                type="number"
                                placeholder="18"
                                value={formData.gstRate}
                                onChange={e => handleChange('gstRate', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Freight</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.freight}
                                onChange={e => handleChange('freight', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Other Charges</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.otherCharges}
                                onChange={e => handleChange('otherCharges', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Add Vendor Quote</Button>
                </div>
            </div>
        </div>
    )
}
