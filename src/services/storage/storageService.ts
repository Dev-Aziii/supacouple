import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';

export interface StorageUploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export class StorageService {
  /**
   * Upload image file to specified bucket path.
   */
  async uploadImage(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: StorageUploadOptions
  ): Promise<{ path: string | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: options?.cacheControl ?? '3600',
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      });

      if (error) throw normalizeError(error);
      return { path: data.path, error: null };
    } catch (err) {
      return { path: null, error: normalizeError(err) };
    }
  }

  /**
   * Delete one or multiple images from specified bucket.
   */
  async deleteImage(
    bucket: string,
    paths: string[]
  ): Promise<{ data: string[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage.from(bucket).remove(paths);
      if (error) throw normalizeError(error);
      return { data: data.map((item) => item.name), error: null };
    } catch (err) {
      return { data: null, error: normalizeError(err) };
    }
  }

  /**
   * Obtain public URL for file located in specified bucket and path.
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

export const storageService = new StorageService();
