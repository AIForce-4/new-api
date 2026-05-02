import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Empty,
  Select,
  Slider,
  Spin,
  Tag,
  TextArea,
  Toast,
  Typography,
} from '@douyinfe/semi-ui';
import { IconClose, IconDelete, IconDownload, IconImage } from '@douyinfe/semi-icons';
import ConsolePageShell from '../layout/ConsolePageShell';
import useInspirationTokens from '../../hooks/inspiration-workshop/useInspirationTokens';
import useInspirationHistory from '../../hooks/inspiration-workshop/useInspirationHistory';
import {
  ASPECT_RATIO_OPTIONS,
  DEFAULT_MODEL,
  FORMAT_OPTIONS,
  MODEL_OPTIONS,
  QUALITY_OPTIONS,
  buildDownloadFilename,
  buildImageEditFormData,
  buildImageGenerationPayload,
  downloadImageSrc,
  normalizeImageResponse,
  requestImageEdit,
  requestImageGeneration,
} from '../../helpers/inspirationWorkshop';

const defaultGenerateForm = {
  tokenId: undefined,
  model: DEFAULT_MODEL,
  prompt: '',
  aspectRatio: 'auto',
  quality: 'medium',
  format: 'png',
  quantity: 1,
};

const defaultEditForm = {
  tokenId: undefined,
  model: DEFAULT_MODEL,
  prompt: '',
  aspectRatio: 'auto',
  quality: 'medium',
  format: 'png',
  quantity: 1,
  referenceImages: [],
  maskImage: null,
};

const newHistoryId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const FilePicker = ({ label, hint, accept, multiple, files, onChange }) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className='mb-2 font-semibold text-[var(--semi-color-text-0)]'>
        {label}
      </div>
      <label className='block cursor-pointer rounded-xl border border-dashed border-[var(--semi-color-border)] bg-[var(--semi-color-fill-0)] p-8 text-center text-[var(--semi-color-text-2)] transition hover:border-[var(--semi-color-primary)]'>
        <IconImage className='mr-2' />
        {hint}
        <input
          type='file'
          accept={accept}
          multiple={multiple}
          className='hidden'
          onChange={(event) => onChange(Array.from(event.target.files || []))}
        />
      </label>
      {files.length > 0 && (
        <div className='mt-3 flex flex-wrap gap-2'>
          {files.map((file, index) => (
            <Tag key={`${file.name}-${index}`} closable onClose={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}>
              {file.name}
            </Tag>
          ))}
          <Button size='small' type='tertiary' onClick={() => onChange([])}>
            {t('清空')}
          </Button>
        </div>
      )}
    </div>
  );
};

const ReferenceImagePicker = ({ files, onChange, max = 10 }) => {
  const { t } = useTranslation();
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const items = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(items);
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  const remaining = Math.max(0, max - files.length);
  const reachedMax = remaining === 0;

  const handleAdd = (incoming) => {
    if (incoming.length === 0) return;
    const merged = [...files, ...incoming].slice(0, max);
    if (incoming.length > remaining) {
      Toast.warning(t('最多上传{{max}}张图片', { max }));
    }
    onChange(merged);
  };

  const removeAt = (index) => {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <div>
      <div className='mb-2 flex items-center gap-2 font-semibold text-[var(--semi-color-text-0)]'>
        <span>{t('参考图片')}</span>
        <span className='text-sm font-normal text-[var(--semi-color-text-2)]'>
          {t('最多 {{max}} 张', { max })}
        </span>
      </div>

      {previews.length > 0 && (
        <div className='mb-3 flex flex-wrap gap-3'>
          {previews.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
              className='relative h-24 w-24 overflow-hidden rounded-xl border border-[var(--semi-color-border)] bg-[var(--semi-color-fill-0)]'
            >
              <img
                src={item.url}
                alt={item.file.name}
                className='h-full w-full object-cover'
              />
              <button
                type='button'
                onClick={() => removeAt(index)}
                className='absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-black/55 text-white transition hover:bg-black/75'
                aria-label={t('移除')}
              >
                <IconClose size='small' />
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        className={`block rounded-xl border border-dashed bg-[var(--semi-color-fill-0)] p-6 text-center transition ${
          reachedMax
            ? 'cursor-not-allowed border-[var(--semi-color-border)] text-[var(--semi-color-text-3)]'
            : 'cursor-pointer border-[var(--semi-color-border)] text-[var(--semi-color-text-2)] hover:border-[var(--semi-color-primary)]'
        }`}
      >
        {previews.length === 0 ? (
          <>
            <IconImage className='mr-2' />
            {t('点击上传图片')}
          </>
        ) : (
          t('继续添加图片')
        )}
        <input
          type='file'
          accept='image/*'
          multiple
          disabled={reachedMax}
          className='hidden'
          onChange={(event) => {
            handleAdd(Array.from(event.target.files || []));
            event.target.value = '';
          }}
        />
      </label>
    </div>
  );
};

const TokenStatus = ({ token }) => {
  const { t } = useTranslation();

  if (!token) {
    return <div className='mt-3 text-sm text-[var(--semi-color-text-2)]'>• {t('请选择令牌')}</div>;
  }

  if (token.status !== 1) {
    return <div className='mt-3 text-sm text-red-500'>• {t('当前令牌不可用')}</div>;
  }

  return (
    <div className='mt-3 text-sm text-green-600'>
      • {t('令牌已就绪')}
      {token.unlimited_quota ? '' : ` · ${t('剩余额度')} ${token.remain_quota ?? 0}`}
    </div>
  );
};

const SegmentedTabs = ({ activeTab, onChange }) => {
  const { t } = useTranslation();
  const tabs = [
    { key: 'generate', label: t('生成') },
    { key: 'edit', label: t('编辑') },
    { key: 'history', label: t('历史') },
  ];

  return (
    <div className='grid grid-cols-3 gap-1 rounded-xl border border-[var(--semi-color-border)] bg-[var(--semi-color-fill-0)] p-1'>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type='button'
          className={`rounded-lg px-4 py-3 text-base font-semibold transition ${activeTab === tab.key ? 'bg-blue-50 text-[var(--semi-color-primary)]' : 'text-[var(--semi-color-text-1)]'}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const OptionButtons = ({ options, value, onChange }) => (
  <div className='grid grid-cols-3 rounded-xl border border-[var(--semi-color-border)] bg-[var(--semi-color-fill-0)] p-1'>
    {options.map((option) => (
      <button
        key={option.value}
        type='button'
        className={`rounded-lg px-3 py-2 font-semibold transition ${value === option.value ? 'bg-blue-50 text-[var(--semi-color-primary)]' : 'text-[var(--semi-color-text-2)]'}`}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const CommonControls = ({ form, setForm, showQuantity = true }) => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <div className='mb-2 font-semibold text-[var(--semi-color-text-0)]'>
          {t('模型')}
        </div>
        <Select
          className='w-full'
          value={form.model}
          optionList={MODEL_OPTIONS}
          onChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
        />
      </div>
      <div>
        <div className='mb-2 font-semibold text-[var(--semi-color-text-0)]'>
          {t('画面比例')}
        </div>
        <Select
          className='w-full'
          value={form.aspectRatio}
          optionList={ASPECT_RATIO_OPTIONS}
          onChange={(value) => setForm((prev) => ({ ...prev, aspectRatio: value }))}
        />
      </div>
      <div>
        <div className='mb-2 font-semibold text-[var(--semi-color-text-0)]'>
          {t('生成质量')}
        </div>
        <OptionButtons
          options={QUALITY_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
          value={form.quality}
          onChange={(quality) => setForm((prev) => ({ ...prev, quality }))}
        />
      </div>
      <div className={showQuantity ? 'grid grid-cols-[1fr_1fr] gap-4' : ''}>
        <div>
          <div className='mb-2 font-semibold text-[var(--semi-color-text-0)]'>
            {t('格式')}
          </div>
          <OptionButtons
            options={FORMAT_OPTIONS}
            value={form.format}
            onChange={(format) => setForm((prev) => ({ ...prev, format }))}
          />
        </div>
        {showQuantity && (
          <div>
            <div className='mb-2 flex items-center justify-between font-semibold text-[var(--semi-color-text-0)]'>
              <span>{t('数量')}</span>
              <span className='text-[var(--semi-color-primary)]'>{form.quantity}</span>
            </div>
            <Slider
              min={1}
              max={4}
              step={1}
              value={form.quantity}
              onChange={(quantity) => setForm((prev) => ({ ...prev, quantity }))}
            />
          </div>
        )}
      </div>
    </>
  );
};

const TokenSelect = ({ tokens, form, setForm }) => {
  const { t } = useTranslation();
  const selectedToken = tokens.getToken(form.tokenId);

  return (
    <div>
      <div className='mb-2 font-semibold text-[var(--semi-color-text-0)]'>
        {t('令牌')}
      </div>
      <Select
        className='w-full'
        placeholder={t('请选择令牌')}
        loading={tokens.loading}
        value={form.tokenId}
        optionList={tokens.tokenOptions}
        emptyContent={
          <div className='p-4 text-center text-[var(--semi-color-text-2)]'>
            {t('暂无可用令牌')}
          </div>
        }
        onChange={(tokenId) => setForm((prev) => ({ ...prev, tokenId }))}
      />
      <TokenStatus token={selectedToken} />
      {tokens.tokenOptions.length === 0 && !tokens.loading && (
        <Link className='mt-2 inline-block text-sm text-[var(--semi-color-primary)]' to='/console/token'>
          {t('前往令牌管理新建令牌')}
        </Link>
      )}
    </div>
  );
};

const LoadingPreview = ({ prompt, onCancel }) => {
  const { t } = useTranslation();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className='min-h-[560px] rounded-2xl'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex min-w-0 items-center gap-2 text-[var(--semi-color-text-1)]'>
          <Spin size='small' />
          <Typography.Text ellipsis={{ showTooltip: true }} className='!max-w-[420px]'>
            {prompt || t('创作中，请稍候')}
          </Typography.Text>
        </div>
        {onCancel && (
          <Button
            icon={<IconClose />}
            theme='borderless'
            type='tertiary'
            size='small'
            onClick={onCancel}
            aria-label={t('取消')}
          />
        )}
      </div>

      <div className='mt-6 flex min-h-[420px] flex-col items-center justify-center gap-6 rounded-xl bg-[var(--semi-color-fill-0)] px-6 py-12'>
        <Spin size='large' />
        <div className='text-base text-[var(--semi-color-text-1)]'>
          {t('AI 正在创作中...')}
        </div>
        <div className='relative h-1.5 w-full max-w-md overflow-hidden rounded-full bg-[var(--semi-color-fill-1)]'>
          <div className='inspiration-loading-bar absolute inset-y-0 w-1/3 rounded-full bg-[var(--semi-color-primary)]' />
        </div>
        <div className='text-sm text-[var(--semi-color-text-2)]'>
          {t('已等待 {{seconds}}s', { seconds: elapsed })}
        </div>
      </div>
    </Card>
  );
};

const PreviewPanel = ({ loading, result, prompt, onCancel }) => {
  const { t } = useTranslation();

  if (loading) {
    return <LoadingPreview prompt={prompt} onCancel={onCancel} />;
  }

  if (!result?.outputs?.length) {
    return (
      <Card className='flex min-h-[560px] items-center justify-center rounded-2xl'>
        <Empty title='✦' description={t('在左侧输入描述，开始创作')} />
      </Card>
    );
  }

  const handleDownload = async (src, index) => {
    try {
      await downloadImageSrc(
        src,
        buildDownloadFilename({
          prompt: result.prompt,
          format: result.request?.format,
          index,
          total: result.outputs.length,
        }),
      );
    } catch (error) {
      Toast.error(error.message || t('下载失败'));
    }
  };

  return (
    <Card className='min-h-[560px] rounded-2xl'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {result.outputs.map((src, index) => (
          <div key={`${src}-${index}`} className='group relative'>
            <img
              src={src}
              alt={`${t('创作结果')} ${index + 1}`}
              className='max-h-[520px] w-full rounded-xl object-contain'
            />
            <Button
              icon={<IconDownload />}
              theme='solid'
              size='small'
              className='!absolute right-3 top-3 opacity-0 transition group-hover:opacity-100'
              onClick={() => handleDownload(src, index)}
            >
              {t('下载')}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

const GeneratePanel = ({ form, setForm, tokens, onSubmit, loading }) => {
  const { t } = useTranslation();

  return (
    <Card className='rounded-2xl'>
      <div className='flex flex-col gap-7'>
        <TokenSelect tokens={tokens} form={form} setForm={setForm} />
        <div>
          <div className='mb-2 font-semibold text-[var(--semi-color-text-0)]'>
            {t('描述画面')}
          </div>
          <TextArea
            rows={6}
            placeholder={t('描述你想要的画面...')}
            value={form.prompt}
            onChange={(prompt) => setForm((prev) => ({ ...prev, prompt }))}
          />
        </div>
        <CommonControls form={form} setForm={setForm} />
        <Button type='primary' size='large' loading={loading} onClick={onSubmit}>
          {t('开始生成')}
        </Button>
      </div>
    </Card>
  );
};

const EditPanel = ({ form, setForm, tokens, onSubmit, loading }) => {
  const { t } = useTranslation();

  const handleReferenceImages = (files) => {
    setForm((prev) => ({ ...prev, referenceImages: files.slice(0, 10) }));
  };

  const handleMaskImage = (files) => {
    const file = files[0];
    if (file && file.type !== 'image/png') {
      Toast.warning(t('蒙版必须为PNG格式'));
      return;
    }
    setForm((prev) => ({ ...prev, maskImage: file || null }));
  };

  return (
    <Card className='rounded-2xl'>
      <div className='flex flex-col gap-7'>
        <TokenSelect tokens={tokens} form={form} setForm={setForm} />
        <ReferenceImagePicker
          files={form.referenceImages}
          onChange={handleReferenceImages}
          max={10}
        />
        <FilePicker
          label={`${t('编辑区域')} ${t('可选')}`}
          hint={t('上传 PNG 蒙版，透明区域将被 AI 重绘')}
          accept='image/png'
          files={form.maskImage ? [form.maskImage] : []}
          onChange={handleMaskImage}
        />
        <div>
          <div className='mb-2 font-semibold text-[var(--semi-color-text-0)]'>
            {t('描述最终效果')}
          </div>
          <TextArea
            rows={5}
            placeholder={t('描述你想要的最终图片效果...')}
            value={form.prompt}
            onChange={(prompt) => setForm((prev) => ({ ...prev, prompt }))}
          />
        </div>
        <CommonControls form={form} setForm={setForm} showQuantity={false} />
        <Button type='primary' size='large' loading={loading} onClick={onSubmit}>
          {t('开始编辑')}
        </Button>
      </div>
    </Card>
  );
};

const HistoryPanel = ({ history, loaded, onSelect, onRemove, onClear }) => {
  const { t } = useTranslation();

  const handleDownload = async (item) => {
    try {
      const src = item.outputs?.[0];
      if (!src) return;
      await downloadImageSrc(
        src,
        buildDownloadFilename({
          prompt: item.prompt,
          format: item.request?.format,
          index: 0,
          total: item.outputs.length,
        }),
      );
    } catch (error) {
      Toast.error(error.message || t('下载失败'));
    }
  };

  if (!loaded) {
    return (
      <Card className='flex min-h-[560px] items-center justify-center rounded-2xl'>
        <Spin size='large' />
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className='min-h-[560px] rounded-2xl'>
        <Empty description={t('暂无历史')} />
      </Card>
    );
  }

  return (
    <Card className='min-h-[560px] rounded-2xl'>
      <div className='mb-4 flex justify-end'>
        <Button type='danger' theme='borderless' onClick={onClear}>
          {t('清空历史')}
        </Button>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {history.map((item) => (
          <div
            key={item.id}
            className='overflow-hidden rounded-xl bg-[var(--semi-color-fill-0)]'
          >
            <button type='button' className='block w-full' onClick={() => onSelect(item)}>
              <img
                src={item.outputs[0]}
                alt={item.prompt}
                className='h-72 w-full object-cover'
              />
            </button>
            <div className='p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <Tag color={item.type === 'edit' ? 'green' : 'blue'}>
                  {item.type === 'edit' ? t('编辑') : t('生成')}
                </Tag>
                <div className='flex items-center gap-1'>
                  <Button
                    icon={<IconDownload />}
                    size='small'
                    theme='borderless'
                    onClick={() => handleDownload(item)}
                  />
                  <Button
                    icon={<IconDelete />}
                    size='small'
                    type='danger'
                    theme='borderless'
                    onClick={() => onRemove(item.id)}
                  />
                </div>
              </div>
              <Typography.Paragraph ellipsis={{ rows: 2 }}>
                {item.prompt}
              </Typography.Paragraph>
              <Typography.Text type='tertiary'>
                {new Date(item.createdAt).toLocaleString()}
              </Typography.Text>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default function InspirationWorkshopPage() {
  const { t } = useTranslation();
  const tokens = useInspirationTokens();
  const historyState = useInspirationHistory();
  const [activeTab, setActiveTab] = useState('generate');
  const [generateForm, setGenerateForm] = useState(defaultGenerateForm);
  const [editForm, setEditForm] = useState(defaultEditForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const abortControllerRef = useRef(null);

  const cancelPending = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const selectedToken = useMemo(() => {
    const tokenId = activeTab === 'edit' ? editForm.tokenId : generateForm.tokenId;
    return tokens.getToken(tokenId);
  }, [activeTab, editForm.tokenId, generateForm.tokenId, tokens]);

  const validateCommon = (form) => {
    if (!form.tokenId) {
      Toast.warning(t('请选择令牌'));
      return false;
    }
    const token = tokens.getToken(form.tokenId);
    if (!token || token.status !== 1) {
      Toast.warning(t('当前令牌不可用'));
      return false;
    }
    if (!form.prompt.trim()) {
      Toast.warning(t('请输入提示词'));
      return false;
    }
    return true;
  };

  const saveResult = (type, form, normalized) => {
    const item = {
      id: newHistoryId(),
      type,
      createdAt: new Date().toISOString(),
      prompt: form.prompt.trim(),
      tokenId: form.tokenId,
      tokenName: selectedToken?.name,
      request: {
        model: form.model,
        aspectRatio: form.aspectRatio,
        quality: form.quality,
        format: form.format,
        quantity: form.quantity,
      },
      outputs: normalized.images,
    };
    setResult(item);
    historyState.addHistoryItem(item);
  };

  const handleGenerate = async () => {
    if (!validateCommon(generateForm)) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setPendingPrompt(generateForm.prompt.trim());
    setLoading(true);
    try {
      const tokenKey = await tokens.resolveTokenKey(generateForm.tokenId);
      const payload = buildImageGenerationPayload(generateForm);
      const response = await requestImageGeneration({
        tokenKey,
        payload,
        signal: controller.signal,
      });
      const normalized = normalizeImageResponse(response, generateForm.format);
      if (normalized.images.length === 0) {
        throw new Error(t('未返回图片'));
      }
      saveResult('generate', generateForm, normalized);
      Toast.success(t('生成成功'));
    } catch (error) {
      if (error?.name === 'AbortError') {
        Toast.info(t('已取消'));
      } else {
        Toast.error(error.message || t('图片生成失败'));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!validateCommon(editForm)) return;
    if (editForm.referenceImages.length === 0) {
      Toast.warning(t('请至少上传一张参考图'));
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setPendingPrompt(editForm.prompt.trim());
    setLoading(true);
    try {
      const tokenKey = await tokens.resolveTokenKey(editForm.tokenId);
      const formData = buildImageEditFormData(editForm);
      const response = await requestImageEdit({
        tokenKey,
        formData,
        signal: controller.signal,
      });
      const normalized = normalizeImageResponse(response, editForm.format);
      if (normalized.images.length === 0) {
        throw new Error(t('未返回图片'));
      }
      saveResult('edit', editForm, normalized);
      Toast.success(t('编辑成功'));
    } catch (error) {
      if (error?.name === 'AbortError') {
        Toast.info(t('已取消'));
      } else {
        Toast.error(error.message || t('图片编辑失败'));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  };

  return (
    <ConsolePageShell>
      <div className='flex flex-col gap-5'>
        <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === 'history' ? (
          <HistoryPanel
            history={historyState.history}
            loaded={historyState.loaded}
            onSelect={setResult}
            onRemove={historyState.removeHistoryItem}
            onClear={historyState.clearHistory}
          />
        ) : (
          <div className='grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]'>
            {activeTab === 'generate' ? (
              <GeneratePanel
                form={generateForm}
                setForm={setGenerateForm}
                tokens={tokens}
                onSubmit={handleGenerate}
                loading={loading}
              />
            ) : (
              <EditPanel
                form={editForm}
                setForm={setEditForm}
                tokens={tokens}
                onSubmit={handleEdit}
                loading={loading}
              />
            )}
            <PreviewPanel
              loading={loading}
              result={result}
              prompt={pendingPrompt}
              onCancel={cancelPending}
            />
          </div>
        )}
      </div>
    </ConsolePageShell>
  );
}
