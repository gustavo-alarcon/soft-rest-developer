import { User } from '../general/user.model';

export interface Customer {
  id: string;
  type: string;
  name?: string;
  dni?: number;
  phone?: string;
  mail?: string;
  // creditNote?: CreditNote;
  businessName?: string;
  businessAddress?: string;
  ruc?: number;
  businessPhone?: string;
  contacts?: Array<{
    contanctName?: string;
    contactPhone?: string;
    contactMail?: string;
  }>;
  createdBy: User;
  createdAt: Date;
  editedBy?: User;
  editedAt?: Date;
  receivableAccount ?: boolean;
}