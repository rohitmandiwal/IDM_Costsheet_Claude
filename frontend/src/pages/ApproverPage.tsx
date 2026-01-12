import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, MessageSquare, FileText, User, Calendar, Circle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea'; // Assuming Textarea component exists

// Mock data for a single cost sheet, which would be fetched based on useParams()
const mockCostSheet = {
    id: 'CS-2024-001',
    prNumbers: '13633801',
    totalValue: 240000,
    createdBy: 'John Doe',
    createdDate: '2024-10-28',
    submittedDate: '2024-10-30',
    currentLevel: 'L1 - Sourcing Manager',
    requirementType: 'TECH',
    lineItemsCount: 1,
    timeline: [
        { status: 'Created', user: 'John Doe', date: '2024-10-28 10:30', isCompleted: true },
        { status: 'L1 Approver', role: 'Sourcing Manager', statusLabel: 'Awaiting approval', isCompleted: false },
        { status: 'Head Sourcing', role: 'Rajesh Kumar', statusLabel: 'Awaiting approval', isCompleted: false },
    ],
    auditTrail: [
        { event: 'Cost Sheet Created', user: 'John Doe', date: '2024-10-28', details: 'Cost sheet created for PR 13633801' },
        { event: 'Submitted for Approval', user: 'John Doe', date: '2024-10-30', details: 'Cost sheet submitted for approval workflow' },
        { event: 'Pending Approval', user: 'You', date: 'Current', details: 'Awaiting your approval at L1 - Sourcing Manager' },
    ]
};


export function ApproverPage() {
    const { costSheetId } = useParams<{ costSheetId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'summary' | 'audit'>('summary');

    // In a real app, you'd fetch the cost sheet data using the costSheetId
    const costSheet = mockCostSheet;

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <Button variant="ghost" onClick={() => navigate('/approvals')} className="mb-4">
                    <ArrowLeft size={16} className="mr-2"/> Back to Approval List
                </Button>

                <div className="grid grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="col-span-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Approval Review: {costSheet.id}</CardTitle>
                                <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                                    <span>PR Numbers: <span className="font-medium text-gray-700">{costSheet.prNumbers}</span></span>
                                    <Badge>{costSheet.requirementType}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="border-b border-gray-200 mb-4">
                                    <nav className="flex space-x-4">
                                        <button onClick={() => setActiveTab('summary')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Summary View</button>
                                        <button onClick={() => setActiveTab('audit')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'audit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Audit Trail</button>
                                    </nav>
                                </div>
                                
                                {activeTab === 'summary' && <ApprovalTimeline timeline={costSheet.timeline} />}
                                {activeTab === 'audit' && <AuditTrail trail={costSheet.auditTrail} />}

                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Panel */}
                    <div className="col-span-4">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Your Approval</CardTitle>
                                <p className="text-sm text-gray-500">Sourcing Manager</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded-md p-4">
                                     <p className="text-sm text-gray-500">Total Value</p>
                                     <p className="text-2xl font-bold">₹{costSheet.totalValue.toLocaleString()}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium">Comments (Optional)</label>
                                    <Textarea placeholder="Add any comments or notes..." className="mt-1"/>
                                </div>

                                <div className="space-y-2">
                                     <Button className="w-full bg-green-600 hover:bg-green-700"><Check size={16} className="mr-2"/>Approve</Button>
                                     <Button variant="destructive" className="w-full"><X size={16} className="mr-2"/>Reject</Button>
                                     <Button variant="outline" className="w-full"><MessageSquare size={16} className="mr-2"/>Request Changes</Button>
                                </div>
                                
                                <Button variant="secondary" className="w-full" onClick={() => navigate(`/cost-sheet-editor`)}>
                                    <FileText size={16} className="mr-2"/>View Detailed Cost Sheet
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components for clarity
function ApprovalTimeline({ timeline }: { timeline: typeof mockCostSheet.timeline }) {
    return (
        <div className="space-y-6">
            {timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        {item.isCompleted ? <CheckCircle className="text-blue-600" /> : <Circle className="text-gray-300" />}
                        {index < timeline.length - 1 && <div className="w-px h-full bg-gray-300 my-2"></div>}
                    </div>
                    <div>
                        <p className="font-semibold">{item.status}</p>
                        <p className="text-sm text-gray-500">{item.role ? `${item.role} - ${item.statusLabel}` : `By ${item.user} on ${item.date}`}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AuditTrail({ trail }: { trail: typeof mockCostSheet.auditTrail }) {
    return (
        <div className="space-y-4">
            {trail.map((item, index) => (
                <div key={index} className="flex gap-4 text-sm">
                    <p className="font-semibold text-gray-700 w-48">{item.event}</p>
                    <p className="text-gray-500 flex-1">{item.details}</p>
                    <p className="text-gray-400 text-xs">{item.date}</p>
                </div>
            ))}
        </div>
    )
}