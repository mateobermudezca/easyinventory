export interface InventoryItem {
  id?: string;
  articulo: string;
  numeroSerie: string;
  referencia: string;
  personaAsignada: string;
  dynamicFields?: Record<string, string>;
  scannedViaCamera?: boolean;
  timestamp?: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'unconfigured';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  insertedRow?: number;
  deletedRow?: number;
  headers?: string[];
  data?: T;
}

export interface AppConfig {
  apiUrl: string;
  members: string[];
  dynamicColumns: string[];
  keepPersonOnSubmit: boolean;
}
