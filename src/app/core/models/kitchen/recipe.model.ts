import { User } from '../general/user.model';

export interface Recipe {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  picture?: string | null;
  category: string; //Platos, Piqueo, Extras Bebidas
  inputs: Array<InputRecipe>;
  createdAt: Date;
  createdBy: User | null;
  editedAt: Date;
  editedBy: User | null;
  price: number;
}

export interface InputRecipe{
  name: string;
  sku: string;
  quantity: number;
  id: string;
  unit: string;
  type: string; //INSUMOS INVENTARIO OTROS POSTRES
}

export interface InputRecipeTable{
  index: number;
  averageCost: number;
  name: string;
  sku: string;
  quantity: number;
  id: string;
  unit: string;
  type: string; //INSUMOS INVENTARIO OTROS POSTRES
}