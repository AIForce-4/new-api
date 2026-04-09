import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  TextArea,
  Toast,
  Typography,
} from '@douyinfe/semi-ui';
import {
  IconDelete,
  IconEdit,
  IconRefresh,
  IconPlus,
} from '@douyinfe/semi-icons';
import { API, showError, showSuccess } from '../../../helpers';

const { Title, Text } = Typography;

const PROVIDER_TYPES = [
  { label: '标准 new-api (格瓦斯 / 星辰AI)', value: 'new-api' },
  { label: 'NekoCode', value: 'nekocode' },
  { label: 'Pincc', value: 'pincc' },
  { label: 'AICodeMirror', value: 'aicodemirror' },
];

const CURRENCIES = [
  { label: 'USD', value: 'USD' },
  { label: 'CNY (¥)', value: 'CNY' },
];

const emptyForm = {
  name: '',
  type: 'new-api',
  base_url: '',
  username: '',
  password: '',
  extra_config: '',
  check_interval_minutes: 60,
  balance_currency: 'USD',
  enabled: true,
};

function formatTime(ts) {
  if (!ts) return '从未';
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return d.toLocaleDateString('zh-CN');
}

function BalanceDisplay({ wallet }) {
  const symbol = wallet.balance_currency === 'CNY' ? '¥' : '$';
  const todaySpend = wallet.today_spend ?? 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Text strong style={{ fontSize: 20 }}>
        {symbol}
        {wallet.last_balance?.toFixed(4) ?? '--'}
      </Text>
      <Text type='secondary' size='small'>
        今日花费: {symbol}
        {todaySpend.toFixed(4)}
      </Text>
      <Text type='tertiary' size='small'>
        上次更新: {formatTime(wallet.last_checked_at)}
      </Text>
    </div>
  );
}

function WalletCard({ wallet, onRefresh, onEdit, onDelete }) {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await API.post(`/api/provider_wallet/${wallet.id}/check`);
      if (res.data.success) {
        showSuccess('余额已更新');
        onRefresh(res.data.data);
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      showError(e.message);
    } finally {
      setChecking(false);
    }
  };

  const typeLabel =
    PROVIDER_TYPES.find((t) => t.value === wallet.type)?.label ?? wallet.type;

  return (
    <Card
      style={{
        borderRadius: 8,
        opacity: wallet.enabled ? 1 : 0.6,
      }}
      headerExtraContent={
        <Space>
          <Button
            icon={<IconRefresh />}
            size='small'
            theme='borderless'
            loading={checking}
            onClick={handleCheck}
            title='立即刷新余额'
          />
          <Button
            icon={<IconEdit />}
            size='small'
            theme='borderless'
            onClick={() => onEdit(wallet)}
          />
          <Popconfirm
            title='确认删除'
            content={`确定删除供应商"${wallet.name}"吗？`}
            onConfirm={() => onDelete(wallet.id)}
          >
            <Button
              icon={<IconDelete />}
              size='small'
              theme='borderless'
              type='danger'
            />
          </Popconfirm>
        </Space>
      }
      title={
        <Space>
          <Text strong>{wallet.name}</Text>
          <Tag size='small' color='blue'>
            {typeLabel}
          </Tag>
          {!wallet.enabled && (
            <Tag size='small' color='grey'>
              已禁用
            </Tag>
          )}
        </Space>
      }
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <BalanceDisplay wallet={wallet} />
        <Text type='tertiary' size='small'>
          每 {wallet.check_interval_minutes} 分钟更新
        </Text>
      </div>
      <Text
        type='tertiary'
        size='small'
        style={{ marginTop: 8, display: 'block' }}
      >
        {wallet.base_url}
      </Text>
    </Card>
  );
}

export default function ProviderWalletTable() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/provider_wallet/');
      if (res.data.success) {
        setWallets(res.data.data ?? []);
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (wallet) => {
    setEditing(wallet);
    setForm({
      name: wallet.name,
      type: wallet.type,
      base_url: wallet.base_url,
      username: wallet.username ?? '',
      password: '', // never pre-fill password
      extra_config: wallet.extra_config ?? '',
      check_interval_minutes: wallet.check_interval_minutes ?? 60,
      balance_currency: wallet.balance_currency ?? 'USD',
      enabled: wallet.enabled,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.type || !form.base_url) {
      Toast.warning({ content: '请填写名称、类型和接口地址', duration: 3 });
      return;
    }
    setSaving(true);
    try {
      let res;
      if (editing) {
        res = await API.put(`/api/provider_wallet/${editing.id}`, form);
      } else {
        res = await API.post('/api/provider_wallet/', form);
      }
      if (res.data.success) {
        showSuccess(editing ? '已更新' : '已创建');
        setModalOpen(false);
        fetchWallets();
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      showError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await API.delete(`/api/provider_wallet/${id}`);
      if (res.data.success) {
        showSuccess('已删除');
        setWallets((prev) => prev.filter((w) => w.id !== id));
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      showError(e.message);
    }
  };

  const handleRefresh = (updated) => {
    setWallets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const f = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div style={{ padding: '0 8px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title heading={5} style={{ margin: 0 }}>
          供应商管理
        </Title>
        <Space>
          <Button icon={<IconRefresh />} onClick={fetchWallets} loading={loading}>
            刷新
          </Button>
          <Button
            icon={<IconPlus />}
            theme='solid'
            type='primary'
            onClick={openCreate}
          >
            新增供应商
          </Button>
        </Space>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size='large' />
        </div>
      ) : wallets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
          暂无供应商，点击"新增供应商"添加
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {wallets.map((w) => (
            <WalletCard
              key={w.id}
              wallet={w}
              onRefresh={handleRefresh}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        title={editing ? '编辑供应商' : '新增供应商'}
        visible={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editing ? '保存' : '创建'}
        cancelText='取消'
        confirmLoading={saving}
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: '名称', key: 'name', placeholder: '如：格瓦斯', required: true },
            { label: '接口地址', key: 'base_url', placeholder: '如：https://api.kvas.cc', required: true },
            { label: '用户名', key: 'username', placeholder: '登录用户名或邮箱/手机号' },
          ].map(({ label, key, placeholder, required }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 110, textAlign: 'right', flexShrink: 0 }}>
                {required && <span style={{ color: 'red' }}>* </span>}{label}
              </span>
              <Input
                style={{ flex: 1 }}
                placeholder={placeholder}
                value={form[key]}
                onChange={(v) => f(key)(v)}
              />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 110, textAlign: 'right', flexShrink: 0 }}>密码</span>
            <Input
              style={{ flex: 1 }}
              mode='password'
              placeholder={editing ? '留空表示不修改密码' : '登录密码'}
              value={form.password}
              onChange={(v) => f('password')(v)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 110, textAlign: 'right', flexShrink: 0 }}>
              <span style={{ color: 'red' }}>* </span>类型
            </span>
            <Select
              style={{ flex: 1 }}
              value={form.type}
              onChange={f('type')}
              optionList={PROVIDER_TYPES}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 110, textAlign: 'right', flexShrink: 0 }}>余额币种</span>
            <Select
              style={{ flex: 1 }}
              value={form.balance_currency}
              onChange={f('balance_currency')}
              optionList={CURRENCIES}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 110, textAlign: 'right', flexShrink: 0 }}>更新间隔(分钟)</span>
            <InputNumber
              style={{ flex: 1 }}
              min={1}
              value={form.check_interval_minutes}
              onChange={f('check_interval_minutes')}
              innerButtons
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ width: 110, textAlign: 'right', flexShrink: 0, paddingTop: 6 }}>额外配置</span>
            <TextArea
              style={{ flex: 1 }}
              placeholder='可选 JSON，如 {"email":"xxx","phone":"xxx"}'
              value={form.extra_config}
              onChange={(v) => f('extra_config')(v)}
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 110, textAlign: 'right', flexShrink: 0 }}>启用</span>
            <Switch checked={form.enabled} onChange={f('enabled')} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
