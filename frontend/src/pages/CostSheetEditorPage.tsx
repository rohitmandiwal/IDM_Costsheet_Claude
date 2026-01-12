import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { PRLineItem, PRSummary } from '../types/costSheet.types';
import { VendorComparison } from '../components/dashboard/VendorComparison';
import type { VendorQuote } from '../components/dashboard/VendorComparison';
import { VendorSelection } from '../components/dashboard/VendorSelection';
import { PreviousPurchaseRecords } from '../components/dashboard/PreviousPurchaseRecords';
import { ApprovalStatus } from '../components/dashboard/ApprovalStatus';

// Helper to generate a unique key for each line item
const getLineItemKey = (item: PRLineItem) => `${item.prNumber}-${item.lineNumber}`;
// Mock data for vendors, to be lifted here to be shared by sibling components
const initialVendors: VendorQuote[] = [
    { id: 1, vendorName: 'Supplier A', vendorCode: 'V001', originalQuote: 25920, negotiatedQuote: 25000, gstRate: 18, freight: 5000, otherCharges: 2000 },
    { id: 2, vendorName: 'Supplier B', vendorCode: 'V002', originalQuote: 26775, negotiatedQuote: 25500, gstRate: 18, freight: 4000, otherCharges: 1500 },
    { id: 3, vendorName: 'Supplier C', vendorCode: 'V003', originalQuote: 26180, negotiatedQuote: 23800, gstRate: 18, freight: 6000, otherCharges: 2500 },
];

export function CostSheetEditorPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const getInitialState = () => {
        if (location.state) {
            return location.state;
        }
        const savedState = sessionStorage.getItem('costSheetEditorState');
        return savedState ? JSON.parse(savedState) : null;
    };
    const initialState = getInitialState();
    const { selectedLineItems, prSummaries, costSheetId, requirementType } = initialState || {};

    const [activeLineItemKey, setActiveLineItemKey] = useState<string | null>(null);
    const [vendors, setVendors] = useState<VendorQuote[]>(initialVendors);

    useEffect(() => {
        // Redirect if essential data is missing
        if (!selectedLineItems || selectedLineItems.length === 0) {
            navigate('/pr-entry');
            return;
        }
        // Set the first item as active by default
        setActiveLineItemKey(getLineItemKey(selectedLineItems[0]));
    }, [selectedLineItems, navigate]);

    if (!selectedLineItems || selectedLineItems.length === 0) {
        return null; // Render nothing while redirecting
    }
    
    const activeLineItem = selectedLineItems.find((item: PRLineItem) => getLineItemKey(item) === activeLineItemKey);
    const costSheetNumber = `CS-${prSummaries[0]?.prNumber || ''}`;

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Left Panel: Line Items List */}
            <aside className="w-1/4 h-screen border-r border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg text-gray-800">Line Items ({selectedLineItems.length})</h2>
                    <p className="text-sm text-gray-500">0 finalized</p>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {selectedLineItems.map((item: PRLineItem) => (
                        <LineItemCard
                            key={getLineItemKey(item)}
                            item={item}
                            isActive={getLineItemKey(item) === activeLineItemKey}
                            onClick={() => setActiveLineItemKey(getLineItemKey(item))}
                        />
                    ))}
                </nav>
            </aside>

            {/* Right Panel: Content */}
            <main className="flex-1 h-screen overflow-y-auto">
                {/* Header */}
                <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-10">
                    <div className="p-4 flex justify-between items-center">
                        <div>
                            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-600 mb-1">
                                <ArrowLeft size={16} />
                                Back to PR
                            </Button>
                            <h1 className="font-bold text-xl text-gray-800">
                                Cost Sheet Editor
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{costSheetNumber}</span>
                                &bull;
                                <span>{requirementType}</span>
                            </div>
                        </div>
                        <Button size="lg"><Send size={16} className="mr-2"/>Submit for Approval</Button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-6">
                    {activeLineItem ? (
                        <div className="space-y-6">
                           <LineItemDetailHeader item={activeLineItem} />
                           
                           {/* Placeholder for future components */}
                           <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-2">Basic Details</h3>
                                <p className="text-sm text-gray-500">
                                    Section for PR Number, Line Item, Currency, Raised By, etc. will be implemented here.
                                </p>
                           </div>

                           <VendorComparison 
                                lineItemQuantity={activeLineItem.quantity} 
                                vendors={vendors}
                                setVendors={setVendors}
                           />
                           <VendorSelection vendors={vendors} lineItemQuantity={activeLineItem.quantity} />
                           <PreviousPurchaseRecords />
                           <ApprovalStatus />
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500">Select a line item from the left to view its details.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Sub-component for the cards in the left panel
function LineItemCard({ item, isActive, onClick }: { item: PRLineItem; isActive: boolean; onClick: () => void; }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 rounded-md border ${
                isActive ? 'bg-blue-50 border-blue-500' : 'bg-white border-white hover:border-gray-300 hover:bg-gray-50'
            }`}
        >
            <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-gray-800">Line {item.lineNumber}</span>
                <Badge variant={isActive ? 'default' : 'secondary'}>Pending</Badge>
            </div>
            <p className="text-sm text-gray-600 truncate mb-2" title={item.description}>
                {item.description}
            </p>
            <p className="text-xs text-gray-400">
                {item.partCode} &bull; {item.quantity} {item.uom}
            </p>
        </button>
    );
}

// Sub-component for the header of the right panel
function LineItemDetailHeader({ item }: { item: PRLineItem }) {
    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h2 className="font-bold text-lg text-gray-800 mb-2">{item.description}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Part Code: <span className="font-medium text-gray-700">{item.partCode}</span></span>
                <span>Line: <span className="font-medium text-gray-700">{item.lineNumber}</span></span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
                <InfoPill label="Quantity" value={`${item.quantity} ${item.uom}`} />
                <InfoPill label="Plant" value={item.plant} />
                <InfoPill label="PR Price" value="₹ 25,000.00" /> 
                <InfoPill label="Last Year Price" value="N/A" />
            </div>
        </div>
    );
}

function InfoPill({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-sm text-gray-800">{value}</p>
        </div>
    )
}