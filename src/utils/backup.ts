import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SQLiteDatabase } from 'expo-sqlite';
import type { Box, Category, Item } from '../types';

const BACKUP_VERSION = 1;

interface BoxRecord extends Box { photoData: string | null }
interface ItemRecord extends Item { photoData: string | null }

interface BackupFile {
  version: number;
  exportedAt: string;
  categories: Category[];
  boxes: BoxRecord[];
  items: ItemRecord[];
}

async function readBase64(uri: string | null): Promise<string | null> {
  if (!uri) return null;
  try {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  } catch {
    return null;
  }
}

async function writeBase64(base64: string, filename: string): Promise<string> {
  const dest = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(dest, base64, { encoding: FileSystem.EncodingType.Base64 });
  return dest;
}

export async function exportBackup(db: SQLiteDatabase): Promise<void> {
  const categories = await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY id ASC');
  const boxes = await db.getAllAsync<Box>('SELECT * FROM boxes ORDER BY id ASC');
  const items = await db.getAllAsync<Item>('SELECT * FROM items ORDER BY id ASC');

  const boxesWithPhotos: BoxRecord[] = await Promise.all(
    boxes.map(async b => ({ ...b, photoData: await readBase64(b.photoUri) }))
  );
  const itemsWithPhotos: ItemRecord[] = await Promise.all(
    items.map(async i => ({ ...i, photoData: await readBase64(i.photoUri) }))
  );

  const backup: BackupFile = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    categories,
    boxes: boxesWithPhotos,
    items: itemsWithPhotos,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `shelfmate-backup-${timestamp}.wsinv`;
  const fileUri = (FileSystem.cacheDirectory ?? '') + filename;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Save Workshop Backup',
  });
}

export async function importBackup(db: SQLiteDatabase): Promise<void> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return;

  const json = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const backup: BackupFile = JSON.parse(json);

  if (
    typeof backup.version !== 'number' ||
    !Array.isArray(backup.categories) ||
    !Array.isArray(backup.boxes) ||
    !Array.isArray(backup.items)
  ) {
    throw new Error('Invalid backup file.');
  }

  await db.execAsync('DELETE FROM items; DELETE FROM boxes; DELETE FROM categories;');

  for (const cat of backup.categories) {
    await db.runAsync(
      'INSERT INTO categories (id, name, color, createdAt) VALUES (?, ?, ?, ?)',
      cat.id, cat.name, cat.color, cat.createdAt,
    );
  }

  for (const box of backup.boxes) {
    let photoUri: string | null = null;
    if (box.photoData) {
      const filename = box.photoUri?.split('/').pop() ?? `photo_box_${box.id}.jpg`;
      photoUri = await writeBase64(box.photoData, filename);
    }
    await db.runAsync(
      'INSERT INTO boxes (id, name, description, photoUri, categoryId, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      box.id, box.name, box.description, photoUri, box.categoryId ?? null, box.createdAt,
    );
  }

  for (const item of backup.items) {
    let photoUri: string | null = null;
    if (item.photoData) {
      const filename = item.photoUri?.split('/').pop() ?? `photo_item_${item.id}.jpg`;
      photoUri = await writeBase64(item.photoData, filename);
    }
    await db.runAsync(
      'INSERT INTO items (id, boxId, name, description, photoUri, amount, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      item.id, item.boxId, item.name, item.description, photoUri, item.amount, item.createdAt,
    );
  }
}
