import { useState, useEffect } from 'react';
import { costSheetService } from '../../services/costSheet.service';
import type { SapPo } from '../../types/sap.types';
import { Loader2, History } from 'lucide-react';

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
                setError('Failed to load records');
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [partCode, JSON.stringify(vendorCodes)]);

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
                <History size={18} className="text-gray-400" />
                <h3 className="font-semibold text-gray-800 text-lg">Previous Purchase Records</h3>
            </div>

            <div className="overflow-hidden border rounded-xl bg-gray-50/30">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100/50">
                        <tr>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">P.O. Number</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Vendor</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Per Unit</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center">
                                    <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-sm text-red-500">
                                    Unable to load purchase history.
                                </td>
                            </tr>
                        ) : records.length > 0 ? (
                            records.map((record) => (
                                <tr key={record.po_number} className="hover:bg-white transition-colors group">
                                    <td className="px-4 py-4 text-sm font-black text-gray-900 font-mono tracking-tight group-hover:text-blue-600">
                                        {record.po_number}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{record.vendor_name}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{record.vendor_code}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-black text-gray-900 text-right">
                                        ₹ {Number(record.unit_price).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-xs font-bold text-gray-500 text-right">
                                        {new Date(record.po_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400 italic">
                                    No previous purchase records found for this item from selected vendors.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
