import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { costSheetService } from '../services/costSheet.service';

type RequirementType = 'technical' | 'non_technical';



export function CreateCostSheetPage() {
  const navigate = useNavigate();
  const [requirementType, setRequirementType] = useState<RequirementType>('technical');
  const [prNumbers, setPrNumbers] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchPRs = async () => {
    if (!requirementType || !prNumbers.trim()) {
      setError('Please select a requirement type and enter at least one PR number.');
      return;
    }

    const prArray = prNumbers.split(',').map((pr) => pr.trim()).filter(Boolean);

    try {
      setIsLoading(true);
      setError(null);
      // This service call would fetch the PRs and likely return a summary.
      // The response will be passed to the next page via route state.
      const result = await costSheetService.fetchPRs(requirementType, prArray);
      const newState = {
        prSummaries: result.prSummaries,
        costSheetId: result.costSheetId,
        requirementType: requirementType
      };
      sessionStorage.setItem('prSummaryState', JSON.stringify(newState));
      navigate('/pr-summary', { state: newState });
    } catch (err: any) {
      console.error('Failed to fetch PRs:', err);
      setError(err.response?.data?.message || 'Failed to fetch Purchase Requisitions. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <span className="px-3 py-1.5 rounded-full bg-primary text-white font-semibold">1</span>
            <span className="font-semibold text-primary">Fetch PRs</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-500 font-semibold">2</span>
            <span className="text-gray-500">Review & Edit</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          {/* Requirement Type Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Requirement Type</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Select the procurement category for this cost sheet</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RequirementCard
                type="technical"
                title="Technical Requirement"
                description="Requires specification evaluation, technical compliance checks, and scoring matrix"
                badgeText="TECH"
                selected={requirementType === 'technical'}
                onSelect={() => setRequirementType('technical')}
              />
              <RequirementCard
                type="non_technical"
                title="Commercial (Non-Technical)"
                description="Commercial-only evaluation based on price, delivery, payment terms, and warranty"
                badgeText="COMM"
                selected={requirementType === 'non_technical'}
                onSelect={() => setRequirementType('non_technical')}
              />
            </div>
          </div>

          {/* Enter PR Numbers Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Enter PR Numbers</h2>
            <p className="text-sm text-gray-500 mb-4">PR Numbers from SAP (comma-separated for multiple PRs)</p>
            <Input
              placeholder="e.g., 13633801, 13633802, 13633803"
              value={prNumbers}
              onChange={(e) => setPrNumbers(e.target.value)}
              className="mb-4"
            />



            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <Button onClick={handleFetchPRs} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching from SAP...
                </>
              ) : (
                'Fetch from SAP'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for Requirement Type selection card to keep the main component clean
function RequirementCard({ type, title, description, badgeText, selected, onSelect }: {
  type: RequirementType;
  title: string;
  description: string;
  badgeText: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer p-4 border rounded-lg transition-all ${selected ? 'border-primary bg-gray-50 ring-2 ring-gray-200' : 'border-gray-300 hover:border-gray-400'
        }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className={`w-4 h-4 rounded-full border-2 ${selected ? 'border-primary bg-primary' : 'border-gray-400'}`}>
            {selected && <div className="w-full h-full bg-white rounded-full scale-50"></div>}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${type === 'technical' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {badgeText}
            </span>
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}