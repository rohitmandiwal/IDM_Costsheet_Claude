import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { dashboardService } from '../services/dashboard.service';
import type { Approval } from '../types/dashboard.types';

const priorityStyles: { [key: string]: string } = {
    'Critical': 'bg-red-100 text-red-800 border-red-200',
    'High': 'bg-orange-100 text-orange-800 border-orange-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Low': 'bg-blue-100 text-blue-800 border-blue-200',
};

export function ApproverDashboard() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApprovals = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getApproverDashboard();
                setApprovals(data.pendingApprovals);
                setError(null);
            } catch (err) {
                setError('Failed to fetch approvals. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchApprovals();
    }, []);

    const technicalCount = approvals.filter(a => a.type === 'TECH').length;
    const commercialCount = approvals.filter(a => a.type === 'COMM').length;
    const totalValue = approvals.reduce((sum, a) => sum + a.value, 0);

    const filteredApprovals = approvals.filter(item => {
        const matchesFilter = filter === 'All' || item.type === filter;
        const matchesSearch = [item.id, item.prNumbers, item.description, item.createdBy].some(field =>
            field.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchesFilter && matchesSearch;
    });
    
    const handleReview = (approvalId: string) => {
        navigate(`/approvals/${approvalId}`);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading approvals...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Pending Approvals</h1>
                <p className="text-sm text-gray-500 mb-6">Review and approve cost sheets awaiting your action</p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <SummaryCard title="Total Pending" value={approvals.length} />
                    <SummaryCard title="Technical" value={technicalCount} />
                    <SummaryCard title="Commercial" value={commercialCount} />
                    <SummaryCard title="Total Value" value={`₹${totalValue.toLocaleString()}`} />
                </div>

                {/* Search and Filter */}
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input 
                            placeholder="Search by CS ID, PR Number, Description, or Creator..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FilterButton label="All" activeFilter={filter} setFilter={setFilter} />
                        <FilterButton label="TECH" activeFilter={filter} setFilter={setFilter} />
                        <FilterButton label="COMM" activeFilter={filter} setFilter={setFilter} />
                    </div>
                </div>

                {/* Approvals List */}
                <div className="space-y-4">
                    {filteredApprovals.map(item => (
                        <ApprovalCard key={item.id} item={item} onReview={handleReview} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Sub-components
function SummaryCard({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    );
}

function FilterButton({ label, activeFilter, setFilter }: { label: string, activeFilter: string, setFilter: (f: string) => void }) {
    const isActive = activeFilter === label;
    return (
        <Button 
            variant={isActive ? 'default' : 'outline'}
            onClick={() => setFilter(label)}
        >
            {label}
        </Button>
    )
}

function ApprovalCard({ item, onReview }: { item: Approval, onReview: (id: string) => void }) {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-blue-600">{item.id}</span>
                        <Badge variant="outline" className={priorityStyles[item.priority]}>{item.priority}</Badge>
                        <Badge className={item.type === 'TECH' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>{item.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-1">{item.description}</p>
                    <p className="text-xs text-gray-500">PR Numbers: {item.prNumbers}</p>
                </div>
                <Button variant="default" onClick={() => onReview(item.id)}>Review →</Button>
            </div>
            <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center text-xs text-gray-500">
                <span>Created By: <span className="font-medium text-gray-700">{item.createdBy}</span></span>
                <span>Submitted: <span className="font-medium text-gray-700">{item.submittedDate}</span></span>
                <span>Total Value: <span className="font-medium text-gray-700">₹{item.value.toLocaleString()}</span></span>
                <span>Current Level: <span className="font-medium text-gray-700">{item.level}</span></span>
            </div>
        </div>
    );
}