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
import { Tooltip } from '@douyinfe/semi-ui';
import { Check } from 'lucide-react';
import { renderQuota } from '../../helpers';
import { getCurrencyConfig } from '../../helpers/render';
import { getQuotaPerUnit } from '../../helpers/quota';
import {
  formatSubscriptionDuration,
  formatSubscriptionResetPeriod,
  getSubscriptionDiscountRatio,
  formatSubscriptionDiscountLabel,
} from '../../helpers/subscriptionFormat';

// 卡片配色主题（内联渐变，避免 Tailwind JIT 清除动态类名）
// 顺序：橙 / 紫黄 / 橙粉
const CARD_THEMES = [
  {
    // 橙
    accent: '#f97316',
    badge: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
    button: 'linear-gradient(135deg, #fdba74 0%, #f97316 100%)',
    buttonShadow: '0 12px 22px -10px rgba(249, 115, 22, 0.65)',
  },
  {
    // 紫黄
    accent: '#a855f7',
    badge: 'linear-gradient(135deg, #facc15 0%, #a855f7 100%)',
    button: 'linear-gradient(135deg, #fbbf24 0%, #a855f7 100%)',
    buttonShadow: '0 12px 22px -10px rgba(168, 85, 247, 0.65)',
  },
  {
    // 橙粉
    accent: '#fb7185',
    badge: 'linear-gradient(135deg, #fb923c 0%, #f472b6 100%)',
    button: 'linear-gradient(135deg, #fb923c 0%, #fb7185 100%)',
    buttonShadow: '0 12px 22px -10px rgba(251, 113, 133, 0.65)',
  },
];

const SubscriptionPlanTile = ({
  planWrapper,
  index = 0,
  onBuy,
  purchaseCount = 0,
  t,
}) => {
  const plan = planWrapper?.plan;
  if (!plan) return null;

  const theme = CARD_THEMES[index % CARD_THEMES.length];

  const { symbol, rate } = getCurrencyConfig();
  const price = Number(plan?.price_amount || 0);
  const convertedPrice = price * rate;
  const displayPrice = convertedPrice.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(convertedPrice) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  const totalAmount = Number(plan?.total_amount || 0);
  // 折扣 = 实付价 / 额度价值（付得少、到账多 => 比值 < 1）
  const discountRatio = getSubscriptionDiscountRatio(plan, getQuotaPerUnit());
  const discountLabel = formatSubscriptionDiscountLabel(discountRatio);

  const limit = Number(plan?.max_purchase_per_user || 0);
  const reached = limit > 0 && purchaseCount >= limit;

  const resetText = formatSubscriptionResetPeriod(plan, t);
  const benefits = [
    totalAmount > 0
      ? {
          node: (
            <>
              {t('立即获得')}
              <span style={{ color: theme.accent, fontWeight: 700 }}>
                {' '}
                {renderQuota(totalAmount)}{' '}
              </span>
              {t('额度')}
            </>
          ),
        }
      : { node: <>{t('额度不限')}</> },
    discountLabel
      ? {
          node: (
            <>
              {t('折合')}
              <span style={{ color: theme.accent, fontWeight: 700 }}>
                {' '}
                {discountLabel}{' '}
              </span>
              {t('优惠')}
            </>
          ),
        }
      : null,
    {
      node: (
        <>
          {t('额度有效期')} {formatSubscriptionDuration(plan, t)}
        </>
      ),
    },
    resetText && resetText !== t('不重置')
      ? {
          node: (
            <>
              {t('额度重置')}: {resetText}
            </>
          ),
        }
      : null,
  ].filter(Boolean);

  const buttonEl = (
    <button
      type='button'
      disabled={reached}
      onClick={() => !reached && onBuy?.(planWrapper)}
      className='w-full rounded-full py-3 text-white text-base font-semibold transition-transform duration-150 active:scale-[0.98] disabled:cursor-not-allowed'
      style={{
        background: reached ? '#cbd5e1' : theme.button,
        boxShadow: reached ? 'none' : theme.buttonShadow,
        border: 'none',
      }}
    >
      {reached ? t('已达上限') : t('立即购买')}
    </button>
  );

  return (
    <div className='relative flex h-full flex-col rounded-3xl bg-white p-7 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.25)] ring-1 ring-slate-100 transition-shadow duration-200 hover:shadow-[0_18px_50px_-18px_rgba(15,23,42,0.35)]'>
      {/* 折扣角标 */}
      {discountLabel && (
        <div
          className='absolute right-6 top-6 rounded-full px-3 py-1 text-sm font-semibold text-white'
          style={{ background: theme.badge }}
        >
          {discountLabel}
        </div>
      )}

      {/* 套餐名 + 副标题 */}
      <div className='flex items-baseline gap-2 pr-16'>
        <span className='text-xl font-bold uppercase tracking-wide text-slate-700'>
          {plan?.title || t('订阅套餐')}
        </span>
        {plan?.subtitle && (
          <span className='truncate text-sm font-normal normal-case text-slate-400'>
            {plan.subtitle}
          </span>
        )}
      </div>

      {/* 价格 */}
      <div className='mt-3 flex items-baseline text-slate-800'>
        <span className='text-3xl font-bold'>{symbol}</span>
        <span className='text-5xl font-extrabold leading-none'>
          {displayPrice}
        </span>
      </div>

      {/* 权益列表 */}
      <ul className='mt-8 mb-8 flex flex-1 flex-col gap-5'>
        {benefits.map((item, i) => (
          <li key={i} className='flex items-start gap-3 text-slate-600'>
            <Check
              size={18}
              strokeWidth={3}
              className='mt-0.5 shrink-0'
              style={{ color: theme.accent }}
            />
            <span className='text-[15px] leading-snug'>{item.node}</span>
          </li>
        ))}
      </ul>

      {/* 购买按钮 */}
      {reached ? (
        <Tooltip
          content={`${t('已达到购买上限')} (${purchaseCount}/${limit})`}
          position='top'
        >
          {buttonEl}
        </Tooltip>
      ) : (
        buttonEl
      )}
    </div>
  );
};

export default SubscriptionPlanTile;
