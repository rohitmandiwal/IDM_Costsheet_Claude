import { Badge } from '../ui/Badge';

interface ApprovalLevel {
    level: number;
    role: string;
    status: 'pending' | 'approved' | 'rejected' | 'sent_back';
    approver_name?: string;
    comments?: string;
}

interface ApprovalStatusProps {
    approvals?: ApprovalLevel[];
    isPreview?: boolean;
}

const roleDisplayNames: Record<string, string> = {
    'approver_l1': 'IDM - Team Lead',
    'approver_l2': 'IDM - Lead',
    'approver_l3': 'Head Sourcing & Supply Chain',
    'approver_l4': 'GTO/GCO',
    'approver_l5': 'CFO',
    'approver_l6': 'CEO',
};

export function ApprovalStatus({ approvals = [], isPreview = false }: ApprovalStatusProps) {
    if (approvals.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 text-lg mb-4">Approval Status</h3>
                <p className="text-sm text-gray-500">No approval chain defined yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-800 text-lg">Approval Status</h3>
                {isPreview && (
                    <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 font-bold">Preview Mode</Badge>
                )}
            </div>

            <div className="space-y-3">
                {approvals.map((approval) => {
                    const displayRole = roleDisplayNames[approval.role] || approval.role;

                    return (
                        <div key={approval.level} className="flex items-center justify-between p-4 bg-orange-50/40 border border-orange-100/50 rounded-xl">
                            <div className="flex items-center gap-5">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-black text-sm shadow-md shadow-orange-200">
                                    L{approval.level}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-base">{displayRole}</span>
                                    <span className="text-sm text-gray-500 font-medium">
                                        {approval.status === 'pending' ? 'Pending review' : (approval.approver_name || approval.status)}
                                    </span>
                                </div>
                            </div>
                            <Badge className="bg-gray-200 text-gray-700 border-none font-bold px-4 py-1.5 uppercase text-[10px] tracking-widest">
                                {approval.status}
                            </Badge>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
