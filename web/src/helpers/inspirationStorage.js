import { createStore, get, set, del, clear, keys } from 'idb-keyval';

const META_STORE = createStore('inspiration-workshop', 'meta');
const BLOB_STORE = createStore('inspiration-workshop-blobs', 'blobs');

const META_KEY = 'history-v1';
const MAX_HISTORY_ITEMS = 20;

const blobKey = (itemId, index) => `${itemId}::${index}`;

const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const persistOutputBlobs = async (itemId, outputs) => {
  const blobKeys = [];
  for (let i = 0; i < outputs.length; i += 1) {
    const src = outputs[i];
    if (typeof src !== 'string') continue;
    if (src.startsWith('data:')) {
      const blob = await dataUrlToBlob(src);
      const key = blobKey(itemId, i);
      await set(key, blob, BLOB_STORE);
      blobKeys.push({ key, type: blob.type || 'image/png' });
    } else {
      blobKeys.push({ url: src });
    }
  }
  return blobKeys;
};

const removeBlobsForItem = async (item) => {
  if (!item?.outputRefs) return;
  await Promise.all(
    item.outputRefs
      .filter((ref) => ref?.key)
      .map((ref) => del(ref.key, BLOB_STORE).catch(() => {})),
  );
};

export const loadHistoryMeta = async () => {
  const raw = (await get(META_KEY, META_STORE)) || [];
  return Array.isArray(raw) ? raw : [];
};

export const resolveOutputUrls = async (item) => {
  if (!item?.outputRefs) return [];
  const urls = await Promise.all(
    item.outputRefs.map(async (ref) => {
      if (ref?.url) return ref.url;
      if (!ref?.key) return null;
      try {
        const blob = await get(ref.key, BLOB_STORE);
        if (!blob) return null;
        return URL.createObjectURL(blob);
      } catch {
        return null;
      }
    }),
  );
  return urls.filter(Boolean);
};

export const releaseObjectUrls = (urls) => {
  if (!urls) return;
  urls.forEach((url) => {
    if (typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
};

export const saveHistoryItem = async (item, currentList) => {
  const outputRefs = await persistOutputBlobs(item.id, item.outputs || []);

  const stored = {
    id: item.id,
    type: item.type,
    createdAt: item.createdAt,
    prompt: item.prompt,
    tokenId: item.tokenId,
    tokenName: item.tokenName,
    request: item.request,
    outputRefs,
  };

  let next = [stored, ...currentList];
  if (next.length > MAX_HISTORY_ITEMS) {
    const overflow = next.slice(MAX_HISTORY_ITEMS);
    next = next.slice(0, MAX_HISTORY_ITEMS);
    await Promise.all(overflow.map(removeBlobsForItem));
  }

  await set(META_KEY, next, META_STORE);
  return next;
};

export const removeHistoryItem = async (id, currentList) => {
  const target = currentList.find((item) => item.id === id);
  if (target) await removeBlobsForItem(target);
  const next = currentList.filter((item) => item.id !== id);
  await set(META_KEY, next, META_STORE);
  return next;
};

export const clearAllHistory = async () => {
  await Promise.all([
    set(META_KEY, [], META_STORE),
    clear(BLOB_STORE).catch(() => {}),
  ]);
};

export const getBlobStoreKeyCount = async () => {
  try {
    return (await keys(BLOB_STORE)).length;
  } catch {
    return 0;
  }
};
