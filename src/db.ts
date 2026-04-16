import Dexie, { Table } from 'dexie';

export interface Project {
  id?: number;
  projectId: string;
  projectName: string;
  campaignType: string;
  goal: string;
  createdAt: Date;
  lastModified: Date;
}

export interface ProjectFile {
  id?: number;
  projectId: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
}

export interface Variant {
  id?: number;
  projectId: string;
  variantId: string;
  name: string;
  type: string;
  typeColor: string;
  bgType: string;
  timeAgo: string;
  timestamp: number;
  quality: string;
  sampleRate: string;
  duration: string;
  score: number;
  memoryRetention: string;
  brandAffinity: string;
  audioUrl: string;
  script: string;
}

export class OumiDatabase extends Dexie {
  projects!: Table<Project, number>;
  files!: Table<ProjectFile, number>;
  variants!: Table<Variant, number>;

  constructor() {
    super('OumiDatabase');
    this.version(2).stores({
      projects: '++id, projectId, projectName, lastModified',
      files: '++id, projectId, name',
      variants: '++id, projectId, variantId'
    });
  }
}

export const db = new OumiDatabase();
