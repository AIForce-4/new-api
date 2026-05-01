import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Empty,
  Image,
  Input,
  Modal,
  Progress,
  Spin,
  Table,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import { ArrowLeftRight, Copy, Wallet } from 'lucide-react';
import {
  API,
  copy,
  getQuotaPerUnit,
  renderQuota,
  showError,
  showSuccess,
  timestamp2string,
} from '../../helpers';
import { displayAmountToQuota, quotaToDisplayAmount } from '../../helpers/quota';
import { UserContext } from '../../context/User';
import TransferModal from '../topup/modals/TransferModal';

const { Text, Title } = Typography;
const pageSize = 10;

const InviteRebate = () => {
  const { t } = useTranslation();
  const [userState, userDispatch] = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [openTransfer, setOpenTransfer] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [transferAmount, setTransferAmount] = useState(getQuotaPerUnit());
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [invitedUsersLoading, setInvitedUsersLoading] = useState(false);
  const [invitedUsersTotal, setInvitedUsersTotal] = useState(0);
  const [invitedUsersPage, setInvitedUsersPage] = useState(1);
  const [rewardDetails, setRewardDetails] = useState([]);
  const [rewardDetailsLoading, setRewardDetailsLoading] = useState(false);
  const [rewardDetailsTotal, setRewardDetailsTotal] = useState(0);
  const [rewardDetailsPage, setRewardDetailsPage] = useState(1);

  const inviteLink = useMemo(() => {
    if (!inviteCode) return '';
    return `${window.location.origin}/register?aff=${inviteCode}`;
  }, [inviteCode]);

  const user = userState?.user || {};
  const availableReward = user.aff_quota || 0;
  const totalReward = user.aff_history_quota || 0;
  const transferredReward = Math.max(totalReward - availableReward, 0);

  const getUserInfo = async () => {
    const res = await API.get('/api/user/self');
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
      if (data?.aff_code) {
        setInviteCode(data.aff_code);
      }
      return data;
    }
    showError(message);
    return null;
  };

  const getInviteCode = async () => {
    const res = await API.get('/api/user/aff');
    const { success, message, data } = res.data;
    if (success) {
      setInviteCode(data);
      return data;
    }
    showError(message);
    return '';
  };

  const loadInviteData = async () => {
    setLoading(true);
    try {
      await Promise.all([getUserInfo(), getInviteCode()]);
    } finally {
      setLoading(false);
    }
  };

  const transfer = async () => {
    const transferQuota = displayAmountToQuota(transferAmount);
    if (transferQuota < getQuotaPerUnit()) {
      showError(t('划转金额最低为') + ' ' + renderQuota(getQuotaPerUnit()));
      return;
    }
    if (transferQuota > availableReward) {
      showError(t('邀请额度不足'));
      return;
    }
    const res = await API.post('/api/user/aff_transfer', {
      quota: transferQuota,
    });
    const { success, message } = res.data;
    if (success) {
      showSuccess(message);
      setOpenTransfer(false);
      await getUserInfo();
      await loadRewardDetails(rewardDetailsPage);
    } else {
      showError(message);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!inviteCode) return;
    await copy(inviteCode);
    showSuccess(t('邀请码已复制到剪贴板'));
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return;
    await copy(inviteLink);
    showSuccess(t('邀请链接已复制到剪贴板'));
  };

  const loadInvitedUsers = async (currentPage = invitedUsersPage) => {
    setInvitedUsersLoading(true);
    try {
      const res = await API.get(
        `/api/user/invite-rebate/users?p=${currentPage}&page_size=${pageSize}`,
      );
      const { success, message, data } = res.data;
      if (success) {
        setInvitedUsers(data.items || []);
        setInvitedUsersTotal(data.total || 0);
      } else {
        showError(message);
      }
    } finally {
      setInvitedUsersLoading(false);
    }
  };

  const loadRewardDetails = async (currentPage = rewardDetailsPage) => {
    setRewardDetailsLoading(true);
    try {
      const res = await API.get(
        `/api/user/invite-rebate/details?p=${currentPage}&page_size=${pageSize}`,
      );
      const { success, message, data } = res.data;
      if (success) {
        setRewardDetails(data.items || []);
        setRewardDetailsTotal(data.total || 0);
      } else {
        showError(message);
      }
    } finally {
      setRewardDetailsLoading(false);
    }
  };

  const renderMoney = (value) => `¥ ${Number(value || 0).toFixed(2)}`;

  const renderTime = (time) => (time ? timestamp2string(time) : '-');

  useEffect(() => {
    loadInviteData();
    setTransferAmount(quotaToDisplayAmount(getQuotaPerUnit()));
  }, []);

  useEffect(() => {
    loadInvitedUsers(invitedUsersPage);
  }, [invitedUsersPage]);

  useEffect(() => {
    loadRewardDetails(rewardDetailsPage);
  }, [rewardDetailsPage]);

  const invitedUserColumns = [
    {
      title: t('用户标识'),
      dataIndex: 'user_identifier',
      render: (value, record) => (
        <div className='flex items-center gap-2'>
          <span>{value}</span>
          {record.invite_tags?.map((tag) => (
            <Tag key={tag} color='red'>
              {t(tag)}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: t('邀请时间'),
      dataIndex: 'invite_time',
      render: renderTime,
    },
    {
      title: t('累计充值金额'),
      dataIndex: 'cumulative_recharge_amount',
      align: 'right',
      render: renderMoney,
    },
    {
      title: t('累计奖励'),
      dataIndex: 'cumulative_reward_amount',
      align: 'right',
      render: (value) => (
        <Text style={{ color: '#d87350' }}>{renderMoney(value)}</Text>
      ),
    },
    {
      title: t('奖励进度'),
      dataIndex: 'reward_progress',
      render: (progress) => (
        <div className='min-w-[160px]'>
          <Progress
            percent={Number(progress?.progress_percent || 0)}
            stroke='#d87350'
            showInfo={false}
          />
          <Text type='secondary' size='small'>
            {Number(progress?.progress_percent || 0).toFixed(2)}%
          </Text>
        </div>
      ),
    },
  ];

  const rewardColumns = [
    {
      title: t('时间'),
      dataIndex: 'time',
      render: renderTime,
    },
    {
      title: t('奖励类型'),
      dataIndex: 'type',
      render: (type) => {
        const isWithdrawal = type === 'withdrawal';
        const isTransfer = type === 'transfer';
        return (
          <Tag color={isWithdrawal ? 'orange' : isTransfer ? 'blue' : 'green'}>
            {t(isWithdrawal ? '返佣提现' : isTransfer ? '返佣划转' : '返佣奖励')}
          </Tag>
        );
      },
    },
    {
      title: t('来源/说明'),
      dataIndex: 'invited_user_identifier',
      render: (value, record) => {
        if (record.type === 'withdrawal' || record.type === 'transfer') {
          return record.remark || t(record.type === 'transfer' ? '转入钱包' : '返佣提现');
        }
        return value || '-';
      },
    },
    {
      title: t('充值金额'),
      dataIndex: 'recharge_amount',
      align: 'right',
      render: (value, record) =>
        record.type === 'withdrawal' || record.type === 'transfer'
          ? '-'
          : renderMoney(value),
    },
    {
      title: t('奖励金额'),
      dataIndex: 'reward_amount',
      align: 'right',
      render: (value, record) => {
        const isOutgoing = record.type === 'withdrawal' || record.type === 'transfer';
        return (
          <Text style={{ color: isOutgoing ? '#d64d4d' : '#d87350' }}>
            {isOutgoing ? `- ${renderMoney(value)}` : renderMoney(value)}
          </Text>
        );
      },
    },
  ];

  return (
    <div className='console-page-shell'>
      <div className='console-page-shell__inner console-page-shell__inner--workspace relative w-full min-h-screen lg:min-h-0'>
        <TransferModal
          t={t}
          openTransfer={openTransfer}
          transfer={transfer}
          handleTransferCancel={() => setOpenTransfer(false)}
          userState={userState}
          renderQuota={renderQuota}
          getQuotaPerUnit={getQuotaPerUnit}
          transferAmount={transferAmount}
          setTransferAmount={setTransferAmount}
        />

        <Modal
          title={t('申请提现')}
          visible={openWithdraw}
          onOk={() => setOpenWithdraw(false)}
          onCancel={() => setOpenWithdraw(false)}
          okText={t('我知道了')}
          cancelButtonProps={{ style: { display: 'none' } }}
          centered
        >
          <div className='flex flex-col items-center gap-4 text-center'>
            <Text>{t('提现申请需联系客服人工处理，请扫码添加客服并备注提现账号信息。')}</Text>
            <Image
              width={220}
              src='/pricing-contact-qr.jpg'
              alt={t('客服二维码')}
              preview={false}
            />
            <Text type='secondary'>
              {t('如二维码无法识别，请联系平台客服获取提现协助。')}
            </Text>
          </div>
        </Modal>

        <Spin spinning={loading}>
          <div className='mb-8'>
            <Title heading={2} className='!mb-3'>
              {t('邀请返利')}
            </Title>
            <Text type='secondary' size='large'>
              {t('被邀请用户充值后，奖励将进入邀请奖励账户')}
            </Text>
          </div>

          <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6'>
            <Card className='!rounded-2xl shadow-sm border-0'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                <Title heading={4} className='!mb-0'>
                  {t('邀请奖励账户')}
                </Title>
                <div className='flex gap-3'>
                  <Button
                    type='primary'
                    theme='solid'
                    icon={<ArrowLeftRight size={16} />}
                    disabled={!availableReward || availableReward <= 0}
                    onClick={() => setOpenTransfer(true)}
                  >
                    {t('转入钱包')}
                  </Button>
                  <Button
                    theme='solid'
                    icon={<Wallet size={16} />}
                    onClick={() => setOpenWithdraw(true)}
                  >
                    {t('申请提现')}
                  </Button>
                </div>
              </div>
              <div className='border-t border-solid border-[var(--semi-color-border)] pt-8'>
                <div className='text-5xl font-bold mb-4'>
                  {renderQuota(availableReward)}
                </div>
                <Text type='secondary'>{t('可转入钱包用于按量付费')}</Text>
              </div>
            </Card>

            <Card className='!rounded-2xl shadow-sm border-0'>
              <Title heading={4} className='!mb-6'>
                {t('邀请统计概览')}
              </Title>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-solid border-[var(--semi-color-border)] pt-8'>
                <div>
                  <Text type='secondary'>{t('生效邀请人数')}</Text>
                  <div className='text-3xl font-bold mt-4'>
                    {user.aff_count || 0}
                  </div>
                </div>
                <div>
                  <Text type='secondary'>{t('累计获得奖励')}</Text>
                  <div className='text-3xl font-bold mt-4'>
                    {renderQuota(totalReward)}
                  </div>
                </div>
                <div>
                  <Text type='secondary'>{t('累计转入钱包')}</Text>
                  <div className='text-3xl font-bold mt-4 text-[#d87350]'>
                    {renderQuota(transferredReward)}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className='!rounded-2xl shadow-sm border-0 !my-6'>
            <Title heading={4} className='!mb-6'>
              {t('邀请信息')}
            </Title>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <Input
                value={inviteCode}
                readonly
                prefix={t('我的邀请码')}
                suffix={
                  <Button
                    type='primary'
                    theme='solid'
                    icon={<Copy size={14} />}
                    disabled={!inviteCode}
                    onClick={handleCopyInviteCode}
                  >
                    {t('复制')}
                  </Button>
                }
              />
              <Input
                value={inviteLink}
                readonly
                prefix={t('我的邀请链接')}
                suffix={
                  <Button
                    type='primary'
                    theme='solid'
                    icon={<Copy size={14} />}
                    disabled={!inviteLink}
                    onClick={handleCopyInviteLink}
                  >
                    {t('复制')}
                  </Button>
                }
              />
            </div>
          </Card>

          <Card className='!rounded-2xl shadow-sm border-0 !my-6'>
            <Title heading={4} className='!mb-6'>
              {t('被邀请用户列表')}
            </Title>
            <Table
              columns={invitedUserColumns}
              dataSource={invitedUsers}
              loading={invitedUsersLoading}
              pagination={{
                currentPage: invitedUsersPage,
                pageSize,
                total: invitedUsersTotal,
                onPageChange: setInvitedUsersPage,
              }}
              empty={<Empty title={t('暂无邀请用户')} />}
            />
          </Card>

          <Card className='!rounded-2xl shadow-sm border-0 !my-6'>
            <Title heading={4} className='!mb-6'>
              {t('奖励事件明细')}
            </Title>
            <Table
              columns={rewardColumns}
              dataSource={rewardDetails}
              loading={rewardDetailsLoading}
              pagination={{
                currentPage: rewardDetailsPage,
                pageSize,
                total: rewardDetailsTotal,
                onPageChange: setRewardDetailsPage,
              }}
              empty={<Empty title={t('暂无奖励明细')} />}
            />
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default InviteRebate;
