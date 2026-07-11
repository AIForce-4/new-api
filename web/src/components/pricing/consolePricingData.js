export const CONSOLE_PRICING_PRODUCTS = [
  {
    id: 'claude',
    label: 'Claude Code',
    iconKey: 'claude',
    formulaTable: {
      headers: ['公式名称', '官方订阅稳定渠道'],
      rows: [
        {
          key: 'simple',
          cells: [
            { label: '公式名称', content: '简易公式', strong: true },
            {
              label: '官方订阅稳定渠道',
              content: '4.3人民币 = 1美元用量',
              accent: true,
            },
          ],
        },
        {
          key: 'ratio',
          cells: [
            { label: '公式名称', content: 'NewAPI倍率语言', strong: true },
            { label: '官方订阅稳定渠道', content: '模型倍率4.3x' },
          ],
        },
        {
          key: 'full',
          cells: [
            { label: '公式名称', content: '完整公式', strong: true },
            {
              label: '公式内容',
              content:
                '官方价格（输入token × 输入价格 + 输出token × 输出价格 + 缓存创建 × 价格 + 缓存读取 × 价格） × 渠道折扣',
            },
          ],
        },
      ],
    },
    officialPricingTable: {
      headers: ['模型名称', '输入价格', '输出价格', '缓存创建', '缓存读取', '描述'],
      rows: [
        {
          key: 'fable5',
          cells: [
            { label: '模型名称', content: 'Claude Fable 5', strong: true },
            { label: '输入价格', content: '$10.00 / 1M tokens' },
            { label: '输出价格', content: '$50.00 / 1M tokens' },
            { label: '缓存创建', content: '$12.50 / 1M tokens' },
            { label: '缓存读取', content: '$1.00 / 1M tokens' },
            {
              label: '描述',
              content: 'Claude 家族超高端实验模型，定价为 Opus 两倍，面向最复杂任务',
              muted: true,
            },
          ],
        },
        {
          key: 'opus48',
          cells: [
            { label: '模型名称', content: 'Claude Opus 4.8', strong: true },
            { label: '输入价格', content: '$5.00 / 1M tokens' },
            { label: '输出价格', content: '$25.00 / 1M tokens' },
            { label: '缓存创建', content: '$6.25 / 1M tokens' },
            { label: '缓存读取', content: '$0.5 / 1M tokens' },
            {
              label: '描述',
              content: '新一代 Opus 旗舰模型，延续顶级编码与推理能力',
              muted: true,
            },
          ],
        },
        {
          key: 'opus47',
          cells: [
            { label: '模型名称', content: 'Claude Opus 4.7', strong: true },
            { label: '输入价格', content: '$5.00 / 1M tokens' },
            { label: '输出价格', content: '$25.00 / 1M tokens' },
            { label: '缓存创建', content: '$6.25 / 1M tokens' },
            { label: '缓存读取', content: '$0.5 / 1M tokens' },
            {
              label: '描述',
              content: '最新旗舰模型，编码GOAT',
              muted: true,
            },
          ],
        },
        {
          key: 'opus46',
          cells: [
            { label: '模型名称', content: 'Claude Opus 4.6', strong: true },
            { label: '输入价格', content: '$5.00 / 1M tokens' },
            { label: '输出价格', content: '$25.00 / 1M tokens' },
            { label: '缓存创建', content: '$6.25 / 1M tokens' },
            { label: '缓存读取', content: '$0.5 / 1M tokens' },
            {
              label: '描述',
              content: '最智能的模型，用于构建代理和编码',
              muted: true,
            },
          ],
        },
        {
          key: 'sonnet5',
          cells: [
            { label: '模型名称', content: 'Claude Sonnet 5', strong: true },
            { label: '输入价格', content: '$3.00 / 1M tokens' },
            { label: '输出价格', content: '$15.00 / 1M tokens' },
            { label: '缓存创建', content: '$3.75 / 1M tokens' },
            { label: '缓存读取', content: '$0.3 / 1M tokens' },
            {
              label: '描述',
              content: '新一代智能模型，保持 Sonnet 系列的均衡性能与速度',
              muted: true,
            },
          ],
        },
        {
          key: 'sonnet',
          cells: [
            { label: '模型名称', content: 'Claude Sonnet 4.6', strong: true },
            { label: '输入价格', content: '$3.00 / 1M tokens' },
            { label: '输出价格', content: '$15.00 / 1M tokens' },
            { label: '缓存创建', content: '$3.75 / 1M tokens' },
            { label: '缓存读取', content: '$0.3 / 1M tokens' },
            {
              label: '描述',
              content: '平衡性能与速度，适合日常使用',
              muted: true,
            },
          ],
        },
        {
          key: 'haiku',
          cells: [
            { label: '模型名称', content: 'Claude Haiku 4.5', strong: true },
            { label: '输入价格', content: '$1.00 / 1M tokens' },
            { label: '输出价格', content: '$5.00 / 1M tokens' },
            { label: '缓存创建', content: '$1.25 / 1M tokens' },
            { label: '缓存读取', content: '$0.1 / 1M tokens' },
            {
              label: '描述',
              content: '快速响应，适合简单任务',
              muted: true,
            },
          ],
        },
      ],
    },
    channels: [
      {
        key: 'stable',
        title: '官方订阅稳定渠道',
        discount: '6折',
        rate: '折扣率: 0.6x',
      },
    ],
  },
  {
    id: 'codex',
    label: 'Codex',
    iconKey: 'codex',
    formulaTable: {
      headers: ['公式名称', '公式内容'],
      rows: [
        {
          key: 'simple',
          cells: [
            { label: '公式名称', content: '简易公式', strong: true },
            { label: '公式内容', content: '0.45人民币 = 1美元用量', accent: true },
          ],
        },
        {
          key: 'ratio',
          cells: [
            { label: '公式名称', content: 'NewAPI倍率语言', strong: true },
            { label: '公式内容', content: '模型倍率0.45x' },
          ],
        },
        {
          key: 'full',
          cells: [
            { label: '公式名称', content: '完整公式', strong: true },
            {
              label: '公式内容',
              content:
                '官方价格（输入token × 输入价格 + 输出token × 输出价格 + 缓存读取 × 价格） × 渠道折扣',
            },
          ],
        },
      ],
    },
    officialPricingTable: {
      headers: ['模型名称', '输入价格', '输出价格', '缓存读取', '描述'],
      rows: [
        {
          key: 'gpt-55',
          cells: [
            { label: '模型名称', content: 'gpt-5.5', strong: true },
            { label: '输入价格', content: '$5 / 1M tokens' },
            { label: '输出价格', content: '$30 / 1M tokens' },
            { label: '缓存读取', content: '$0.5 / 1M tokens' },
            {
              label: '描述',
              content: '5.5 旗舰模型，推理深度与复杂工程任务处理能力再创新高',
              muted: true,
            },
          ],
        },
        {
          key: 'gpt-54',
          cells: [
            { label: '模型名称', content: 'gpt-5.4', strong: true },
            { label: '输入价格', content: '$2.5 / 1M tokens' },
            { label: '输出价格', content: '$15 / 1M tokens' },
            { label: '缓存读取', content: '$0.25 / 1M tokens' },
            {
              label: '描述',
              content: '5.4 旗舰模型，擅长深度推理与复杂工程任务处理',
              muted: true,
            },
          ],
        },
        {
          key: 'gpt-53-codex',
          cells: [
            { label: '模型名称', content: 'gpt-5.3-codex', strong: true },
            { label: '输入价格', content: '$1.75 / 1M tokens' },
            { label: '输出价格', content: '$14.00 / 1M tokens' },
            { label: '缓存读取', content: '$0.175 / 1M tokens' },
            {
              label: '描述',
              content: '前代旗舰代码模型， Codex 系列能力Max',
              muted: true,
            },
          ],
        },
        {
          key: 'gpt-52',
          cells: [
            { label: '模型名称', content: 'gpt-5.2', strong: true },
            { label: '输入价格', content: '$1.75 / 1M tokens' },
            { label: '输出价格', content: '$14.00 / 1M tokens' },
            { label: '缓存读取', content: '$0.175 / 1M tokens' },
            {
              label: '描述',
              content: '5.2 通用升级版，推理与指令遵循全面提升',
              muted: true,
            },
          ],
        },
        {
          key: 'gpt-52-codex',
          cells: [
            { label: '模型名称', content: 'gpt-5.2-codex', strong: true },
            { label: '输入价格', content: '$1.75 / 1M tokens' },
            { label: '输出价格', content: '$14.00 / 1M tokens' },
            { label: '缓存读取', content: '$0.175 / 1M tokens' },
            {
              label: '描述',
              content: '5.2 代码专项版，工程能力较 5.1-codex 显著提升',
              muted: true,
            },
          ],
        },
        {
          key: 'gpt-51-codex-max',
          cells: [
            { label: '模型名称', content: 'gpt-5.1-codex-max', strong: true },
            { label: '输入价格', content: '$1.25 / 1M tokens' },
            { label: '输出价格', content: '$10.00 / 1M tokens' },
            { label: '缓存读取', content: '$0.125 / 1M tokens' },
            {
              label: '描述',
              content: '5.1 代码增强版，更长上下文与更强推理能力',
              muted: true,
            },
          ],
        },
        {
          key: 'gpt-51-codex',
          cells: [
            { label: '模型名称', content: 'gpt-5.1-codex', strong: true },
            { label: '输入价格', content: '$1.25 / 1M tokens' },
            { label: '输出价格', content: '$10.00 / 1M tokens' },
            { label: '缓存读取', content: '$0.125 / 1M tokens' },
            {
              label: '描述',
              content: '5.1 代码专项版，深度优化编程理解与生成',
              muted: true,
            },
          ],
        },
        {
          key: 'gpt-51',
          cells: [
            { label: '模型名称', content: 'gpt-5.1', strong: true },
            { label: '输入价格', content: '$1.25 / 1M tokens' },
            { label: '输出价格', content: '$10.00 / 1M tokens' },
            { label: '缓存读取', content: '$0.125 / 1M tokens' },
            {
              label: '描述',
              content: '5.1 通用基础版，均衡处理各类开发任务',
              muted: true,
            },
          ],
        },
      ],
    },
    channels: [
      {
        key: 'official',
        title: '官方订阅渠道',
        discount: '0.6折',
        rate: '折扣率: 0.06x',
      },
    ],
  },
  {
    id: 'gpt56',
    label: 'GPT-5.6',
    iconKey: 'openai',
    formulaTable: {
      headers: ['公式名称', '公式内容'],
      rows: [
        {
          key: 'simple',
          cells: [
            { label: '公式名称', content: '简易公式', strong: true },
            { label: '公式内容', content: '0.45人民币 = 1美元用量', accent: true },
          ],
        },
        {
          key: 'ratio',
          cells: [
            { label: '公式名称', content: 'NewAPI倍率语言', strong: true },
            { label: '公式内容', content: '模型倍率0.45x' },
          ],
        },
        {
          key: 'full',
          cells: [
            { label: '公式名称', content: '完整公式', strong: true },
            {
              label: '公式内容',
              content:
                '官方价格（输入token × 输入价格 + 输出token × 输出价格 + 缓存创建 × 价格 + 缓存读取 × 价格） × 渠道折扣',
            },
          ],
        },
      ],
    },
    officialPricingTable: {
      headers: ['模型名称', '输入价格', '输出价格', '缓存创建', '缓存读取', '描述'],
      rows: [
        {
          key: 'gpt-56-sol',
          cells: [
            { label: '模型名称', content: 'gpt-5.6-sol', strong: true },
            { label: '输入价格', content: '$5.00 / 1M tokens' },
            { label: '输出价格', content: '$30.00 / 1M tokens' },
            { label: '缓存创建', content: '$6.25 / 1M tokens' },
            { label: '缓存读取', content: '$0.5 / 1M tokens' },
            {
              label: '描述',
              content: '旗舰，最强',
              muted: true,
            },
          ],
        },
        {
          key: 'gpt-56-terra',
          cells: [
            { label: '模型名称', content: 'gpt-5.6-terra', strong: true },
            { label: '输入价格', content: '$2.5 / 1M tokens' },
            { label: '输出价格', content: '$15.00 / 1M tokens' },
            { label: '缓存创建', content: '$3.125 / 1M tokens' },
            { label: '缓存读取', content: '$0.25 / 1M tokens' },
            {
              label: '描述',
              content: '较低成本强模型',
              muted: true,
            },
          ],
        },
        {
          key: 'gpt-56-luna',
          cells: [
            { label: '模型名称', content: 'gpt-5.6-luna', strong: true },
            { label: '输入价格', content: '$1.00 / 1M tokens' },
            { label: '输出价格', content: '$6.00 / 1M tokens' },
            { label: '缓存创建', content: '$1.25 / 1M tokens' },
            { label: '缓存读取', content: '$0.1 / 1M tokens' },
            {
              label: '描述',
              content: '最快、最便宜',
              muted: true,
            },
          ],
        },
      ],
    },
    channels: [
      {
        key: 'official',
        title: '官方订阅渠道',
        discount: '0.6折',
        rate: '折扣率: 0.06x',
      },
    ],
  },
];
