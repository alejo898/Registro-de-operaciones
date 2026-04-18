import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadOperations, saveOperations, loadCurrentPrices, saveCurrentPrices } from './utils/storage';
import { crearOperacion } from './data/Operacion.js';
import { procesarOperacionesFIFO as processOperations, enrichWithCurrentPrices } from './calculos';
import { exportarCSV } from './ui';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import PortfolioTable from './components/PortfolioTable';
import OperationsTable from './components/OperationsTable';
import OperationModal from './components/OperationModal';
import Charts from './components/Charts';
import CurrentPrices from './components/CurrentPrices';
import Filters from './components/Filters';
import ResumenTable from './components/ResumenTable';

export default function App() {
  const [operations, setOperations] = useState(() => loadOperations());
  const [currentPrices, setCurrentPrices] = useState(() => loadCurrentPrices());
  const [modalData, setModalData] = useState(null);
  const [filters, setFilters] = useState({ ticker: '', type: '', dateFrom: '', dateTo: '' });
  const [activeTab, setActiveTab] = useState('portfolio');

  useEffect(() => { saveOperations(operations); }, [operations]);
  useEffect(() => { saveCurrentPrices(currentPrices); }, [currentPrices]);

  const { positions: rawPositions, tradeResults } = useMemo(
    () => processOperations(operations),
    [operations]
  );

  const positions = useMemo(
    () => enrichWithCurrentPrices(rawPositions, currentPrices),
    [rawPositions, currentPrices]
  );

  function handleSave(formData) {
    if (formData.id) {
      setOperations((prev) =>
        prev.map((op) => (op.id === formData.id ? { ...op, ...formData } : op))
      );
    } else {
      try {
        crearOperacion({
          fecha: formData.date,
          ticker: formData.ticker,
          tipo: formData.type === 'BUY' ? 'COMPRA' : 'VENTA',
          cantidad: formData.quantity,
          precio: formData.price,
          comision: formData.commission,
        });
      } catch (e) {
        console.error('Datos inválidos:', e.message);
        return;
      }
      setOperations((prev) => [
        ...prev,
        { ...formData, id: uuidv4(), createdAt: new Date().toISOString() },
      ]);
    }
    setModalData(null);
  }

  function handleDelete(id) {
    if (window.confirm('¿Eliminar esta operación?')) {
      setOperations((prev) => prev.filter((op) => op.id !== id));
    }
  }

  function handleEdit(op) { setModalData(op); }

  function handleUpdatePrice(ticker, price) {
    setCurrentPrices((prev) => ({ ...prev, [ticker]: price }));
  }

  const filteredOperations = useMemo(() => {
    return tradeResults.filter((op) => {
      if (filters.ticker && op.ticker !== filters.ticker.toUpperCase()) return false;
      if (filters.type && op.type !== filters.type) return false;
      if (filters.dateFrom && op.date < filters.dateFrom) return false;
      if (filters.dateTo && op.date > filters.dateTo) return false;
      return true;
    });
  }, [tradeResults, filters]);

  const tickers = [...new Set(operations.map((op) => op.ticker.toUpperCase()))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNewOperation={() => setModalData({})} operations={operations} tradeResults={tradeResults} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <SummaryCards positions={positions} tradeResults={tradeResults} />

        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {[
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'operations', label: 'Operaciones' },
            { id: 'charts', label: 'Gráficos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'portfolio' && (
          <>
            <ResumenTable operations={operations} preciosActuales={currentPrices} />
            <CurrentPrices tickers={tickers} currentPrices={currentPrices} onUpdatePrice={handleUpdatePrice} />
            <PortfolioTable positions={positions} />
          </>
        )}

        {activeTab === 'operations' && (
          <>
            <Filters filters={filters} onFiltersChange={setFilters} tickers={tickers} />
            <OperationsTable operations={filteredOperations} onEdit={handleEdit} onDelete={handleDelete} />
          </>
        )}

        {activeTab === 'charts' && (
          <Charts positions={positions} tradeResults={tradeResults} />
        )}
      </main>

      {modalData !== null && (
        <OperationModal initialData={modalData} onSave={handleSave} onClose={() => setModalData(null)} />
      )}
    </div>
  );
}
