import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface ApprovalLevel {
    level: number;
    role: string;
    status: 'pending' | 'approved' | 'rejected' | 'sent_back';
    approver_name?: string;
    comments?: string;
    updated_at?: string;
}

interface ApprovalStatusProps {
    approvals?: ApprovalLevel[];
    currentLevel?: number;
    isPreview?: boolean; // True when showing dynamic calculation before submission
}

const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    sent_back: 'bg-orange-100 text-orange-800 border-orange-200',
};

const roleDisplayNames: Record<string, string> = {
    'approver_l1': 'IDM-Team Lead',
    'approver_l2': 'IDM-Lead',
    'approver_l3': 'Head Sourcing & Supply Chain',
    'approver_l4': 'GTO/GCO',
    'approver_l5': 'CFO',
    'approver_l6': 'CEO',
};

export function ApprovalStatus({ approvals = [], currentLevel, isPreview = false }: ApprovalStatusProps) {
    if (approvals.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Approval Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">No approval chain defined yet.</p>
                    <p className="text-xs text-gray-400 mt-2">Select a vendor to see the required approval levels based on total value.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Approval Status</span>
                    {isPreview && (
                        <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Preview
                        </span>
                    )}
                </CardTitle>
                {isPreview && (
                    <p className="text-xs text-gray-500 mt-1">
                        This approval chain is calculated based on the current total value. It will be finalized upon submission.
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {approvals.map((approval) => {
                        const isCurrentLevel = approval.level === currentLevel;
                        const statusIcon = approval.status === 'approved' ? (
                            <CheckCircle2 size={16} className="text-green-600" />
                        ) : approval.status === 'rejected' ? (
                            <XCircle size={16} className="text-red-600" />
                        ) : (
                            <Clock size={16} className="text-yellow-600" />
                        );

                        return (
                            <div
                                key={approval.level}
                                className={`flex items-center justify-between p-3 rounded-md border ${isCurrentLevel ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${isCurrentLevel ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                                        }`}>
                                        L{approval.level}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {roleDisplayNames[approval.role] || approval.role}
                                        </p>
                                        <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
                                            {statusIcon}
                                            {approval.status.replace('_', ' ')}
                                            {approval.approver_name && ` - ${approval.approver_name}`}
                                        </p>
                                        {approval.comments && (
                                            <p className="text-xs text-gray-600 mt-1 italic">"{approval.comments}"</p>
                                        )}
                                    </div>
                                </div>
                                <Badge className={statusStyles[approval.status]}>
                                    {approval.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
