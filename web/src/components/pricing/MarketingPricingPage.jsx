import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { UserContext } from '../../context/User';
import {
  SUBSCRIPTION_PLAN_DEFINITIONS,
  formatPricingAmount,
  getSubscriptionPlanDiscountLabel,
  getSubscriptionPlanQuota,
} from '../../constants';

const PlanFeature = ({ tone, children }) => (
  <div className='pricing-marketing-feature'>
    <Check className={`pricing-marketing-feature__icon ${tone}`} />
    <p>{children}</p>
  </div>
);

const PlanButton = ({ className, onClick, children }) => (
  <button className={`pricing-marketing-button ${className}`} onClick={onClick}>
    {children}
  </button>
);

const MarketingPricingPage = () => {
  const { t } = useTranslation();
  const [userState] = useContext(UserContext);
  const navigate = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);
  const subscriptionPlans = SUBSCRIPTION_PLAN_DEFINITIONS.map((plan) => {
    const quota = getSubscriptionPlanQuota(plan.price, plan.discount);
    const savings = quota - plan.price;
    const discountLabel = getSubscriptionPlanDiscountLabel(plan.discount);

    return {
      ...plan,
      quota,
      savings,
      discountLabel,
    };
  });

  const goToTopUp = (plan) => {
    if (!userState?.user) {
      navigate('/login');
      return;
    }
    navigate(plan ? `/console/topup?plan=${plan}` : '/console/topup');
  };

  return (
    <>
      <main className='pricing-marketing-page'>
        <section className='pricing-marketing-section pricing-marketing-hero'>
          <div className='pricing-marketing-hero__inner'>
            <div className='pricing-marketing-hero__copy'>
              <h1>{t('简单透明的定价')}</h1>
              <p>{t('包月订阅或按量付费，灵活适配个人开发者与企业团队')}</p>
            </div>

            <div className='pricing-marketing-grid'>
              {subscriptionPlans.map((plan) => {
                const titleClassName = [
                  'pricing-marketing-card__title',
                  plan.key === 'MAX' && 'pricing-marketing-card__title--max',
                  plan.key === 'ULTRA' && 'pricing-marketing-card__title--ultra',
                ]
                  .filter(Boolean)
                  .join(' ');
                const savingClassName = [
                  'pricing-marketing-card__saving',
                  plan.key === 'MAX' && 'pricing-marketing-card__saving--max',
                  plan.key === 'ULTRA' &&
                    'pricing-marketing-card__saving--ultra',
                ]
                  .filter(Boolean)
                  .join(' ');
                const featureAccentClassName = [
                  'pricing-marketing-feature__highlight',
                  plan.key === 'MAX' &&
                    'pricing-marketing-feature__highlight--max',
                  plan.key === 'ULTRA' &&
                    'pricing-marketing-feature__highlight--ultra',
                  !['MAX', 'ULTRA'].includes(plan.key) &&
                    'pricing-marketing-feature__highlight--accent',
                ]
                  .filter(Boolean)
                  .join(' ');
                const featureToneClassName =
                  plan.key === 'ULTRA'
                    ? 'pricing-marketing-feature__icon--orange'
                    : 'pricing-marketing-feature__icon--accent';

                return (
                  <article
                    key={plan.key}
                    className={`pricing-marketing-card ${plan.pricingToneClassName}`}
                  >
                    {plan.badgeKey ? (
                      <div
                        className={`pricing-marketing-card__ribbon ${plan.key === 'ULTRA' ? 'pricing-marketing-card__ribbon--orange' : 'pricing-marketing-card__ribbon--accent'}`}
                      >
                        {t(plan.badgeKey)}
                      </div>
                    ) : null}
                    <div className='pricing-marketing-card__header'>
                      <h2 className={titleClassName}>{plan.key}</h2>
                      <div className='pricing-marketing-card__price-wrap'>
                        <div className='pricing-marketing-card__price'>
                          {formatPricingAmount(plan.price)}
                        </div>
                        <div className='pricing-marketing-card__meta'>
                          <p className='pricing-marketing-card__original'>
                            {t('原价')} {formatPricingAmount(plan.quota)}
                          </p>
                          <p className={savingClassName}>
                            {t('优惠')}
                            {t(getSubscriptionPlanDiscountLabel(plan.discount))} ·{' '}
                            {t('省')}
                            {formatPricingAmount(plan.savings)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='pricing-marketing-card__features'>
                      <PlanFeature tone={featureToneClassName}>
                        {t('立即获得')}
                        <span className={featureAccentClassName}>
                          {formatPricingAmount(plan.quota, {
                            symbol: '￥',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        {t('额度')}
                      </PlanFeature>
                      <PlanFeature tone={featureToneClassName}>
                        {t('折合')}
                        <span className={featureAccentClassName}>
                          {t(plan.discountLabel)}
                        </span>
                        {t('优惠')}
                      </PlanFeature>
                      <PlanFeature tone={featureToneClassName}>
                        {t('额度有效期30天')}
                      </PlanFeature>
                      <PlanFeature tone={featureToneClassName}>
                        {t(plan.supportTextKey)}
                      </PlanFeature>
                    </div>

                    <PlanButton
                      className={plan.pricingButtonClassName}
                      onClick={() => goToTopUp(plan.key)}
                    >
                      {t(`选择 ${plan.key}`)}
                    </PlanButton>
                  </article>
                );
              })}
            </div>

            <div className='pricing-marketing-grid pricing-marketing-grid--secondary'>
              <article className='pricing-marketing-card pricing-marketing-card--paygo'>
                <div className='pricing-marketing-card__header'>
                  <h2 className='pricing-marketing-card__title'>PAYGO</h2>
                  <div className='pricing-marketing-card__price-wrap'>
                    <div className='pricing-marketing-card__price pricing-marketing-card__price--label'>
                      {t('按量付费')}
                    </div>
                  </div>
                </div>

                <div className='pricing-marketing-card__features'>
                  <PlanFeature tone='pricing-marketing-feature__icon--accent'>
                    {t('充值金额，获得')}
                    <span className='pricing-marketing-feature__highlight pricing-marketing-feature__highlight--accent'>
                      {t('等价人民币')}
                    </span>
                    {t('额度')}
                  </PlanFeature>
                  <PlanFeature tone='pricing-marketing-feature__icon--accent'>
                    {t('按实际使用付费')}
                  </PlanFeature>
                  <PlanFeature tone='pricing-marketing-feature__icon--accent'>
                    {t('标准价格')}
                  </PlanFeature>
                  <PlanFeature tone='pricing-marketing-feature__icon--accent'>
                    <span className='pricing-marketing-feature__highlight pricing-marketing-feature__highlight--accent'>
                      {t('永不过期')}
                    </span>
                  </PlanFeature>
                </div>

                <PlanButton
                  className='pricing-marketing-button--default'
                  onClick={() => goToTopUp()}
                >
                  {t('立即充值')}
                </PlanButton>
              </article>

              <article className='pricing-marketing-card pricing-marketing-card--enterprise'>
                <div className='pricing-marketing-card__header'>
                  <h2 className='pricing-marketing-card__title pricing-marketing-card__title--blue'>
                    {t('企业认证')}
                  </h2>
                  <div className='pricing-marketing-card__price-wrap'>
                    <div className='pricing-marketing-card__price pricing-marketing-card__price--blue'>
                      ¥200
                      <span className='pricing-marketing-card__price-suffix'>
                        /月
                      </span>
                    </div>
                  </div>
                </div>

                <div className='pricing-marketing-card__features'>
                  <PlanFeature tone='pricing-marketing-feature__icon--blue'>
                    {t('企业大额包量')}
                    <span className='pricing-marketing-feature__highlight pricing-marketing-feature__highlight--blue'>
                      {t('专属折扣')}
                    </span>
                  </PlanFeature>
                  <PlanFeature tone='pricing-marketing-feature__icon--blue'>
                    <span className='pricing-marketing-feature__highlight pricing-marketing-feature__highlight--blue'>
                      {t('APIKEY上限提升')}
                    </span>
                    ，{t('按')}
                    <span className='pricing-marketing-feature__highlight pricing-marketing-feature__highlight--blue'>
                      {t('APIKEY限制/查询用量')}
                    </span>
                  </PlanFeature>
                  <PlanFeature tone='pricing-marketing-feature__icon--blue'>
                    <span className='pricing-marketing-feature__highlight pricing-marketing-feature__highlight--blue'>
                      {t('优先开票')}
                    </span>
                  </PlanFeature>
                  <PlanFeature tone='pricing-marketing-feature__icon--blue'>
                    <span className='pricing-marketing-feature__highlight pricing-marketing-feature__highlight--blue'>
                      {t('7×24小时')}
                    </span>
                    {t('专属客服群')}
                  </PlanFeature>
                </div>

                <PlanButton
                  className='pricing-marketing-button--blue-outline'
                  onClick={() => setContactOpen(true)}
                >
                  {t('联系我们')}
                </PlanButton>
              </article>
            </div>
          </div>
        </section>

        <section className='pricing-marketing-support'>
          <p>{t('支持支付宝支付')}</p>
          <p>
            {t('遇到问题？')}
            <button onClick={() => setContactOpen(true)}>{t('联系我们')}</button>
          </p>
        </section>

        <div className='pricing-marketing-divider'>
          <div />
        </div>

        <section className='pricing-marketing-section pricing-marketing-faq'>
          <div className='pricing-marketing-faq-grid'>
            <article className='pricing-marketing-faq-card pricing-marketing-faq-card--wide'>
              <h3>{t('订阅和按量付费谁优先消耗?')}</h3>
              <p>
                {t(
                  '订阅余额优先消耗。订阅余额会在30天内到期，为了保障您的权益，我们会优先扣除订阅余额。',
                )}
              </p>
            </article>

            <article className='pricing-marketing-faq-card pricing-marketing-faq-card--wide'>
              <h3>{t('订阅用完后是否可以立即再次购买?')}</h3>
              <p>
                {t(
                  '可以。每次订阅购买都是全新的，会给您一个新的30天周期和完整的新订阅余额。',
                )}
              </p>
            </article>

            <article className='pricing-marketing-faq-card pricing-marketing-faq-card--narrow'>
              <h3>{t('额度如何补充？')}</h3>
              <p>{t('您可以购买优惠订阅，也可以直接充值按量付费。')}</p>
            </article>

            <article className='pricing-marketing-faq-card pricing-marketing-faq-card--wide-plus'>
              <h3>{t('不同订阅可以使用什么模型？')}</h3>
              <p>
                {t(
                  '所有订阅/按量付费模式，均可使用 Claude Code和Codex。我们完全使用官方服务，因此总是第一时间支持最新模型！',
                )}
              </p>
            </article>
          </div>
        </section>

        <footer className='pricing-marketing-footer'>
          <div className='pricing-marketing-footer__inner'>
            <div className='pricing-marketing-footer__grid'>
              <div className='pricing-marketing-footer__column'>
                <h3>{t('产品')}</h3>
                <Link to='/about'>AI Force 介绍</Link>
                <Link to='/pricing'>{t('价格方案')}</Link>
                <Link to='/login'>{t('登录')}</Link>
              </div>

              <div className='pricing-marketing-footer__column'>
                <h3>{t('资源')}</h3>
                <Link to='/docs'>{t('使用教程')}</Link>
                <Link to='/about'>{t('品牌故事')}</Link>
              </div>

              <div className='pricing-marketing-footer__column'>
                <h3>{t('Claude 模型')}</h3>
                <span>Claude Opus 4</span>
                <span>Claude Sonnet 4.5</span>
                <span>Claude Haiku 3.5</span>
              </div>

              <div className='pricing-marketing-footer__column'>
                <h3>{t('服务承诺')}</h3>
                <span>{t('透明定价')}</span>
                <span>{t('隐私保护')}</span>
                <span>{t('安全合规')}</span>
              </div>

              <div className='pricing-marketing-footer__column'>
                <h3>{t('解决方案')}</h3>
                <span>{t('AI 编程助手')}</span>
                <span>{t('代码生成')}</span>
                <span>{t('技术支持')}</span>
              </div>

              <div className='pricing-marketing-footer__column'>
                <h3>{t('关于')}</h3>
                <Link to='/about'>{t('关于我们')}</Link>
                <a href='mailto:support@quantumnous.com'>{t('联系我们')}</a>
              </div>
            </div>

            <div className='pricing-marketing-footer__meta'>
              <p>© 2025 AI Force. {t('保留所有权利。')}</p>
            </div>
          </div>
        </footer>
      </main>

      {contactOpen && (
        <div
          className='pricing-marketing-contact-overlay'
          onClick={() => setContactOpen(false)}
        >
          <div
            className='pricing-marketing-contact-modal'
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className='pricing-marketing-contact-modal__close'
              onClick={() => setContactOpen(false)}
              aria-label={t('关闭')}
            >
              <X size={24} />
            </button>
            <h3>{t('扫码添加客服微信')}</h3>
            <div className='pricing-marketing-contact-modal__image-wrap'>
              <img
                src='/pricing-contact-qr.jpg'
                alt={t('客服微信二维码')}
                className='pricing-marketing-contact-modal__image'
              />
            </div>
            <p>{t('微信扫一扫，添加客服获取帮助')}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketingPricingPage;
