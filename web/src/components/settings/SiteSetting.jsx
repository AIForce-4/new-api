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
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Banner,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Spin,
  Switch,
  TextArea,
  Typography,
} from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { API, showError, showSuccess } from '../../helpers';
import { StatusContext } from '../../context/Status';
import NoticeModal from '../layout/NoticeModal';
import GroupPromoModal from '../dashboard/GroupPromoModal';
import { useIsMobile } from '../../hooks/common/useIsMobile';

const { Text } = Typography;

const DEFAULT_SETTINGS = {
  enabled: true,
  content: '',
  qr_code_image_url: '',
  qr_code_caption: '微信扫码添加客服',
};

const DEFAULT_GROUP_PROMO_SETTINGS = {
  badge: '系统公告',
  title: '地区限制提示',
  content:
    '依据相关法律法规，本平台拒绝向中国大陆地区用户提供服务。如您位于中国大陆，请立即停止使用。\n\n※ 继续使用即表示您确认自身不位于受限地区，并自愿承担由此产生的一切法律后果。',
  images: [
    {
      type: 'customer_service',
      label: '平台客服',
      description: '扫码添加客服，获取提现协助与使用支持',
      url: '/pricing-contact-qr.jpg',
    },
    {
      type: 'group',
      label: '用户群',
      description: '扫码加入用户群，接收交流答疑与活动通知',
      url: '/qunPic.jpg',
    },
  ],
};

const SiteSetting = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [statusState, statusDispatch] = useContext(StatusContext);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [groupPromoSettings, setGroupPromoSettings] = useState(
    DEFAULT_GROUP_PROMO_SETTINGS,
  );
  const [uploadingGroupPromoType, setUploadingGroupPromoType] = useState('');
  const [savingGroupPromo, setSavingGroupPromo] = useState(false);
  const [noticePreviewVisible, setNoticePreviewVisible] = useState(false);
  const [groupPromoPreviewVisible, setGroupPromoPreviewVisible] =
    useState(false);
  const qrFileInputRef = useRef(null);
  const groupPromoFileInputRefs = useRef({});

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/option/home_notice');
      const { success, message, data } = res.data;
      if (!success) {
        showError(message || t('加载官网设置失败'));
        return;
      }
      setSettings({
        ...DEFAULT_SETTINGS,
        ...data,
      });
    } catch (error) {
      showError(error.message || t('加载官网设置失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const loadGroupPromoSettings = async () => {
      try {
        const res = await API.get('/api/option/group_promo');
        const { success, data } = res.data;
        if (success && data) {
          setGroupPromoSettings({
            ...DEFAULT_GROUP_PROMO_SETTINGS,
            ...data,
            images:
              data.images?.length === 2
                ? data.images
                : DEFAULT_GROUP_PROMO_SETTINGS.images,
          });
        }
      } catch (error) {
        showError(error.message || t('加载群公告设置失败'));
      }
    };
    loadGroupPromoSettings();
  }, []);

  const updateSetting = (key) => (value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateGroupPromoField = (key) => (value) => {
    setGroupPromoSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateGroupPromoImageCopy = (imageType, key) => (value) => {
    setGroupPromoSettings((current) => ({
      ...current,
      images: current.images.map((image) =>
        image.type === imageType ? { ...image, [key]: value } : image,
      ),
    }));
  };

  const saveSettings = async () => {
    if (
      settings.enabled &&
      !settings.content.trim() &&
      !settings.qr_code_image_url.trim()
    ) {
      showError(t('启用弹窗时，公告内容或二维码至少填写一项'));
      return;
    }

    setSaving(true);
    try {
      const res = await API.put('/api/option/home_notice', settings);
      const { success, message, data } = res.data;
      if (!success) {
        showError(message || t('保存官网设置失败'));
        return;
      }
      setSettings({
        ...DEFAULT_SETTINGS,
        ...data,
      });
      if (statusState?.status) {
        statusDispatch({
          type: 'set',
          payload: {
            ...statusState.status,
            home_notice: data,
          },
        });
      }
      showSuccess(t('官网设置已保存'));
    } catch (error) {
      showError(error.message || t('保存官网设置失败'));
    } finally {
      setSaving(false);
    }
  };

  const uploadQRCode = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showError(t('仅支持 PNG、JPG 或 WebP 图片'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showError(t('图片大小不能超过 2 MB'));
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await API.post('/api/option/home_notice/image', formData);
      const { success, message, data } = res.data;
      if (!success || !data?.url) {
        showError(message || t('二维码上传失败'));
        return;
      }
      setSettings((current) => ({
        ...current,
        qr_code_image_url: data.url,
      }));
      showSuccess(t('二维码已上传，请点击保存官网公告设置'));
    } catch (error) {
      showError(error.message || t('二维码上传失败'));
    } finally {
      setUploading(false);
    }
  };

  const uploadGroupPromoImage = (imageType) => async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showError(t('仅支持 PNG、JPG 或 WebP 图片'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showError(t('图片大小不能超过 2 MB'));
      return;
    }

    setUploadingGroupPromoType(imageType);
    try {
      const formData = new FormData();
      formData.append('type', imageType);
      formData.append('file', file);
      const res = await API.post('/api/option/group_promo/image', formData);
      const { success, message, data } = res.data;
      if (!success || !data?.url) {
        showError(message || t('群公告二维码上传失败'));
        return;
      }

      const nextSettings = {
        ...groupPromoSettings,
        images: groupPromoSettings.images.map((image) =>
          image.type === imageType ? { ...image, url: data.url } : image,
        ),
      };
      setGroupPromoSettings(nextSettings);
      if (statusState?.status) {
        statusDispatch({
          type: 'set',
          payload: {
            ...statusState.status,
            group_promo: nextSettings,
          },
        });
      }
      showSuccess(
        imageType === 'group'
          ? t('群二维码已更新，旧图片已自动删除')
          : t('客服二维码已更新，旧图片已自动删除'),
      );
    } catch (error) {
      showError(error.message || t('群公告二维码上传失败'));
    } finally {
      setUploadingGroupPromoType('');
    }
  };

  const saveGroupPromoSettings = async () => {
    if (
      !groupPromoSettings.badge.trim() ||
      !groupPromoSettings.title.trim() ||
      !groupPromoSettings.content.trim()
    ) {
      showError(t('公告标签、标题和正文不能为空'));
      return;
    }

    setSavingGroupPromo(true);
    try {
      const res = await API.put('/api/option/group_promo', groupPromoSettings);
      const { success, message, data } = res.data;
      if (!success) {
        showError(message || t('保存控制台公告失败'));
        return;
      }
      setGroupPromoSettings({
        ...DEFAULT_GROUP_PROMO_SETTINGS,
        ...data,
      });
      if (statusState?.status) {
        statusDispatch({
          type: 'set',
          payload: {
            ...statusState.status,
            group_promo: data,
          },
        });
      }
      showSuccess(t('控制台公告已保存'));
    } catch (error) {
      showError(error.message || t('保存控制台公告失败'));
    } finally {
      setSavingGroupPromo(false);
    }
  };

  return (
    <>
      <Spin spinning={loading} size='large'>
        <Row>
          <Col span={24}>
            <Card>
              <Form.Section text={t('控制台公告')}>
                <Banner
                  type='info'
                  description={t(
                    '用户登录进入控制台后展示。固定展示客服微信二维码和群二维码，顺序不会变化。',
                  )}
                  closeIcon={null}
                  style={{ marginBottom: 20 }}
                />
                <label className='site-setting-field'>
                  <Text strong>{t('公告标签')}</Text>
                  <Input
                    value={groupPromoSettings.badge}
                    onChange={updateGroupPromoField('badge')}
                    placeholder={t('例如：系统公告')}
                  />
                </label>
                <label className='site-setting-field'>
                  <Text strong>{t('公告标题')}</Text>
                  <Input
                    value={groupPromoSettings.title}
                    onChange={updateGroupPromoField('title')}
                    placeholder={t('例如：地区限制提示')}
                  />
                </label>
                <label className='site-setting-field'>
                  <Text strong>{t('公告正文')}</Text>
                  <TextArea
                    value={groupPromoSettings.content}
                    onChange={updateGroupPromoField('content')}
                    autosize={{ minRows: 4, maxRows: 10 }}
                    placeholder={t('输入控制台公告正文，空行会分成不同段落')}
                  />
                </label>
                <div className='group-promo-upload-grid'>
                  {groupPromoSettings.images.map((image) => (
                    <div key={image.type} className='group-promo-upload-card'>
                      <div className='group-promo-upload-card__copy'>
                        <label className='site-setting-field'>
                          <Text strong>{t('二维码标题')}</Text>
                          <Input
                            value={image.label}
                            onChange={updateGroupPromoImageCopy(
                              image.type,
                              'label',
                            )}
                          />
                        </label>
                        <label className='site-setting-field'>
                          <Text strong>{t('二维码说明')}</Text>
                          <Input
                            value={image.description}
                            onChange={updateGroupPromoImageCopy(
                              image.type,
                              'description',
                            )}
                          />
                        </label>
                      </div>
                      {image.url ? (
                        <img
                          src={image.url}
                          alt={image.label}
                          className='group-promo-upload-card__image'
                        />
                      ) : null}
                      {image.type === 'group' ? (
                        <>
                          <input
                            ref={(element) => {
                              groupPromoFileInputRefs.current[image.type] =
                                element;
                            }}
                            type='file'
                            accept='image/png,image/jpeg,image/webp'
                            hidden
                            onChange={uploadGroupPromoImage(image.type)}
                          />
                          <Button
                            icon={<Upload size={16} />}
                            loading={uploadingGroupPromoType === image.type}
                            disabled={
                              Boolean(uploadingGroupPromoType) &&
                              uploadingGroupPromoType !== image.type
                            }
                            onClick={() =>
                              groupPromoFileInputRefs.current[
                                image.type
                              ]?.click()
                            }
                          >
                            {t('更新群二维码')}
                          </Button>
                        </>
                      ) : (
                        <Text type='secondary'>
                          {t('客服二维码固定，无需更新')}
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
                <div className='site-setting-actions'>
                  <Button onClick={() => setGroupPromoPreviewVisible(true)}>
                    {t('预览控制台公告')}
                  </Button>
                  <Button
                    type='primary'
                    loading={savingGroupPromo}
                    onClick={saveGroupPromoSettings}
                  >
                    {t('保存控制台公告')}
                  </Button>
                </div>
              </Form.Section>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 10 }}>
          <Col span={24}>
            <Card>
              <Form.Section text={t('官网弹窗公告')}>
                <Banner
                  type='info'
                  description={t(
                    '管理员可配置官网首次访问弹窗。公告支持 Markdown 和 HTML，二维码可直接上传 PNG、JPG 或 WebP 图片。',
                  )}
                  closeIcon={null}
                  style={{ marginBottom: 20 }}
                />
                <div className='site-setting-switch-row'>
                  <div>
                    <Text strong>{t('进入官网时自动弹出')}</Text>
                    <div className='site-setting-switch-row__description'>
                      {t('关闭后公告仍可通过右上角通知入口查看。')}
                    </div>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onChange={updateSetting('enabled')}
                  />
                </div>
                <label className='site-setting-field'>
                  <Text strong>{t('公告内容')}</Text>
                  <TextArea
                    placeholder={t('输入公告内容，支持 Markdown 和 HTML')}
                    value={settings.content}
                    onChange={updateSetting('content')}
                    autosize={{ minRows: 6, maxRows: 16 }}
                    style={{ fontFamily: 'JetBrains Mono, Consolas' }}
                  />
                </label>
                <div className='site-setting-upload-row'>
                  <div>
                    <Text strong>{t('公告二维码')}</Text>
                    <div className='site-setting-switch-row__description'>
                      {t('支持 PNG、JPG、WebP，大小不超过 2 MB。')}
                    </div>
                  </div>
                  <input
                    ref={qrFileInputRef}
                    type='file'
                    accept='image/png,image/jpeg,image/webp'
                    hidden
                    onChange={uploadQRCode}
                  />
                  <Button
                    icon={<Upload size={16} />}
                    loading={uploading}
                    onClick={() => qrFileInputRef.current?.click()}
                  >
                    {t('上传二维码')}
                  </Button>
                </div>
                {settings.qr_code_image_url.trim() ? (
                  <div className='site-setting-qr-preview'>
                    <img
                      src={settings.qr_code_image_url}
                      alt={settings.qr_code_caption || t('二维码预览')}
                    />
                    <div className='site-setting-qr-preview__copy'>
                      <Text type='secondary'>{t('二维码已就绪')}</Text>
                      <Button
                        theme='borderless'
                        type='danger'
                        size='small'
                        onClick={() => updateSetting('qr_code_image_url')('')}
                      >
                        {t('移除二维码')}
                      </Button>
                    </div>
                  </div>
                ) : null}
                <label className='site-setting-field'>
                  <Text strong>{t('二维码说明')}</Text>
                  <Input
                    placeholder={t('例如：微信扫码添加客服')}
                    value={settings.qr_code_caption}
                    onChange={updateSetting('qr_code_caption')}
                  />
                </label>
                <div className='site-setting-actions'>
                  <Button onClick={() => setNoticePreviewVisible(true)}>
                    {t('预览官网公告')}
                  </Button>
                  <Button
                    type='primary'
                    loading={saving}
                    onClick={saveSettings}
                  >
                    {t('保存官网公告设置')}
                  </Button>
                </div>
              </Form.Section>
            </Card>
          </Col>
        </Row>
      </Spin>
      <NoticeModal
        visible={noticePreviewVisible}
        onClose={() => setNoticePreviewVisible(false)}
        isMobile={isMobile}
        homeNoticeOverride={settings}
        previewMode
      />
      <GroupPromoModal
        visible={groupPromoPreviewVisible}
        onClose={() => setGroupPromoPreviewVisible(false)}
        settings={groupPromoSettings}
      />
    </>
  );
};

export default SiteSetting;
