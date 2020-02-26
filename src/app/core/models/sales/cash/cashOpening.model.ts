import { User } from '../../general/user.model';

export interface CashOpening {
  id: string;
  openedBy: User;
  openedAt: Date;
  closedBy: User;
  closedAt: Date;
  openingBalance: number;
  closureBalance: number;
  amountAdded: number;
  amountWithdrawn: number;
  cashCount: number;
  totalAmount: number;
  totalTickets: number;
  totalDepartures: number;
  totalTicketsByPaymentType: {
    VISA: number;
    MASTERCARD: number;
    EFECTIVO: number;
  };
  totalDeparturesByPaymentType: {
    TRANSFERENCIA: number;
    EFECTIVO: number;
  }
}