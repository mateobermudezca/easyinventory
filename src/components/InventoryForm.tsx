import React, { useState, useEffect } from 'react';
import { Camera, Send, RotateCcw, User, Tag, Hash, Box, Sparkles } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { getKeepPersonSetting, saveKeepPersonSetting } from '../services/googleSheets';

interface InventoryFormProps {
  members: string[];
  dynamicFields?: string[];
  isSubmitting: boolean;
  onSubmit: (item: InventoryItem) => Promise<boolean>;
  onOpenScanner: () => void;
  externalSerial?: string;
  externalRef?: string;
}

const COMMON_ARTICLES = [
  'Silla Ergonómica',
  'Escritorio en L',
  'Archivador Metálico',
  'Mesa de Juntas',
  'Cajonera Móvil',
  'Monitor Stand'
];

export const InventoryForm: React.FC<InventoryFormProps> = ({
  members,
  dynamicFields = [],
  isSubmitting,
  onSubmit,
  onOpenScanner,
  externalSerial,
  externalRef
}) => {
  const [articulo, setArticulo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [referencia, setReferencia] = useState('');
  const [personaAsignada, setPersonaAsignada] = useState(members[0] || 'Sin Asignar');
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [keepPerson, setKeepPerson] = useState(getKeepPersonSetting());
  const [wasScanned, setWasScanned] = useState(false);

  // Reaccionar a datos provenientes del escáner
  useEffect(() => {
    if (externalSerial) {
      setNumeroSerie(externalSerial);
      setWasScanned(true);
    }
  }, [externalSerial]);

  useEffect(() => {
    if (externalRef) {
      setReferencia(externalRef);
      setWasScanned(true);
    }
  }, [externalRef]);

  // Actualizar persona asignada por defecto si la lista de miembros cambia y el valor actual no existe
  useEffect(() => {
    if (members.length > 0 && !members.includes(personaAsignada)) {
      setPersonaAsignada(members[0]);
    }
  }, [members, personaAsignada]);

  // Manejo de cambio en checkbox de conservar persona
  const handleKeepPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setKeepPerson(val);
    saveKeepPersonSetting(val);
  };

  const handleDynamicChange = (field: string, val: string) => {
    setDynamicValues(prev => ({ ...prev, [field]: val }));
  };

  const handleResetForm = () => {
    setArticulo('');
    setNumeroSerie('');
    setReferencia('');
    setDynamicValues({});
    setWasScanned(false);
    if (!keepPerson) {
      setPersonaAsignada(members[0] || 'Sin Asignar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!articulo.trim()) {
      alert('Por favor ingresa el nombre o tipo de artículo.');
      return;
    }

    const item: InventoryItem = {
      articulo,
      numeroSerie,
      referencia,
      personaAsignada,
      dynamicFields: dynamicValues,
      scannedViaCamera: wasScanned
    };

    const success = await onSubmit(item);
    if (success) {
      handleResetForm();
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-header-intro">
        <h2>Registro de Mobiliario</h2>
        <p>Captura rápida y sincronización directa con Google Sheets.</p>
      </div>

      {/* Zona Hero de Escaneo con Cámara */}
      <div
        className="scanner-banner"
        onClick={onOpenScanner}
        role="button"
        tabIndex={0}
      >
        <div className="scanner-banner-left">
          <div className="scanner-icon-bubble">
            <Camera size={22} />
          </div>
          <div className="scanner-banner-text">
            <h3>Escanear Etiqueta con Cámara</h3>
            <p>Detección de códigos de barras, QR y texto OCR</p>
          </div>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            background: 'rgba(59, 130, 246, 0.25)',
            color: '#60a5fa',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700
          }}
        >
          Escanear
        </span>
      </div>

      {/* Campo Artículo */}
      <div className="form-group">
        <label className="form-label" htmlFor="articuloInput">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box size={14} color="#60a5fa" />
            Artículo / Mueble
          </span>
          <span className="req">Obligatorio</span>
        </label>
        <div className="input-container">
          <input
            id="articuloInput"
            type="text"
            className="input-field"
            placeholder="Ej. Silla ergonómica, Escritorio..."
            value={articulo}
            onChange={(e) => setArticulo(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        {/* Sugerencias Rápidas */}
        <div className="quick-pills">
          {COMMON_ARTICLES.map((item) => (
            <button
              type="button"
              key={item}
              className="pill-btn"
              onClick={() => setArticulo(item)}
            >
              + {item}
            </button>
          ))}
        </div>
      </div>

      {/* Campo Número de Serie */}
      <div className="form-group">
        <label className="form-label" htmlFor="serialInput">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Hash size={14} color="#60a5fa" />
            Número de Serie
          </span>
          {wasScanned && numeroSerie && (
            <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Sparkles size={11} /> Escaneado
            </span>
          )}
        </label>
        <div className="input-container">
          <input
            id="serialInput"
            type="text"
            className="input-field"
            placeholder="Ej. SN-84920412"
            value={numeroSerie}
            onChange={(e) => {
              setNumeroSerie(e.target.value);
              setWasScanned(false);
            }}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Campo Referencia / Modelo */}
      <div className="form-group">
        <label className="form-label" htmlFor="refInput">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag size={14} color="#60a5fa" />
            Referencia / Modelo
          </span>
        </label>
        <div className="input-container">
          <input
            id="refInput"
            type="text"
            className="input-field"
            placeholder="Ej. REF-MOD-2024"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Campo Persona Asignada */}
      <div className="form-group">
        <label className="form-label" htmlFor="personaSelect">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} color="#60a5fa" />
            Persona Asignada
          </span>
        </label>
        <div className="input-container">
          <select
            id="personaSelect"
            className="select-field"
            value={personaAsignada}
            onChange={(e) => setPersonaAsignada(e.target.value)}
          >
            {members.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campos Dinámicos */}
      {dynamicFields.map((field) => (
        <div className="form-group" key={field}>
          <label className="form-label" htmlFor={`dynamic-${field}`}>
            {field}
          </label>
          <div className="input-container">
            <input
              id={`dynamic-${field}`}
              type="text"
              className="input-field"
              placeholder={`Ingresa ${field.toLowerCase()}...`}
              value={dynamicValues[field] || ''}
              onChange={(e) => handleDynamicChange(field, e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      ))}

      {/* Opción de UX ergonómica: Mantener persona asignada */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 2px',
          cursor: 'pointer'
        }}
      >
        <input
          id="keepPersonCheck"
          type="checkbox"
          checked={keepPerson}
          onChange={handleKeepPersonChange}
          style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
        />
        <label
          htmlFor="keepPersonCheck"
          style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          Mantener la misma persona asignada tras enviar
        </label>
      </div>

      {/* Botón Principal de Envío */}
      <button
        type="submit"
        className="btn-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="spinner" />
            <span>Guardando en Google Sheets...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Guardar y Enviar Registro</span>
          </>
        )}
      </button>

      {/* Botón secundario para limpiar formulario */}
      <button
        type="button"
        onClick={handleResetForm}
        disabled={isSubmitting}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
          padding: '4px 0'
        }}
      >
        <RotateCcw size={14} />
        <span>Limpiar campos manualmente</span>
      </button>
    </form>
  );
};
