import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import type { PRLineItem, PRSummary } from '../types/costSheet.types';

interface PRDetailsState {
  prSummaries: PRSummary[];
  lineItems: PRLineItem[];
  requirementType: 'Technical' | 'Commercial';
}

export function PRDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PRDetailsState;

  const [selectedLineItems, setSelectedLineItems] = useState<Set<string>>(new Set());
  const [lineItems, setLineItems] = useState<PRLineItem[]>([]);

  useEffect(() => {
    if (!state || !state.prSummaries) {
      navigate('/create-cost-sheet');
      return;
    }

    const allLineItems = state.lineItems || [];
    setLineItems(allLineItems);

    const allItemIds = allLineItems.map((item) => `${item.lineNumber}-${item.materialCode}`);
    setSelectedLineItems(new Set(allItemIds));
  }, [state, navigate]);

  if (!state || !state.prSummaries) {
    return null;
  }

  const { prSummaries, requirementType } = state;

  const handleToggleLineItem = (lineNumber: number, materialCode: string) => {
    const itemId = `${lineNumber}-${materialCode}`;
    setSelectedLineItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedLineItems.size === lineItems.length) {
      setSelectedLineItems(new Set());
    } else {
      const allItemIds = lineItems.map((item) => `${item.lineNumber}-${item.materialCode}`);
      setSelectedLineItems(new Set(allItemIds));
    }
  };

  const handleBack = () => {
    navigate('/create-cost-sheet');
  };

  const handleStartCostSheet = () => {
    const selectedItems = lineItems.filter((item) =>
      selectedLineItems.has(`${item.lineNumber}-${item.materialCode}`)
    );

    navigate('/cost-sheet-editor', {
      state: {
        prSummaries,
        lineItems: selectedItems,
        requirementType,
      },
    });
  };

  const handleDownloadPR = () => {
    console.log('Download PR');
  };

  const prNumbers = prSummaries.map((pr) => pr.prNumber);
  const totalLineItems = lineItems.length;
  const selectedCount = selectedLineItems.size;

  const createdDateRange = prSummaries.length > 0 ? '15 Jan 2026 - 15 Jan 2026' : '-';
  const primaryRequester = prSummaries.length > 0 ? prSummaries[0].requester : '-';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Requisition Details</h1>
        <p className="text-gray-600">Review PR line items and select items to include in cost sheet</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">PR Numbers ({prNumbers.length})</h3>
              <div className="flex flex-wrap gap-2">
                {prNumbers.map((prNumber) => (
                  <Badge key={prNumber} className="bg-[#0B61FF] text-white px-3 py-1">
                    {prNumber}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Primary Requester</h3>
              <p className="text-base text-gray-900">{primaryRequester}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Created Date Range</h3>
              <p className="text-base text-gray-900">{createdDateRange}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Line Items</h3>
              <p className="text-4xl font-bold text-gray-900">{totalLineItems}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Selected for Cost Sheet</h3>
              <p className="text-4xl font-bold text-[#0B61FF]">{selectedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">PR Line Items (All Selected PRs)</h2>
          <Button
            variant="outline"
            onClick={handleDownloadPR}
            className="border-black text-black hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PR
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedLineItems.size === lineItems.length && lineItems.length > 0}
                  onChange={handleToggleAll}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </TableHead>
              <TableHead>PR Number</TableHead>
              <TableHead>Line</TableHead>
              <TableHead>Part Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>UoM</TableHead>
              <TableHead>Plant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => {
              const itemId = `${item.lineNumber}-${item.materialCode}`;
              const isSelected = selectedLineItems.has(itemId);

              return (
                <TableRow key={itemId}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleLineItem(item.lineNumber, item.materialCode)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gray-200 text-gray-900 px-2 py-1">
                      {prSummaries[0]?.prNumber || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.lineNumber}</TableCell>
                  <TableCell>{item.materialCode}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.plant}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-black text-black hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleStartCostSheet}
            disabled={selectedCount === 0}
            className="bg-[#030213] hover:bg-[#030213]/90 text-white"
          >
            Start Cost Sheet ({selectedCount} items)
          </Button>
        </div>
      </Card>
    </div>
  );
}
