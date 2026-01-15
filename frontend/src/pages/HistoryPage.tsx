import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, History, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { dashboardService } from '../services/dashboard.service';

type StatusType = 'approved' | 'rejected' | 'pending' | 'draft' | 'sent_back' | 'po_created' | 'unknown';

const statusStyles: Record<string, string> = {
    'approved': 'bg-green-100 text-green-800 border-green-200',
    'rejected': 'bg-red-100 text-red-800 border-red-200',
    'pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'draft': 'bg-gray-100 text-gray-800 border-gray-200',
    'sent_back': 'bg-amber-100 text-amber-800 border-amber-200',
    'po_created': 'bg-blue-100 text-blue-800 border-blue-200',
    'unknown': 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusIcons: Record<string, React.ReactNode> = {
    'approved': <CheckCircle2 size={16} className="text-green-600" />,
    'rejected': <XCircle size={16} className="text-red-600" />,
    'pending': <Clock size={16} className="text-amber-600" />,
    'draft': <FileText size={16} className="text-gray-600" />,
    'sent_back': <AlertCircle size={16} className="text-amber-600" />,
    'po_created': <CheckCircle2 size={16} className="text-blue-600" />,
    'unknown': <Clock size={16} className="text-gray-600" />
};

export function HistoryPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                setLoading(true);
                const logs = await dashboardService.getAuditLogs({});
                setAuditLogs(logs);
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAuditLogs();
    }, []);

    // Extract unique cost sheets from audit logs to create a history list
    const costSheets = Array.from(new Set(auditLogs.map(log => log.CostSheet?.cost_sheet_number)))
        .filter(Boolean)
        .map(csNumber => {
            const logsForCS = auditLogs.filter(log => log.CostSheet?.cost_sheet_number === csNumber);
            const latestLog = logsForCS[0];
            return {
                id: latestLog.CostSheet?.id,
                costSheetNumber: csNumber as string,
                status: (latestLog.resulting_status || 'unknown') as StatusType,
                description: latestLog.description as string,
                lastActivity: latestLog.created_at as string,
                lastUser: latestLog.User?.full_name as string,
                type: latestLog.activity_type as string
            };
        });

    const filteredCostSheets = costSheets.filter(cs => {
        const matchesFilter = filter === 'All' || cs.status.toLowerCase() === filter.toLowerCase();
        const matchesSearch = cs.costSheetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cs.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <History size={28} className="text-primary" />
                            Cost Sheet History
                        </h1>
                        <p className="text-gray-500 mt-1">Track all activities, status changes, and approval timelines</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by Cost Sheet number or activity..."
                            className="pl-10 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {['All', 'Approved', 'Rejected', 'Pending', 'Sent_Back'].map(f => (
                            <Button
                                key={f}
                                variant={filter === f ? 'default' : 'outline'}
                                onClick={() => setFilter(f)}
                                className="h-11"
                            >
                                {f.replace('_', ' ')}
                            </Button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCostSheets.length > 0 ? filteredCostSheets.map((cs) => (
                            <Card key={cs.id} className="hover:shadow-md transition-shadow cursor-pointer border-gray-200" onClick={() => navigate(`/history/${cs.id}`)}>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${statusStyles[cs.status] || 'bg-gray-100'}`}>
                                                {statusIcons[cs.status] || <Clock size={20} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-gray-900">{cs.costSheetNumber}</span>
                                                    <Badge variant="outline" className={statusStyles[cs.status]}>
                                                        {cs.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-1">{cs.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8 text-right">
                                            <div className="hidden md:block">
                                                <p className="text-xs text-gray-400 mb-1">Last Activity</p>
                                                <p className="text-sm font-medium text-gray-700">{new Date(cs.lastActivity).toLocaleDateString()}</p>
                                            </div>
                                            <div className="hidden md:block">
                                                <p className="text-xs text-gray-400 mb-1">Modified By</p>
                                                <p className="text-sm font-medium text-gray-700">{cs.lastUser}</p>
                                            </div>
                                            <ChevronRight className="text-gray-300" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                                <History size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                                <p className="text-gray-500 max-w-xs mx-auto mt-1">Try adjusting your filters or search terms to find what you're looking for.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
