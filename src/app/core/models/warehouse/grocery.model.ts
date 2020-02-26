import { User } from '../general/user.model';

export interface Grocery {
  id: string;
  name: string; // Chocman Doble
  description: string;
  sku: string; //AP909001
  unit: string; // UND., KG., GR., L., M., PULG. ...
  stock: number;
  emergencyStock: number;
  averageCost: number;
  price: number;
  picture: string;
  status: string; // DISPONIBLE, INACTIVO
  createdAt: Date;
  createdBy: User;
  editedAt: Date;
  editedBy: User;
}