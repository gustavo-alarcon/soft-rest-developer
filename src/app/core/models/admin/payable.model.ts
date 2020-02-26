import { Provider } from '../third-parties/provider.model';
import { Household } from '../warehouse/household.model';
import { Grocery } from '../warehouse/grocery.model';
import { Dessert } from '../warehouse/desserts.model';
import { User } from '../general/user.model';
import { Cash } from '../sales/cash/cash.model';
import { KitchenInput } from '../warehouse/kitchenInput.model';
import { Input } from '../warehouse/input.model';

export interface Payable {
  id: string;
  documentDate: Date;
  documentType: string; // FACTURA, BOLETA, TICKET
  documentSerial: string;
  documentCorrelative: number;
  provider: {
    id: string;
    name: string;
    ruc: number;
  };
  itemsList: Array<ItemModel>;
  payments: Array<{
    type: string;
    paymentType: string;
    amount: number;
    cashReference: Cash;
    paidAt: Date;
    paidBy: User;
  }>;
  creditDate: Date;
  paymentDate: Date;
  totalAmount: number;
  subtotalAmount: number;
  igvAmount: number;
  paymentType: string; // CREDITO, EFECTIVO, TARJETA
  paidAmount: number;
  indebtAmount: number;
  status: string; // PENDIENTE, PAGADO, ANULADO
  createdAt: Date;
  createdBy: User;
  editedAt: Date;
  editedBy: User;
  approvedAt: Date;
  approvedBy: User;
}

export interface PayableLimited {
  documentDate: Date;
  documentType: string; // FACTURA, BOLETA, TICKET
  documentSerial: string;
  documentCorrelative: number;
  provider: {
    id: string;
    name: string;
    ruc: number;
  };
  itemsList: Array<ItemModel>;
  payments: Array<{
    type: string;
    paymentType: string;
    amount: number;
    cashReference: Cash;
    paidAt: Date;
    paidBy: User;
  }>;
  creditDate: Date;
  paymentDate: Date;
  totalAmount: number;
  subtotalAmount: number;
  igvAmount: number;
  paymentType: string; // CREDITO, EFECTIVO, TARJETA
  paidAmount: number;
  indebtAmount: number;
  status: string; // PENDIENTE, PAGADO, ANULADO
}

export interface ItemModel {
  //They could be household, grocery, desserts, input
  type: string;           //Insumos, Otros, Postres, Menajes
  id: string;
  sku: string;
  item: string | Household | Grocery | Dessert | Input;
  quantity: number;
  averageCost: number;
  unit: string;
  kardexId?: string;
  costTrendId?: string

}

