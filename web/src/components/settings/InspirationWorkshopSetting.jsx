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
import React, { useEffect, useMemo, useState } from 'react';
import {
  Banner,
  Button,
  Card,
  Form,
  Select,
  Spin,
  TextArea,
  Typography,
} from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../helpers';

const { Text } = Typography;

const FALLBACK_SETTINGS = {
  image_models: ['gpt-image-2', 'gpt-image-1'],
  default_image_model: 'gpt-image-2',
};

const parseModels = (value) => {
  const seen = new Set();
  return value
    .split('\n')
    .map((model) => model.trim())
    .filter((model) => {
      if (!model || seen.has(model)) {
        return false;
      }
      seen.add(model);
      return true;
    });
};

const InspirationWorkshopSetting = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [modelsText, setModelsText] = useState(
    FALLBACK_SETTINGS.image_models.join('\n'),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const modelOptions = useMemo(
    () =>
      settings.image_models.map((model) => ({
        label: model,
        value: model,
      })),
    [settings.image_models],
  );

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/option/inspiration_workshop');
      const { success, message, data } = response.data;
      if (!success) {
        showError(message || t('加载灵感画坊设置失败'));
        return;
      }
      const nextSettings = {
        image_models:
          data?.image_models?.length > 0
            ? data.image_models
            : FALLBACK_SETTINGS.image_models,
        default_image_model:
          data?.default_image_model || FALLBACK_SETTINGS.default_image_model,
      };
      setSettings(nextSettings);
      setModelsText(nextSettings.image_models.join('\n'));
    } catch (error) {
      showError(error.message || t('加载灵感画坊设置失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateModelsText = (value) => {
    setModelsText(value);
    const imageModels = parseModels(value);
    setSettings((current) => ({
      ...current,
      image_models: imageModels,
      default_image_model: imageModels.includes(current.default_image_model)
        ? current.default_image_model
        : imageModels[0] || '',
    }));
  };

  const saveSettings = async () => {
    const imageModels = parseModels(modelsText);
    if (imageModels.length === 0) {
      showError(t('至少配置一个图片模型'));
      return;
    }
    if (!imageModels.includes(settings.default_image_model)) {
      showError(t('默认模型必须包含在图片模型列表中'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        image_models: imageModels,
        default_image_model: settings.default_image_model,
      };
      const response = await API.put(
        '/api/option/inspiration_workshop',
        payload,
      );
      const { success, message, data } = response.data;
      if (!success) {
        showError(message || t('保存灵感画坊设置失败'));
        return;
      }
      setSettings(data);
      setModelsText(data.image_models.join('\n'));
      showSuccess(t('灵感画坊设置已保存'));
    } catch (error) {
      showError(error.message || t('保存灵感画坊设置失败'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{ marginTop: 10 }}>
      <Spin spinning={loading} size='large'>
        <Form.Section text={t('灵感画坊')}>
          <Banner
            type='info'
            description={t(
              '配置灵感画坊生成和编辑时可选择的图片模型。模型 ID 需要已经在渠道和模型配置中可用，每行填写一个。',
            )}
            closeIcon={null}
            style={{ marginBottom: 20 }}
          />
          <label className='site-setting-field'>
            <Text strong>{t('图片模型 ID')}</Text>
            <TextArea
              value={modelsText}
              onChange={updateModelsText}
              autosize={{ minRows: 4, maxRows: 12 }}
              placeholder={'gpt-image-2\nqwen-image'}
              style={{ fontFamily: 'JetBrains Mono, Consolas' }}
            />
          </label>
          <label className='site-setting-field'>
            <Text strong>{t('默认模型')}</Text>
            <Select
              value={settings.default_image_model}
              optionList={modelOptions}
              onChange={(value) =>
                setSettings((current) => ({
                  ...current,
                  default_image_model: value,
                }))
              }
              placeholder={t('请选择默认模型')}
              style={{ width: '100%' }}
            />
          </label>
          <Text type='secondary'>
            {t('修改后，灵感画坊的模型下拉框会在用户下次进入页面时更新。')}
          </Text>
          <div className='site-setting-actions'>
            <Button type='primary' loading={saving} onClick={saveSettings}>
              {t('保存灵感画坊设置')}
            </Button>
          </div>
        </Form.Section>
      </Spin>
    </Card>
  );
};

export default InspirationWorkshopSetting;
