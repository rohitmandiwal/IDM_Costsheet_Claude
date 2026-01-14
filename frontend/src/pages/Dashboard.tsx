import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Clock, FileText, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { dashboardService } from '../services/dashboard.service';
import { costSheetService } from '../services/costSheet.service';
import type { UnifiedDashboardData } from '../types/dashboard.types';

type RequirementType = 'All' | 'Technical' | 'Non-Technical';

export function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<UnifiedDashboardData | null>(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [requirementFilter, setRequirementFilter] = useState<RequirementType>('All');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getUnifiedDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    navigate(`/pr-entry?prNumber=${quickSearch}`);
  };

  const handleCreateNewCostSheet = () => {
    navigate('/pr-entry');
  };

  const handleViewDetails = async (prNumber: string, requirementType: string) => {
    try {
      setIsActionLoading(true);
      const reqType = requirementType.toLowerCase().includes('non') || requirementType.toLowerCase().includes('comm') ? 'non_technical' : 'technical';
      const result = await costSheetService.fetchPRs(reqType, [prNumber]);
      const newState = {
        prSummaries: result.prSummaries,
        costSheetId: result.costSheetId,
        requirementType: reqType
      };
      sessionStorage.setItem('prSummaryState', JSON.stringify(newState));
      navigate('/pr-summary', { state: newState });
    } catch (error) {
      console.error('Failed to fetch PR details:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleViewApprovalDetails = (id: string, requirementType: 'TECH' | 'COMM') => {
    navigate('/approver-page', { state: { costSheetId: id, requirementType } });
  };

  const handleContinueDraft = (costSheetNumber: string, requirementType: string) => {
    const reqType = requirementType.toLowerCase().includes('non') || requirementType.toLowerCase().includes('comm') ? 'non_technical' : 'technical';
    navigate('/cost-sheet-editor', { state: { costSheetNumber, requirementType: reqType } });
  };

  const filteredPendingApprovals = dashboardData?.pendingApprovals.filter(approval =>
    requirementFilter === 'All' || (requirementFilter === 'Technical' && approval.type === 'TECH') || (requirementFilter === 'Non-Technical' && approval.type === 'COMM')
  ) || [];

  const filteredDraftCostSheets = dashboardData?.draftCostSheets.filter(draft =>
    requirementFilter === 'All' || draft.requirementType === requirementFilter
  ) || [];

  const filteredRecentPRs = dashboardData?.recentPRs.filter(pr =>
    requirementFilter === 'All' || pr.type === (requirementFilter === 'Technical' ? 'Technical' : 'Non-Technical')
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-500 mb-2">Failed to load dashboard data</div>
          <div className="text-sm text-gray-600">Please try again later.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      {isActionLoading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-900 font-medium">Fetching PR Details...</p>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of procurement activities and pending actions</p>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <Card className="col-span-8 p-6">
          <h2 className="text-gray-900 mb-4">Quick PR Search</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter PR number to search..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        <Card className="col-span-4 p-6 bg-[#030213] text-white">
          <div className="text-white/80 mb-2">Total Active Cost Sheets</div>
          <div className="text-3xl font-bold mb-4">{dashboardData.totalActiveCostSheets}</div>
          <Button
            variant="secondary"
            onClick={handleCreateNewCostSheet}
            className="w-full bg-white/10 hover:bg-white/20 text-white border-none"
          >
            Create New Cost Sheet
          </Button>
        </Card>
      </div>

      <div className="mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Filter by Type:</span>
            <button
              onClick={() => setRequirementFilter('All')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${requirementFilter === 'All'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setRequirementFilter('Technical')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${requirementFilter === 'Technical'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Technical
            </button>
            <button
              onClick={() => setRequirementFilter('Non-Technical')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${requirementFilter === 'Non-Technical'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Non-Technical
            </button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#F39C12]" />
                </div>
                <div>
                  <h2 className="text-gray-900">Pending Approvals</h2>
                  <p className="text-gray-600 text-sm">Cost sheets awaiting your action</p>
                </div>
              </div>
              <Badge variant="secondary">{filteredPendingApprovals.length}</Badge>
            </div>

            <div className="space-y-4">
              {filteredPendingApprovals.length > 0 ? (
                filteredPendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#0B61FF] hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleViewApprovalDetails(approval.id, approval.type)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-gray-900 mb-1">{approval.id}</div>
                        <div className="text-sm text-gray-600">
                          PRs: {approval.prNumbers}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={approval.type === 'TECH' ? 'bg-primary text-white' : 'bg-gray-700 text-white'}>
                          {approval.type}
                        </Badge>
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                          {approval.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">₹{approval.value.toLocaleString('en-US')}</span>
                      <span className="text-gray-500">{approval.daysAgo}d ago</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No pending approvals found.</div>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => navigate('/approvals')}
            >
              View All Approvals
            </Button>
          </Card>
        </div>

        <div className="col-span-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#0B61FF]" />
                </div>
                <div>
                  <h2 className="text-gray-900">Draft Cost Sheets</h2>
                  <p className="text-gray-600 text-sm">Continue working on drafts</p>
                </div>
              </div>
              <Badge variant="secondary">{filteredDraftCostSheets.length}</Badge>
            </div>

            <div className="space-y-4">
              {filteredDraftCostSheets.length > 0 ? (
                filteredDraftCostSheets.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#0B61FF] hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleContinueDraft(draft.costSheetNumber, draft.requirementType)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-900">{draft.costSheetNumber}</span>
                          <Badge className={draft.requirementType === 'Technical' ? 'bg-primary text-white' : 'bg-gray-700 text-white'}>
                            {draft.requirementType.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          PRs: {draft.prs.join(', ')}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(draft.updatedAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No draft cost sheets found.</div>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => handleCreateNewCostSheet()}
            >
              View All Drafts
            </Button>
          </Card>
        </div>

        <div className="col-span-12">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D1FAE5] rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#12A454]" />
                </div>
                <div>
                  <h2 className="text-gray-900">Recent Purchase Requisitions</h2>
                  <p className="text-gray-600 text-sm">Recently fetched PRs ready for cost sheet creation</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 text-sm">PR Number</th>
                    <th className="text-left py-3 px-4 text-gray-700 text-sm">Description</th>
                    <th className="text-left py-3 px-4 text-gray-700 text-sm">Line Items</th>
                    <th className="text-left py-3 px-4 text-gray-700 text-sm">Plant</th>
                    <th className="text-left py-3 px-4 text-gray-700 text-sm">Type</th>
                    <th className="text-right py-3 px-4 text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecentPRs.length > 0 ? (
                    filteredRecentPRs.map((pr) => (
                      <tr key={pr.prNumber} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{pr.prNumber}</td>
                        <td className="py-3 px-4 text-gray-700">{pr.description}</td>
                        <td className="py-3 px-4 text-gray-700">{pr.lineItems}</td>
                        <td className="py-3 px-4 text-gray-700">{pr.plant}</td>
                        <td className="py-3 px-4">
                          <Badge className={pr.type === 'Technical' ? 'bg-primary text-white' : 'bg-gray-700 text-white'}>
                            {pr.type === 'Technical' ? 'TECH' : 'COMM'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(pr.prNumber, pr.type)}
                            disabled={isActionLoading}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-4">No recent PRs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
