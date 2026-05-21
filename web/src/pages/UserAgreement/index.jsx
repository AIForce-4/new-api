import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userAgreementStyle, userAgreementBody } from './content';

const UserAgreement = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('用户协议');
  }, [t]);

  return (
    <>
      <style>{userAgreementStyle}</style>
      <div dangerouslySetInnerHTML={{ __html: userAgreementBody }} />
    </>
  );
};

export default UserAgreement;
