import { useState, useEffect } from 'react';
import { Clock, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { dashboardService } from '../services/dashboard.service';
import type { ApproverDashboardData, CostSheet } from '../types/dashboard.types';

export function ApproverDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ApproverDashboardData | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Technical' | 'Non-Technical'>('All');
  const [filteredPendingApprovals, setFilteredPendingApprovals] = useState<CostSheet[]>([]);
  const [filteredDraftSheets, setFilteredDraftSheets] = useState<CostSheet[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (data) {
      applyFilter();
    }
  }, [activeFilter, data]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await dashboardService.getApproverDashboard();
      setData(dashboardData);
      setFilteredPendingApprovals(dashboardData.pendingApprovals);
      setFilteredDraftSheets(dashboardData.draftCostSheets);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      if (error.response?.status === 403) {
        console.error('Access denied: User does not have Approver role');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    if (!data) return;

    if (activeFilter === 'All') {
      setFilteredPendingApprovals(data.pendingApprovals);
      setFilteredDraftSheets(data.draftCostSheets);
    } else {
      setFilteredPendingApprovals(
        data.pendingApprovals.filter((cs) => cs.type === activeFilter)
      );
      setFilteredDraftSheets(
        data.draftCostSheets.filter((cs) => cs.type === activeFilter)
      );
    }
  };

  const handleCostSheetClick = (costSheetNumber: string) => {
    console.log('View cost sheet:', costSheetNumber);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-500 mb-2">Failed to load dashboard data</div>
          <div className="text-sm text-gray-600">You may not have the required permissions to access this dashboard.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of procurement activities and pending actions</p>
      </div>

      <div className="mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Filter by Type:</span>
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeFilter === 'All'
                  ? 'bg-[#0B61FF] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('Technical')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeFilter === 'Technical'
                  ? 'bg-[#0B61FF] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Technical
            </button>
            <button
              onClick={() => setActiveFilter('Non-Technical')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeFilter === 'Non-Technical'
                  ? 'bg-[#0B61FF] text-white'
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
              {filteredPendingApprovals.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No pending approvals
                </div>
              ) : (
                filteredPendingApprovals.map((approval) => (
                  <div
                    key={approval.costSheetNumber}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#0B61FF] hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleCostSheetClick(approval.costSheetNumber)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-gray-900 mb-1">{approval.costSheetNumber}</div>
                        <div className="text-sm text-gray-600">
                          PRs: {approval.prNumbers.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={approval.type === 'Technical' ? 'bg-[#0B61FF] text-white' : 'bg-gray-500 text-white'}>
                          {approval.type === 'Technical' ? 'TECH' : 'COMM'}
                        </Badge>
                        <Badge className="bg-[#FEF3C7] text-[#F39C12] border-[#F39C12]/20">
                          {approval.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">₹{approval.totalValue.toLocaleString()}</span>
                      <span className="text-gray-500">{approval.daysAgo}d ago</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => console.log('View all approvals')}
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
              <Badge variant="secondary">{filteredDraftSheets.length}</Badge>
            </div>

            <div className="space-y-4">
              {filteredDraftSheets.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No draft cost sheets
                </div>
              ) : (
                filteredDraftSheets.map((draft) => (
                  <div
                    key={draft.costSheetNumber}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#0B61FF] hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleCostSheetClick(draft.costSheetNumber)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-900">{draft.costSheetNumber}</span>
                          <Badge className={draft.type === 'Technical' ? 'bg-[#0B61FF] text-white' : 'bg-gray-500 text-white'}>
                            {draft.type === 'Technical' ? 'TECH' : 'COMM'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          PRs: {draft.prNumbers.join(', ')}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{draft.lastEdited}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-900">{draft.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0B61FF] transition-all"
                          style={{ width: `${draft.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => console.log('View all drafts')}
            >
              View All Drafts
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
