export interface Box {
  id: number;
  name: string;
  createdAt: string;
}

export interface Item {
  id: number;
  boxId: number;
  name: string;
  description: string;
  photoUri: string | null;
  createdAt: string;
}

export interface SearchResult {
  type: 'box' | 'item';
  id: number;
  name: string;
  description: string;
}
