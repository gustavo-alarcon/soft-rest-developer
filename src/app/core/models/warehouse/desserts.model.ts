import { User } from '../general/user.model';

export interface Dessert {
  id: string;
  name: string; // Chocman Doble
  sku: string; //AP909001
  description: string;
  picture: string;
  unit: string; // UND., KG., GR., L., M., PULG. ...
  stock: number;
  averageCost: number;
  emergencyStock: number;
  status: string; // DISPONIBLE, INACTIVO
  price: number;
  createdAt: Date;
  createdBy: User;
  editedAt: Date;
  editedBy: User;
}