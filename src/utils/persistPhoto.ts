import * as FileSystem from 'expo-file-system';

/**
 * Copies a temporary image URI (cache/picker) to the app's document directory
 * so it survives OS cache clears. Returns the new persistent URI.
 */
export async function persistPhoto(tempUri: string): Promise<string> {
  const filename = `photo_${Date.now()}.jpg`;
  const dest = FileSystem.documentDirectory + filename;
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return dest;
}

/**
 * Deletes a previously persisted photo. Safe to call with null/undefined or
 * non-document URIs (cache URIs from older versions are silently skipped).
 */
export async function deletePersistedPhoto(uri: string | null | undefined): Promise<void> {
  if (!uri || !uri.startsWith(FileSystem.documentDirectory ?? '')) return;
  await FileSystem.deleteAsync(uri, { idempotent: true });
}
