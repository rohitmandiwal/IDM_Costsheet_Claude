import { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle2, Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { costSheetService } from '../services/costSheet.service';
import type { PRSummary } from '../types/costSheet.types';

type RequirementType = 'Technical' | 'Commercial';

const DEMO_PR_OPTIONS = [
  { prNumbers: ['13633801'], label: '13633801 (Technical - Laptops)' },
  { prNumbers: ['24678012'], label: '24678012 (Commercial - Chairs)' },
  { prNumbers: ['13633802'], label: '13633802 (Technical - Components)' },
  { prNumbers: ['13633801', '13633802'], label: '2 PRs: 13633801, 13633802' },
  { prNumbers: ['13633801', '13633802', '24678012'], label: '3 PRs: 13633801, 13633802, 24678012' },
];

export function CreateCostSheetPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [requirementType, setRequirementType] = useState<RequirementType | null>(null);
  const [prNumbers, setPrNumbers] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prSummaries, setPrSummaries] = useState<PRSummary[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [costSheetId, setCostSheetId] = useState<number | null>(null);

  const handleRequirementTypeSelect = (type: RequirementType) => {
    setRequirementType(type);
  };

  const validatePRNumbers = (input: string): boolean => {
    setValidationError(null);

    if (!input.trim()) {
      setValidationError('PR Numbers are required');
      return false;
    }

    const prArray = input.split(',').map((pr) => pr.trim()).filter((pr) => pr);

    if (prArray.length === 0) {
      setValidationError('Please enter at least one PR Number');
      return false;
    }

    if (prArray.length > 10) {
      setValidationError('Maximum 10 PR Numbers allowed');
      return false;
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    const invalidPRs = prArray.filter((pr) => !alphanumericRegex.test(pr));

    if (invalidPRs.length > 0) {
      setValidationError(`Invalid PR Numbers: ${invalidPRs.join(', ')}. Only alphanumeric characters allowed.`);
      return false;
    }

    return true;
  };

  const handleFetchPRs = async () => {
    if (!requirementType) return;

    if (!validatePRNumbers(prNumbers)) {
      return;
    }

    const prArray = prNumbers.split(',').map((pr) => pr.trim()).filter((pr) => pr);

    try {
      setIsLoading(true);
      setError(null);
      const result = await costSheetService.fetchPRs(requirementType, prArray);
      setPrSummaries(result.prSummaries);
      setCostSheetId(result.costSheetId);
      setStep(2);
    } catch (err: any) {
      console.error('Failed to fetch PRs:', err);
      setError(err.response?.data?.message || 'Failed to fetch Purchase Requisitions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchDifferentPRs = () => {
    setStep(1);
    setPrNumbers('');
    setValidationError(null);
    setError(null);
    setPrSummaries([]);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleContinue = async () => {
    if (!costSheetId || !requirementType) return;

    try {
      setIsLoading(true);
      const lineItems = await costSheetService.fetchPRLineItems(costSheetId);

      navigate('/pr-details', {
        state: {
          prSummaries,
          lineItems,
          requirementType,
        },
      });
    } catch (err: any) {
      console.error('Failed to fetch line items:', err);
      setError('Failed to fetch line items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoPRClick = (prNumbers: string[]) => {
    setPrNumbers(prNumbers.join(', '));
    setValidationError(null);
  };

  const getPRCount = () => {
    if (!prNumbers.trim()) return 0;
    return prNumbers.split(',').map(pr => pr.trim()).filter(pr => pr).length;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Cost Sheet</h1>
          <p className="text-gray-600">Start procurement workflow by fetching PRs from SAP</p>
        </div>
        <Button variant="outline" onClick={handleBackToDashboard} className="border-black text-black hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 1 ? 'bg-[#0B61FF] text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <span className={`font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>Fetch PRs</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 2 ? 'bg-[#0B61FF] text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <span className={`font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>Review & Edit</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <Card className="p-6 border-2 border-dashed border-blue-400">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#0B61FF]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Requirement Type</h2>
                <p className="text-gray-600 text-sm">Select the procurement category for this cost sheet</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleRequirementTypeSelect('Technical')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  requirementType === 'Technical'
                    ? 'border-[#0B61FF] border-l-4 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    requirementType === 'Technical'
                      ? 'border-[#0B61FF] bg-[#0B61FF]'
                      : 'border-gray-300'
                  }`}>
                    {requirementType === 'Technical' && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-[#0B61FF] text-white text-xs px-2 py-0.5">TECH</Badge>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Technical Requirement</h3>
                    <p className="text-sm text-gray-600">
                      Requires specification evaluation, technical compliance checks, and scoring matrix
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRequirementTypeSelect('Commercial')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  requirementType === 'Commercial'
                    ? 'border-[#0B61FF] border-l-4 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    requirementType === 'Commercial'
                      ? 'border-[#0B61FF] bg-[#0B61FF]'
                      : 'border-gray-300'
                  }`}>
                    {requirementType === 'Commercial' && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gray-500 text-white text-xs px-2 py-0.5">COMM</Badge>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Commercial (Non-Technical)</h3>
                    <p className="text-sm text-gray-600">
                      Commercial-only evaluation based on price, delivery, payment terms, and warranty
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {requirementType && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Enter PR Numbers</h2>
                  <p className="text-gray-600 text-sm mt-1">PR Numbers from SAP (comma-separated for multiple PRs)</p>
                </div>
                {getPRCount() > 0 && (
                  <Badge className="bg-blue-100 text-[#0B61FF] text-sm px-3 py-1">
                    {getPRCount()} PR{getPRCount() > 1 ? 's' : ''} entered
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="e.g., 13633801, 13633802, 24678012"
                    value={prNumbers}
                    onChange={(e) => {
                      setPrNumbers(e.target.value);
                      setValidationError(null);
                    }}
                    className={validationError ? 'border-red-500' : ''}
                  />
                  {validationError && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleFetchPRs}
                  disabled={isLoading || !prNumbers.trim()}
                  className="w-auto bg-[#030213] hover:bg-[#030213]/90 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fetching from SAP...
                    </>
                  ) : (
                    'Fetch from SAP'
                  )}
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-3">Demo PR Numbers (Click to try):</p>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_PR_OPTIONS.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleDemoPRClick(option.prNumbers)}
                        className="px-3 py-1.5 bg-white border border-blue-300 rounded-md text-sm text-gray-700 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900 mb-1">Error Fetching PRs</h3>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge className={requirementType === 'Technical' ? 'bg-[#0B61FF] text-white' : 'bg-gray-500 text-white'}>
                {requirementType === 'Technical' ? 'TECH' : 'COMM'}
              </Badge>
            </div>
            <Button variant="outline" onClick={handleFetchDifferentPRs} className="border-black text-black hover:bg-gray-50">
              Fetch Different PRs
            </Button>
          </div>

          {prSummaries.map((pr) => (
            <Card key={pr.prNumber} className="p-6 border-2 border-green-400 bg-green-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">PR {pr.prNumber}</h3>
                    <Badge className="bg-gray-400 text-white text-xs">valid</Badge>
                    <Badge className={requirementType === 'Technical' ? 'bg-[#0B61FF] text-white text-xs' : 'bg-gray-500 text-white text-xs'}>
                      {requirementType === 'Technical' ? 'TECH' : 'COMM'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Description:</span>
                      <p className="text-sm text-gray-900 mt-0.5">{pr.description}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Plant:</span>
                      <p className="text-sm text-gray-900 mt-0.5">{pr.plant}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Line Items:</span>
                      <p className="text-sm text-gray-900 mt-0.5">{pr.lineItemCount}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Requester:</span>
                      <p className="text-sm text-gray-900 mt-0.5">{pr.requester}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Est. Value:</span>
                      <p className="text-sm text-gray-900 mt-0.5">INR {pr.estimatedValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={handleCancel} className="border-black text-black hover:bg-gray-50">
              Cancel
            </Button>
            <Button onClick={handleContinue} className="bg-[#030213] hover:bg-[#030213]/90 text-white">
              Continue to Cost Sheet Builder
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
