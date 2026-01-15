import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { historyService } from '../services/history.service';
import { Clock, User, FileText, AlertCircle, CheckCircle, XCircle, ArrowLeft, Filter } from 'lucide-react';
import Swal from 'sweetalert2';

interface TimelineItem {
    type: string;
    timestamp: string;
    action: string;
    user: string;
    userRole?: string;
    description: string;
    comments?: string;
    status?: string;
    level?: number;
    affectedFields?: string[];
    priority?: string;
}

interface ChangeRequest {
    id: number;
    requestType: string;
    affectedFields: string[];
    changeReason: string;
    detailedComments: string;
    priority: string;
    status: string;
    requestedBy: string;
    requestedByRole: string;
    requestedAt: string;
    resolvedBy?: string;
    resolvedAt?: string;
}

export function CostSheetHistoryPage() {
    const { costSheetId } = useParams<{ costSheetId: string }>();
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'changes'>('timeline');
    const [filters, setFilters] = useState({
        activityType: '',
        userRole: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        if (costSheetId) {
            fetchData();
        }
    }, [costSheetId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [timelineData, changeRequestsData] = await Promise.all([
                historyService.getHistoryTimeline(costSheetId!),
                historyService.getChangeRequests(costSheetId!),
            ]);
            setTimeline(timelineData);
            setChangeRequests(changeRequestsData);
        } catch (error) {
            console.error('Error fetching history:', error);
            Swal.fire('Error', 'Failed to load history data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        if (action.includes('APPROVE')) return <CheckCircle className="text-green-500" size={18} />;
        if (action.includes('REJECT')) return <XCircle className="text-red-500" size={18} />;
        if (action.includes('SUBMIT')) return <FileText className="text-blue-500" size={18} />;
        if (action.includes('CHANGE')) return <AlertCircle className="text-amber-500" size={18} />;
        return <Clock className="text-gray-500" size={18} />;
    };

    const getActionColor = (action: string) => {
        if (action.includes('APPROVE')) return 'bg-green-50 border-green-200 text-green-700';
        if (action.includes('REJECT')) return 'bg-red-50 border-red-200 text-red-700';
        if (action.includes('SUBMIT')) return 'bg-blue-50 border-blue-200 text-blue-700';
        if (action.includes('CHANGE')) return 'bg-amber-50 border-amber-200 text-amber-700';
        return 'bg-gray-50 border-gray-200 text-gray-700';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low': return 'bg-green-100 text-green-800 border-green-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const filteredTimeline = timeline.filter(item => {
        if (filters.activityType && !item.action.toLowerCase().includes(filters.activityType.toLowerCase())) return false;
        if (filters.userRole && item.userRole !== filters.userRole) return false;
        if (filters.startDate && new Date(item.timestamp) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(item.timestamp) > new Date(filters.endDate)) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Cost Sheet History</h1>
                    <p className="text-gray-600">Complete lifecycle tracking and change management</p>
                </div>

                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'timeline'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Clock className="inline mr-2" size={16} />
                            Timeline View
                        </button>
                        <button
                            onClick={() => setActiveTab('changes')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'changes'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <AlertCircle className="inline mr-2" size={16} />
                            Change Requests ({changeRequests.filter(cr => cr.status === 'pending').length})
                        </button>
                    </nav>
                </div>

                {activeTab === 'timeline' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Activity Timeline</span>
                                    <Button variant="outline" size="sm">
                                        <Filter size={16} className="mr-2" />
                                        Filters
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    <div className="space-y-6">
                                        {filteredTimeline.map((item, index) => (
                                            <div key={index} className="relative pl-12">
                                                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-sm">
                                                    {getActionIcon(item.action)}
                                                </div>
                                                <div className={`p-4 rounded-lg border ${getActionColor(item.action)}`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-sm">
                                                                {item.action.replace(/_/g, ' ')}
                                                            </h3>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {new Date(item.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {item.level && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Level {item.level}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm mb-2">{item.description}</p>
                                                    {item.comments && (
                                                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border border-current border-opacity-20">
                                                            <p className="text-xs italic">"{item.comments}"</p>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-3 text-xs">
                                                        <User size={12} />
                                                        <span className="font-medium">{item.user}</span>
                                                        {item.userRole && (
                                                            <>
                                                                <span className="text-gray-400">•</span>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {item.userRole.replace(/_/g, ' ').toUpperCase()}
                                                                </Badge>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'changes' && (
                    <div className="space-y-4">
                        {changeRequests.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No change requests found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            changeRequests.map((request) => (
                                <Card key={request.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {request.requestType.replace(/_/g, ' ').toUpperCase()}
                                                    </h3>
                                                    <Badge className={getPriorityColor(request.priority)}>
                                                        {request.priority.toUpperCase()}
                                                    </Badge>
                                                    <Badge className={getStatusColor(request.status)}>
                                                        {request.status.replace(/_/g, ' ').toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Requested by <span className="font-medium">{request.requestedBy}</span>
                                                    {' '}({request.requestedByRole.replace(/_/g, ' ')})
                                                    {' '}on {new Date(request.requestedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                <h4 className="font-semibold text-sm text-amber-900 mb-2">Change Reason</h4>
                                                <p className="text-sm text-amber-800">{request.changeReason}</p>
                                            </div>

                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <h4 className="font-semibold text-sm text-blue-900 mb-2">Detailed Comments</h4>
                                                <p className="text-sm text-blue-800">{request.detailedComments}</p>
                                            </div>

                                            {request.affectedFields && request.affectedFields.length > 0 && (
                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-sm text-purple-900 mb-2">Affected Fields</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {request.affectedFields.map((field, idx) => (
                                                            <Badge key={idx} variant="outline" className="bg-white">
                                                                {field}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {request.resolvedAt && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-sm text-green-900 mb-2">Resolution</h4>
                                                    <p className="text-sm text-green-800">
                                                        Resolved by <span className="font-medium">{request.resolvedBy}</span>
                                                        {' '}on {new Date(request.resolvedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
