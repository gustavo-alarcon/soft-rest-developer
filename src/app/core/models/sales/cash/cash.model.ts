import { User } from '../../general/user.model';

export interface Cash {
  id: string;
  currentOwnerName: string;
  currentOwnerId: string;
  currentOpeningId: string;
  name: string;
  open: boolean;
  password: string;
  supervisor: User;
  lastOpening: Date;
  lastClosure: Date;
  createdAt: Date;
  createdBy: User;
  editedAt: Date;
  editedBy: User;
}

