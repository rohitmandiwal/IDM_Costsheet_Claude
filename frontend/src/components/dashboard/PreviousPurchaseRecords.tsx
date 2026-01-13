import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { costSheetService } from '../../services/costSheet.service';
import type { SapPo } from '../../types/sap.types';
import { Loader2 } from 'lucide-react';

interface PreviousPurchaseRecordsProps {
    partCode: string;
    vendorCodes: string[];
}

export function PreviousPurchaseRecords({ partCode, vendorCodes }: PreviousPurchaseRecordsProps) {
    const [records, setRecords] = useState<SapPo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!partCode) {
                setRecords([]);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await costSheetService.getPreviousPurchaseRecords(partCode, vendorCodes);
                setRecords(data);
            } catch (err) {
                console.error('Failed to fetch previous purchase records', err);
                // Don't show hard error to user to avoid disrupting workflow, just log it.
                // Maybe show empty state or small warning.
                setError('Failed to load records');
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [partCode, JSON.stringify(vendorCodes)]); // Depend on vendorCodes deep equality

    return (
        <Card className="shadow-none border-gray-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">Previous Purchase Records</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-gray-400" size={24} />
                    </div>
                ) : error ? (
                    <p className="text-sm text-red-500 py-2">Unable to load purchase history.</p>
                ) : records.length > 0 ? (
                    <div className="space-y-3">
                        {records.map((record) => (
                            <div key={record.po_number} className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-100 hover:border-gray-300 transition-colors shadow-sm">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{record.po_number}</p>
                                    <p className="text-xs text-gray-500 flex gap-2">
                                        <span>{record.vendor_name}</span>
                                        <span className="text-gray-300">|</span>
                                        <span>{record.vendor_code}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800 text-sm">₹{Number(record.unit_price).toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">{record.po_date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic py-2">
                        No previous purchase records found for this item from selected vendors.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
