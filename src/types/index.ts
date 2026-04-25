export interface Category {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Box {
  id: number;
  name: string;
  description: string;
  photoUri: string | null;
  categoryId: number | null;
  createdAt: string;
}

export interface Item {
  id: number;
  boxId: number;
  name: string;
  description: string;
  photoUri: string | null;
  amount: number;
  createdAt: string;
}

export interface SearchResult {
  type: 'box' | 'item';
  id: number;
  name: string;
  description: string;
}
