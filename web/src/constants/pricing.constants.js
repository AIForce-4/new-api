export const SUBSCRIPTION_PLAN_DEFINITIONS = [
  {
    key: 'LITE',
    price: 99,
    discount: 0.95,
    badgeKey: null,
    homeToneClassName: 'marketing-pricing-card--lite',
    homeButtonClassName: 'marketing-pricing-card__button--outline',
    pricingToneClassName: 'pricing-marketing-card--lite',
    pricingButtonClassName: 'pricing-marketing-button--outline',
    supportTextKey: '最高速率支持',
  },
  {
    key: 'PRO',
    price: 249,
    discount: 0.85,
    badgeKey: null,
    homeToneClassName: 'marketing-pricing-card--pro',
    homeButtonClassName: 'marketing-pricing-card__button--outline',
    pricingToneClassName: 'pricing-marketing-card--pro',
    pricingButtonClassName: 'pricing-marketing-button--outline',
    supportTextKey: '最高速率支持',
  },
  {
    key: 'MAX',
    price: 449,
    discount: 0.8,
    badgeKey: '推荐',
    homeToneClassName: 'marketing-pricing-card--max',
    homeButtonClassName: 'marketing-pricing-card__button--accent',
    pricingToneClassName: 'pricing-marketing-card--max',
    pricingButtonClassName: 'pricing-marketing-button--accent',
    supportTextKey: '最高速率支持',
  },
  {
    key: 'ULTRA',
    price: 1159,
    discount: 0.75,
    badgeKey: '顶级',
    homeToneClassName: 'marketing-pricing-card--ultra',
    homeButtonClassName: 'marketing-pricing-card__button--orange',
    pricingToneClassName: 'pricing-marketing-card--ultra',
    pricingButtonClassName: 'pricing-marketing-button--orange',
    supportTextKey: '最高速率支持',
  },
];

export function getSubscriptionPlanQuota(price, discount) {
  return Math.round(price / discount);
}

export function getSubscriptionPlanDiscountLabel(discount) {
  const value = (discount * 10).toFixed(1);
  const normalized = value.endsWith('.0') ? value.slice(0, -2) : value;
  return `${normalized}折`;
}

export function formatPricingAmount(
  amount,
  {
    symbol = '¥',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = {},
) {
  return `${symbol}${new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)}`;
}
