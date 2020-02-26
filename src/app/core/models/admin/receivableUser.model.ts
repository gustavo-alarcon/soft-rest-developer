import { User } from '../general/user.model';

export interface ReceivableUser {
    id: string;
    name?: string;
    customerId:string;
    balance: number;
    debt:number;
    paidAmount:number;
    indebtAmount:number;
    createdBy: User;
    createdAt: Date;
    editedBy?: User;
    editedAt?: Date;
}