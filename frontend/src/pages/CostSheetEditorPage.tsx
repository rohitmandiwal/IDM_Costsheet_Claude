import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { PRLineItem } from '../types/costSheet.types';
import { costSheetService } from '../services/costSheet.service';
import { VendorComparison } from '../components/dashboard/VendorComparison';
import type { VendorQuote } from '../components/dashboard/VendorComparison';
import { PaymentDeliveryTerms } from '../components/dashboard/PaymentDeliveryTerms';
import { VendorSelection } from '../components/dashboard/VendorSelection';
import { PreviousPurchaseRecords } from '../components/dashboard/PreviousPurchaseRecords';
import { ApprovalStatus } from '../components/dashboard/ApprovalStatus';
import Swal from 'sweetalert2';

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
    const [selectedLineItems, setSelectedLineItems] = useState<PRLineItem[]>(initialState?.selectedLineItems || []);
    const [requirementType, setRequirementType] = useState<string>(initialState?.requirementType || '');
    const [createdCostSheetId, setCreatedCostSheetId] = useState<number | null>(initialState?.costSheetId || null);

    const [activeLineItemKey, setActiveLineItemKey] = useState<string | null>(null);
    const [vendors, setVendors] = useState<VendorQuote[]>(initialVendors);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [costSheetData, setCostSheetData] = useState<any>(null);

    const isApproverView = (location.state as any)?.isApproverView || false;

    // Derived state for display
    const firstPrNumber = selectedLineItems.length > 0 ? selectedLineItems[0].prNumber : 'NEW';

    useEffect(() => {
        // If we have a cost sheet ID (e.g. from ApproverPage) but no line items, fetch them
        const locationState = location.state as { costSheetId?: string | number } | null;
        const incomingCostSheetId = locationState?.costSheetId;

        if (incomingCostSheetId && (!selectedLineItems || selectedLineItems.length === 0)) {
            const fetchCostSheetDetails = async () => {
                try {
                    // Ensure we're using string or number ID correctly. Repo handles CS- prefix.
                    const data = await costSheetService.getCostSheetById(incomingCostSheetId);
                    if (data) {
                        setCostSheetData(data); // Store full cost sheet data including approval_chain
                        setCreatedCostSheetId(data.id);
                        setRequirementType(data.requirement_type);

                        // Map backend line items to frontend PRLineItem format
                        const mappedLineItems: PRLineItem[] = data.cost_sheet_line_items.map((item: any) => {
                            const sapItem = item.SapPrLineItem || {};
                            return {
                                id: item.id, // Cost Sheet Line Item ID
                                prNumber: sapItem.pr_number || item.pr_number || 'N/A',
                                lineNumber: sapItem.line_item_number || item.line_item_number || 'N/A',
                                partCode: sapItem.part_code || item.part_code || 'N/A',
                                description: sapItem.description || item.description || '',
                                quantity: parseFloat(sapItem.qty || item.quantity || 0),
                                uom: sapItem.uom || item.uom || '',
                                plant: sapItem.plant_code || item.plant_code || '',
                                prPrice: parseFloat(sapItem.pr_price || item.pr_price || 0),
                                lastYearPrice: sapItem.earlier_po_est ? parseFloat(sapItem.earlier_po_est) : (item.earlier_po_est ? parseFloat(item.earlier_po_est) : undefined),
                                deliveryDate: '',
                                status: item.status
                            };
                        });

                        setSelectedLineItems(mappedLineItems);

                        // Load vendor quotations for the first line item (or active line item)
                        if (mappedLineItems.length > 0) {
                            const firstLineItem = data.cost_sheet_line_items[0];

                            // Map vendor quotations to VendorQuote format
                            if (firstLineItem.vendor_quotations && firstLineItem.vendor_quotations.length > 0) {
                                const mappedVendors: VendorQuote[] = firstLineItem.vendor_quotations.map((vq: any) => ({
                                    id: vq.id,
                                    vendorName: vq.vendor?.vendor_name || 'Unknown Vendor',
                                    vendorCode: vq.vendor?.vendor_code || '',
                                    originalQuote: parseFloat(vq.r0_quoted_per_unit || 0),
                                    negotiatedQuote: parseFloat(vq.r1_negotiated_per_unit || 0),
                                    gstRate: parseFloat(vq.gst || 18),
                                    freight: parseFloat(vq.freight || 0),
                                    otherCharges: parseFloat(vq.other_charges || 0),
                                    paymentTerms: vq.payment_terms || '',
                                    deliveryTerms: vq.delivery_terms || '',
                                    exchangeRate: parseFloat(vq.exchange_rate || 1.0),
                                    quoteValidityDate: vq.quote_validity_date || '',
                                }));
                                setVendors(mappedVendors);
                            }

                            // Set the finalized vendor if it exists
                            if (firstLineItem.finalized_vendor_id) {
                                setSelectedVendorId(firstLineItem.finalized_vendor_id.toString());
                            }

                            setActiveLineItemKey(getLineItemKey(mappedLineItems[0]));
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch existing cost sheet:", error);
                    Swal.fire('Error', 'Failed to load cost sheet details.', 'error');
                    navigate('/dashboard');
                }
            };
            fetchCostSheetDetails();
            return;
        }

        // Redirect if essential data is missing AND we are not loading an existing cost sheet
        if ((!selectedLineItems || selectedLineItems.length === 0) && !incomingCostSheetId && !createdCostSheetId) {
            navigate('/pr-entry');
            return;
        }

        // Set the first item as active by default if not set
        if (selectedLineItems.length > 0 && !activeLineItemKey) {
            setActiveLineItemKey(getLineItemKey(selectedLineItems[0]));
        }

        const initCostSheet = async () => {
            if (!createdCostSheetId && !isCreating && selectedLineItems.length > 0 && !incomingCostSheetId) {
                setIsCreating(true);
                try {
                    const prNumbers: string[] = Array.from(new Set(selectedLineItems.map((item: PRLineItem) => item.prNumber)));
                    const lineItemIds = selectedLineItems
                        .map((item: PRLineItem) => item.id)
                        .filter((id: number | undefined): id is number => id !== undefined);

                    if (lineItemIds.length !== selectedLineItems.length) {
                        console.error("Some line items are missing IDs");
                    }

                    const result = await costSheetService.createCostSheet(requirementType as any, prNumbers, lineItemIds);
                    setCreatedCostSheetId(result.id);

                    // Update session storage
                    const newState = { ...initialState, costSheetId: result.id, selectedLineItems };
                    sessionStorage.setItem('costSheetEditorState', JSON.stringify(newState));
                } catch (error) {
                    console.error("Failed to create cost sheet:", error);
                } finally {
                    setIsCreating(false);
                }
            }
        };
        initCostSheet();

    }, [location.state, navigate, createdCostSheetId, activeLineItemKey]); // Removed strict deps on state vars to avoid loops, focused on initial load triggers

    // Dynamic approval chain calculation based on vendor selection and total value
    useEffect(() => {
        const calculateAndFetchApprovalChain = async () => {
            // Don't calculate if:
            // 1. Missing required data
            // 2. We are in approver view (read-only)
            // 3. The cost sheet is already submitted (has a current approval level > 0)
            if (!requirementType || !selectedVendorId || vendors.length === 0 || isApproverView) {
                return;
            }

            // If we have data and approval process has started, don't revert to preview
            if (costSheetData?.current_approval_level && costSheetData.current_approval_level > 0) {
                return;
            }

            // Find the selected vendor
            const selectedVendor = vendors.find(v => v.id.toString() === selectedVendorId);
            if (!selectedVendor || !activeLineItemKey) {
                return;
            }

            // Get the active line item
            const activeItem = selectedLineItems.find(item => getLineItemKey(item) === activeLineItemKey);
            if (!activeItem) {
                return;
            }

            // Calculate total landed cost for the selected vendor
            const lineItemQuantity = activeItem.quantity;
            const negotiatedValue = selectedVendor.negotiatedQuote * lineItemQuantity;
            const taxAmount = negotiatedValue * (selectedVendor.gstRate / 100);
            const totalLandedCost = negotiatedValue + taxAmount + selectedVendor.freight + selectedVendor.otherCharges;

            try {
                // Fetch dynamic approval chain based on total value
                const approvalChain = await costSheetService.calculateApprovalChain(
                    totalLandedCost,
                    requirementType as 'technical' | 'non_technical'
                );

                // Update cost sheet data with the calculated approval chain
                setCostSheetData((prev: any) => ({
                    ...prev,
                    approval_chain: approvalChain,
                    final_order_value: totalLandedCost,
                    current_approval_level: null // Not yet submitted
                }));
            } catch (error) {
                console.error('Error calculating approval chain:', error);
            }
        };

        calculateAndFetchApprovalChain();
    }, [vendors, selectedVendorId, requirementType, activeLineItemKey, selectedLineItems]);

    // Load vendor quotations when active line item changes
    useEffect(() => {
        if (!costSheetData || !activeLineItemKey) {
            return;
        }

        // Find the active line item in the cost sheet data
        const activeLineItemData = costSheetData.cost_sheet_line_items?.find((item: any) => {
            const sapItem = item.SapPrLineItem || {};
            const itemKey = `${sapItem.pr_number || item.pr_number}-${sapItem.line_item_number || item.line_item_number}`;
            return itemKey === activeLineItemKey;
        });

        if (!activeLineItemData) {
            return;
        }

        // Map vendor quotations to VendorQuote format
        if (activeLineItemData.vendor_quotations && activeLineItemData.vendor_quotations.length > 0) {
            const mappedVendors: VendorQuote[] = activeLineItemData.vendor_quotations.map((vq: any) => ({
                id: vq.id,
                vendorId: vq.vendor_id || vq.vendor?.id,
                vendorName: vq.vendor?.vendor_name || 'Unknown Vendor',
                vendorCode: vq.vendor?.vendor_code || '',
                originalQuote: parseFloat(vq.r0_quoted_per_unit || 0),
                negotiatedQuote: parseFloat(vq.r1_negotiated_per_unit || 0),
                gstRate: parseFloat(vq.gst || 18),
                freight: parseFloat(vq.freight || 0),
                otherCharges: parseFloat(vq.other_charges || 0),
                paymentTerms: vq.payment_terms || '',
                deliveryTerms: vq.delivery_terms || '',
                exchangeRate: parseFloat(vq.exchange_rate || 1.0),
                quoteValidityDate: vq.quote_validity_date || '',
            }));
            setVendors(mappedVendors);

            // Set the finalized vendor if it exists
            if (activeLineItemData.finalized_vendor_id) {
                const selectedQuote = mappedVendors.find(v => v.vendorId === activeLineItemData.finalized_vendor_id);
                if (selectedQuote) {
                    setSelectedVendorId(selectedQuote.id.toString());
                } else {
                    setSelectedVendorId('');
                }
            } else {
                setSelectedVendorId('');
            }
        } else {
            setVendors([]);
            setSelectedVendorId('');
        }

    }, [activeLineItemKey, costSheetData]);

    if (!selectedLineItems || selectedLineItems.length === 0) {
        return null; // Render nothing while redirecting
    }

    const activeLineItem = selectedLineItems.find((item: PRLineItem) => getLineItemKey(item) === activeLineItemKey);

    const displayCostSheetNumber = createdCostSheetId ? `CS-${createdCostSheetId}` : `CS-${firstPrNumber}`;

    const handleSubmit = async () => {
        if (!createdCostSheetId) return;

        const result = await Swal.fire({
            title: 'Submit Cost Sheet?',
            text: "Are you sure you want to submit this cost sheet for approval?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, submit it!'
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);
        try {
            await costSheetService.submitCostSheet(createdCostSheetId);
            await Swal.fire({
                title: 'Submitted!',
                text: 'Cost sheet has been submitted for approval.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to submit cost sheet:", error);
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to submit cost sheet. Please try again.',
                icon: 'error',
                confirmButtonText: 'Close'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async () => {
        if (!createdCostSheetId) return;

        const result = await Swal.fire({
            title: 'Approve Cost Sheet?',
            text: "Are you sure you want to approve this cost sheet?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Approve!'
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true);
        try {
            await costSheetService.performApprovalAction(createdCostSheetId, 'approve');
            await Swal.fire({
                title: 'Approved!',
                text: 'Cost sheet has been approved successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            navigate('/approvals');
        } catch (error: any) {
            console.error("Failed to approve cost sheet:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to approve cost sheet.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVendorSelect = async (quoteId: string) => {
        setSelectedVendorId(quoteId);

        if (!activeLineItemKey || !costSheetData) return;

        // Find active CostSheetLineItem
        const activeCSLineItem = costSheetData.cost_sheet_line_items?.find((item: any) => {
            const sapItem = item.SapPrLineItem || {};
            const itemKey = `${sapItem.pr_number || item.pr_number}-${sapItem.line_item_number || item.line_item_number}`;
            return itemKey === activeLineItemKey;
        });

        if (!activeCSLineItem) return;

        // Find Vendor ID from Quote ID
        const quote = vendors.find(v => v.id.toString() === quoteId);

        if (quote && quote.vendorId) {
            try {
                await costSheetService.selectVendorAndDeviation(
                    activeCSLineItem.id,
                    quote.vendorId,
                    null
                );

                // Update local state to reflect change
                setCostSheetData((prev: any) => {
                    if (!prev) return prev;
                    const updatedItems = prev.cost_sheet_line_items.map((item: any) => {
                        if (item.id === activeCSLineItem.id) {
                            return { ...item, finalized_vendor_id: quote.vendorId };
                        }
                        return item;
                    });
                    return { ...prev, cost_sheet_line_items: updatedItems };
                });
            } catch (error) {
                console.error("Failed to save vendor selection", error);
                Swal.fire('Error', 'Failed to save vendor selection.', 'error');
            }
        }
    };

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
                                {isApproverView ? 'Back to Review' : 'Back to PR'}
                            </Button>
                            <h1 className="font-bold text-xl text-gray-800">
                                {isApproverView ? 'Review Cost Sheet' : 'Cost Sheet Editor'}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{displayCostSheetNumber}</span>
                                &bull;
                                <span>{requirementType}</span>
                            </div>
                        </div>
                        {isApproverView ? (
                            <Button
                                size="lg"
                                onClick={handleApprove}
                                disabled={!createdCostSheetId || isSubmitting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check size={16} className="mr-2" />
                                {isSubmitting ? 'Approving...' : 'Approve Cost Sheet'}
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!createdCostSheetId || isSubmitting || isCreating}
                            >
                                <Send size={16} className="mr-2" />
                                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                            </Button>
                        )}
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
                                readOnly={isApproverView}
                            />
                            <VendorSelection
                                vendors={vendors}
                                lineItemQuantity={activeLineItem.quantity}
                                selectedVendorId={selectedVendorId}
                                onVendorSelect={handleVendorSelect}
                                readOnly={isApproverView}
                                existingDeviation={(() => {
                                    if (!costSheetData || !activeLineItemKey) return null;
                                    const activeLineItemData = costSheetData.cost_sheet_line_items?.find((item: any) => {
                                        const sapItem = item.SapPrLineItem || {};
                                        const itemKey = `${sapItem.pr_number || item.pr_number}-${sapItem.line_item_number || item.line_item_number}`;
                                        return itemKey === activeLineItemKey;
                                    });
                                    return activeLineItemData?.deviations?.[0] || null;
                                })()}
                            />

                            {selectedVendorId && (() => {
                                const selectedVendor = vendors.find(v => v.id.toString() === selectedVendorId);
                                if (!selectedVendor) return null;
                                return (
                                    <PaymentDeliveryTerms
                                        paymentTerms={selectedVendor.paymentTerms || ''}
                                        setPaymentTerms={(val) => setVendors(prev => prev.map(v => v.id.toString() === selectedVendorId ? { ...v, paymentTerms: val } : v))}
                                        deliveryTerms={selectedVendor.deliveryTerms || ''}
                                        setDeliveryTerms={(val) => setVendors(prev => prev.map(v => v.id.toString() === selectedVendorId ? { ...v, deliveryTerms: val } : v))}
                                        exchangeRate={selectedVendor.exchangeRate || 1.0}
                                        setExchangeRate={(val) => setVendors(prev => prev.map(v => v.id.toString() === selectedVendorId ? { ...v, exchangeRate: val } : v))}
                                        quoteValidityDate={selectedVendor.quoteValidityDate || ''}
                                        setQuoteValidityDate={(val) => setVendors(prev => prev.map(v => v.id.toString() === selectedVendorId ? { ...v, quoteValidityDate: val } : v))}
                                        readOnly={isApproverView}
                                    />
                                );
                            })()}
                            <PreviousPurchaseRecords
                                partCode={activeLineItem.partCode}
                                vendorCodes={vendors.map(v => v.vendorCode).filter(Boolean)}
                            />
                            <ApprovalStatus
                                approvals={costSheetData?.approval_chain || []}
                                currentLevel={costSheetData?.current_approval_level}
                                isPreview={!costSheetData?.current_approval_level && costSheetData?.approval_chain?.length > 0}
                            />
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
            className={`w-full text-left p-3 rounded-md border ${isActive ? 'bg-blue-50 border-blue-500' : 'bg-white border-white hover:border-gray-300 hover:bg-gray-50'
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