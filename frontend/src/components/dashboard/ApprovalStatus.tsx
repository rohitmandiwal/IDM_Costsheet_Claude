import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

// Mock data for approval status
const mockApprovalLevels = [
    { level: 'L1', role: 'IDM-Team Lead', status: 'Pending' as const },
    { level: 'L2', role: 'IDM-Lead', status: 'Pending' as const },
    { level: 'L3', role: 'Head Sourcing & Supply Chain', status: 'Pending' as const },
];

const statusStyles = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
}

export function ApprovalStatus() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Approval Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {mockApprovalLevels.map(level => (
                        <div key={level.level} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                                    {level.level}
                                </span>
                                <div>
                                    <p className="font-semibold text-gray-800">{level.role}</p>
                                    <p className="text-sm text-gray-500">{level.status} review</p>
                                </div>
                            </div>
                            <Badge className={statusStyles[level.status]}>{level.status}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
