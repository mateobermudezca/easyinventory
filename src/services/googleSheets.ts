import { ApiResponse, InventoryItem } from '../types/inventory';

const STORAGE_KEYS = {
  API_URL: 'easy_inventory_api_url',
  MEMBERS: 'easy_inventory_members',
  COLUMNS: 'easy_inventory_columns',
  KEEP_PERSON: 'easy_inventory_keep_person'
};

export const getApiUrl = (): string => {
  const stored = localStorage.getItem(STORAGE_KEYS.API_URL);
  if (stored && stored.trim()) return stored.trim();
  const envUrl = (import.meta as unknown as { env?: { VITE_GOOGLE_SCRIPT_URL?: string } }).env?.VITE_GOOGLE_SCRIPT_URL;
  return envUrl ? envUrl.trim() : '';
};

export const saveApiUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEYS.API_URL, url.trim());
};

export const getStoredMembers = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) return ['Juan Pérez', 'María Gómez', 'Carlos Rodríguez', 'Sin Asignar'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['Sin Asignar'];
  } catch {
    return ['Sin Asignar'];
  }
};

export const saveStoredMembers = (members: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
};

export const getStoredColumns = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLUMNS);
    if (!raw) return ['Ubicación', 'Estado'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredColumns = (columns: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(columns));
};

export const getKeepPersonSetting = (): boolean => {
  const val = localStorage.getItem(STORAGE_KEYS.KEEP_PERSON);
  return val === null ? true : val === 'true';
};

export const saveKeepPersonSetting = (keep: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.KEEP_PERSON, String(keep));
};

/**
 * Realiza una petición POST a la Web App de Google Apps Script.
 * Usa text/plain para evitar bloqueos por Preflight CORS en el navegador.
 */
async function postToGoogleScript<T>(payload: Record<string, unknown>): Promise<ApiResponse<T>> {
  const url = getApiUrl();
  if (!url) {
    throw new Error('No se ha configurado la URL de Google Apps Script. Configúrala en el panel de Ajustes.');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok && response.status !== 0) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const jsonText = await response.text();
    let data: ApiResponse<T>;
    try {
      data = JSON.parse(jsonText);
    } catch {
      // Si la respuesta fue procesada pero Google Apps Script retornó texto plano
      return {
        success: true,
        message: 'Registro recibido y procesado por Google Sheets.'
      } as ApiResponse<T>;
    }

    return data;
  } catch (error) {
    console.error('Error enviando a Google Sheets:', error);
    throw error;
  }
}

/**
 * Prueba de conectividad con la hoja de Google Sheets.
 */
export async function pingGoogleSheets(): Promise<ApiResponse> {
  return postToGoogleScript({ action: 'ping' });
}

/**
 * Envía un nuevo registro de artículo a la hoja de Google Sheets.
 */
export async function submitInventoryItem(item: InventoryItem): Promise<ApiResponse> {
  return postToGoogleScript({
    action: 'addRow',
    data: {
      articulo: item.articulo.trim(),
      numeroSerie: item.numeroSerie.trim(),
      referencia: item.referencia.trim(),
      personaAsignada: item.personaAsignada.trim(),
      dynamicFields: item.dynamicFields || {}
    }
  });
}

/**
 * Elimina la última fila registrada en Google Sheets (función Deshacer).
 */
export async function undoLastInventoryItem(): Promise<ApiResponse> {
  return postToGoogleScript({ action: 'deleteLastRow' });
}

/**
 * Agrega un nuevo encabezado dinámico a Google Sheets.
 */
export async function addDynamicColumnToSheets(columnName: string): Promise<ApiResponse> {
  return postToGoogleScript({
    action: 'addColumn',
    columnName: columnName.trim()
  });
}
