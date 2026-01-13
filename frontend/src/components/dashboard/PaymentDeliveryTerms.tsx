import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface PaymentDeliveryTermsProps {
    paymentTerms: string;
    setPaymentTerms: (value: string) => void;
    deliveryTerms: string;
    setDeliveryTerms: (value: string) => void;
    exchangeRate: number;
    setExchangeRate: (value: number) => void;
    quoteValidityDate: string;
    setQuoteValidityDate: (value: string) => void;
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
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-800">Payment & Delivery Terms</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Terms */}
                    <div className="space-y-2">
                        <Label htmlFor="payment-terms" className="text-gray-600 font-medium text-sm">Payment Terms</Label>
                        <Input
                            id="payment-terms"
                            placeholder="e.g. Net 30"
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            disabled={readOnly}
                        />
                    </div>

                    {/* Delivery Terms */}
                    <div className="space-y-2">
                        <Label htmlFor="delivery-terms" className="text-gray-600 font-medium text-sm">Delivery Terms</Label>
                        <Input
                            id="delivery-terms"
                            placeholder="e.g., FOB, CIF, DAP"
                            value={deliveryTerms}
                            onChange={(e) => setDeliveryTerms(e.target.value)}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            disabled={readOnly}
                        />
                    </div>

                    {/* Exchange Rate */}
                    <div className="space-y-2">
                        <Label htmlFor="exchange-rate" className="text-gray-600 font-medium text-sm">Exchange Rate</Label>
                        <Input
                            id="exchange-rate"
                            type="number"
                            placeholder="1.0"
                            step="0.01"
                            value={exchangeRate || ''}
                            onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            disabled={readOnly}
                        />
                    </div>

                    {/* Quote Validity Date */}
                    <div className="space-y-2">
                        <Label htmlFor="quote-validity" className="text-gray-600 font-medium text-sm">Quote Validity Date</Label>
                        <div className="relative">
                            <Input
                                id="quote-validity"
                                type="date"
                                value={quoteValidityDate}
                                onChange={(e) => setQuoteValidityDate(e.target.value)}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                disabled={readOnly}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
