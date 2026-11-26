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
const price = (value) => `${value} / 1M tokens`;

const formulaTable = (
  channelHeaders,
  simpleRatios,
  modelRatios,
  includeCacheCreation = true,
) => ({
  headers: ['公式名称', ...channelHeaders],
  rows: [
    {
      key: 'simple',
      cells: [
        { label: '公式名称', content: '简易公式', strong: true },
        ...channelHeaders.map((channel, index) => ({
          label: channel,
          content: simpleRatios[index],
          accent: index === 0,
        })),
      ],
    },
    {
      key: 'ratio',
      cells: [
        { label: '公式名称', content: 'NewAPI倍率语言', strong: true },
        ...channelHeaders.map((channel, index) => ({
          label: channel,
          content: modelRatios[index],
        })),
      ],
    },
    {
      key: 'full',
      cells: [
        { label: '公式名称', content: '完整公式', strong: true },
        {
          label: '公式内容',
          content: includeCacheCreation
            ? '官方价格（输入token × 输入价格 + 输出token × 输出价格 + 缓存创建 × 价格 + 缓存读取 × 价格） × 渠道折扣'
            : '官方价格（输入token × 输入价格 + 输出token × 输出价格 + 缓存读取 × 价格） × 渠道折扣',
          colSpan: channelHeaders.length,
        },
      ],
    },
  ],
});

const formatPrice = (value) => {
  if (value === null || value === undefined || value === '' || value === '-') {
    return '-';
  }
  return price(value);
};

const priceCell = (label, value) => {
  if (Array.isArray(value)) {
    return {
      label,
      tiers: value.map(([tierLabel, tierValue]) => ({
        label: tierLabel,
        content: formatPrice(tierValue),
      })),
    };
  }

  return { label, content: formatPrice(value) };
};

const modelRow = (
  key,
  modelName,
  inputPrice,
  outputPrice,
  cacheCreationPrice,
  cacheReadPrice,
  description,
  includeCacheCreation = true,
) => ({
  key,
  cells: [
    { label: '模型名称', content: modelName, strong: true },
    priceCell('输入价格', inputPrice),
    priceCell('输出价格', outputPrice),
    ...(includeCacheCreation
      ? [priceCell('缓存创建', cacheCreationPrice)]
      : []),
    priceCell('缓存读取', cacheReadPrice),
    { label: '描述', content: description, muted: true },
  ],
});

// Official list prices, checked 2026-11-25:
// https://platform.claude.com/docs/en/about-claude/pricing
// https://developers.openai.com/api/docs/pricing
// https://aistudio.google.com/docs/pricing
const claudeRows = [
  modelRow(
    'claude-fable-5-2',
    'claude-fable-5-2',
    '$8.00',
    '$40.00',
    '$10.00',
    '$0.20',
    '面向高要求推理和长周期 Agent 任务',
  ),
  modelRow(
    'claude-opus-5-5',
    'claude-opus-5-5',
    '$4.00',
    '$20.00',
    '$5.00',
    '$0.20',
    '面向长时间 Agent 式编码和知识工作',
  ),
  modelRow(
    'claude-sonnet-5-5',
    'claude-sonnet-5-5',
    '$2.00',
    '$10.00',
    '$2.50',
    '$0.10',
    '速度与智能平衡，适合大多数日常任务',
  ),
  modelRow(
    'claude-haiku-5-5',
    'claude-haiku-5-5',
    '$0.10',
    '$0.50',
    '$0.125',
    '$0.01',
    '请求不超过 100K tokens；适合高吞吐、低延迟任务',
  ),
  modelRow(
    'claude-haiku-5-5-long-context',
    'claude-haiku-5-5（长上下文）',
    '$0.50',
    '$2.50',
    '$0.625',
    '$0.05',
    '请求超过 100K tokens 时按此档计费',
  ),
  modelRow(
    'claude-mythos-5-2',
    'claude-mythos-5-2',
    '$8.00',
    '$40.00',
    '$10.00',
    '$0.20',
    '官方页面列出的专用模型，使用前需要资格验证',
  ),
  modelRow(
    'claude-fable-5-1',
    'claude-fable-5-1',
    '$10.00',
    '$50.00',
    '$12.50',
    '$0.25',
    '上一代 Fable 模型',
  ),
  modelRow(
    'claude-mythos-5-1',
    'claude-mythos-5-1',
    '$10.00',
    '$50.00',
    '$12.50',
    '$0.25',
    '官方页面列出的专用模型，使用前需要资格验证',
  ),
  modelRow(
    'claude-fable-5',
    'claude-fable-5',
    '$10.00',
    '$50.00',
    '$12.50',
    '$1.00',
    '上一代 Fable 模型',
  ),
  modelRow(
    'claude-mythos-5',
    'claude-mythos-5',
    '$10.00',
    '$50.00',
    '$12.50',
    '$1.00',
    '官方页面列出的专用模型，使用前需要资格验证',
  ),
  modelRow(
    'claude-opus-5',
    'claude-opus-5',
    '$5.00',
    '$25.00',
    '$6.25',
    '$0.50',
    '上一代 Opus 模型，适合复杂推理和 Agent 任务',
  ),
  modelRow(
    'claude-opus-4-8',
    'claude-opus-4-8',
    '$5.00',
    '$25.00',
    '$6.25',
    '$0.50',
    '上一代 Opus 模型',
  ),
  modelRow(
    'claude-opus-4-7',
    'claude-opus-4-7',
    '$5.00',
    '$25.00',
    '$6.25',
    '$0.50',
    '上一代 Opus 模型',
  ),
  modelRow(
    'claude-opus-4-6',
    'claude-opus-4-6',
    '$5.00',
    '$25.00',
    '$6.25',
    '$0.50',
    '上一代 Opus 模型',
  ),
  modelRow(
    'claude-opus-4-5',
    'claude-opus-4-5',
    '$5.00',
    '$25.00',
    '$6.25',
    '$0.50',
    '上一代 Opus 模型',
  ),
  modelRow(
    'claude-sonnet-5',
    'claude-sonnet-5',
    '$2.00',
    '$10.00',
    '$2.50',
    '$0.20',
    '上一代 Sonnet 模型',
  ),
  modelRow(
    'claude-sonnet-4-6',
    'claude-sonnet-4-6',
    '$3.00',
    '$15.00',
    '$3.75',
    '$0.30',
    '上一代 Sonnet 模型',
  ),
  modelRow(
    'claude-sonnet-4-5',
    'claude-sonnet-4-5',
    '$3.00',
    '$15.00',
    '$3.75',
    '$0.30',
    '上一代 Sonnet 模型',
  ),
  modelRow(
    'claude-haiku-4-5',
    'claude-haiku-4-5-20251001',
    '$1.00',
    '$5.00',
    '$1.25',
    '$0.10',
    '上一代 Haiku 模型，快速响应并适合简单任务',
  ),
];

const codexRows = [
  modelRow(
    'gpt-6-2-astra',
    'gpt-6.2-astra',
    '$8.00',
    '$40.00',
    '$10.00',
    '$0.40',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-6-2-astra-long-context',
    'gpt-6.2-astra（长上下文）',
    '$16.00',
    '$60.00',
    '$20.00',
    '$0.80',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-6-2-sol',
    'gpt-6.2-sol',
    '$2.00',
    '$10.00',
    '$2.50',
    '$0.10',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-6-2-sol-long-context',
    'gpt-6.2-sol（长上下文）',
    '$4.00',
    '$15.00',
    '$5.00',
    '$0.20',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-6-astra',
    'gpt-6-astra',
    '$10.00',
    '$50.00',
    '$12.50',
    '$1.00',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-6-astra-long-context',
    'gpt-6-astra（长上下文）',
    '$20.00',
    '$75.00',
    '$25.00',
    '$2.00',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-6-1-sol',
    'gpt-6.1-sol',
    '$2.00',
    '$10.00',
    '$2.50',
    '$0.10',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-6-1-sol-long-context',
    'gpt-6.1-sol（长上下文）',
    '$4.00',
    '$15.00',
    '$5.00',
    '$0.20',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-6-1-terra',
    'gpt-6.1-terra',
    '$1.00',
    '$5.00',
    '$1.25',
    '$0.05',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-6-1-terra-long-context',
    'gpt-6.1-terra（长上下文）',
    '$2.00',
    '$7.50',
    '$2.50',
    '$0.10',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-6-luna',
    'gpt-6-luna',
    '$0.10',
    '$0.50',
    '$0.125',
    '$0.01',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-6-luna-long-context',
    'gpt-6-luna（长上下文）',
    '$0.20',
    '$0.75',
    '$0.25',
    '$0.02',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-6-sol',
    'gpt-6-sol',
    '$2.00',
    '$10.00',
    '$2.50',
    '$0.20',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-6-sol-long-context',
    'gpt-6-sol（长上下文）',
    '$4.00',
    '$15.00',
    '$5.00',
    '$0.40',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-5-6-sol',
    'gpt-5.6-sol',
    '$4.00',
    '$20.00',
    '$5.00',
    '$0.40',
    '官方促销价，有效期至 2026-11-30；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-5-6-sol-long-context',
    'gpt-5.6-sol（长上下文）',
    '$8.00',
    '$30.00',
    '$10.00',
    '$0.80',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-5-6-terra',
    'gpt-5.6-terra',
    '$2.00',
    '$12.00',
    '$2.50',
    '$0.20',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-5-6-terra-long-context',
    'gpt-5.6-terra（长上下文）',
    '$4.00',
    '$18.00',
    '$5.00',
    '$0.40',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-5-6-luna',
    'gpt-5.6-luna',
    '$0.20',
    '$1.20',
    '$0.25',
    '$0.02',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-5-6-luna-long-context',
    'gpt-5.6-luna（长上下文）',
    '$0.40',
    '$1.80',
    '$0.50',
    '$0.04',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-5-5',
    'gpt-5.5',
    '$5.00',
    '$30.00',
    '-',
    '$0.50',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-5-5-long-context',
    'gpt-5.5（长上下文）',
    '$10.00',
    '$45.00',
    '-',
    '$1.00',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-5-5-pro',
    'gpt-5.5-pro',
    '$30.00',
    '$180.00',
    '-',
    '-',
    '官方标准价；输入不超过 272K tokens，不提供缓存读取价格',
  ),
  modelRow(
    'gpt-5-5-pro-long-context',
    'gpt-5.5-pro（长上下文）',
    '$60.00',
    '$270.00',
    '-',
    '-',
    '输入超过 272K tokens 时按此档计费，不提供缓存读取价格',
  ),
  modelRow(
    'gpt-5-4',
    'gpt-5.4',
    '$2.50',
    '$15.00',
    '-',
    '$0.25',
    '官方标准价；输入不超过 272K tokens',
  ),
  modelRow(
    'gpt-5-4-long-context',
    'gpt-5.4（长上下文）',
    '$5.00',
    '$22.50',
    '-',
    '$0.50',
    '输入超过 272K tokens 时按此档计费',
  ),
  modelRow(
    'gpt-5-4-pro',
    'gpt-5.4-pro',
    '$30.00',
    '$180.00',
    '-',
    '-',
    '官方标准价；输入不超过 272K tokens，不提供缓存读取价格',
  ),
  modelRow(
    'gpt-5-4-pro-long-context',
    'gpt-5.4-pro（长上下文）',
    '$60.00',
    '$270.00',
    '-',
    '-',
    '输入超过 272K tokens 时按此档计费，不提供缓存读取价格',
  ),
];

const geminiRows = [
  modelRow(
    'gemini-4-carbon',
    'gemini-4-carbon',
    [
      ['当前', '$2.00'],
      ['2026/12/1 起', '$4.00'],
    ],
    [
      ['当前', '$10.00'],
      ['2026/12/1 起', '$20.00'],
    ],
    '',
    [
      ['当前', '$0.10'],
      ['2026/12/1 起', '$0.20'],
    ],
    '最强推理与长任务模型，支持 1M 上下文；当前为官方限时价',
    false,
  ),
  modelRow(
    'gemini-4-argon',
    'gemini-4-argon',
    [
      ['当前', '$2.00'],
      ['2026/12/1 起', '$4.00'],
    ],
    [
      ['当前', '$10.00'],
      ['2026/12/1 起', '$20.00'],
    ],
    '',
    [
      ['当前', '$0.10'],
      ['2026/12/1 起', '$0.20'],
    ],
    '高效前沿推理模型，复杂编码和 Agent 任务速度更快；当前为官方限时价',
    false,
  ),
  modelRow(
    'gemini-4-neon',
    'gemini-4-neon',
    '$3.00',
    '$15.00',
    '',
    '$0.15',
    '前沿智能模型，适合复杂软件工程、知识工作和科学任务',
    false,
  ),
  modelRow(
    'gemini-4-hydrogen',
    'gemini-4-hydrogen',
    '$1.50',
    '$7.50',
    '',
    '$0.075',
    '面向日常编码和 Agent 工作流的高性价比模型，支持 1M 上下文',
    false,
  ),
  modelRow(
    'gemini-3-8-flash',
    'gemini-3.8-flash',
    [
      ['当前', '$0.75'],
      ['2027/1/1 起', '$1.50'],
    ],
    [
      ['当前', '$3.75'],
      ['2027/1/1 起', '$7.50'],
    ],
    '',
    [
      ['当前', '$0.075'],
      ['2027/1/1 起', '$0.15'],
    ],
    '快速、高性价比模型；当前为官方优惠价',
    false,
  ),
  modelRow(
    'gemini-3-6-flash',
    'gemini-3.6-flash',
    [
      ['当前', '$0.75'],
      ['2027/1/1 起', '$1.50'],
    ],
    [
      ['当前', '$3.75'],
      ['2027/1/1 起', '$7.50'],
    ],
    '',
    [
      ['当前', '$0.075'],
      ['2027/1/1 起', '$0.15'],
    ],
    '上一代 Flash 模型；当前为官方优惠价',
    false,
  ),
  modelRow(
    'gemini-3-5-flash-lite',
    'gemini-3.5-flash-lite',
    '$0.30',
    '$2.50',
    '',
    '$0.03',
    '低延迟轻量模型，适合高吞吐文本和多模态输入',
    false,
  ),
  modelRow(
    'gemini-3-1-pro-preview',
    'gemini-3.1-pro-preview',
    [
      ['≤200K', '$2.00'],
      ['>200K', '$4.00'],
    ],
    [
      ['≤200K', '$12.00'],
      ['>200K', '$18.00'],
    ],
    '',
    [
      ['≤200K', '$0.20'],
      ['>200K', '$0.40'],
    ],
    'Pro 预览模型，按输入长度分档计费',
    false,
  ),
  modelRow(
    'gemini-3-flash-preview',
    'gemini-3-flash-preview',
    [
      ['文本/图像/视频', '$0.50'],
      ['音频', '$1.00'],
    ],
    '$3.00',
    '',
    [
      ['文本/图像/视频', '$0.05'],
      ['音频', '$0.10'],
    ],
    '快速预览模型，不同输入模态价格不同',
    false,
  ),
  modelRow(
    'gemini-2-5-pro',
    'gemini-2.5-pro',
    [
      ['≤200K', '$1.25'],
      ['>200K', '$2.50'],
    ],
    [
      ['≤200K', '$10.00'],
      ['>200K', '$15.00'],
    ],
    '',
    [
      ['≤200K', '$0.125'],
      ['>200K', '$0.25'],
    ],
    '上一代 Pro 模型，按输入长度分档计费',
    false,
  ),
  modelRow(
    'gemini-2-5-flash',
    'gemini-2.5-flash',
    [
      ['文本/图像/视频', '$0.30'],
      ['音频', '$1.00'],
    ],
    '$2.50',
    '',
    [
      ['文本/图像/视频', '$0.03'],
      ['音频', '$0.10'],
    ],
    '上一代 Flash 模型，不同输入模态价格不同',
    false,
  ),
  modelRow(
    'gemini-2-5-flash-lite',
    'gemini-2.5-flash-lite',
    [
      ['文本/图像/视频', '$0.10'],
      ['音频', '$0.30'],
    ],
    '$0.40',
    '',
    [
      ['文本/图像/视频', '$0.01'],
      ['音频', '$0.03'],
    ],
    '上一代轻量模型，适合低成本和低延迟调用',
    false,
  ),
];

export const CONSOLE_PRICING_PRODUCTS = [
  {
    id: 'claude',
    label: 'Claude Code',
    iconKey: 'claude',
    formulaTable: formulaTable(
      ['官方渠道稳定', '官方渠道/CC外场景专用', '三方逆向'],
      [
        '4.03人民币 = 1美元用量',
        '3.02人民币 = 1美元用量',
        '1.15人民币 = 1美元用量',
      ],
      ['模型倍率4.03x', '模型倍率3.02x', '模型倍率1.15x'],
    ),
    officialPricingTable: {
      headers: [
        '模型名称',
        '输入价格',
        '输出价格',
        '缓存创建（5m）',
        '缓存读取',
        '描述',
      ],
      rows: claudeRows,
    },
    channels: [
      {
        key: 'stable',
        title: '官方渠道稳定',
        discount: '5.6折',
        rate: '折扣率: 0.56x',
      },
      {
        key: 'official',
        title: '官方渠道',
        discount: '4.2折',
        rate: '折扣率: 0.42x',
      },
      {
        key: 'external',
        title: 'CC外场景专用',
        discount: '4.2折',
        rate: '折扣率: 0.42x',
      },
      {
        key: 'reverse',
        title: '三方逆向',
        discount: '1.6折',
        rate: '折扣率: 0.16x',
      },
    ],
  },
  {
    id: 'codex',
    label: 'Codex',
    iconKey: 'openai',
    formulaTable: formulaTable(
      ['官方直连', '官方订阅'],
      ['5.40人民币 = 1美元用量', '0.50人民币 = 1美元用量'],
      ['模型倍率5.40x', '模型倍率0.50x'],
    ),
    officialPricingTable: {
      headers: [
        '模型名称',
        '输入价格',
        '输出价格',
        '缓存创建（30m）',
        '缓存读取',
        '描述',
      ],
      rows: codexRows,
    },
    channels: [
      {
        key: 'direct',
        title: '官方直连',
        discount: '7.5折',
        rate: '折扣率: 0.75x',
      },
      {
        key: 'subscription',
        title: '官方订阅',
        discount: '0.7折',
        rate: '折扣率: 0.07x',
      },
    ],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    iconKey: 'gemini',
    formulaTable: formulaTable(
      ['官方直连', '官方订阅'],
      ['5.40人民币 = 1美元用量', '0.50人民币 = 1美元用量'],
      ['模型倍率5.40x', '模型倍率0.50x'],
      false,
    ),
    officialPricingTable: {
      headers: ['模型名称', '输入价格', '输出价格', '缓存读取', '描述'],
      rows: geminiRows,
    },
    channels: [
      {
        key: 'direct',
        title: '官方直连',
        discount: '7.5折',
        rate: '折扣率: 0.75x',
      },
      {
        key: 'subscription',
        title: '官方订阅',
        discount: '0.7折',
        rate: '折扣率: 0.07x',
      },
    ],
  },
];
