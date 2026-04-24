import { SQLiteDatabase } from 'expo-sqlite';
import { Box, Item } from '../types';
import { CREATE_BOXES_TABLE, CREATE_ITEMS_TABLE } from './schema';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_BOXES_TABLE + CREATE_ITEMS_TABLE);
}

export async function getBoxes(db: SQLiteDatabase): Promise<Box[]> {
  return db.getAllAsync<Box>('SELECT * FROM boxes ORDER BY createdAt DESC');
}

export async function createBox(db: SQLiteDatabase, name: string): Promise<void> {
  await db.runAsync('INSERT INTO boxes (name) VALUES (?)', name);
}

export async function updateBox(db: SQLiteDatabase, id: number, name: string): Promise<void> {
  await db.runAsync('UPDATE boxes SET name = ? WHERE id = ?', name, id);
}

export async function deleteBox(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM boxes WHERE id = ?', id);
}

export async function getItemsByBox(db: SQLiteDatabase, boxId: number): Promise<Item[]> {
  return db.getAllAsync<Item>('SELECT * FROM items WHERE boxId = ? ORDER BY createdAt DESC', boxId);
}

export async function createItem(
  db: SQLiteDatabase,
  boxId: number,
  name: string,
  description: string,
  photoUri: string | null,
): Promise<void> {
  await db.runAsync(
    'INSERT INTO items (boxId, name, description, photoUri) VALUES (?, ?, ?, ?)',
    boxId,
    name,
    description,
    photoUri,
  );
}

export async function updateItem(
  db: SQLiteDatabase,
  id: number,
  name: string,
  description: string,
  photoUri: string | null,
): Promise<void> {
  await db.runAsync(
    'UPDATE items SET name = ?, description = ?, photoUri = ? WHERE id = ?',
    name,
    description,
    photoUri,
    id,
  );
}

export async function deleteItem(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}

export async function searchAll(
  db: SQLiteDatabase,
  query: string,
  includeBoxes: boolean,
  limit: number,
  offset: number,
): Promise<{ type: 'box' | 'item'; id: number; name: string; description: string }[]> {
  const like = `%${query}%`;
  if (includeBoxes) {
    return db.getAllAsync(
      `SELECT 'item' AS type, id, name, description FROM items WHERE name LIKE ? OR description LIKE ?
       UNION ALL
       SELECT 'box' AS type, id, name, '' AS description FROM boxes WHERE name LIKE ?
       LIMIT ? OFFSET ?`,
      like, like, like, limit, offset,
    );
  }
  return db.getAllAsync(
    `SELECT 'item' AS type, id, name, description FROM items WHERE name LIKE ? OR description LIKE ? LIMIT ? OFFSET ?`,
    like, like, limit, offset,
  );
}
