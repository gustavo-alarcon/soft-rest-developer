import { User } from '../../general/user.model';

export interface Meal {
  id: string;
  name: string; // Lomo Saltado
  sku: string; //AP102001
  description: string;
  picture: string;
  unit: string; // UND., KG., GR., L., M., PULG. ...
  stock: number;
  initialStock: number;
  emergencyStock: number;
  menuType: string;
  type: string; // ENTRADA, FONDO, POSTRE, PIQUEO, BEBIDA
  recipeId: string;
  status: string; // DISPONIBLE, COCINANDO, INACTIVO
  price: number;
  cost:number;
  createdAt: Date;
  createdBy: User;
  editedAt: Date;
  editedBy: User;
}