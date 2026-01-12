import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/Table';
import { PlusCircle, X } from 'lucide-react';

// Mock vendor type for now. This should eventually come from types/costSheet.types.ts
export interface VendorQuote {
    id: number;
    vendorName: string;
    vendorCode: string;
    originalQuote: number;
    negotiatedQuote: number;
    gstRate: number;
    freight: number;
    otherCharges: number;
}

interface VendorComparisonProps {
    lineItemQuantity: number;
    vendors: VendorQuote[];
    setVendors: React.Dispatch<React.SetStateAction<VendorQuote[]>>;
}

export function VendorComparison({ lineItemQuantity, vendors, setVendors }: VendorComparisonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // This would be the lowest negotiated quote
    const lowestQuote = Math.min(...vendors.map(v => v.negotiatedQuote).filter(q => q > 0));

    const handleAddVendor = (newVendor: { name: string, code: string }) => {
        setVendors(prev => [...prev, {
            id: prev.length + 1,
            vendorName: newVendor.name,
            vendorCode: newVendor.code,
            originalQuote: 0,
            negotiatedQuote: 0,
            gstRate: 0,
            freight: 0,
            otherCharges: 0,
        }]);
        setIsModalOpen(false);
    }
    
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-semibold text-gray-800">Vendor Comparison</h3>
                    <p className="text-xs text-gray-500">Best price highlighted in green. Scroll horizontally for all fields.</p>
                </div>
                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={16} className="mr-2"/>Add Vendor
                </Button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Original Quote</TableHead>
                            <TableHead>Negotiated Quote</TableHead>
                            <TableHead>GST</TableHead>
                            <TableHead>Freight</TableHead>
                            <TableHead>Total Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vendors.map(vendor => {
                            const negotiatedValue = vendor.negotiatedQuote * lineItemQuantity;
                            const taxAmount = negotiatedValue * (vendor.gstRate / 100);
                            const totalValue = negotiatedValue + taxAmount + vendor.freight + vendor.otherCharges;
                            const isL1 = vendor.negotiatedQuote === lowestQuote;

                            return (
                                <TableRow key={vendor.id}>
                                    <TableCell>
                                        <p className="font-medium text-gray-800">{vendor.vendorName}</p>
                                        <p className="text-xs text-gray-500">{vendor.vendorCode}</p>
                                    </TableCell>
                                    <TableCell>₹{vendor.originalQuote.toLocaleString()}</TableCell>
                                    <TableCell className={isL1 ? 'text-green-600 font-bold' : ''}>
                                        ₹{vendor.negotiatedQuote.toLocaleString()}
                                    </TableCell>
                                    <TableCell>₹{taxAmount.toLocaleString()} ({vendor.gstRate}%)</TableCell>
                                    <TableCell>₹{vendor.freight.toLocaleString()}</TableCell>
                                    <TableCell className="font-semibold">₹{totalValue.toLocaleString()}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            
            {isModalOpen && <AddVendorModal onAdd={handleAddVendor} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}

function AddVendorModal({ onClose, onAdd }: { onClose: () => void, onAdd: (vendor: { name: string, code: string }) => void }) {
    const [vendorName, setVendorName] = useState('');
    const [vendorCode, setVendorCode] = useState('');

    const handleSubmit = () => {
        if (vendorName) {
            onAdd({ name: vendorName, code: vendorCode });
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Add New Vendor</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X size={20}/></Button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Vendor Name</label>
                        <Input 
                            placeholder="Enter vendor name..."
                            value={vendorName}
                            onChange={e => setVendorName(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Search for an existing vendor or add a new one.</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Vendor Code (Optional)</label>
                        <Input
                            placeholder="Vendor code auto-populates if found"
                            value={vendorCode}
                            onChange={e => setVendorCode(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Add Vendor</Button>
                </div>
            </div>
        </div>
    )
}
