import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import { costSheetService } from '../services/costSheet.service';
import { dashboardService } from '../services/dashboard.service';
import Swal from 'sweetalert2';
import { History, TrendingUp, AlertCircle, Clock as ClockIcon, Edit } from 'lucide-react';
import { ChangeRequestDialog } from '../components/ChangeRequestDialog';
import { historyService } from '../services/history.service';

export function ApproverPage() {
    const { costSheetId } = useParams<{ costSheetId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'summary' | 'audit' | 'history'>('summary');
    const [costSheet, setCostSheet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [showChangeRequestDialog, setShowChangeRequestDialog] = useState(false);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [changeRequests, setChangeRequests] = useState<any[]>([]);

    useEffect(() => {
        const fetchCostSheet = async () => {
            if (!costSheetId) return;
            try {
                setLoading(true);
                const data = await costSheetService.getCostSheetById(costSheetId);
                setCostSheet(data);

                // Fetch audit logs as well using the numeric ID from the data
                if (data && data.id) {
                    const [logs, timelineData, changeRequestsData] = await Promise.all([
                        dashboardService.getAuditLogs({ costSheetId: data.id }),
                        historyService.getHistoryTimeline(data.id.toString()),
                        historyService.getChangeRequests(data.id.toString())
                    ]);
                    setAuditLogs(logs);
                    setTimeline(timelineData);
                    setChangeRequests(changeRequestsData);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load cost sheet details');
            } finally {
                setLoading(false);
            }
        };
        fetchCostSheet();
    }, [costSheetId]);

    const handleApprovalAction = async (action: 'approve' | 'reject' | 'send_back') => {
        if (!costSheet) return;

        const actionText = action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Send Back';
        const color = action === 'approve' ? '#10B981' : action === 'reject' ? '#EF4444' : '#F59E0B';

        const result = await Swal.fire({
            title: `${actionText} Cost Sheet?`,
            text: `Are you sure you want to ${action.replace('_', ' ')} this cost sheet?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: color,
            cancelButtonColor: '#6B7280',
            confirmButtonText: `Yes, ${actionText}!`
        });

        if (!result.isConfirmed) return;

        if (action !== 'approve' && !comments.trim()) {
            Swal.fire('Required', 'Please provide comments for rejection or requesting changes.', 'warning');
            return;
        }

        try {
            setActionLoading(true);
            await costSheetService.performApprovalAction(costSheet.id, action, comments);
            await Swal.fire('Success', `Cost sheet ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'sent back'} successfully.`, 'success');
            navigate('/approvals');
        } catch (err: any) {
            console.error(err);
            Swal.fire('Error', err.response?.data?.message || 'Failed to perform action', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!costSheet) return <div className="p-8">Cost Sheet not found</div>;

    // Helper to extract PR numbers for display
    const prNumbersDisplay = costSheet.cost_sheet_prs?.map((p: any) => p.pr_number).join(', ') || 'N/A';

    // Calculate total estimated value from linked PRs if final order value is not set
    const estimatedPrValue = costSheet.cost_sheet_prs?.reduce((sum: number, p: any) => sum + (Number(p.SapPr?.est_value) || 0), 0) || 0;
    const valueToDisplay = costSheet.final_order_value || estimatedPrValue;
    const totalValueDisplay = valueToDisplay ? `₹${Number(valueToDisplay).toLocaleString()}` : 'N/A';

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <Button variant="ghost" onClick={() => navigate('/approvals')} className="mb-4">
                    <ArrowLeft size={16} className="mr-2" /> Back to Approval List
                </Button>

                <div className="grid grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="col-span-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Approval Review: {costSheet.cost_sheet_number}</CardTitle>
                                <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                                    <span>PR Numbers: <span className="font-medium text-gray-700">{prNumbersDisplay}</span></span>
                                    <Badge>{costSheet.requirement_type}</Badge>
                                    <Badge variant="outline">{costSheet.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="border-b border-gray-200 mb-4">
                                    <nav className="flex space-x-4">
                                        <button onClick={() => setActiveTab('summary')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Summary View</button>
                                        <button onClick={() => setActiveTab('audit')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'audit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Audit Trail</button>
                                        <button onClick={() => setActiveTab('history')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>History & Changes</button>
                                    </nav>
                                </div>

                                {activeTab === 'summary' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                <TrendingUp size={18} className="text-blue-500" /> Approval Chain Progression
                                            </h3>
                                            <div className="flex flex-col space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                                {(costSheet.approval_chain || []).map((step: any, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-4 relative z-10">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.status === 'approved' ? 'bg-green-500 text-white' :
                                                            step.status === 'rejected' ? 'bg-red-500 text-white' :
                                                                step.status === 'sent_back' ? 'bg-amber-500 text-white' :
                                                                    (costSheet.current_approval_level === step.level) ? 'bg-blue-500 text-white animate-pulse' :
                                                                        'bg-gray-200 text-gray-500'
                                                            }`}>
                                                            {step.status === 'approved' ? <Check size={12} /> : step.level}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <p className="text-sm font-semibold text-gray-800">{step.role.replace('approver_', '').replace('_', ' ').toUpperCase()}</p>
                                                                <Badge variant="outline" className={
                                                                    step.status === 'approved' ? 'text-green-600 border-green-200 bg-green-50' :
                                                                        step.status === 'pending' ? 'text-gray-400 border-gray-100' :
                                                                            'text-amber-600 border-amber-200 bg-amber-50'
                                                                }>
                                                                    {step.status.toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                            {step.approver_name && <p className="text-xs text-gray-500">By: {step.approver_name}</p>}
                                                            {step.comments && <p className="text-xs text-gray-500 italic mt-1 bg-gray-50 p-1.5 rounded">"{step.comments}"</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <h3 className="font-semibold text-gray-800 mb-4">Line Items Summary</h3>
                                            <div className="space-y-3">
                                                {costSheet.cost_sheet_line_items?.map((item: any) => (
                                                    <div key={item.id} className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-gray-400">#{(item.SapPrLineItem?.line_item_number || item.line_item_number)}</span>
                                                                <span className="font-medium text-gray-800">{item.SapPrLineItem?.description || item.description}</span>
                                                            </div>
                                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">QTY: {item.SapPrLineItem?.qty || item.quantity}</Badge>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                                            <span>Part Code: <span className="text-gray-700 font-medium">{item.SapPrLineItem?.part_code || item.part_code || 'N/A'}</span></span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className={item.finalized_deal ? 'text-green-600 border-green-200 bg-green-50' : 'text-amber-600 border-amber-200'}>
                                                                    {item.finalized_deal ? 'VENDOR FINALIZED' : 'PENDING SELECTION'}
                                                                </Badge>
                                                                {item.finalized_deal && (
                                                                    <span className="font-bold text-gray-900">₹{(Number(item.finalized_deal.final_total_value) || 0).toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'audit' && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <History size={18} className="text-blue-500" /> Activity Timeline
                                        </h3>
                                        <div className="relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
                                            {auditLogs.length > 0 ? auditLogs.map((log: any, idx: number) => (
                                                <div key={idx} className="relative pl-10 pb-6">
                                                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10">
                                                        <ClockIcon size={14} className="text-primary" />
                                                    </div>
                                                    <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm font-bold text-gray-800">{log.activity_type.replace(/_/g, ' ')}</p>
                                                            <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-2">{log.description}</p>
                                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                                                            <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-600">
                                                                {log.User?.full_name?.charAt(0)}
                                                            </div>
                                                            <span className="text-[10px] font-medium text-gray-500">{log.User?.full_name}</span>
                                                        </div>
                                                        {log.comments && (
                                                            <p className="mt-2 p-2 bg-amber-50 border-l-2 border-amber-300 text-[11px] text-amber-800 italic rounded-r italic">
                                                                "{log.comments}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-10 text-gray-400">
                                                    <AlertCircle size={32} className="mx-auto mb-2 opacity-20" />
                                                    <p>No audit activity found for this cost sheet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <History size={18} className="text-blue-500" /> Complete History Timeline
                                            </h3>
                                            <div className="relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
                                                {timeline.length > 0 ? timeline.map((item: any, idx: number) => (
                                                    <div key={idx} className="relative pl-12 pb-6">
                                                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm z-10">
                                                            {item.action.includes('APPROVE') ? <CheckCircle size={14} className="text-green-500" /> :
                                                                item.action.includes('REJECT') ? <X size={14} className="text-red-500" /> :
                                                                    item.action.includes('CHANGE') ? <AlertCircle size={14} className="text-amber-500" /> :
                                                                        <ClockIcon size={14} className="text-blue-500" />}
                                                        </div>
                                                        <div className={`p-4 rounded-lg border ${item.action.includes('APPROVE') ? 'bg-green-50 border-green-200' :
                                                            item.action.includes('REJECT') ? 'bg-red-50 border-red-200' :
                                                                item.action.includes('CHANGE') ? 'bg-amber-50 border-amber-200' :
                                                                    'bg-blue-50 border-blue-200'
                                                            }`}>
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h4 className="font-semibold text-sm">{item.action.replace(/_/g, ' ')}</h4>
                                                                    <p className="text-xs text-gray-600 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                                                                </div>
                                                                {item.level && <Badge variant="outline" className="text-xs">Level {item.level}</Badge>}
                                                            </div>
                                                            <p className="text-sm mb-2">{item.description}</p>
                                                            {item.comments && (
                                                                <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border border-current border-opacity-20">
                                                                    <p className="text-xs italic">"{item.comments}"</p>
                                                                </div>
                                                            )}
                                                            {item.affectedFields && item.affectedFields.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {item.affectedFields.map((field: string, i: number) => (
                                                                        <Badge key={i} variant="secondary" className="text-xs">{field}</Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-3 text-xs">
                                                                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[8px] font-bold">
                                                                    {item.user?.charAt(0)}
                                                                </div>
                                                                <span className="font-medium">{item.user}</span>
                                                                {item.userRole && (
                                                                    <>
                                                                        <span className="text-gray-400">•</span>
                                                                        <Badge variant="secondary" className="text-xs">{item.userRole.replace(/_/g, ' ').toUpperCase()}</Badge>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-10 text-gray-400">
                                                        <AlertCircle size={32} className="mx-auto mb-2 opacity-20" />
                                                        <p>No history found for this cost sheet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {changeRequests.length > 0 && (
                                            <div className="pt-6 border-t border-gray-200">
                                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                    <AlertCircle size={18} className="text-amber-500" /> Change Requests
                                                </h3>
                                                <div className="space-y-3">
                                                    {changeRequests.map((request: any) => (
                                                        <div key={request.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h4 className="font-semibold text-sm text-amber-900">{request.requestType.replace(/_/g, ' ').toUpperCase()}</h4>
                                                                    <p className="text-xs text-amber-700 mt-1">
                                                                        By {request.requestedBy} on {new Date(request.requestedAt).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <Badge className={`text-xs ${request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                                    request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {request.status.toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                                                    <p className="text-xs font-semibold text-amber-900">Reason:</p>
                                                                    <p className="text-xs text-amber-800">{request.changeReason}</p>
                                                                </div>
                                                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                                                    <p className="text-xs font-semibold text-amber-900">Details:</p>
                                                                    <p className="text-xs text-amber-800">{request.detailedComments}</p>
                                                                </div>
                                                                {request.affectedFields && request.affectedFields.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {request.affectedFields.map((field: string, i: number) => (
                                                                            <Badge key={i} variant="outline" className="text-xs bg-white">{field}</Badge>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Panel */}
                    <div className="col-span-4">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Your Approval</CardTitle>
                                <p className="text-sm text-gray-500">Current Level: {costSheet.current_approval_level}</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded-md p-4">
                                    <p className="text-sm text-gray-500">Total Value</p>
                                    <p className="text-2xl font-bold">{totalValueDisplay}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Comments (Required for Rejection/Changes)</label>
                                    <Textarea
                                        placeholder="Add any comments or notes..."
                                        className="mt-1"
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprovalAction('approve')}
                                        disabled={actionLoading}
                                    >
                                        <Check size={16} className="mr-2" />Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => handleApprovalAction('reject')}
                                        disabled={actionLoading}
                                    >
                                        <X size={16} className="mr-2" />Reject
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleApprovalAction('send_back')}
                                        disabled={actionLoading}
                                    >
                                        <MessageSquare size={16} className="mr-2" />Request Changes (Send Back)
                                    </Button>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                                    onClick={() => setShowChangeRequestDialog(true)}
                                    disabled={actionLoading}
                                >
                                    <Edit size={16} className="mr-2" />Request Changes
                                </Button>

                                <Button variant="secondary" className="w-full" onClick={() => navigate(`/cost-sheet-editor`, { state: { costSheetId: costSheet.id, isApproverView: true } })}>
                                    <FileText size={16} className="mr-2" />View Detailed Cost Sheet
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <ChangeRequestDialog
                    isOpen={showChangeRequestDialog}
                    onClose={() => setShowChangeRequestDialog(false)}
                    costSheetId={costSheet.id.toString()}
                    onSuccess={() => {
                        navigate('/approvals');
                    }}
                />
            </div>
        </div>
    );
}