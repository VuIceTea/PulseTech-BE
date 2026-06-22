export declare function createVnpayPaymentUrl(opts: {
    amount: number;
    reference: string;
    ipAddr?: string;
}): Promise<string>;
export declare function createMomoPaymentUrl(opts: {
    amount: number;
    reference: string;
}): Promise<string>;
export declare function createBankPaymentInfo(order: any): Promise<{
    instructions: string;
    orderCode: any;
    amount: any;
}>;
//# sourceMappingURL=payment.service.d.ts.map