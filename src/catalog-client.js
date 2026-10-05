// Public read-only catalogue. Admin and write operations keep Firebase's SDK.
export const localCatalog = fetch('/products.json').then(response => {
  if (!response.ok) throw new Error('Catalogue indisponible');
  return response.json();
});
export const imageUrl = p => /^(data:image\/|https:\/\/)/.test(p?.image || '') ? p.image : '/assets/' + (p?.image || 'logo.webp');
export function decodeValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, decodeValue(item)]));
  return value.timestampValue ?? value.referenceValue;
}
let request;
export function loadProducts(fallback) {
  return request ||= readProducts(fallback);
}
async function readProducts(fallback) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const documents = [];
    let token = '';
    do {
      const query = new URLSearchParams({pageSize: '100', key: 'AIzaSyDo-JGqAlPGpRU9fQ6iRZD0esHHvBjdJwE'});
      if (token) query.set('pageToken', token);
      const response = await fetch('https://firestore.googleapis.com/v1/projects/bluedelta-eae0a/databases/(default)/documents/products?' + query, {signal: controller.signal});
      if (!response.ok) throw new Error('Catalogue HTTP ' + response.status);
      const page = await response.json();
      documents.push(...(page.documents || []));
      token = page.nextPageToken || '';
    } while (token);
    const products = documents.map(document => ({id: document.name.split('/').pop(), ...Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key, decodeValue(value)]))})).filter(p => p.id !== '_catalog' && p.active !== false);
    await Promise.all(products.map(async p => {
      const saved = fallback.find(item => item.id === p.id);
      if (!saved?.imageHash || !p.image || !crypto.subtle) return;
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p.image));
      const hash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
      if (hash === saved.imageHash) { p.image = saved.image; p.imageHash = hash; for(const key of ['thumbnail','thumbnailWidth','thumbnailHash','imageWidth','imageHeight'])if(saved[key]!==undefined)p[key]=saved[key]; }
    }));
    return products.sort((a,b) => (a.position ?? 999) - (b.position ?? 999) || String(a.name).localeCompare(String(b.name), 'fr'));
  } catch {
    return fallback;
  } finally { clearTimeout(timeout); }
}
