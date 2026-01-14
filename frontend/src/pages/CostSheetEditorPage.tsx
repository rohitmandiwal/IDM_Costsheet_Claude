import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
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
import { BasicDetails } from '../components/dashboard/BasicDetails';
import { DeviationAnalysis } from '../components/dashboard/DeviationAnalysis';
import Swal from 'sweetalert2';

// Helper to generate a unique key for each line item
const getLineItemKey = (item: PRLineItem) => `${item.prNumber}-${item.lineNumber}`;

export function CostSheetEditorPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [selectedLineItems, setSelectedLineItems] = useState<PRLineItem[]>([]);
    const [requirementType, setRequirementType] = useState<string>('');
    const [createdCostSheetId, setCreatedCostSheetId] = useState<number | null>(null);
    const [activeLineItemKey, setActiveLineItemKey] = useState<string | null>(null);
    const [vendors, setVendors] = useState<VendorQuote[]>([]);
    const [selectedVendorId, setSelectedVendorId] = useState<string>('');
    const [costSheetData, setCostSheetData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isApproverView = (location.state as any)?.isApproverView || false;

    // Derived State
    const activeLineItem = useMemo(() =>
        selectedLineItems.find((item: PRLineItem) => getLineItemKey(item) === activeLineItemKey),
        [selectedLineItems, activeLineItemKey]);

    const displayCostSheetNumber = costSheetData?.cost_sheet_number || 'N/A';

    // Initial Load
    useEffect(() => {
        const init = async () => {
            const state = location.state as { costSheetId?: number; selectedLineItems?: PRLineItem[]; requirementType?: string };
            const csId = state?.costSheetId;

            if (csId) {
                try {
                    const data = await costSheetService.getCostSheetById(csId);
                    setCostSheetData(data);
                    setCreatedCostSheetId(data.id);
                    setRequirementType(data.requirement_type);

                    const mapped: PRLineItem[] = data.cost_sheet_line_items.map((item: any) => ({
                        id: item.id,
                        prNumber: item.SapPrLineItem?.pr_number || item.pr_number || 'N/A',
                        lineNumber: item.SapPrLineItem?.line_item_number || item.line_item_number || 'N/A',
                        partCode: item.SapPrLineItem?.part_code || item.part_code || 'N/A',
                        description: item.SapPrLineItem?.description || item.description || '',
                        quantity: parseFloat(item.SapPrLineItem?.qty || item.quantity || 0),
                        uom: item.SapPrLineItem?.uom || item.uom || '',
                        plant: item.SapPrLineItem?.plant_code || item.plant_code || '',
                        prPrice: parseFloat(item.SapPrLineItem?.pr_price || item.pr_price || 0),
                        lastYearPrice: item.SapPrLineItem?.earlier_po_est ? parseFloat(item.SapPrLineItem?.earlier_po_est) : undefined,
                        status: item.status
                    }));

                    setSelectedLineItems(mapped);
                    if (mapped.length > 0) {
                        const firstKey = getLineItemKey(mapped[0]);
                        setActiveLineItemKey(firstKey);
                    }
                } catch (error) {
                    console.error("Failed to load cost sheet:", error);
                    Swal.fire('Error', 'Failed to load cost sheet details.', 'error');
                } finally {
                    setIsLoading(false);
                }
            } else if (state?.selectedLineItems && state?.requirementType) {
                // Auto-create cost sheet if we have selected items but no ID
                try {
                    const prNumbers = [...new Set(state.selectedLineItems.map(item => item.prNumber))];
                    const selectedLineItemIds = state.selectedLineItems.map(item => item.id).filter(id => id !== undefined) as number[];

                    const normalizedType = state.requirementType.toLowerCase().includes('non') || state.requirementType.toLowerCase().includes('comm') ? 'non_technical' : 'technical';

                    const newCS = await costSheetService.createCostSheet(
                        normalizedType as 'technical' | 'non_technical',
                        prNumbers,
                        selectedLineItemIds
                    );

                    setCreatedCostSheetId(newCS.id);
                    setRequirementType(newCS.requirement_type);
                    setCostSheetData(newCS);

                    const mapped: PRLineItem[] = newCS.cost_sheet_line_items.map((item: any) => ({
                        id: item.id,
                        prNumber: item.SapPrLineItem?.pr_number || item.pr_number || 'N/A',
                        lineNumber: item.SapPrLineItem?.line_item_number || item.line_item_number || 'N/A',
                        partCode: item.SapPrLineItem?.part_code || item.part_code || 'N/A',
                        description: item.SapPrLineItem?.description || item.description || '',
                        quantity: parseFloat(item.SapPrLineItem?.qty || item.quantity || 0),
                        uom: item.SapPrLineItem?.uom || item.uom || '',
                        plant: item.SapPrLineItem?.plant_code || item.plant_code || '',
                        prPrice: parseFloat(item.SapPrLineItem?.pr_price || item.pr_price || 0),
                        lastYearPrice: item.SapPrLineItem?.earlier_po_est ? parseFloat(item.SapPrLineItem?.earlier_po_est) : undefined,
                        status: item.status
                    }));

                    setSelectedLineItems(mapped);
                    if (mapped.length > 0) {
                        const firstKey = getLineItemKey(mapped[0]);
                        setActiveLineItemKey(firstKey);
                    }
                } catch (error) {
                    console.error("Failed to auto-create cost sheet:", error);
                    // navigate('/pr-entry');
                } finally {
                    setIsLoading(false);
                }
            } else {
                navigate('/pr-entry');
            }
        };

        init();
    }, [location.state, navigate]);

    // Update vendors when active line item changes
    useEffect(() => {
        if (!costSheetData || !activeLineItemKey) return;

        const activeItemData = costSheetData.cost_sheet_line_items?.find((item: any) => {
            const key = `${item.SapPrLineItem?.pr_number || item.pr_number}-${item.SapPrLineItem?.line_item_number || item.line_item_number}`;
            return key === activeLineItemKey;
        });

        if (activeItemData) {
            const mappedVendors: VendorQuote[] = (activeItemData.vendor_quotations || []).map((vq: any) => {
                const isFinalized = vq.vendor_id === activeItemData.finalized_vendor_id;
                const finalizedDeal = activeItemData.finalized_deal;

                return {
                    id: vq.id,
                    vendorId: vq.vendor_id || vq.vendor?.id || vq.Vendor?.id,
                    vendorName: vq.vendor?.vendor_name || vq.Vendor?.vendor_name || 'Unknown',
                    vendorCode: vq.vendor?.vendor_code || vq.Vendor?.vendor_code || '',
                    taxCode: vq.tax_code || '',
                    originalQuote: parseFloat(vq.r0_quoted_per_unit || 0),
                    negotiatedQuote: parseFloat(vq.r1_negotiated_per_unit || 0),
                    gstRate: parseFloat(vq.gstRate || vq.gst || 18),
                    freight: parseFloat(vq.freight || 0),
                    otherCharges: parseFloat(vq.other_charges || 0),
                    paymentTerms: (isFinalized && finalizedDeal?.payment_terms) || vq.payment_terms || '',
                    deliveryTerms: (isFinalized && finalizedDeal?.delivery_terms) || vq.delivery_terms || '',
                    exchangeRate: parseFloat((isFinalized && finalizedDeal?.exchange_rate) || vq.exchange_rate || 1.0),
                    quoteValidityDate: (isFinalized && finalizedDeal?.quote_validity_date) || vq.quote_validity_date || '',
                };
            });

            // Only update vendors if the data actually changed
            const currentVendorsJson = JSON.stringify(vendors.map(v => ({
                id: v.id,
                paymentTerms: v.paymentTerms,
                deliveryTerms: v.deliveryTerms,
                exchangeRate: v.exchangeRate,
                quoteValidityDate: v.quoteValidityDate
            })));
            const newVendorsJson = JSON.stringify(mappedVendors.map(v => ({
                id: v.id,
                paymentTerms: v.paymentTerms,
                deliveryTerms: v.deliveryTerms,
                exchangeRate: v.exchangeRate,
                quoteValidityDate: v.quoteValidityDate
            })));

            if (currentVendorsJson !== newVendorsJson) {
                setVendors(mappedVendors);
            }

            if (activeItemData.finalized_vendor_id) {
                const selected = mappedVendors.find(v => v.vendorId === activeItemData.finalized_vendor_id);
                setSelectedVendorId(selected ? selected.id.toString() : '');
            } else {
                setSelectedVendorId('');
            }
        }
    }, [activeLineItemKey, costSheetData]);

    const handleVendorSelect = async (quoteId: string) => {
        setSelectedVendorId(quoteId);
        if (!activeLineItem || !costSheetData) return;

        const activeCSLineItem = costSheetData.cost_sheet_line_items?.find((item: any) => {
            const key = `${item.SapPrLineItem?.pr_number || item.pr_number}-${item.SapPrLineItem?.line_item_number || item.line_item_number}`;
            return key === activeLineItemKey;
        });

        if (!activeCSLineItem) return;

        const quote = vendors.find(v => v.id.toString() === quoteId);
        if (quote) {
            // Use vendorId if available, otherwise use the quotation id as fallback
            const vendorIdToUse = quote.vendorId || quote.id;

            if (!vendorIdToUse) {
                console.error("Vendor ID is missing for the selected quote", quote);
                Swal.fire('Error', 'Vendor information is incomplete. Please refresh and try again.', 'error');
                return;
            }

            try {
                const updatedCS = await costSheetService.selectVendorAndDeviation(
                    activeCSLineItem.id,
                    vendorIdToUse,
                    null
                );
                setCostSheetData(updatedCS);
            } catch (error) {
                console.error("Failed to save vendor selection", error);
                Swal.fire('Error', 'Failed to save vendor selection.', 'error');
            }
        }
    };

    const handleVendorsUpdate = async (updatedVendors: VendorQuote[]) => {
        setVendors(updatedVendors);
        // Refresh full data to ensure totals are updated from backend
        if (createdCostSheetId) {
            const data = await costSheetService.getCostSheetById(createdCostSheetId);
            setCostSheetData(data);
        }
    };

    const handleDeviationChange = async (field: string, value: string) => {
        if (!activeLineItem || !costSheetData) return;

        const activeCSLineItem = costSheetData.cost_sheet_line_items?.find((item: any) => {
            const key = `${item.SapPrLineItem?.pr_number || item.pr_number}-${item.SapPrLineItem?.line_item_number || item.line_item_number}`;
            return key === activeLineItemKey;
        });

        if (!activeCSLineItem) return;

        const currentDeviation = activeCSLineItem.deviations?.[0] || {};
        const updatedDeviation = { ...currentDeviation, [field]: value };

        // Get the vendor ID from selectedVendorId or finalized_vendor_id
        const quote = vendors.find(v => v.id.toString() === selectedVendorId);
        const vendorIdToUse = activeCSLineItem.finalized_vendor_id || quote?.vendorId || quote?.id;

        if (!vendorIdToUse) {
            console.warn('No vendor selected yet, deviation will be saved when vendor is selected');
            // Store deviation locally for now
            return;
        }

        try {
            const updatedCS = await costSheetService.selectVendorAndDeviation(
                activeCSLineItem.id,
                vendorIdToUse,
                updatedDeviation
            );
            setCostSheetData(updatedCS);
        } catch (error) {
            Swal.fire('Error', 'Failed to save deviation. Please try again.', 'error');
        }
    };

    // Debounce timer ref
    const debounceTimerRef = useRef<number | null>(null);

    const handleQuoteTermChange = useCallback((field: string, value: any) => {
        if (!selectedVendorId || !costSheetData || !activeLineItemKey) return;

        const activeItemData = costSheetData.cost_sheet_line_items?.find((item: any) => {
            const key = `${item.SapPrLineItem?.pr_number || item.pr_number}-${item.SapPrLineItem?.line_item_number || item.line_item_number}`;
            return key === activeLineItemKey;
        });

        if (!activeItemData) return;

        const quoteId = parseInt(selectedVendorId);

        // Map snake_case API field names to camelCase state field names
        const fieldMap: Record<string, string> = {
            'payment_terms': 'paymentTerms',
            'delivery_terms': 'deliveryTerms',
            'exchange_rate': 'exchangeRate',
            'quote_validity_date': 'quoteValidityDate'
        };
        const stateFieldName = fieldMap[field] || field;

        // Optimistic update - immediate UI feedback in vendors state
        setVendors(prev => prev.map(v => v.id === quoteId ? { ...v, [stateFieldName]: value } : v));

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer - only make API call after user stops typing for 800ms
        debounceTimerRef.current = setTimeout(async () => {
            try {
                await costSheetService.updateFinalizedDealTerms(activeItemData.id, { [field]: value });
                // Note: No need to refresh full cost sheet for payment/delivery terms
                // as they don't affect pricing or approval chain
            } catch (error) {
                console.error(`Failed to update ${field}:`, error);
                Swal.fire('Error', `Failed to update ${field}`, 'error');
            }
        }, 800); // 800ms debounce delay
    }, [selectedVendorId, costSheetData, activeLineItemKey]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleSubmit = async () => {
        if (!createdCostSheetId) return;

        const result = await Swal.fire({
            title: 'Submit Cost Sheet?',
            text: "Are you sure you want to submit this cost sheet for approval?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, submit it!'
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true);
        try {
            await costSheetService.submitCostSheet(createdCostSheetId);
            await Swal.fire({
                title: 'Submitted!',
                text: 'Cost sheet has been submitted successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to submit:", error);
            Swal.fire('Error', 'Failed to submit cost sheet.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium font-sans">Loading Cost Sheet Details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[300px] h-screen border-r border-gray-200 bg-white flex flex-col shrink-0">
                <div className="p-5 border-b">
                    <h2 className="font-bold text-gray-800">Line Items</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-3xl font-bold text-gray-900">{selectedLineItems.length}</span>
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider pt-2">
                            {selectedLineItems.filter(li => li.status === 'finalized').length} finalized
                        </span>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {selectedLineItems.map((item) => (
                        <LineItemCard
                            key={getLineItemKey(item)}
                            item={item}
                            isActive={getLineItemKey(item) === activeLineItemKey}
                            onClick={() => setActiveLineItemKey(getLineItemKey(item))}
                        />
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto relative flex flex-col">
                {/* Header */}
                <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-10 p-5 shrink-0">
                    <div className="container max-w-6xl mx-auto flex justify-between items-center">
                        <div className="flex items-start gap-4">
                            <button onClick={() => navigate(-1)} className="mt-1 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="font-bold text-2xl text-gray-900">Cost Sheet Editor</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-mono">PR: {costSheetData?.cost_sheet_prs?.[0]?.pr_number || 'N/A'}</span>
                                    <span>&bull;</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-mono">CS: {displayCostSheetNumber}</span>
                                    <span>&bull;</span>
                                    <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-100 font-bold tracking-wide">
                                        {requirementType?.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting || isApproverView}
                            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-gray-200 transition-all font-bold px-8 h-12 rounded-xl"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                            Submit for Approval
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="container max-w-6xl mx-auto p-8 space-y-10">
                        {activeLineItem ? (
                            <>
                                <LineItemDetailHeader
                                    item={activeLineItem}
                                    requester={costSheetData?.cost_sheet_prs?.[0]?.SapPr?.requester || 'N/A'}
                                />

                                <BasicDetails
                                    item={activeLineItem}
                                    costSheetData={costSheetData}
                                />

                                <VendorComparison
                                    lineItemId={costSheetData?.cost_sheet_line_items?.find((li: any) => getLineItemKey({ prNumber: li.SapPrLineItem?.pr_number, lineNumber: li.SapPrLineItem?.line_item_number } as any) === activeLineItemKey)?.id}
                                    lineItemQuantity={activeLineItem.quantity}
                                    vendors={vendors}
                                    onVendorsUpdate={handleVendorsUpdate}
                                    readOnly={isApproverView}
                                />

                                <VendorSelection
                                    vendors={vendors}
                                    lineItemQuantity={activeLineItem.quantity}
                                    selectedVendorId={selectedVendorId}
                                    onVendorSelect={handleVendorSelect}
                                    readOnly={isApproverView}
                                />

                                {/* Show Deviation Analysis only if non-L1 vendor is selected */}
                                {selectedVendorId && (() => {
                                    const selectedVendor = vendors.find(v => v.id.toString() === selectedVendorId);
                                    if (!selectedVendor) return null;

                                    // Calculate if this is L1 (lowest price)
                                    const lowestNegotiatedTotal = Math.min(...vendors.map(v => {
                                        const negotiatedValue = (v.negotiatedQuote || 0) * activeLineItem.quantity;
                                        const taxAmount = (negotiatedValue * (v.gstRate || 0)) / 100;
                                        return negotiatedValue + taxAmount + (v.freight || 0) + (v.otherCharges || 0);
                                    }).filter(t => t > 0));

                                    const selectedNegotiatedValue = (selectedVendor.negotiatedQuote || 0) * activeLineItem.quantity;
                                    const selectedTaxAmount = (selectedNegotiatedValue * (selectedVendor.gstRate || 0)) / 100;
                                    const selectedTotal = selectedNegotiatedValue + selectedTaxAmount + (selectedVendor.freight || 0) + (selectedVendor.otherCharges || 0);

                                    const isL1 = selectedTotal === lowestNegotiatedTotal && selectedTotal > 0;

                                    // Only show deviation if NOT L1
                                    if (isL1) return null;

                                    return (
                                        <DeviationAnalysis
                                            deviation={costSheetData?.cost_sheet_line_items?.find((li: any) =>
                                                `${li.SapPrLineItem?.pr_number || li.pr_number}-${li.SapPrLineItem?.line_item_number || li.line_item_number}` === activeLineItemKey
                                            )?.deviations?.[0]}
                                            readOnly={isApproverView}
                                            onChange={handleDeviationChange}
                                        />
                                    );
                                })()}

                                {selectedVendorId && (() => {
                                    const selectedVendor = vendors.find(v => v.id.toString() === selectedVendorId);
                                    if (!selectedVendor) return null;
                                    return (
                                        <PaymentDeliveryTerms
                                            paymentTerms={selectedVendor.paymentTerms || ''}
                                            deliveryTerms={selectedVendor.deliveryTerms || ''}
                                            exchangeRate={selectedVendor.exchangeRate || 1.0}
                                            quoteValidityDate={selectedVendor.quoteValidityDate || ''}
                                            readOnly={isApproverView}
                                            setPaymentTerms={(val) => handleQuoteTermChange('payment_terms', val)}
                                            setDeliveryTerms={(val) => handleQuoteTermChange('delivery_terms', val)}
                                            setExchangeRate={(val) => handleQuoteTermChange('exchange_rate', val)}
                                            setQuoteValidityDate={(val) => handleQuoteTermChange('quote_validity_date', val)}
                                        />
                                    );
                                })()}

                                <ApprovalStatus
                                    approvals={costSheetData?.approval_chain || []}
                                    isPreview={!costSheetData?.current_approval_level && costSheetData?.approval_chain?.length > 0}
                                />

                                <PreviousPurchaseRecords
                                    partCode={activeLineItem.partCode}
                                    vendorCodes={vendors.map(v => v.vendorCode).filter(Boolean)}
                                />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-gray-300">
                                <p className="text-gray-400 font-medium">Select a line item from the sidebar to start editing</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function LineItemCard({ item, isActive, onClick }: { item: PRLineItem; isActive: boolean; onClick: () => void; }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 transition-all duration-200 border-b border-gray-100/50 hover:bg-gray-50 ${isActive
                ? 'bg-primary/5 border-l-4 border-l-primary'
                : 'bg-white'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    Line {item.lineNumber}
                </span>
                <Badge variant="outline" className={isActive ? 'bg-primary/10 text-primary border-primary/20' : 'text-gray-400 border-gray-200'}>
                    Pending
                </Badge>
            </div>
            <div className={`text-sm font-semibold line-clamp-2 ${isActive ? 'text-primary' : 'text-gray-700'}`}>
                {item.description}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-mono">
                <span>{item.partCode}</span>
                <span>•</span>
                <span>{item.quantity} {item.uom}</span>
            </div>
        </button>
    );
}

function LineItemDetailHeader({ item, requester }: { item: PRLineItem; requester: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 border-l-8 border-l-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 uppercase tracking-wider font-bold px-3 py-1 rounded-full mb-3 text-[10px]">Technical</Badge>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{item.description}</h2>
                        <div className="flex items-center gap-4 text-gray-500 mt-2 font-medium text-sm">
                            <span>Part Code: <span className="text-gray-900 font-bold">{item.partCode}</span></span>
                            <span className="opacity-30 border-l border-gray-300 h-4"></span>
                            <span>Line: <span className="text-gray-900 font-bold">{item.lineNumber}</span></span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pt-6 border-t border-gray-100 mt-4">
                    <HeaderStat label="Quantity" value={`${item.quantity} ${item.uom}`} />
                    <HeaderStat label="Plant" value={item.plant} />
                    <HeaderStat label="Requester" value={requester} />
                    <HeaderStat label="PR Price" value={`₹ ${item.prPrice?.toLocaleString() || '0'}`} />
                    <HeaderStat label="Last Year Price" value={item.lastYearPrice ? `₹ ${item.lastYearPrice.toLocaleString()}` : '-'} />
                    <HeaderStat label="P.O. No" value="N/A" />
                </div>
            </div>
        </div>
    );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</p>
            <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
        </div>
    );
}