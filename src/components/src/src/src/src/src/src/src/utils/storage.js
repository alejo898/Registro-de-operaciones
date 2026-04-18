const OPERATIONS_KEY = 'trading_operations';
const PRICES_KEY = 'trading_current_prices';

export function loadOperations() {
  try { return JSON.parse(localStorage.getItem(OPERATIONS_KEY)) ?? []; } catch { return []; }
}
export function saveOperations(operations) {
  localStorage.setItem(OPERATIONS_KEY, JSON.stringify(operations));
}
export function loadCurrentPrices() {
  try { return JSON.parse(localStorage.getItem(PRICES_KEY)) ?? {}; } catch { return {}; }
}
export function saveCurrentPrices(prices) {
  localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
}
