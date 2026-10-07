import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Tesseract from 'tesseract.js';
import {
  X,
  Camera,
  Barcode,
  Type,
  Upload,
  CheckCircle,
  AlertTriangle,
  RotateCw
} from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (field: 'serial' | 'ref', value: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyData
}) => {
  const [mode, setMode] = useState<'barcode' | 'ocr'>('barcode');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [detectedValue, setDetectedValue] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrCandidates, setOcrCandidates] = useState<string[]>([]);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Detener el escáner de cámara
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error deteniendo escáner:', err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
  }, []);

  // Iniciar escáner de código de barras / QR
  const startBarcodeScanner = useCallback(async () => {
    await stopScanner();
    setScannerError(null);

    try {
      const qrCode = new Html5Qrcode('camera-reader');
      html5QrCodeRef.current = qrCode;

      await qrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 260, height: 180 },
          aspectRatio: 1.333333
        },
        (decodedText) => {
          // Vibración táctil si el dispositivo lo soporta
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          setDetectedValue(decodedText.trim());
          stopScanner();
        },
        () => {
          // Fallo por frame vacío, no hacer nada
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('No se pudo acceder a la cámara:', msg);
      setScannerError('Cámara no accesible o permiso denegado. Puedes usar la opción de foto o ingreso manual.');
    }
  }, [stopScanner]);

  // Manejar cambio de modo y montaje
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setDetectedValue(null);
      setOcrCandidates([]);
      setScannerError(null);
      return;
    }

    if (mode === 'barcode' && !detectedValue) {
      // Breve timeout para permitir que el elemento DOM #camera-reader esté montado
      const timer = setTimeout(() => {
        startBarcodeScanner();
      }, 250);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, mode, detectedValue, startBarcodeScanner, stopScanner]);

  if (!isOpen) return null;

  // Procesar imagen mediante OCR (Tesseract.js)
  const processImageFileWithOCR = async (file: File) => {
    setOcrLoading(true);
    setOcrCandidates([]);
    setScannerError(null);

    try {
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: () => {}
      });

      const rawText = data.text;
      // Extraer líneas y tokens alfanuméricos relevantes (mínimo 3 caracteres)
      const lines = rawText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length >= 3);

      const tokens = Array.from(
        new Set(
          rawText
            .split(/[\s,;|:]+/)
            .map((t) => t.trim())
            .filter((t) => t.length >= 4 && /[A-Za-z0-9]/.test(t))
        )
      );

      const candidates = Array.from(new Set([...lines, ...tokens])).slice(0, 8);

      if (candidates.length === 0) {
        setScannerError('No se reconoció texto claro en la foto. Intenta con más iluminación.');
      } else {
        setOcrCandidates(candidates);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error en OCR';
      setScannerError(`Error al procesar la imagen: ${msg}`);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mode === 'barcode') {
      // Procesar archivo con lector de código
      const qrCode = new Html5Qrcode('camera-reader');
      qrCode
        .scanFile(file, true)
        .then((decodedText) => {
          setDetectedValue(decodedText.trim());
        })
        .catch(() => {
          setScannerError('No se encontró código de barras o QR en la imagen.');
        });
    } else {
      processImageFileWithOCR(file);
    }
  };

  const handleApply = (field: 'serial' | 'ref', value: string) => {
    onApplyData(field, value);
    stopScanner();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Escáner */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="#3b82f6" />
            <h2 className="modal-title">Escáner de Etiquetas</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="btn-icon"
            aria-label="Cerrar escáner"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selector de Modo: Códigos vs OCR */}
        <div className="scanner-tab-bar">
          <button
            type="button"
            className={`scanner-tab-btn ${mode === 'barcode' ? 'active' : ''}`}
            onClick={() => {
              setDetectedValue(null);
              setMode('barcode');
            }}
          >
            <Barcode size={16} />
            <span>Código de Barras / QR</span>
          </button>
          <button
            type="button"
            className={`scanner-tab-btn ${mode === 'ocr' ? 'active' : ''}`}
            onClick={() => {
              stopScanner();
              setDetectedValue(null);
              setMode('ocr');
            }}
          >
            <Type size={16} />
            <span>Texto Impreso (OCR)</span>
          </button>
        </div>

        {/* Vista Modo 1: Código de Barras / QR en Vivo */}
        {mode === 'barcode' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!detectedValue ? (
              <>
                <div className="scanner-viewport-wrapper">
                  <div id="camera-reader" />
                  <div className="viewfinder-overlay">
                    <div className="viewfinder-frame">
                      <div className="viewfinder-laser" />
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Apunta la cámara al código de barras o QR de la etiqueta.
                </p>
              </>
            ) : (
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid #3b82f6',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <CheckCircle size={20} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>¡Código Detectado!</span>
                </div>
                <div
                  style={{
                    background: '#0b0f19',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'monospace',
                    fontSize: '1.05rem',
                    color: '#60a5fa',
                    wordBreak: 'break-all'
                  }}
                >
                  {detectedValue}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ flex: 1, height: '46px', fontSize: '0.85rem' }}
                    onClick={() => handleApply('serial', detectedValue)}
                  >
                    Usar como Serie
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      flex: 1,
                      height: '46px',
                      fontSize: '0.85rem',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-medium)',
                      boxShadow: 'none'
                    }}
                    onClick={() => handleApply('ref', detectedValue)}
                  >
                    Usar como Referencia
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDetectedValue(null);
                    startBarcodeScanner();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCw size={14} />
                  <span>Volver a escanear</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vista Modo 2: OCR de Texto Impreso */}
        {mode === 'ocr' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="info-box">
              <strong>Lectura de Texto en Etiquetas:</strong> Toma una foto o sube una imagen de la placa del mueble para extraer números de serie y referencias impresas.
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
            >
              {ocrLoading ? (
                <>
                  <div className="spinner" />
                  <span>Analizando texto con OCR...</span>
                </>
              ) : (
                <>
                  <Camera size={18} />
                  <span>Tomar Foto / Subir Etiqueta</span>
                </>
              )}
            </button>

            {ocrCandidates.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Valores detectados (toca para asignar):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {ocrCandidates.map((cad, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.88rem',
                          color: '#f8fafc',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {cad}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="pill-btn"
                          style={{ padding: '3px 8px', fontSize: '0.72rem', background: '#2563eb', color: '#fff' }}
                          onClick={() => handleApply('serial', cad)}
                        >
                          + Serie
                        </button>
                        <button
                          type="button"
                          className="pill-btn"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          onClick={() => handleApply('ref', cad)}
                        >
                          + Ref
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Oculto de Foto */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* Alerta de Error o Fallback */}
        {scannerError && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--warning-bg)',
              color: '#fbbf24',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{scannerError}</div>
          </div>
        )}

        {/* Acciones Secundarias: Cargar archivo y Cerrar */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            className="btn-icon"
            style={{ width: 'auto', flex: 1, padding: '0 14px', fontSize: '0.82rem', gap: '6px' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            <span>Subir imagen</span>
          </button>

          <button
            type="button"
            className="btn-icon"
            style={{ width: 'auto', flex: 1, padding: '0 14px', fontSize: '0.82rem' }}
            onClick={() => {
              stopScanner();
              onClose();
            }}
          >
            <span>Ingresar Manual</span>
          </button>
        </div>
      </div>
    </div>
  );
};
