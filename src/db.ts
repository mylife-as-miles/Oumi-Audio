import Dexie, { Table } from 'dexie';

export interface Project {
  id?: number;
  projectId: string;
  projectName: string;
  campaignType: string;
  goal: string;
  createdAt: Date;
}

export interface ProjectFile {
  id?: number;
  projectId: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
}

export class OumiDatabase extends Dexie {
  projects!: Table<Project, number>;
  files!: Table<ProjectFile, number>;

  constructor() {
    super('OumiDatabase');
    this.version(1).stores({
      projects: '++id, projectId, projectName',
      files: '++id, projectId, name'
    });
  }
}

export const db = new OumiDatabase();
