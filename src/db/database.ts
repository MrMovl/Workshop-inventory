import { SQLiteDatabase } from 'expo-sqlite';
import { Box, Category, Item } from '../types';
import { CREATE_BOXES_TABLE, CREATE_CATEGORIES_TABLE, CREATE_ITEMS_TABLE } from './schema';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_CATEGORIES_TABLE + CREATE_BOXES_TABLE + CREATE_ITEMS_TABLE);
  // Migrate existing boxes table — ignore errors if columns already exist
  for (const sql of [
    "ALTER TABLE boxes ADD COLUMN description TEXT NOT NULL DEFAULT ''",
    'ALTER TABLE boxes ADD COLUMN photoUri TEXT',
    'ALTER TABLE boxes ADD COLUMN categoryId INTEGER REFERENCES categories(id) ON DELETE SET NULL',
  ]) {
    try { await db.execAsync(sql); } catch (_e) { /* column already exists */ }
  }
  // Migrate existing items table
  try {
    await db.execAsync('ALTER TABLE items ADD COLUMN amount INTEGER NOT NULL DEFAULT 1');
  } catch (_e) { /* column already exists */ }
}

export async function getBoxes(db: SQLiteDatabase): Promise<Box[]> {
  return db.getAllAsync<Box>('SELECT * FROM boxes ORDER BY createdAt DESC');
}

export async function createBox(
  db: SQLiteDatabase,
  name: string,
  description: string,
  photoUri: string | null,
  categoryId: number | null,
): Promise<void> {
  await db.runAsync(
    'INSERT INTO boxes (name, description, photoUri, categoryId) VALUES (?, ?, ?, ?)',
    name, description, photoUri, categoryId,
  );
}

export async function updateBox(
  db: SQLiteDatabase,
  id: number,
  name: string,
  description: string,
  photoUri: string | null,
  categoryId: number | null,
): Promise<void> {
  await db.runAsync(
    'UPDATE boxes SET name = ?, description = ?, photoUri = ?, categoryId = ? WHERE id = ?',
    name, description, photoUri, categoryId, id,
  );
}

export async function deleteBox(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM boxes WHERE id = ?', id);
}

export async function getCategories(db: SQLiteDatabase): Promise<Category[]> {
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC');
}

export async function createCategory(
  db: SQLiteDatabase,
  name: string,
  color: string,
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO categories (name, color) VALUES (?, ?)',
    name, color,
  );
  return result.lastInsertRowId;
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
  amount: number,
): Promise<void> {
  await db.runAsync(
    'INSERT INTO items (boxId, name, description, photoUri, amount) VALUES (?, ?, ?, ?, ?)',
    boxId,
    name,
    description,
    photoUri,
    amount,
  );
}

export async function updateItem(
  db: SQLiteDatabase,
  id: number,
  name: string,
  description: string,
  photoUri: string | null,
  amount: number,
): Promise<void> {
  await db.runAsync(
    'UPDATE items SET name = ?, description = ?, photoUri = ?, amount = ? WHERE id = ?',
    name,
    description,
    photoUri,
    amount,
    id,
  );
}

export async function getRecentBoxes(db: SQLiteDatabase): Promise<Box[]> {
  return db.getAllAsync<Box>(
    `SELECT * FROM boxes
     ORDER BY COALESCE(
       (SELECT MAX(createdAt) FROM items WHERE boxId = boxes.id), ''
     ) DESC, createdAt DESC
     LIMIT 10`,
  );
}

export async function searchBoxes(db: SQLiteDatabase, query: string): Promise<Box[]> {
  return db.getAllAsync<Box>(
    `SELECT * FROM boxes
     WHERE name LIKE ?
     ORDER BY COALESCE(
       (SELECT MAX(createdAt) FROM items WHERE boxId = boxes.id), ''
     ) DESC, createdAt DESC
     LIMIT 10`,
    `%${query}%`,
  );
}

export async function deleteItem(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}

export async function getRecentAll(
  db: SQLiteDatabase,
  includeBoxes: boolean,
  limit: number,
): Promise<{ type: 'box' | 'item'; id: number; name: string; description: string }[]> {
  if (includeBoxes) {
    return db.getAllAsync(
      `SELECT type, id, name, description FROM (
         SELECT 'item' AS type, id, name, COALESCE(description, '') AS description, createdAt FROM items
         UNION ALL
         SELECT 'box' AS type, id, name, COALESCE(description, '') AS description, createdAt FROM boxes
       ) ORDER BY createdAt DESC LIMIT ?`,
      limit,
    );
  }
  return db.getAllAsync(
    `SELECT 'item' AS type, id, name, COALESCE(description, '') AS description FROM items ORDER BY createdAt DESC LIMIT ?`,
    limit,
  );
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
       SELECT 'box' AS type, id, name, description FROM boxes WHERE name LIKE ?
       LIMIT ? OFFSET ?`,
      like, like, like, limit, offset,
    );
  }
  return db.getAllAsync(
    `SELECT 'item' AS type, id, name, description FROM items WHERE name LIKE ? OR description LIKE ? LIMIT ? OFFSET ?`,
    like, like, limit, offset,
  );
}
