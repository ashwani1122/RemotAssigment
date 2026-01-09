import Dexie, { Table } from 'dexie';

export interface VideoRecord {
  id?: number;
  blob: Blob;
  previewUrl: string;
  timestamp: number;
  status: 'pending' | 'uploading' | 'synced' | 'failed';
}

export class MyDatabase extends Dexie {
  videos!: Table<VideoRecord>;

  constructor() {
    super('VideoVault');
    this.version(1).stores({
      videos: '++id, timestamp, status'
    });
  }
}

export const db = new MyDatabase();