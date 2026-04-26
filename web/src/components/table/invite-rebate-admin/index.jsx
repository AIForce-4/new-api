import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Typography,
} from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import {
  API,
  renderQuota,
  showError,
  showSuccess,
  timestamp2string,
} from '../../../helpers';
import { displayAmountToQuota } from '../../../helpers/quota';

const { Text, Title } = Typography;
const pageSize = 10;

const InviteRebateAdminTable = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [summary, setSummary] = useState({
    total_records: 0,
    total_recharge_amount: 0,
    total_reward_amount: 0,
    unique_inviter_count: 0,
    unique_invitee_count: 0,
  });
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [withdrawUsername, setWithdrawUsername] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawUser, setWithdrawUser] = useState(null);
  const [withdrawQueryLoading, setWithdrawQueryLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const renderMoney = (value) => `¥ ${Number(value || 0).toFixed(2)}`;

  const renderUser = (name, id) => `${name || '-'} (#${id})`;

  const loadSummary = async () => {
    const res = await API.get('/api/invite_rebate/stat');
    const { success, message, data } = res.data;
    if (success) {
      setSummary(data || {});
    } else {
      showError(message);
    }
  };

  const loadRecords = async (currentPage = page) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        p: String(currentPage),
        page_size: String(pageSize),
      });
      if (keyword) {
        query.set('keyword', keyword);
      }
      const res = await API.get(`/api/invite_rebate/?${query.toString()}`);
      const { success, message, data } = res.data;
      if (success) {
        setRecords(data.items || []);
        setTotal(data.total || 0);
      } else {
        showError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadRecords(page);
  }, [page]);

  const handleSearch = () => {
    if (page === 1) {
      loadRecords(1);
    } else {
      setPage(1);
    }
  };

  const resetWithdrawModal = () => {
    setWithdrawUsername('');
    setWithdrawAmount(0);
    setWithdrawUser(null);
  };

  const closeWithdrawModal = () => {
    setWithdrawVisible(false);
    resetWithdrawModal();
  };

  const queryWithdrawUser = async () => {
    const username = withdrawUsername.trim();
    if (!username) {
      showError(t('请输入用户名'));
      return;
    }
    setWithdrawQueryLoading(true);
    try {
      const res = await API.get(
        `/api/invite_rebate/user?username=${encodeURIComponent(username)}`,
      );
      const { success, message, data } = res.data;
      if (success) {
        setWithdrawUser(data);
      } else {
        setWithdrawUser(null);
        showError(message);
      }
    } finally {
      setWithdrawQueryLoading(false);
    }
  };

  const withdrawRebate = async () => {
    if (!withdrawUser) {
      showError(t('请先查询用户'));
      return;
    }
    const quota = displayAmountToQuota(withdrawAmount);
    if (!quota || quota <= 0) {
      showError(t('请输入提现金额'));
      return;
    }
    setWithdrawLoading(true);
    try {
      const res = await API.post('/api/invite_rebate/withdraw', {
        username: withdrawUser.username,
        quota,
      });
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('提现成功'));
        closeWithdrawModal();
        await Promise.all([loadSummary(), loadRecords(page)]);
      } else {
        showError(message);
      }
    } finally {
      setWithdrawLoading(false);
    }
  };

  const columns = [
    {
      title: t('结算时间'),
      dataIndex: 'settled_at',
      render: (time) => (time ? timestamp2string(time) : '-'),
    },
    {
      title: t('邀请人'),
      dataIndex: 'inviter_username',
      render: (name, record) => renderUser(name, record.inviter_id),
    },
    {
      title: t('被邀请用户'),
      dataIndex: 'invitee_username',
      render: (name, record) => renderUser(name, record.invitee_id),
    },
    {
      title: t('订单号'),
      dataIndex: 'trade_no',
      render: (tradeNo) => <Text copyable>{tradeNo}</Text>,
    },
    {
      title: t('支付方式'),
      dataIndex: 'payment_method',
    },
    {
      title: t('充值金额'),
      dataIndex: 'recharge_amount',
      align: 'right',
      render: renderMoney,
    },
    {
      title: t('返佣金额'),
      dataIndex: 'reward_amount',
      align: 'right',
      render: (value) => (
        <Text style={{ color: '#d87350' }}>{renderMoney(value)}</Text>
      ),
    },
    {
      title: t('返佣比例'),
      dataIndex: 'rebate_rate',
      align: 'right',
      render: (value) => `${Number(value || 0).toFixed(2)}%`,
    },
    {
      title: t('封顶金额'),
      dataIndex: 'reward_cap',
      align: 'right',
      render: renderMoney,
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <Title heading={3} className='!mb-2'>
          {t('返佣统计')}
        </Title>
        <Text type='secondary'>{t('邀请返佣记录与汇总统计')}</Text>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4'>
        <Card className='!rounded-2xl'>
          <Text type='secondary'>{t('返佣记录数')}</Text>
          <div className='text-2xl font-bold mt-2'>
            {summary.total_records || 0}
          </div>
        </Card>
        <Card className='!rounded-2xl'>
          <Text type='secondary'>{t('累计充值金额')}</Text>
          <div className='text-2xl font-bold mt-2'>
            {renderMoney(summary.total_recharge_amount)}
          </div>
        </Card>
        <Card className='!rounded-2xl'>
          <Text type='secondary'>{t('累计返佣金额')}</Text>
          <div className='text-2xl font-bold mt-2 text-[#d87350]'>
            {renderMoney(summary.total_reward_amount)}
          </div>
        </Card>
        <Card className='!rounded-2xl'>
          <Text type='secondary'>{t('邀请人数')}</Text>
          <div className='text-2xl font-bold mt-2'>
            {summary.unique_inviter_count || 0}
          </div>
        </Card>
        <Card className='!rounded-2xl'>
          <Text type='secondary'>{t('被邀请用户数')}</Text>
          <div className='text-2xl font-bold mt-2'>
            {summary.unique_invitee_count || 0}
          </div>
        </Card>
      </div>

      <Card className='!rounded-2xl'>
        <Space className='mb-4'>
          <Input
            prefix={<Search size={14} />}
            placeholder={t('搜索订单号、支付方式或用户ID')}
            value={keyword}
            onChange={setKeyword}
            onEnterPress={handleSearch}
            style={{ width: 320 }}
          />
          <Button type='primary' onClick={handleSearch}>
            {t('搜索')}
          </Button>
          <Button theme='solid' type='warning' onClick={() => setWithdrawVisible(true)}>
            {t('返佣提现')}
          </Button>
        </Space>
        <Table
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={{
            currentPage: page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          empty={<Empty title={t('暂无数据')} />}
        />
      </Card>

      <Modal
        title={t('返佣提现')}
        visible={withdrawVisible}
        onCancel={closeWithdrawModal}
        onOk={withdrawRebate}
        confirmLoading={withdrawLoading}
        okText={t('确认提现')}
        cancelText={t('取消')}
      >
        <div className='space-y-4'>
          <Space align='end'>
            <Input
              label={t('用户名')}
              placeholder={t('请输入用户名')}
              value={withdrawUsername}
              onChange={(value) => {
                setWithdrawUsername(value);
                setWithdrawUser(null);
              }}
              onEnterPress={queryWithdrawUser}
              style={{ width: 260 }}
            />
            <Button loading={withdrawQueryLoading} onClick={queryWithdrawUser}>
              {t('查询用户')}
            </Button>
          </Space>

          {withdrawUser && (
            <Card className='!rounded-xl' bodyStyle={{ padding: 16 }}>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <Text type='secondary'>{t('用户名')}</Text>
                  <div className='font-semibold'>{withdrawUser.username}</div>
                </div>
                <div>
                  <Text type='secondary'>{t('显示名称')}</Text>
                  <div className='font-semibold'>{withdrawUser.display_name || '-'}</div>
                </div>
                <div>
                  <Text type='secondary'>{t('当前可用返佣额度')}</Text>
                  <div className='font-semibold text-[#d87350]'>
                    {renderQuota(withdrawUser.aff_quota || 0)}
                  </div>
                </div>
                <div>
                  <Text type='secondary'>{t('累计返佣')}</Text>
                  <div className='font-semibold'>
                    {renderQuota(withdrawUser.aff_history_quota || 0)}
                  </div>
                </div>
                <div>
                  <Text type='secondary'>{t('邀请人数')}</Text>
                  <div className='font-semibold'>{withdrawUser.aff_count || 0}</div>
                </div>
              </div>
            </Card>
          )}

          <InputNumber
            label={t('提现金额')}
            placeholder={t('请输入提现金额')}
            min={0}
            value={withdrawAmount}
            onChange={setWithdrawAmount}
            style={{ width: '100%' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default InviteRebateAdminTable;
