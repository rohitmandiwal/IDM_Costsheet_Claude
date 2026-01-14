import { Input } from '../ui/Input';

interface PaymentDeliveryTermsProps {
    paymentTerms: string;
    setPaymentTerms?: (value: string) => void;
    deliveryTerms: string;
    setDeliveryTerms?: (value: string) => void;
    exchangeRate: number;
    setExchangeRate?: (value: number) => void;
    quoteValidityDate: string;
    setQuoteValidityDate?: (value: string) => void;
    readOnly?: boolean;
}

export function PaymentDeliveryTerms({
    paymentTerms,
    setPaymentTerms,
    deliveryTerms,
    setDeliveryTerms,
    exchangeRate,
    setExchangeRate,
    quoteValidityDate,
    setQuoteValidityDate,
    readOnly = false
}: PaymentDeliveryTermsProps) {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 text-lg mb-6">Payment & Delivery Terms</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Payment Terms</label>
                    <Input
                        placeholder="e.g., Net 30, Net 60"
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms?.(e.target.value)}
                        className="h-10 bg-gray-50/50 border-gray-200 focus:bg-white"
                        disabled={readOnly}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Delivery Terms</label>
                    <Input
                        placeholder="e.g., FOB, CIF, DAP"
                        value={deliveryTerms}
                        onChange={(e) => setDeliveryTerms?.(e.target.value)}
                        className="h-10 bg-gray-50/50 border-gray-200 focus:bg-white"
                        disabled={readOnly}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Exchange Rate</label>
                    <Input
                        type="number"
                        step="0.01"
                        value={exchangeRate || 1.00}
                        onChange={(e) => setExchangeRate?.(parseFloat(e.target.value))}
                        className="h-10 bg-gray-50/50 border-gray-200 focus:bg-white"
                        disabled={readOnly}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Quote Validity Date</label>
                    <Input
                        type="date"
                        value={quoteValidityDate}
                        onChange={(e) => setQuoteValidityDate?.(e.target.value)}
                        className="h-10 bg-gray-50/50 border-gray-200 focus:bg-white"
                        disabled={readOnly}
                    />
                </div>
            </div>
        </div>
    );
}
