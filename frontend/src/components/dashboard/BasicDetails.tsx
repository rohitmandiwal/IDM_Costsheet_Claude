import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import type { PRLineItem } from '../../types/costSheet.types';

interface BasicDetailsProps {
    item: PRLineItem;
    costSheetData: any;
}

export function BasicDetails({ item, costSheetData }: BasicDetailsProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-800 text-lg">Basic Details</h3>
                <div className="text-sm text-gray-500 font-medium">
                    Total Vendors: <span className="text-gray-800 font-bold">{costSheetData?.cost_sheet_line_items?.find((li: any) => li.id === item.id)?.vendor_quotations?.length || 0}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">PR Number</label>
                    <p className="text-gray-900 font-medium">{item.prNumber}</p>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Line Item</label>
                    <p className="text-gray-900 font-medium font-mono">{item.lineNumber}</p>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Currency</label>
                    <Select defaultValue="INR">
                        <SelectTrigger className="h-9 border-gray-200 bg-gray-50/50">
                            <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Raised By</label>
                    <p className="text-gray-900 font-medium">{costSheetData?.initiator?.full_name || 'Jane Smith'}</p>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Created Date</label>
                    <p className="text-gray-900 font-medium">{formatDate(costSheetData?.created_at) || '2024-09-10'}</p>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Last Modified</label>
                    <p className="text-gray-900 font-medium">{formatDate(costSheetData?.updated_at) || '-'}</p>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Modified By</label>
                    <p className="text-gray-900 font-medium">-</p>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">PO Number</label>
                    <p className="text-gray-900 font-medium">Not Generated</p>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">PO Date</label>
                    <p className="text-gray-900 font-medium">-</p>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Final Approval Status</label>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold px-3 py-1 mt-1">
                        {costSheetData?.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </Badge>
                </div>
            </div>
        </div>
    );
}
