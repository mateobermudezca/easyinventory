import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InventoryForm } from './components/InventoryForm';
import { ConfigModal } from './components/ConfigModal';
import { ScannerModal } from './components/ScannerModal';
import { Toast, ToastData } from './components/Toast';
import {
  ConnectionStatus,
  InventoryItem
} from './types/inventory';
import {
  getApiUrl,
  pingGoogleSheets,
  submitInventoryItem,
  getStoredMembers,
  getStoredColumns,
  undoLastInventoryItem
} from './services/googleSheets';

export const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [dynamicFields, setDynamicFields] = useState<string[]>([]);

  // Datos escaneados para el formulario
  const [scannedSerial, setScannedSerial] = useState<string>('');
  const [scannedRef, setScannedRef] = useState<string>('');

  // Cargar configuración guardada
  const refreshConfig = useCallback(() => {
    setMembers(getStoredMembers());
    setDynamicFields(getStoredColumns());
  }, []);

  // Verificar conectividad inicial
  const checkConnection = useCallback(async () => {
    const url = getApiUrl();
    if (!url) {
      setStatus('unconfigured');
      return;
    }

    setStatus('connecting');
    try {
      const res = await pingGoogleSheets();
      if (res.success) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch {
      setStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    refreshConfig();
    checkConnection();
  }, [refreshConfig, checkConnection]);

  // Manejar función Deshacer (Undo) - Fase 4
  const handleUndo = async () => {
    try {
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Eliminando último registro de Google Sheets...',
        duration: 3000
      });
      const res = await undoLastInventoryItem();
      if (res.success) {
        setStatus('connected');
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: '¡Registro deshecho correctamente!',
          duration: 3500
        });
      } else {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          message: res.message || 'No se pudo deshacer el registro.',
          duration: 4000
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al deshacer';
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: `Error al deshacer: ${msg}`,
        duration: 4000
      });
    }
  };

  // Manejar el envío del formulario a Google Sheets
  const handleFormSubmit = async (item: InventoryItem): Promise<boolean> => {
    const url = getApiUrl();
    if (!url) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'Configura la URL de Google Sheets antes de enviar.',
        actionText: 'Configurar',
        onAction: () => setIsConfigOpen(true)
      });
      setIsConfigOpen(true);
      return false;
    }

    setIsSubmitting(true);
    try {
      const response = await submitInventoryItem(item);
      if (response.success) {
        setStatus('connected');
        // Limpiar los valores de escáner tras envío
        setScannedSerial('');
        setScannedRef('');

        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: '¡Artículo registrado con éxito en Google Sheets!',
          actionText: 'Deshacer',
          onAction: handleUndo,
          duration: 5000 // 5 segundos para deshacer (Fase 4)
        });
        return true;
      } else {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error de comunicación';
      setStatus('disconnected');
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: `Fallo al sincronizar: ${errorMsg}. Los datos permanecen en pantalla.`,
        duration: 5000
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar datos aplicados desde el escáner
  const handleApplyScannedData = (field: 'serial' | 'ref', value: string) => {
    if (field === 'serial') {
      setScannedSerial(value);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: `Número de Serie "${value}" asignado desde la cámara.`,
        duration: 3000
      });
    } else {
      setScannedRef(value);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: `Referencia "${value}" asignada desde la cámara.`,
        duration: 3000
      });
    }
  };

  return (
    <div className="app-layout">
      <Header
        status={status}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      <main className="app-main">
        <InventoryForm
          members={members}
          dynamicFields={dynamicFields}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onOpenScanner={() => setIsScannerOpen(true)}
          externalSerial={scannedSerial}
          externalRef={scannedRef}
        />
      </main>

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onApplyData={handleApplyScannedData}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => {
          setIsConfigOpen(false);
          refreshConfig();
        }}
        onStatusChange={(newStatus) => setStatus(newStatus)}
        onConfigUpdated={refreshConfig}
      />

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
};

export default App;
