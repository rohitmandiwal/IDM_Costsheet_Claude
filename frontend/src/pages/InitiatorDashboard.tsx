import { useState, useEffect } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { dashboardService } from '../services/dashboard.service';
import type { InitiatorDashboardData, PurchaseRequisition } from '../types/dashboard.types';

export function InitiatorDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<InitiatorDashboardData | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Technical' | 'Non-Technical'>('All');
  const [filteredPRs, setFilteredPRs] = useState<PurchaseRequisition[]>([]);
  const [quickSearch, setQuickSearch] = useState('');

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
      const dashboardData = await dashboardService.getUnifiedDashboard();
      setData(dashboardData);
      setFilteredPRs(dashboardData.recentPRs || []);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      if (error.response?.status === 403) {
        console.error('Access denied: User does not have required permissions');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    if (!data || !data.recentPRs) return;

    if (activeFilter === 'All') {
      setFilteredPRs(data.recentPRs);
    } else {
      setFilteredPRs(
        data.recentPRs.filter((pr) => pr.type === activeFilter)
      );
    }
  };

  const handleSearch = () => {
    console.log('Search for PR:', quickSearch);
  };

  const handleViewDetails = (prNumber: string) => {
    console.log('View details for PR:', prNumber);
  };

  const handleCreateCostSheet = () => {
    navigate('/pr-entry');
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

        <Card className="col-span-4 p-6 bg-gradient-to-br from-[#0B61FF] to-[#0847B8] text-white">
          <div className="text-white/80 mb-2">Total Active Cost Sheets</div>
          <div className="text-3xl mb-4">{data.totalActiveCostSheets}</div>
          <Button
            variant="secondary"
            onClick={handleCreateCostSheet}
            className="w-full"
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
                  {(filteredPRs || []).map((pr) => (
                    <tr key={pr.prNumber} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{pr.prNumber}</td>
                      <td className="py-3 px-4 text-gray-700">{pr.description}</td>
                      <td className="py-3 px-4 text-gray-700">{pr.lineItems}</td>
                      <td className="py-3 px-4 text-gray-700">{pr.plant}</td>
                      <td className="py-3 px-4">
                        <Badge className={pr.type === 'Technical' ? 'bg-[#0B61FF] text-white' : 'bg-gray-500 text-white'}>
                          {pr.type === 'Technical' ? 'TECH' : 'COMM'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(pr.prNumber)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
