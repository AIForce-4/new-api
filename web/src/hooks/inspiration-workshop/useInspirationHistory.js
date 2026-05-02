import { useCallback, useEffect, useRef, useState } from 'react';
import { Toast } from '@douyinfe/semi-ui';
import {
  clearAllHistory,
  loadHistoryMeta,
  releaseObjectUrls,
  removeHistoryItem as removeStoredItem,
  resolveOutputUrls,
  saveHistoryItem,
} from '../../helpers/inspirationStorage';

const isQuotaError = (error) =>
  !!error &&
  (error.name === 'QuotaExceededError' ||
    error.code === 22 ||
    error.code === 1014);

export default function useInspirationHistory() {
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const urlCacheRef = useRef(new Map());

  const releaseAll = useCallback(() => {
    urlCacheRef.current.forEach((urls) => releaseObjectUrls(urls));
    urlCacheRef.current.clear();
  }, []);

  const hydrateOutputs = useCallback(async (items) => {
    const cache = urlCacheRef.current;
    const aliveIds = new Set(items.map((item) => item.id));

    cache.forEach((urls, id) => {
      if (!aliveIds.has(id)) {
        releaseObjectUrls(urls);
        cache.delete(id);
      }
    });

    return Promise.all(
      items.map(async (item) => {
        let urls = cache.get(item.id);
        if (!urls) {
          urls = await resolveOutputUrls(item);
          cache.set(item.id, urls);
        }
        return { ...item, outputs: urls };
      }),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await loadHistoryMeta();
        const hydrated = await hydrateOutputs(stored);
        if (!cancelled) setHistory(hydrated);
      } catch (error) {
        console.error('Failed to load inspiration history:', error);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
      releaseAll();
    };
  }, [hydrateOutputs, releaseAll]);

  const addHistoryItem = useCallback(
    async (item) => {
      try {
        const currentMeta = history.map(({ outputs, ...rest }) => rest);
        const nextMeta = await saveHistoryItem(item, currentMeta);
        const hydrated = await hydrateOutputs(nextMeta);
        setHistory(hydrated);
      } catch (error) {
        if (isQuotaError(error)) {
          Toast.warning('存储空间不足，无法保存到历史');
        } else {
          console.error('Failed to save inspiration history item:', error);
          Toast.error('历史保存失败');
        }
      }
    },
    [history, hydrateOutputs],
  );

  const removeHistoryItem = useCallback(
    async (id) => {
      try {
        const currentMeta = history.map(({ outputs, ...rest }) => rest);
        const nextMeta = await removeStoredItem(id, currentMeta);
        const cache = urlCacheRef.current;
        const cached = cache.get(id);
        if (cached) {
          releaseObjectUrls(cached);
          cache.delete(id);
        }
        const hydrated = await hydrateOutputs(nextMeta);
        setHistory(hydrated);
      } catch (error) {
        console.error('Failed to remove inspiration history item:', error);
      }
    },
    [history, hydrateOutputs],
  );

  const clearHistory = useCallback(async () => {
    try {
      await clearAllHistory();
      releaseAll();
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear inspiration history:', error);
    }
  }, [releaseAll]);

  return {
    history,
    loaded,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
  };
}
