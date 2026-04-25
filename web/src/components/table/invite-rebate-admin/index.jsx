import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Input,
  Space,
  Table,
  Typography,
} from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { API, showError, timestamp2string } from '../../../helpers';

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
    </div>
  );
};

export default InviteRebateAdminTable;
