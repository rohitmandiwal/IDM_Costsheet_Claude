import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
// import { costSheetService } from '../services/costSheet.service'; // Removed unused import
import type { PRLineItem, PRSummary } from '../types/costSheet.types';

// Helper to generate a unique key for each line item
const getLineItemKey = (item: PRLineItem) => `${item.prNumber}-${item.lineNumber}`;

export function PRDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // State restoration logic
    const getInitialState = () => {
        if (location.state) {
            return location.state;
        }
        const savedState = sessionStorage.getItem('prDetailsState');
        return savedState ? JSON.parse(savedState) : null;
    };
    const initialState = getInitialState();
    const { prSummaries, costSheetId, requirementType: rawReqType } = initialState || {};
    const requirementType = rawReqType ? (rawReqType.toLowerCase().includes('non') || rawReqType.toLowerCase().includes('comm') ? 'non_technical' : 'technical') : 'technical';

    const [lineItems, setLineItems] = useState<PRLineItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    // const [isLoading, setIsLoading] = useState(true); // Removed unused state

    useEffect(() => {
        if (!prSummaries || prSummaries.length === 0) {
            navigate('/pr-entry');
            return;
        }

        // setIsLoading(true);
        // Extract line items from all PR summaries
        const allLineItems: PRLineItem[] = [];
        prSummaries.forEach((pr: PRSummary) => {
            if (pr.lineItems) {
                allLineItems.push(...pr.lineItems);
            }
        });

        setLineItems(allLineItems);
        setSelectedItems(new Set(allLineItems.map(getLineItemKey)));
        // setIsLoading(false);

    }, [prSummaries, navigate]);

    if (!prSummaries) {
        return null; // Render nothing while redirecting
    }

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(new Set(lineItems.map(getLineItemKey)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleToggleItem = (item: PRLineItem, checked: boolean) => {
        const key = getLineItemKey(item);
        const newSelectedItems = new Set(selectedItems);
        if (checked) {
            newSelectedItems.add(key);
        } else {
            newSelectedItems.delete(key);
        }
        setSelectedItems(newSelectedItems);
    };

    const handleStartCostSheet = () => {
        const selectedLineItems = lineItems.filter(item => selectedItems.has(getLineItemKey(item)));
        const stateToPass = {
            selectedLineItems,
            prSummaries,
            costSheetId,
            requirementType
        };
        sessionStorage.setItem('costSheetEditorState', JSON.stringify(stateToPass));
        navigate('/cost-sheet-editor', {
            state: stateToPass
        });
    };

    // Aggregate data for display
    const allRequesters = [...new Set(prSummaries.map((pr: PRSummary) => pr.requester))].join(', ');

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Purchase Requisition Detail</h1>
                        <p className="text-sm text-gray-500">Select items from the fetched PRs to build your cost sheet.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} className="mr-2" />
                        Back
                    </Button>
                </div>

                {/* Info Cards Section */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <InfoCard title="PR Numbers" value={prSummaries.map((pr: PRSummary) => pr.prNumber).join(', ')} />
                    <InfoCard title="Primary Requester" value={allRequesters} />
                    <div className="grid grid-cols-2 col-span-1 gap-6">
                        <InfoCard title="Total Line Items" value={lineItems.length} isNumeric={true} />
                        <InfoCard title="Selected for Cost Sheet" value={selectedItems.size} isNumeric={true} highlight={true} />
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1">
                    <InfoCard
                        title="Total Estimated Value (Selected)"
                        value={`₹ ${lineItems
                            .filter(item => selectedItems.has(getLineItemKey(item)))
                            .reduce((sum, item) => sum + ((item.prPrice || 0) * item.quantity), 0)
                            .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        isNumeric={true}
                        highlight={true}
                    />
                </div>

                {/* Line Items Table */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">PR Line Items (All Selected PRs)</h2>
                        <Button variant="outline"><Download size={16} className="mr-2" />Download PR</Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedItems.size === lineItems.length && lineItems.length > 0}
                                        onCheckedChange={handleToggleAll}
                                    />
                                </TableHead>
                                <TableHead>PR Number</TableHead>
                                <TableHead>Line</TableHead>
                                <TableHead>Part Code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead>UoM</TableHead>
                                <TableHead>Plant</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lineItems.map((item) => (
                                <TableRow key={getLineItemKey(item)}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedItems.has(getLineItemKey(item))}
                                            onCheckedChange={(checked) => handleToggleItem(item, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell>{item.prNumber}</TableCell>
                                    <TableCell>{item.lineNumber}</TableCell>
                                    <TableCell>{item.partCode}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell>{item.uom}</TableCell>
                                    <TableCell>{item.plant}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end mt-8">
                    <Button
                        size="lg"
                        onClick={handleStartCostSheet}
                        disabled={selectedItems.size === 0}
                    >
                        Start Cost Sheet ({selectedItems.size} items)
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Sub-component for info cards to keep the main component clean
function InfoCard({ title, value, isNumeric = false, highlight = false }: {
    title: string;
    value: string | number;
    isNumeric?: boolean;
    highlight?: boolean;
}) {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            {isNumeric ? (
                <p className={`text-3xl font-bold ${highlight ? 'text-primary' : 'text-gray-800'}`}>{value}</p>
            ) : (
                <p className="font-semibold text-gray-800 truncate">{value}</p>
            )}
        </div>
    );
}