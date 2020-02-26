
import { User } from '../../general/user.model';
import { Meal } from './meal.model';

export interface Menu {
  id: string;
  name: string;
  appetizer: Meal;
  mainDish: Meal;
  dessert: Meal;
  createdAt: Date;
  createdBy: User;
  editedAt: Date;
  editedBy: User;
  type: string;
}