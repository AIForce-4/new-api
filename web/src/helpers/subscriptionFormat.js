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
export function formatSubscriptionDuration(plan, t) {
  const unit = plan?.duration_unit || 'month';
  const value = plan?.duration_value || 1;
  const unitLabels = {
    year: t('年'),
    month: t('个月'),
    day: t('天'),
    hour: t('小时'),
    custom: t('自定义'),
  };
  if (unit === 'custom') {
    const seconds = plan?.custom_seconds || 0;
    if (seconds >= 86400) return `${Math.floor(seconds / 86400)} ${t('天')}`;
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)} ${t('小时')}`;
    return `${seconds} ${t('秒')}`;
  }
  return `${value} ${unitLabels[unit] || unit}`;
}

export function formatSubscriptionResetPeriod(plan, t) {
  const period = plan?.quota_reset_period || 'never';
  if (period === 'never') return t('不重置');
  if (period === 'daily') return t('每天');
  if (period === 'weekly') return t('每周');
  if (period === 'monthly') return t('每月');
  if (period === 'custom') {
    const seconds = Number(plan?.quota_reset_custom_seconds || 0);
    if (seconds >= 86400) return `${Math.floor(seconds / 86400)} ${t('天')}`;
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)} ${t('小时')}`;
    if (seconds >= 60) return `${Math.floor(seconds / 60)} ${t('分钟')}`;
    return `${seconds} ${t('秒')}`;
  }
  return t('不重置');
}

// 折扣比值 = 实付价 / 额度对应价值（付得少、到账多 => 比值 < 1 表示有优惠）
// quotaPerUnit 为额度换算基数（每“单位货币”对应的原生额度）。
export function getSubscriptionDiscountRatio(plan, quotaPerUnit = 1) {
  const price = Number(plan?.price_amount || 0);
  const totalAmount = Number(plan?.total_amount || 0);
  const base = quotaPerUnit > 0 ? quotaPerUnit : 1;
  const totalValue = totalAmount > 0 ? totalAmount / base : 0;
  if (totalValue <= 0 || price <= 0) return 0;
  return price / totalValue;
}

// 0.95 -> "9.5折"，仅在有优惠（比值 > 0 且 < 1）时返回，否则返回 null
export function formatSubscriptionDiscountLabel(ratio) {
  if (!(ratio > 0) || ratio >= 1) return null;
  const value = parseFloat((ratio * 10).toFixed(1));
  return `${value}折`;
}

// 按折扣“折数”降序排序（折扣力度小的在前：9.5折 -> 9折 -> 8.5折）。
// 折数越大 = 比值(ratio)越大，所以有优惠的套餐按 ratio 降序。
// 无优惠的套餐（比值 >= 1 或无法计算）排到最后，其内部保持后端原有顺序。
// 返回新数组，不修改入参。
export function sortSubscriptionPlansByDiscount(
  planWrappers,
  quotaPerUnit = 1,
) {
  const getPlan = (w) => w?.plan ?? w;
  const hasDiscount = (ratio) => ratio > 0 && ratio < 1;
  return [...(planWrappers || [])]
    .map((w, index) => ({
      w,
      index,
      ratio: getSubscriptionDiscountRatio(getPlan(w), quotaPerUnit),
    }))
    .sort((a, b) => {
      const da = hasDiscount(a.ratio);
      const db = hasDiscount(b.ratio);
      // 有优惠的排在无优惠的前面
      if (da !== db) return da ? -1 : 1;
      // 都有优惠：按折数降序（ratio 降序，9.5折在前）
      if (da && db && a.ratio !== b.ratio) return b.ratio - a.ratio;
      // 同折数或都无优惠：保持后端原有顺序（稳定）
      return a.index - b.index;
    })
    .map((item) => item.w);
}
