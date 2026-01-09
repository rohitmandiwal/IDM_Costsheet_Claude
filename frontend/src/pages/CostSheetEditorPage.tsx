import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import type { PRLineItem, PRSummary } from '../types/costSheet.types';

interface CostSheetEditorState {
  prSummaries: PRSummary[];
  lineItems: PRLineItem[];
  requirementType: 'Technical' | 'Commercial';
}

interface Vendor {
  vendorId: number;
  vendorName: string;
  vendorCode: string;
  taxCode: string;
  originalQuotePerUnit: string;
  value: string;
  afterNegotiationPerUnit: string;
  afterNegotiationValue: string;
  gst: string;
}

export function CostSheetEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CostSheetEditorState;

  const [selectedLineItemIndex, setSelectedLineItemIndex] = useState(0);
  const [vendors, setVendors] = useState<Vendor[]>([
    { vendorId: 1, vendorName: '', vendorCode: '', taxCode: '', originalQuotePerUnit: '', value: '', afterNegotiationPerUnit: '', afterNegotiationValue: '', gst: '' },
    { vendorId: 2, vendorName: '', vendorCode: '', taxCode: '', originalQuotePerUnit: '', value: '', afterNegotiationPerUnit: '', afterNegotiationValue: '', gst: '' },
    { vendorId: 3, vendorName: '', vendorCode: '', taxCode: '', originalQuotePerUnit: '', value: '', afterNegotiationPerUnit: '', afterNegotiationValue: '', gst: '' },
  ]);

  useEffect(() => {
    if (!state || !state.prSummaries || !state.lineItems || state.lineItems.length === 0) {
      navigate('/create-cost-sheet');
    }
  }, [state, navigate]);

  if (!state || !state.prSummaries || !state.lineItems || state.lineItems.length === 0) {
    return null;
  }

  const { prSummaries, lineItems, requirementType } = state;
  const selectedLineItem = lineItems[selectedLineItemIndex];
  const prNumber = prSummaries[0]?.prNumber || '-';
  const costSheetId = 'CS-001';

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmitForApproval = () => {
    console.log('Submit for approval');
  };

  const handleAddVendor = () => {
    setVendors([
      ...vendors,
      {
        vendorId: vendors.length + 1,
        vendorName: '',
        vendorCode: '',
        taxCode: '',
        originalQuotePerUnit: '',
        value: '',
        afterNegotiationPerUnit: '',
        afterNegotiationValue: '',
        gst: '',
      },
    ]);
  };

  const finalizedCount = 0;
  const totalVendors = vendors.filter(v => v.vendorName || v.vendorCode).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-80 border-r bg-gray-50 overflow-y-auto">
        <div className="p-6 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Line Items <span className="text-gray-600">({lineItems.length})</span>
          </h2>
          <p className="text-sm text-gray-600">{finalizedCount} finalized</p>
        </div>
        <div className="p-4 space-y-2">
          {lineItems.map((item, index) => {
            const isSelected = index === selectedLineItemIndex;
            return (
              <button
                key={`${item.lineNumber}-${item.materialCode}`}
                onClick={() => setSelectedLineItemIndex(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'bg-white border-l-4 border-l-[#0B61FF] border-t-gray-200 border-r-gray-200 border-b-gray-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">Line {item.lineNumber}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                <p className="text-xs text-gray-500">
                  {item.materialCode} • {item.quantity} {item.unit}
                </p>
                <Badge className="bg-yellow-100 text-yellow-800 mt-2 px-2 py-0.5 text-xs">
                  Pending
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleBack}
                className="text-[#0B61FF] hover:text-[#0B61FF]/80 text-sm font-medium mb-2 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to PR
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Cost Sheet Editor</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>PR: {prNumber}</span>
                <span>•</span>
                <span>{costSheetId}</span>
                <span>•</span>
                <Badge className={requirementType === 'Technical' ? 'bg-[#0B61FF] text-white' : 'bg-gray-500 text-white'}>
                  {requirementType === 'Technical' ? 'TECHNICAL' : 'COMMERCIAL'}
                </Badge>
              </div>
            </div>
            <Button className="bg-[#0B61FF] hover:bg-[#0B61FF]/90 text-white" onClick={handleSubmitForApproval}>
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <Card className="p-6 border-l-4 border-l-[#0B61FF]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedLineItem.description}</h2>
                <Badge className="bg-[#0B61FF] text-white mb-2">
                  {requirementType === 'Technical' ? 'TECHNICAL' : 'COMMERCIAL'}
                </Badge>
                <p className="text-sm text-gray-600">
                  Part Code: {selectedLineItem.materialCode} • Line: {selectedLineItem.lineNumber}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Quantity</p>
                <p className="text-sm font-semibold text-gray-900">{selectedLineItem.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">UOM</p>
                <p className="text-sm font-semibold text-gray-900">{selectedLineItem.unit}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Plant</p>
                <p className="text-sm font-semibold text-gray-900">{selectedLineItem.plant}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Requester</p>
                <p className="text-sm font-semibold text-gray-900">{prSummaries[0]?.requester || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">PR Price</p>
                <p className="text-sm font-semibold text-gray-900">INR {selectedLineItem.estimatedValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Last Year Price</p>
                <p className="text-sm font-semibold text-gray-900">-</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-600">P.O. No: <span className="text-gray-900 font-medium">N/A</span></p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Details</h2>
              <p className="text-sm text-gray-600">Total Vendors: <span className="font-semibold">{totalVendors}</span></p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">PR Number</p>
                <p className="text-sm font-medium text-gray-900">{prNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Line Item</p>
                <p className="text-sm font-medium text-gray-900">{selectedLineItem.lineNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Currency</p>
                <select className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-full">
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Raised By</p>
                <p className="text-sm font-medium text-gray-900">{prSummaries[0]?.requester || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Created Date</p>
                <p className="text-sm font-medium text-gray-900">15 Jan 2026</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Last Modified</p>
                <p className="text-sm font-medium text-gray-900">15 Jan 2026</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Modified By</p>
                <p className="text-sm font-medium text-gray-900">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">PO Number</p>
                <p className="text-sm font-medium text-gray-900">Not Generated</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">PO Date</p>
                <p className="text-sm font-medium text-gray-900">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Final Approval Status</p>
                <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Vendor Comparison</h2>
                <p className="text-xs text-gray-600">Best price highlighted in green • Scroll horizontally for all fields</p>
              </div>
              <Button
                variant="outline"
                onClick={handleAddVendor}
                className="border-[#0B61FF] text-[#0B61FF] hover:bg-blue-50"
              >
                + Add Vendor
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-600 p-3">Vendor</th>
                    <th className="text-left text-xs font-medium text-gray-600 p-3">Vendor Name</th>
                    <th className="text-left text-xs font-medium text-gray-600 p-3">Vendor Code</th>
                    <th className="text-left text-xs font-medium text-gray-600 p-3">Tax Code</th>
                    <th className="text-left text-xs font-medium text-gray-600 p-3">Original Quote Per Unit</th>
                    <th className="text-left text-xs font-medium text-gray-600 p-3">Value</th>
                    <th className="text-left text-xs font-medium text-gray-600 p-3">After Negotiation Per Unit Price</th>
                    <th className="text-left text-xs font-medium text-gray-600 p-3">After Negotiation Value</th>
                    <th className="text-left text-xs font-medium text-gray-600 p-3">GST %</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.vendorId} className="border-b">
                      <td className="p-3">
                        <span className="text-sm font-medium text-gray-700">Vendor {vendor.vendorId}</span>
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="Enter name"
                          value={vendor.vendorName}
                          onChange={(e) => {
                            const newVendors = [...vendors];
                            const index = newVendors.findIndex(v => v.vendorId === vendor.vendorId);
                            newVendors[index].vendorName = e.target.value;
                            setVendors(newVendors);
                          }}
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="Enter code"
                          value={vendor.vendorCode}
                          onChange={(e) => {
                            const newVendors = [...vendors];
                            const index = newVendors.findIndex(v => v.vendorId === vendor.vendorId);
                            newVendors[index].vendorCode = e.target.value;
                            setVendors(newVendors);
                          }}
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="Tax code"
                          value={vendor.taxCode}
                          onChange={(e) => {
                            const newVendors = [...vendors];
                            const index = newVendors.findIndex(v => v.vendorId === vendor.vendorId);
                            newVendors[index].taxCode = e.target.value;
                            setVendors(newVendors);
                          }}
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="0.00"
                          value={vendor.originalQuotePerUnit}
                          onChange={(e) => {
                            const newVendors = [...vendors];
                            const index = newVendors.findIndex(v => v.vendorId === vendor.vendorId);
                            newVendors[index].originalQuotePerUnit = e.target.value;
                            setVendors(newVendors);
                          }}
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="0.00"
                          value={vendor.value}
                          onChange={(e) => {
                            const newVendors = [...vendors];
                            const index = newVendors.findIndex(v => v.vendorId === vendor.vendorId);
                            newVendors[index].value = e.target.value;
                            setVendors(newVendors);
                          }}
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="0.00"
                          value={vendor.afterNegotiationPerUnit}
                          onChange={(e) => {
                            const newVendors = [...vendors];
                            const index = newVendors.findIndex(v => v.vendorId === vendor.vendorId);
                            newVendors[index].afterNegotiationPerUnit = e.target.value;
                            setVendors(newVendors);
                          }}
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="0.00"
                          value={vendor.afterNegotiationValue}
                          onChange={(e) => {
                            const newVendors = [...vendors];
                            const index = newVendors.findIndex(v => v.vendorId === vendor.vendorId);
                            newVendors[index].afterNegotiationValue = e.target.value;
                            setVendors(newVendors);
                          }}
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="0"
                          value={vendor.gst}
                          onChange={(e) => {
                            const newVendors = [...vendors];
                            const index = newVendors.findIndex(v => v.vendorId === vendor.vendorId);
                            newVendors[index].gst = e.target.value;
                            setVendors(newVendors);
                          }}
                          className="text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Deviation Analysis</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Deviation Approval (If any)</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Raised By</p>
                <Input placeholder="Manual Entry" className="text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Deviation Type</p>
                <select className="text-sm border border-gray-300 rounded px-3 py-2 w-full">
                  <option value="">Select</option>
                  <option value="price">Price Deviation</option>
                  <option value="technical">Technical Deviation</option>
                  <option value="delivery">Delivery Deviation</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Approved By</p>
                <Input placeholder="-" className="text-sm" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment & Delivery Terms</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Payment Terms</p>
                <Input placeholder="Enter terms" className="text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Delivery Terms</p>
                <Input placeholder="Enter terms" className="text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Exchange Rate</p>
                <Input placeholder="1.00" className="text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Quote Validity Date</p>
                <Input type="date" className="text-sm" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                    L1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">IDM-Team Lead</p>
                    <p className="text-sm text-gray-600">Pending review</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                    L2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">IDM-Lead</p>
                    <p className="text-sm text-gray-600">Pending review</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 font-semibold">
                    L3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Head Sourcing & Supply Chain</p>
                    <p className="text-sm text-gray-600">Pending review</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
