import { User } from '../general/user.model';
import { Contact } from './contact.model';
import { BankAccount } from './bankAccount.model';

export interface Provider {
    id: string;
    ruc: number;
    name: string;
    address: string;
    phone?: string;
    detractionAccount?: string;
    bankAccounts?: Array<BankAccount>;
    contacts?: Array<Contact>;
    createdBy: User;
    createdAt: Date;
    editedBy?: User;
    editedAt?: Date;
}