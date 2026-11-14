/**
 * Types & Interfaces for Senior IS Hoodies Pre-Order
 * Information Systems Department - Al-Sallab Institute (Class of 2027)
 */

export type HoodieSize = 'M' | 'L' | 'XL' | 'XXL';

export type OrderType = 'individual' | 'team' | 'plain_hoodie';

export type PaymentMethod = 'vodafone_cash' | 'instapay';

export interface SizeDimension {
  size: HoodieSize;
  chestCm: number;
  lengthCm: number;
  sleeveCm: number;
  recommendedWeightKg: string;
  recommendedHeightCm: string;
}

export interface TemplateCheckItem {
  id: string;
  label: string;
  description: string;
  detected: boolean;
}

export interface PaymentDetails {
  method: PaymentMethod;
  amountPaid: number;          // Must be >= 50% of totalPrice
  senderAccountOrPhone: string; // Phone number or InstaPay username transferred from
  transactionRef: string;      // Transaction reference number / Ref No
  receiptPreviewUrl?: string;  // Image preview of transfer receipt (MANDATORY)
  receiptFileName?: string;    // Original file name
  isReceiptValid?: boolean;    // True only if client-side validation passes
  receiptDimensions?: string;  // e.g. 1080x1920
  receiptTemplateMatched?: string; // e.g. "InstaPay Official Template" or "VF-Cash Official SMS"
  templateChecklist?: TemplateCheckItem[]; // Detailed checklist of verified template elements
  paidPercentage: number;      // e.g. 50 or 100%
  remainingAmount: number;     // Remaining balance to be paid upon physical pickup
  isVerified: boolean;
}

export interface IndividualFormData {
  fullName: string;
  nameOnHoodie: string; // Name to print on hoodie
  whatsApp: string;
  weightKg: string;   // Weight in KG for sizing accuracy
  size: HoodieSize;
  quantity: number;
  payment: PaymentDetails;
}

export interface TeamMember {
  id: string;
  fullName: string;
  nameOnHoodie?: string;
  weightKg: string;
  size: HoodieSize;
}

export interface TeamFormData {
  teamName: string;
  leaderName: string;
  leaderWhatsApp: string;
  nameOnHoodie?: string;
  members: TeamMember[];
  payment: PaymentDetails;
}

export interface StoredOrder {
  trackingId: string; // e.g. BIS-0001 (individual) or BIS TEAM-001 (team)
  orderType: OrderType;
  fullName: string;
  nameOnHoodie?: string;
  whatsApp: string;
  weightKg?: string;
  size: string;
  printStyle: 'SILK_SCREEN_FRONT_BACK';
  teamName: string;
  totalPrice: number;
  itemCount: number;
  payment: PaymentDetails;
  details?: {
    teamLeaderName?: string;
    members?: TeamMember[];
  };
  createdAt: string;
  status: 'confirmed' | 'processing' | 'ready_for_pickup';
}

export interface GoogleSheetPayload {
  // Required 14 Precise Columns for Google Apps Script Backend Binding
  timestamp: string;
  trackingId: string;
  orderType: 'individual' | 'team' | 'plain_hoodie';
  fullName: string;
  nameOnHoodie: string;
  whatsApp: string;
  size: string;
  weight: string;
  quantity: number;
  paidAmount: number;
  totalPrice: number;
  instapayRef: string;
  vfcashSender: string;
  receiptProofUrl: string;
  // Tab Routing for Google Sheet: "طلبات الأفراد" or "طلبات التيمات"
  targetSheet: 'طلبات الأفراد' | 'طلبات التيمات';
  sheetTab: 'طلبات الأفراد' | 'طلبات التيمات';
  sheetName?: string;
  tabName?: string;
  // Additional helpful attributes & aliases
  weightKg?: string;
  depositPaid?: number;
  remainingAmount?: number;
  paymentMethod?: string;
  transactionRef?: string;
  senderAccount?: string;
  printStyle?: string;
  teamName?: string;
  // Sheet column aliases
  'Timestamp'?: string;
  'Tracking ID'?: string;
  'Order Type'?: string;
  'Full Name'?: string;
  'Name on Hoodie'?: string;
  'WhatsApp'?: string;
  'Size'?: string;
  'Weight'?: string;
  'Quantity'?: number;
  'Paid Amount'?: number;
  'Total Price'?: number;
  'InstaPay Ref'?: string;
  'Vodafone Cash Sender'?: string;
  'Receipt Proof URL'?: string;
  row?: (string | number)[];
  [key: string]: any;
}
