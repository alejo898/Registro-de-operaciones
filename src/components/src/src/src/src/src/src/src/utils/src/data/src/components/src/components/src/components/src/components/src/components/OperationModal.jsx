import { useState } from 'react';
import { X } from 'lucide-react';

const TICKERS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'OTRO'];
const today = () => new Date().toISOString().slice(0, 10);
const empty = { date: today(), ticker: '', type: 'BUY', quantity: '', price: '', commission: '', notes: '' };

export default function OperationModal({ initialData, onSave, onClose }) {
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState({ ...empty, ...initialData });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.date) errs.date = 'Requerido';
    if (!form.ticker.trim()) errs.ticker = 'Requerido';
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'La cantidad debe ser mayor a 0';
    if (!form.price    || Number(form.price)    <= 0) errs.price    = 'El precio debe ser mayor a 0';
    if (form.commission !== '' && Number(form.commission) < 0) errs.commission = 'No puede ser negativa';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      ticker: form.ticker.trim().toUpperCase(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      commission: form.commission !== '' ? Number(form.commission) : 0,
    });
  }

  const estimatedTotal = form.quantity && form.price
    ? (Number(form.quantity) * Number(form.price) + Number(form.commission || 0)).toFixed(2) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Editar Operación' : 'Nueva Operación'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><X size={20} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Tipo</label>
            <div className="flex gap-2">
              {['BUY', 'SELL'].map((t) => (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === t ? (t === 'BUY' ? 'bg-blue-600 text-white border-blue-600' : 'bg-orange-500 text-white border-orange-500')
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {t === 'BUY' ? '📈 Compra' : '📉 Venta'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha *</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                className={`input ${errors.date ? 'border-red-400' : ''}`} />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="label">Ticker *</label>
              <select value={form.ticker} onChange={(e) => set('ticker', e.target.value)}
                className={`input ${errors.ticker ? 'border-red-400' : ''}`}>
                <option value="">Seleccioná...</option>
                {TICKERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.ticker && <p className="text-xs text-red-500 mt-1">{errors.ticker}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Cantidad *</label>
              <input type="number" step="any" min="0" placeholder="100" value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                className={`input ${errors.quantity ? 'border-red-400' : ''}`} />
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="label">Precio por acción *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" step="any" min="0" placeholder="150.00" value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  className={`input pl-7 ${errors.price ? 'border-red-400' : ''}`} />
              </div>
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
          </div>
          <div>
            <label className="label">Comisión (opcional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input type="number" step="any" min="0" placeholder="0.00" value={form.commission}
                onChange={(e) => set('commission', e.target.value)}
                className={`input pl-7 ${errors.commission ? 'border-red-400' : ''}`} />
            </div>
            {errors.commission && <p className="text-xs text-red-500 mt-1">{errors.commission}</p>}
          </div>
          <div>
            <label className="label">Notas (opcional)</label>
            <input type="text" placeholder="Observaciones..." value={form.notes}
              onChange={(e) => set('notes', e.target.value)} className="input" />
          </div>
          {estimatedTotal && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Total {form.type === 'BUY' ? 'invertido' : 'recibido'} estimado</span>
              <span className="font-bold text-gray-900">${estimatedTotal}</span>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{isEdit ? 'Guardar cambios' : 'Registrar operación'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
