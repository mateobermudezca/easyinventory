import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Link,
  RefreshCw,
  Users,
  Plus,
  Columns,
  ArrowRight,
  Trash2
} from 'lucide-react';
import {
  getApiUrl,
  saveApiUrl,
  pingGoogleSheets,
  getStoredMembers,
  saveStoredMembers,
  getStoredColumns,
  saveStoredColumns,
  addDynamicColumnToSheets
} from '../services/googleSheets';
import { ConnectionStatus } from '../types/inventory';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onConfigUpdated: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  onStatusChange,
  onConfigUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'columns'>('general');
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Integrantes del equipo
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');

  // Columnas dinámicas
  const [columns, setColumns] = useState<string[]>([]);
  const [newColumn, setNewColumn] = useState('');
  const [addingCol, setAddingCol] = useState(false);
  const [colSyncMessage, setColSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getApiUrl());
      setMembers(getStoredMembers());
      setColumns(getStoredColumns());
      setTestResult(null);
      setColSyncMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Guardar y probar conexión
  const handleSaveAndTest = async () => {
    const cleanUrl = url.trim();
    saveApiUrl(cleanUrl);

    if (!cleanUrl) {
      setTestResult({
        success: false,
        message: 'Por favor ingresa la URL de tu Google Apps Script.'
      });
      onStatusChange('unconfigured');
      return;
    }

    setTesting(true);
    setTestResult(null);
    onStatusChange('connecting');

    try {
      const response = await pingGoogleSheets();
      if (response.success) {
        setTestResult({
          success: true,
          message: response.message || '¡Conexión verificada con Google Sheets!'
        });
        onStatusChange('connected');
      } else {
        setTestResult({
          success: false,
          message: response.message || 'La hoja respondió con un error.'
        });
        onStatusChange('disconnected');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error desconocido al conectar';
      setTestResult({
        success: false,
        message: `No se pudo conectar: ${errMsg}. Asegúrate de que la Web App esté desplegada con acceso a "Cualquier usuario" (Anyone).`
      });
      onStatusChange('disconnected');
    } finally {
      setTesting(false);
    }
  };

  // Agregar persona
  const handleAddMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newMember.trim();
    if (!clean) return;

    if (members.includes(clean)) {
      alert('Esta persona ya está en la lista.');
      return;
    }

    const updated = [...members, clean];
    setMembers(updated);
    saveStoredMembers(updated);
    setNewMember('');
    onConfigUpdated();
  };

  // Eliminar persona
  const handleRemoveMember = (name: string) => {
    if (members.length <= 1) {
      alert('Debes conservar al menos una opción de persona asignada.');
      return;
    }
    const updated = members.filter(m => m !== name);
    setMembers(updated);
    saveStoredMembers(updated);
    onConfigUpdated();
  };

  // Agregar campo / columna dinámica
  const handleAddColumn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newColumn.trim();
    if (!clean) return;

    if (columns.includes(clean)) {
      alert('Este campo ya existe.');
      return;
    }

    setAddingCol(true);
    setColSyncMessage(null);

    // Guardar localmente de inmediato
    const updated = [...columns, clean];
    setColumns(updated);
    saveStoredColumns(updated);
    setNewColumn('');
    onConfigUpdated();

    // Sincronizar con Google Sheets si hay conexión configurada
    if (getApiUrl()) {
      try {
        const res = await addDynamicColumnToSheets(clean);
        if (res.success) {
          setColSyncMessage(`Columna "${clean}" sincronizada con Google Sheets.`);
        }
      } catch {
        setColSyncMessage(`Columna "${clean}" guardada localmente (se sincronizará al conectar).`);
      }
    } else {
      setColSyncMessage(`Columna "${clean}" guardada en la app.`);
    }

    setAddingCol(false);
  };

  // Eliminar campo dinámico
  const handleRemoveColumn = (colName: string) => {
    const updated = columns.filter(c => c !== colName);
    setColumns(updated);
    saveStoredColumns(updated);
    onConfigUpdated();
  };

  const handleFinishAndClose = () => {
    onConfigUpdated();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del Modal */}
        <div className="modal-header">
          <h2 className="modal-title">Configuración de Inventario</h2>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <button
            type="button"
            className="pill-btn"
            style={{
              flex: 1,
              padding: '8px 4px',
              backgroundColor: activeTab === 'general' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'general' ? '#fff' : 'var(--text-muted)',
              borderColor: activeTab === 'general' ? 'var(--accent-primary)' : 'var(--border-subtle)'
            }}
            onClick={() => setActiveTab('general')}
          >
            Google Sheets
          </button>
          <button
            type="button"
            className="pill-btn"
            style={{
              flex: 1,
              padding: '8px 4px',
              backgroundColor: activeTab === 'members' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'members' ? '#fff' : 'var(--text-muted)',
              borderColor: activeTab === 'members' ? 'var(--accent-primary)' : 'var(--border-subtle)'
            }}
            onClick={() => setActiveTab('members')}
          >
            Integrantes ({members.length})
          </button>
          <button
            type="button"
            className="pill-btn"
            style={{
              flex: 1,
              padding: '8px 4px',
              backgroundColor: activeTab === 'columns' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'columns' ? '#fff' : 'var(--text-muted)',
              borderColor: activeTab === 'columns' ? 'var(--accent-primary)' : 'var(--border-subtle)'
            }}
            onClick={() => setActiveTab('columns')}
          >
            Campos ({columns.length})
          </button>
        </div>

        {/* Tab 1: Conexión Google Sheets */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="info-box">
              <strong>Guía de Despliegue ($0 Costo):</strong>
              <ol>
                <li>En tu hoja de cálculo: <em>Extensiones ➔ Apps Script</em>.</li>
                <li>Pega el contenido de <code>google-apps-script/Code.gs</code>.</li>
                <li>Implementar como <em>Aplicación Web</em> con acceso para <strong>Cualquier usuario (Anyone)</strong>.</li>
                <li>Pega la URL aquí para vincularla a tu app móvil.</li>
              </ol>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apiUrlInput">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Link size={14} color="#60a5fa" />
                  URL de Web App (Google Apps Script)
                </span>
                <span className="req">*</span>
              </label>
              <div className="input-container">
                <input
                  id="apiUrlInput"
                  type="url"
                  className="input-field"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            {testResult && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: testResult.success ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: testResult.success ? '#34d399' : '#f87171',
                  border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                {testResult.success ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div>{testResult.message}</div>
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveAndTest}
              disabled={testing}
            >
              {testing ? (
                <>
                  <div className="spinner" />
                  <span>Verificando conexión...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  <span>Guardar y Probar Conexión</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: Integrantes del Equipo */}
        {activeTab === 'members' && (
          <div className="config-section">
            <div className="config-section-title">
              <Users size={18} color="#60a5fa" />
              <span>Integrantes del Equipo</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Nombres de personas para seleccionar rápidamente en el menú desplegable del formulario.
            </p>

            <form className="inline-form" onSubmit={handleAddMember}>
              <input
                type="text"
                className="input-field"
                placeholder="Nombre de la persona..."
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
              />
              <button
                type="submit"
                className="btn-inline"
                disabled={!newMember.trim()}
              >
                <Plus size={16} />
                <span>Agregar</span>
              </button>
            </form>

            <div className="chip-container">
              {members.map((member) => (
                <div className="chip" key={member}>
                  <span>{member}</span>
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => handleRemoveMember(member)}
                    title={`Eliminar ${member}`}
                    aria-label={`Eliminar ${member}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Columnas Dinámicas */}
        {activeTab === 'columns' && (
          <div className="config-section">
            <div className="config-section-title">
              <Columns size={18} color="#60a5fa" />
              <span>Campos y Columnas Personalizadas</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Agrega características extra (ej: <em>Estado del Mueble</em>, <em>Ubicación</em>, <em>Color</em>). Se crearán como nuevas columnas en Google Sheets y en tu formulario móvil.
            </p>

            <form className="inline-form" onSubmit={handleAddColumn}>
              <input
                type="text"
                className="input-field"
                placeholder="Ej. Ubicación, Estado..."
                value={newColumn}
                onChange={(e) => setNewColumn(e.target.value)}
              />
              <button
                type="submit"
                className="btn-inline"
                disabled={!newColumn.trim() || addingCol}
              >
                {addingCol ? <div className="spinner" /> : <Plus size={16} />}
                <span>Crear Campo</span>
              </button>
            </form>

            {colSyncMessage && (
              <div style={{ fontSize: '0.78rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} />
                <span>{colSyncMessage}</span>
              </div>
            )}

            <div className="chip-container">
              {columns.map((col) => (
                <div className="chip" key={col}>
                  <span>{col}</span>
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => handleRemoveColumn(col)}
                    title={`Eliminar ${col}`}
                    aria-label={`Eliminar ${col}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de Acción Principal al pie del modal */}
        <button
          type="button"
          className="btn-primary"
          onClick={handleFinishAndClose}
          style={{ marginTop: '8px' }}
        >
          <span>Ir a Registrar Inventario</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
