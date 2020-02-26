import { User } from '../../general/user.model';
import { Menu } from './menu.model';
import { Meal } from './meal.model';
import { Combo } from './combo.model';
import { Promo } from './promo.model';
import { Grocery } from '../../warehouse/grocery.model';
import { Customer } from '../../third-parties/customer.model';

export interface Order {
  id: string;
  orderCorrelative: string;
  orderList: Array<Menu | Meal | Combo | Promo | Grocery>;
  orderStatus: string // SELECCIONANDO, PAGADO, ANULADO
  price: number;
  discount?: number;
  igv?: number;
  total: number;
  paymentType: string; // EFECTIVO, VISA, MASTERCARD
  amountReceived: number;
  amountChange: number;
  documentType: string; // FACTURA, BOLETA, TICKET
  documentSerial?: string; // FE001 ...
  documentCorrelative?: string; // 0000124 ...
  customerId: string;
  customerName? : string;
  cashId: string;
  openingId: string;
  canceledAt: Date;
  canceledBy: User;
  createdAt: Date;
  createdBy: User;
  editedAt: Date;
  editedBy: User;
}