import { useCallback, useEffect, useMemo, useState } from 'react';
import { API } from '../../helpers/api';
import { fetchTokenKey } from '../../helpers/token';

export default function useInspirationTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTokens = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/token/?p=1&size=100');
      const { success, data } = response.data || {};
      if (!success) {
        setTokens([]);
        return;
      }

      const items = Array.isArray(data) ? data : data?.items || [];
      setTokens(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const tokenOptions = useMemo(
    () =>
      tokens.map((token) => ({
        value: token.id,
        label: token.name || token.key || `#${token.id}`,
        disabled: token.status !== 1,
        token,
      })),
    [tokens],
  );

  const getToken = useCallback(
    (tokenId) => tokens.find((token) => token.id === tokenId),
    [tokens],
  );

  const resolveTokenKey = useCallback((tokenId) => fetchTokenKey(tokenId), []);

  return {
    tokens,
    tokenOptions,
    loading,
    reload: loadTokens,
    getToken,
    resolveTokenKey,
  };
}
