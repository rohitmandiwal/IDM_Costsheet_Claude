import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { PRSummary } from '../types/costSheet.types';

export function PRSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data passed from the previous page, with sessionStorage fallback
  const stateFromLocation = location.state;
  const savedStateString = sessionStorage.getItem('prSummaryState');
  const stateFromSession = savedStateString ? JSON.parse(savedStateString) : null;

  const { prSummaries, costSheetId, requirementType } = stateFromLocation || stateFromSession || { prSummaries: [], costSheetId: null, requirementType: 'technical' };

  if (!prSummaries || prSummaries.length === 0 || !costSheetId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">No PR Summary data found.</h2>
        <Button onClick={() => navigate('/pr-entry')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  const handleFetchDifferentPRs = () => {
    // Navigate back to the create page to start over
    navigate('/pr-entry');
  };

  const handleContinue = () => {
    // Navigate to the next step, the PR line item selection page
    const stateToPass = { 
      prSummaries, 
      costSheetId,
      requirementType
    };
    sessionStorage.setItem('prDetailsState', JSON.stringify(stateToPass)); // Persist for next page
    navigate('/pr-details', { 
      state: stateToPass
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Cost Sheet</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-500 font-semibold">1</span>
            <span className="text-gray-500">Fetch PRs</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1.5 rounded-full bg-blue-600 text-white font-semibold">2</span>
            <span className="font-semibold text-blue-600">Review & Edit</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Review Fetched Purchase Requisitions</h2>
                <Button variant="outline" onClick={handleFetchDifferentPRs}>
                    Fetch Different PRs
                </Button>
            </div>
            <p className="text-sm text-gray-500 mb-6">Verify PR details and enter/edit quantities before proceeding</p>
            
            <div className="space-y-4">
                {prSummaries.map((pr: PRSummary) => (
                    <PRSummaryCard key={pr.prNumber} pr={pr} requirementType={requirementType} />
                ))}
            </div>
        </div>

        <div className="flex justify-between items-center mt-8">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button onClick={handleContinue}>
                Continue to Cost Sheet Builder
            </Button>
        </div>
      </div>
    </div>
  );
}

function PRSummaryCard({ pr, requirementType }: { pr: PRSummary; requirementType: 'Technical' | 'Commercial' }) {
    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800">PR {pr.prNumber}</h3>
                        <Badge variant="outline" className="text-green-600 border-green-300">valid</Badge>
                        <Badge className={requirementType === 'Technical' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                            {requirementType === 'Technical' ? 'TECH' : 'COMM'}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{pr.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Plant</p>
                            <p className="font-medium text-gray-800">{pr.plant}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Requester</p>
                            <p className="font-medium text-gray-800">{pr.requester}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Line Items</p>
                            <p className="font-medium text-gray-800">{pr.lineItemCount}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Est. Value</p>
                            <p className="font-medium text-gray-800">INR {pr.estimatedValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
