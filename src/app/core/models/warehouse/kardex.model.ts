import { User } from '../general/user.model';

export interface Kardex {
  id: string;
  details: string;
  insQuantity: number;
  insPrice: number;
  insTotal: number;
  outsQuantity: number;
  outsPrice: number;
  outsTotal: number;
  balanceQuantity: number;
  balancePrice: number;
  balanceTotal: number;
  type: string; /**@ ENTRADA, SALIDA, INICIAL, REINICIO, ANULADO */
  createdAt: Date;
  createdBy: User;
}