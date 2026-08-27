// src/app/pages/purchase/register.tsx

export type PurchaseRegisterRow = {
  id: string;
  purchaseDate: string;
  terms: string;
  supplierName: string;
  billNo: string;
  purchaseBillNo: string;
  location: string;
  totalQuantity: number;
  totalAmount: number;
  freightInsuranceOther: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  transportName: string;
  mobileNo: string;
  vehicalNo: string;
  status: string;
};