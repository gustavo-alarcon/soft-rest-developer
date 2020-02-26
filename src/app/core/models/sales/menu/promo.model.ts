import { User } from '../../general/user.model';
import { Recipe } from '../../kitchen/recipe.model';

export interface Promo {
  id?: string;
  name: string;
  quantity: string; //Indefinido, Definido
  units?: number;
  soldUnits: number;
  price: number;
  realPrice: number;
  validityPeriod: string; //Indefinido, Definido
  dateRange?: {
    begin: Date,
    end: Date
  }
  products: elementPromo[];
  createdAt?: Date;
  createdBy?: User;
  editedAt?: Date;
  editedBy?: User;
  state: string;
}

export interface productPromo{
  name: string;
  sku: string;
  quantity: number;
  id: string;
  unit: string;
  type?: string; //OTROS POSTRES
}

export interface recipePromo extends Recipe{
  quantity: number;
  unit: string;
}

export interface productPromoTable extends productPromo{
  index: number;
  averageCost: number;
}


export interface recipePromoTable extends recipePromo{
  index: number;
  averageCost: number;
}

export type elementPromo = productPromo|recipePromo;

export type elementPromoTable = productPromoTable|recipePromoTable;