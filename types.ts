
export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  category: string;
  isCustom?: boolean;
}

export enum AppMode {
  RANDOM = 'RANDOM',
  FILTER = 'FILTER',
  EXPLORE = 'EXPLORE'
}
