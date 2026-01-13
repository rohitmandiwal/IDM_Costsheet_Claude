import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, MessageSquare, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import { costSheetService } from '../services/costSheet.service';
import Swal from 'sweetalert2';

export function ApproverPage() {
    const { costSheetId } = useParams<{ costSheetId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'summary' | 'audit'>('summary');
    const [costSheet, setCostSheet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchCostSheet = async () => {
            if (!costSheetId) return;
            try {
                setLoading(true);
                const data = await costSheetService.getCostSheetById(costSheetId);
                setCostSheet(data);
                // Note: Real audit trail/timeline would require separate fetch or expanded API
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
                                    </nav>
                                </div>

                                {activeTab === 'summary' && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Line Items</h3>
                                        {costSheet.cost_sheet_line_items?.map((item: any) => (
                                            <div key={item.id} className="p-3 border rounded bg-gray-50">
                                                <p className="font-medium">{item.id} - {item.finalized_vendor_id ? 'Vendor Selected' : 'Pending Selection'}</p>
                                                {/* Add more details here as needed */}
                                            </div>
                                        ))}
                                        <p className="text-gray-500 text-sm mt-4">
                                            Full timeline view requires integration with audit logs API.
                                        </p>
                                    </div>
                                )}
                                {activeTab === 'audit' && (
                                    <div className="text-center py-8 text-gray-500">
                                        Audit trail integration pending.
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

                                <Button variant="secondary" className="w-full" onClick={() => navigate(`/cost-sheet-editor`, { state: { costSheetId: costSheet.id, isApproverView: true } })}>
                                    <FileText size={16} className="mr-2" />View Detailed Cost Sheet
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}