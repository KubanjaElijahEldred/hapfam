export type Dept = 'production' | 'inventory' | 'quality' | 'management';
export type Flavor = 'Soya' | 'Rice' | 'Maize';

export interface Product {
  id: string;
  name: string;
  flavor: Flavor;
  image: any;
  description: string;
  color: string;
  unit: string;
}

export interface Material {
  id: string;
  name: string;
  category: 'Raw Material' | 'Packaging';
  unit: string;
  qty: number;
  reorder: number;
  image: any;
  location: string;
  supplier: string;
  expiry?: string;
}

export interface ProductionOrder {
  id: string;
  productId: string;
  qty: number;
  unit: string;
  start: string;
  due: string;
  supervisor: string;
  priority: 'High' | 'Normal' | 'Low';
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  instructions?: string;
  createdAt: string;
}

export interface Batch {
  id: string;
  orderId: string;
  productId: string;
  produced: number;
  bags: number;
  consumed: Record<string, number>;
  wastage: number;
  supervisor: string;
  date: string;
  status: 'Draft' | 'In Inspection' | 'Approved' | 'Rejected' | 'On Hold';
}

export interface MaterialRequest {
  id: string;
  orderId: string;
  materialId: string;
  requested: number;
  approved: number;
  issued: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Issued' | 'Partial';
  requester: string;
  date: string;
}

export interface Movement {
  id: string;
  materialId?: string;
  productId?: string;
  type: 'Receipt' | 'Issue' | 'Adjustment' | 'Finished Goods';
  qty: number;
  ref: string;
  date: string;
  by: string;
}

export interface Inspection {
  id: string;
  batchId: string;
  productId: string;
  inspector: string;
  date: string;
  results: Record<string, string>;
  decision: 'Pass' | 'Fail' | 'Hold' | 'Pending';
  comments: string;
}

export interface Decision {
  id: string;
  batchId: string;
  decision: 'Approved' | 'Rejected' | 'On Hold';
  reason: string;
  by: string;
  date: string;
}

export interface NCR {
  id: string;
  batchId: string;
  description: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Closed';
  owner: string;
  date: string;
  due: string;
}

export interface FinishedGood {
  id: string;
  productId: string;
  batchId: string;
  qty: number;
  date: string;
  location: string;
}

export interface AppNotification {
  id: string;
  dept: Dept;
  title: string;
  body: string;
  time: string;
  read: boolean;
  tone: 'info' | 'success' | 'warning' | 'danger';
}

export interface Activity {
  id: string;
  dept: Dept;
  text: string;
  detail: string;
  time: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
}

export interface QualitySpec {
  id: string;
  test: string;
  product: Flavor | 'All';
  min: string;
  max: string;
  unit: string;
  method: string;
}
