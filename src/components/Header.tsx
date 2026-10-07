import React from 'react';
import { Package, Settings } from 'lucide-react';
import { ConnectionStatus } from '../types/inventory';

interface HeaderProps {
  status: ConnectionStatus;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({ status, onOpenConfig }) => {
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Verificando...';
      case 'disconnected':
        return 'Sin Conexión';
      case 'unconfigured':
        return 'Configurar Hoja';
    }
  };

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon-wrapper">
          <Package size={22} strokeWidth={2.2} />
        </div>
        <h1 className="brand-title">Easy Inventory</h1>
      </div>

      <div className="header-actions">
        <button
          type="button"
          onClick={onOpenConfig}
          className={`status-badge ${status}`}
          title="Estado de conexión con Google Sheets"
        >
          <span className="status-dot" />
          <span>{getStatusText()}</span>
        </button>

        <button
          type="button"
          onClick={onOpenConfig}
          className="btn-icon"
          aria-label="Abrir Ajustes"
          title="Ajustes de Configuración"
        >
          <Settings size={19} />
        </button>
      </div>
    </header>
  );
};
