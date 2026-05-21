import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { privacyPolicyStyle, privacyPolicyBody } from './content';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('隐私政策');
  }, [t]);

  return (
    <>
      <style>{privacyPolicyStyle}</style>
      <div dangerouslySetInnerHTML={{ __html: privacyPolicyBody }} />
    </>
  );
};

export default PrivacyPolicy;
