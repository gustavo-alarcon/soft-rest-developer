import { User } from '../../general/user.model';
import { Meal } from './meal.model';
import { Grocery } from '../../warehouse/grocery.model';
import { Dessert } from '../../warehouse/desserts.model';
import { Recipe } from '../../kitchen/recipe.model';

export interface Combo {
  id?: string;
  name: string;
  soldUnits: number;
  price: number;
  realPrice: number;
  validityPeriod: string; //Indefinido, Definido
  dateRange?: {
    begin: Date,
    end: Date
  }
  products: elementCombo[];
  createdAt?: Date;
  createdBy?: User;
  editedAt?: Date;
  editedBy?: User;
  state: string;
}

export interface productCombo{
  name: string;
  sku: string;
  quantity: number;
  id: string;
  unit: string;
  type?: string; //OTROS POSTRES
}

export interface recipeCombo extends Recipe{
  quantity: number;
  unit: string;
}

export interface productComboTable extends productCombo{
  index: number;
  averageCost: number;
}


export interface recipeComboTable extends recipeCombo{
  index: number;
  averageCost: number;
}

export type elementCombo = productCombo|recipeCombo;

export type elementComboTable = productComboTable|recipeComboTable;

// export interface Recipe {
//   id: string;
//   name: string;
//   sku: string;
//   description: string | null;
//   picture?: string | null;
//   category: string; //Platos, Piqueo, Extras Bebidas
//   inputs: Array<InputRecipe>;
//   createdAt: Date;
//   createdBy: User | null;
//   editedAt: Date;
//   editedBy: User | null;
//   price: number;
// }
