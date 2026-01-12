import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

// Mock data for previous purchases
const mockPurchaseRecords = [
    { poNumber: 'PO-2024-1234', vendor: 'V-Raj Enterprises', perUnitPrice: 23500, date: '15.09.2024' },
    { poNumber: 'PO-2024-0987', vendor: 'V-Ajantha Tech', perUnitPrice: 24200, date: '28.08.2024' },
];

export function PreviousPurchaseRecords() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Previous Purchase Records</CardTitle>
            </CardHeader>
            <CardContent>
                {mockPurchaseRecords.length > 0 ? (
                    <div className="space-y-4">
                        {mockPurchaseRecords.map((record) => (
                            <div key={record.poNumber} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                                <div>
                                    <p className="font-semibold text-gray-800">{record.poNumber}</p>
                                    <p className="text-sm text-gray-500">{record.vendor}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">₹{record.perUnitPrice.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">{record.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No previous records available for this item.</p>
                )}
            </CardContent>
        </Card>
    );
}
