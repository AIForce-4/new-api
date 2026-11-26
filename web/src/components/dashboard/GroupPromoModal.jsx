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
import React from 'react';
import { Modal } from '@douyinfe/semi-ui';

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

const GroupPromoModal = ({
  visible,
  onClose,
  settings = DEFAULT_GROUP_PROMO_SETTINGS,
}) => {
  const resolvedSettings = settings || DEFAULT_GROUP_PROMO_SETTINGS;
  const resolvedImages =
    resolvedSettings.images?.length === 2
      ? resolvedSettings.images
      : DEFAULT_GROUP_PROMO_SETTINGS.images;
  const contentParagraphs = (resolvedSettings.content || '')
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <Modal
      centered
      className='group-promo-dialog'
      footer={null}
      onCancel={onClose}
      visible={visible}
      width={920}
      bodyStyle={{ overflowY: 'hidden' }}
    >
      <div className='group-promo-modal'>
        <div className='group-promo-modal__header'>
          <div className='group-promo-modal__badge'>
            {resolvedSettings.badge || DEFAULT_GROUP_PROMO_SETTINGS.badge}
          </div>
        </div>
        <div className='group-promo-modal__warning'>
          <div className='group-promo-modal__warning-title'>
            ⚠️ {resolvedSettings.title || DEFAULT_GROUP_PROMO_SETTINGS.title}
          </div>
          {contentParagraphs.map((paragraph, index) => (
            <div
              key={`${paragraph.slice(0, 20)}-${index}`}
              className='group-promo-modal__warning-text'
            >
              {paragraph}
            </div>
          ))}
        </div>
        <div className='group-promo-modal__cards'>
          {resolvedImages.map((image) => (
            <div key={image.type} className='group-promo-modal__card'>
              <div className='group-promo-modal__card-title'>{image.label}</div>
              <div className='group-promo-modal__card-desc'>
                {image.description}
              </div>
              <img
                src={image.url}
                alt={image.label}
                className='group-promo-modal__image'
              />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default GroupPromoModal;
