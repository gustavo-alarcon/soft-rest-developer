import { User } from '../../general/user.model';

export interface Transaction {
  id: string;
  type: string;
  description?: string;
  amount: number;
  status: string;
  ticketType: string;
  paymentType: string;
  expenseType?: string;
  incomeType?: string;
  // departureType?: string;
  originAccount?: string;
  destinationAccount?: string;
  debt?: number;
  editedBy: User;
  editedAt: Date;
  createdAt: Date;
  createdBy: User;
}