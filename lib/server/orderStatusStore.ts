import fs from 'fs';
import path from 'path';

const SYNC_FILE_PATH = path.join(process.cwd(), 'data', 'order_status_sync.json');

// In-memory cache for ultra-fast server responses
let statusCache: Record<string, { status: string; updated_at: string }> = {};

function initCache() {
  try {
    if (fs.existsSync(SYNC_FILE_PATH)) {
      const content = fs.readFileSync(SYNC_FILE_PATH, 'utf-8');
      if (content.trim()) {
        statusCache = JSON.parse(content);
      }
    }
  } catch (err) {
    console.error('[OrderStatusStore] Init read error:', err);
  }
}

// Initialize on module load
initCache();

export function setOrderStatusOverride(orderIdOrCode: string, status: string): void {
  if (!orderIdOrCode) return;
  const key = orderIdOrCode.toUpperCase().replace('#', '').trim();
  const now = new Date().toISOString();

  statusCache[orderIdOrCode] = { status, updated_at: now };
  statusCache[key] = { status, updated_at: now };

  try {
    const dir = path.dirname(SYNC_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SYNC_FILE_PATH, JSON.stringify(statusCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[OrderStatusStore] Write error:', err);
  }
}

export function getOrderStatusOverride(orderIdOrCode: string): string | null {
  if (!orderIdOrCode) return null;
  const key = orderIdOrCode.toUpperCase().replace('#', '').trim();
  if (statusCache[orderIdOrCode]) return statusCache[orderIdOrCode].status;
  if (statusCache[key]) return statusCache[key].status;
  return null;
}

export function getAllOrderStatusOverrides(): Record<string, { status: string; updated_at: string }> {
  try {
    if (fs.existsSync(SYNC_FILE_PATH)) {
      const content = fs.readFileSync(SYNC_FILE_PATH, 'utf-8');
      if (content.trim()) {
        statusCache = JSON.parse(content);
      }
    }
  } catch (e) {}
  return statusCache;
}
