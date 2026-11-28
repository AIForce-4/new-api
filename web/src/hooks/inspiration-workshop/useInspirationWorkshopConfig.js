/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useState } from 'react';
import { API } from '../../helpers/api';
import {
  FALLBACK_DEFAULT_MODEL,
  FALLBACK_MODEL_OPTIONS,
} from '../../helpers/inspirationWorkshop';
import { getWorkshopModelOptions } from './workshopModelOptions';

const fallbackConfig = {
  imageModels: FALLBACK_MODEL_OPTIONS.map((option) => option.value),
  defaultImageModel: FALLBACK_DEFAULT_MODEL,
};

export default function useInspirationWorkshopConfig() {
  const [config, setConfig] = useState(fallbackConfig);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadConfig = async () => {
      try {
        const [settings, pricing, account] = await Promise.all([
          API.get('/api/inspiration_workshop/config', {
            params: { _ts: Date.now() },
            skipErrorHandler: true,
          }).catch(() => null),
          API.get('/api/pricing', { skipErrorHandler: true }),
          API.get('/api/user/self', { skipErrorHandler: true }),
        ]);
        if (!active) return;
        const data = settings?.data?.data;
        const imageModels = Array.isArray(data?.image_models)
          ? data.image_models.filter((model) => typeof model === 'string' && model.trim())
          : [];
        if (imageModels.length > 0) {
          setConfig({
            imageModels,
            defaultImageModel: imageModels.includes(data.default_image_model)
              ? data.default_image_model : imageModels[0],
          });
        }
        const prices = pricing.data;
        const userGroup = account.data?.data?.group;
        if (prices?.success && account.data?.success && Array.isArray(prices.data) && userGroup) {
          setCatalog({
            models: prices.data,
            usableGroups: prices.usable_group || {},
            groupRatios: prices.group_ratio || {},
            autoGroups: prices.auto_groups || [],
            userGroup,
          });
        }
      } catch (error) {
        console.error('Failed to load inspiration workshop config:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadConfig();
    return () => {
      active = false;
    };
  }, []);

  return {
    loading,
    modelsError: !loading && !catalog,
    modelsForToken: (token, mode) => getWorkshopModelOptions(config.imageModels, catalog, token, mode),
    defaultImageModel: config.defaultImageModel,
  };
}
