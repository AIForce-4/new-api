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
const codeBlock = (strings, ...values) =>
  String.raw({ raw: strings }, ...values).trim();

const PRODUCTION_SITE_BASE_URL = 'https://www.aif4.org';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const resolveSiteBaseUrl = () => {
  const configuredUrl = import.meta.env?.VITE_REACT_APP_SERVER_URL || '';
  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window === 'undefined' || !window.location?.origin) {
    return PRODUCTION_SITE_BASE_URL;
  }

  const currentOrigin = trimTrailingSlash(window.location.origin);
  const hostname = window.location.hostname;
  const isLocalHostname =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

  return isLocalHostname ? PRODUCTION_SITE_BASE_URL : currentOrigin;
};

const SITE_BASE_URL = resolveSiteBaseUrl();

const CODEX_API_BASE_URL = `${SITE_BASE_URL}/v1`;

const paragraph = (text) => ({ type: 'paragraph', text });
const richText = (...segments) => ({
  type: 'richText',
  segments: segments.map((segment) =>
    typeof segment === 'string'
      ? { type: 'text', text: segment }
      : { type: 'link', text: segment.text, href: segment.href },
  ),
});
const note = (title, items) => ({ type: 'note', title, items });
const code = (value, language = 'terminal') => ({
  type: 'code',
  code: value,
  language,
});
const image = (src, alt, caption = '') => ({
  type: 'image',
  src,
  alt,
  caption,
});
const variables = (items) => ({ type: 'variables', items });

const section = (id, title, blocks) => ({
  id,
  type: 'section',
  title,
  blocks,
});
const callout = (id, title, text, tone = 'success') => ({
  id,
  type: 'callout',
  tone,
  title,
  blocks: [paragraph(text)],
});
const stepsSection = (id, title, steps, supportContact = null) => ({
  id,
  type: 'steps',
  title,
  supportContact,
  steps,
});

const SUPPORT_CONTACT = {
  fingerImage: '/console-docs/install/finger-up.svg',
  buttonText: '有疑问? 技术支持',
  title: '扫码添加客服微信',
  description: '微信扫一扫，添加客服获取 AIF4 接入帮助',
  qrCodeImage: '/pricing-contact-qr.jpg',
  qrCodeAlt: '客服微信二维码',
};

const CLAUDE_WINDOWS_INSTALL = codeBlock`
npm install -g @anthropic-ai/claude-code
claude --version
`;

const CLAUDE_WINDOWS_ENV = codeBlock`
$env:ANTHROPIC_BASE_URL = "${SITE_BASE_URL}"
$env:ANTHROPIC_AUTH_TOKEN = "sk-替换为你的APIKey"

# 永久写入当前 Windows 用户环境变量
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "${SITE_BASE_URL}", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "sk-替换为你的APIKey", "User")
`;

const CLAUDE_WINDOWS_SETUP_SCRIPT = codeBlock`
iex (irm 'https://www.aif4.org/claude-setup.ps1')
`;

const CLAUDE_POSIX_ENV = (shellFile) => codeBlock`
echo 'export ANTHROPIC_BASE_URL="${SITE_BASE_URL}"' >> ~/${shellFile}
echo 'export ANTHROPIC_AUTH_TOKEN="sk-替换为你的APIKey"' >> ~/${shellFile}
source ~/${shellFile}
`;

const CLAUDE_POSIX_SETUP_SCRIPT = codeBlock`
curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/claude-cli-setup.sh | bash
`;

const CLAUDE_VERIFY_AND_START = codeBlock`
claude --version

# 进入你的项目目录
cd /path/to/your/project

# 启动 Claude Code
claude
`;

const CODEX_AUTH_JSON = codeBlock`
{
  "OPENAI_API_KEY": "sk-替换为你的APIKey"
}
`;

const CODEX_CONFIG_TOML = codeBlock`
model_provider = "aif4"
model = "gpt-6.2-astra"
model_reasoning_effort = "xhigh"
disable_response_storage = true
preferred_auth_method = "apikey"

[model_providers.aif4]
name = "AIF4"
base_url = "${CODEX_API_BASE_URL}"
wire_api = "responses"
requires_openai_auth = true
`;

const CODEX_POSIX_CONFIG = (shellFile) => codeBlock`
mkdir -p "$HOME/.codex"

cat > "$HOME/.codex/auth.json" <<'EOF'
{
  "OPENAI_API_KEY": "sk-替换为你的APIKey"
}
EOF

cat > "$HOME/.codex/config.toml" <<'EOF'
model_provider = "aif4"
model = "gpt-6.2-astra"
model_reasoning_effort = "xhigh"
disable_response_storage = true
preferred_auth_method = "apikey"

[model_providers.aif4]
name = "AIF4"
base_url = "${CODEX_API_BASE_URL}"
wire_api = "responses"
requires_openai_auth = true
EOF

source ~/${shellFile}
`;

const CODEX_VERIFY_AND_START = codeBlock`
codex -V

# 进入你的项目目录
cd /path/to/your/project

# 启动 Codex
codex
`;

const GEMINI_ENV_CONTENT = codeBlock`
GEMINI_API_KEY=sk-替换为你的APIKey
GOOGLE_GEMINI_BASE_URL=${SITE_BASE_URL}
`;

const GEMINI_SETTINGS_CONTENT = codeBlock`
{
  "experimental": {
    "dynamicModelConfiguration": true
  },
  "security": {
    "auth": {
      "selectedType": "gemini-api-key"
    }
  }
}
`;

const GEMINI_POSIX_CONFIG = codeBlock`
mkdir -p ~/.gemini

cat > ~/.gemini/.env <<'EOF'
${GEMINI_ENV_CONTENT}
EOF

cat > ~/.gemini/settings.json <<'EOF'
${GEMINI_SETTINGS_CONTENT}
EOF

chmod 700 ~/.gemini
chmod 600 ~/.gemini/.env ~/.gemini/settings.json
`;

const API_KEY_STEP = {
  title: '创建 API Key',
  blocks: [
    richText(
      '进入 ',
      { text: '令牌管理', href: '/console/token' },
      ' 创建专用 API Key。不要把密钥提交到 Git 仓库，也不要发送到公开聊天中。',
    ),
    note('密钥建议', [
      '为不同设备创建不同令牌，便于单独撤销。',
      '如果密钥泄露，立即在令牌管理中禁用并重新创建。',
    ]),
    image(
      '/console-docs/install/apiKeyGuide.jpg',
      'API Key 创建位置',
      '控制台中的 API Key 创建位置示意。',
    ),
  ],
};

const BEGINNER_TERMINAL_TIP = note('第一次使用终端？', [
  '点击每段命令右上角的“一键复制”，再粘贴到终端窗口。macOS 使用 Command+V，Windows/Linux 使用 Ctrl+V。',
  '一次只执行当前步骤，看到命令执行结束后再做下一步。',
  '终端提示需要输入密码时，输入时通常不会显示字符，这是正常现象。',
]);

const CLAUDE_DESKTOP_MACOS_SECTIONS = [
  callout(
    'desktop-macos-overview',
    'macOS / Linux 桌面端接入',
    'CLI 和桌面 App 共用同一个 API Key。请先启用 Developer Mode，再配置第三方推理和模型。',
  ),
  section('desktop-macos-requirements', '开始前准备', [
    paragraph(
      '请在浏览器中提前登录本站，并准备一个可用的 API Key。第一次下载桌面 App 和 workspace 资源时需要能够访问官方下载域名。',
    ),
  ]),
  stepsSection(
    'desktop-macos-steps',
    'macOS / Linux 配置步骤',
    [
      API_KEY_STEP,
      {
        title: '安装官方 Claude 桌面 App',
        blocks: [
          richText(
            '从 ',
            {
              text: 'Claude 官方下载页',
              href: 'https://claude.com/download',
            },
            ' 获取 macOS 对应安装包并完成安装。',
          ),
          paragraph(
            '如果首次启动卡在 workspace 初始化，请临时切换到可访问官方资源域名的网络，完成一次下载后再切回常用网络。',
          ),
        ],
      },
      {
        title: '启用 Developer Mode',
        blocks: [
          paragraph(
            '打开 Claude App，点击菜单中的 Help → Troubleshooting → Enable Developer Mode，并在弹窗中选择启用。',
          ),
          image(
            '/console-docs/install/claude-app/macos/step-enable-dev-mode.png',
            'macOS 启用 Claude Developer Mode',
            '图 1：点击 Help → Troubleshooting → Enable Developer Mode。',
          ),
          note('启用后应用可能自动重启', [
            '如果菜单中没有 Developer Mode，请先升级到最新版桌面 App。',
          ]),
        ],
      },
      {
        title: '打开第三方推理配置',
        blocks: [
          paragraph(
            '应用重启后，点击 Developer → Configure Third-Party Inference，并打开 Connection 页面。',
          ),
          image(
            '/console-docs/install/claude-app/macos/step-open-third-party-inference.png',
            'macOS 打开 Claude 第三方推理配置',
            '图 2：打开 Developer → Configure Third-Party Inference。',
          ),
        ],
      },
      {
        title: '填写连接信息',
        blocks: [
          variables([
            { name: 'Credential kind', value: 'Static API key' },
            { name: 'Gateway base URL', value: SITE_BASE_URL },
            { name: 'Gateway API key', value: '你在本站创建的 API Key' },
          ]),
          image(
            '/console-docs/install/claude-app/macos/step-config-connection.png',
            'macOS Claude 桌面 App 连接配置',
            '图 3：填写 Static API key、Gateway base URL 和 API Key，其余字段保持默认。',
          ),
          note('macOS / Linux 注意', [
            'Gateway base URL 使用当前站点地址，不需要额外添加 /v1。',
            'macOS 如果弹出安全确认，请允许 Claude App 完成配置。',
          ]),
        ],
      },
      {
        title: '添加模型并保存',
        blocks: [
          paragraph(
            '在 Models → Model list 中选择 Add model，填写本站模型价格页中可用的 Claude 模型 ID。例如：',
          ),
          code('claude-sonnet-5-5', 'model-id'),
          image(
            '/console-docs/install/claude-app/macos/step-add-models.png',
            'macOS 添加 Claude 模型',
            '图 4：在 Model list 中选择 Add model 并填写模型 ID。',
          ),
          paragraph(
            '点击 Apply Changes 或 Apply locally，再点击 Save Changes。应用重启后进入使用页面。',
          ),
        ],
      },
      {
        title: '新建对话测试',
        blocks: [
          paragraph(
            '新建对话并发送测试消息，然后回到本站使用日志确认请求已进入当前 API Key。',
          ),
          image(
            '/console-docs/install/claude-app/macos/step-test-message.png',
            'macOS Claude 桌面 App 发送测试消息',
            '图 5：新建对话并发送测试消息，确认能够正常收到回复。',
          ),
        ],
      },
    ],
    SUPPORT_CONTACT,
  ),
  section('desktop-macos-troubleshooting', '常见问题', [
    note('桌面 App 一直停在 workspace 初始化', [
      '通常是 downloads.claude.ai 资源下载受阻，不是 API Key 配置错误。',
      '切换到可访问官方资源域名的网络完成首次初始化。',
    ]),
    note('提示 401 或模型不存在', [
      '确认 API Key 没有多余空格，且令牌仍然启用。',
      '确认 Model list 中的模型 ID 与本站模型价格页一致。',
    ]),
  ]),
];

const CLAUDE_DESKTOP_WINDOWS_SECTIONS = [
  callout(
    'desktop-windows-overview',
    'Windows 桌面端接入',
    'Windows 菜单路径和认证方式与 macOS/Linux 不同，请按本页顺序操作。',
  ),
  section('desktop-windows-requirements', '开始前准备', [
    paragraph(
      '请在浏览器中提前登录本站并准备 API Key。Windows 10/11 首次运行 Claude App 时还需要完成 Virtual Machine Platform 等环境初始化。',
    ),
  ]),
  stepsSection(
    'desktop-windows-steps',
    'Windows 配置步骤',
    [
      API_KEY_STEP,
      {
        title: '安装官方 Claude 桌面 App',
        blocks: [
          richText(
            '从 ',
            {
              text: 'Claude 官方下载页',
              href: 'https://claude.com/download',
            },
            ' 下载 Windows 安装包并运行。',
          ),
          paragraph(
            '安装器会先拉取安装包，需要能够访问官方资源域名。拉取完成后会自动打开 Claude App。',
          ),
          image(
            '/console-docs/install/claude-app/windows/step-install.png',
            'Windows 安装 Claude App',
            '图 1：安装器正在拉取安装包，请等待进度完成。',
          ),
        ],
      },
      {
        title: '启用 Developer Mode',
        blocks: [
          paragraph(
            '点击 Claude App 左上角的菜单按钮，进入 Help → Troubleshooting → Enable Developer Mode。',
          ),
          image(
            '/console-docs/install/claude-app/windows/step-help-menu.png',
            'Windows 打开 Claude Help 菜单',
            '图 2：点击左上角菜单按钮，再打开 Help。',
          ),
          image(
            '/console-docs/install/claude-app/windows/step-enable-dev-mode.png',
            'Windows 启用 Claude Developer Mode',
            '图 3：在确认弹窗中选择 Enable。',
          ),
        ],
      },
      {
        title: '打开第三方推理配置',
        blocks: [
          paragraph(
            '应用自动重启后，再次打开左上角菜单，进入 Developer → Configure Third-Party Inference。',
          ),
          image(
            '/console-docs/install/claude-app/windows/step-developer-menu.png',
            'Windows 打开 Claude Developer 菜单',
            '图 4：从左上角菜单进入 Developer。',
          ),
        ],
      },
      {
        title: '填写连接信息',
        blocks: [
          variables([
            { name: 'Credential kind', value: 'Static API key' },
            { name: 'Gateway base URL', value: SITE_BASE_URL },
            { name: 'Gateway API key', value: '你在本站创建的 API Key' },
            { name: 'Gateway auth scheme', value: 'x-api-key' },
          ]),
          image(
            '/console-docs/install/claude-app/windows/step-config-connection.png',
            'Windows Claude 桌面 App 连接配置',
            '图 5：填写 Base URL 和 API Key，并将 Gateway auth scheme 选择为 x-api-key。',
          ),
          note('Windows 必填项', [
            'Gateway auth scheme 必须选择 x-api-key。',
            'Gateway base URL 使用当前站点地址，不需要额外添加 /v1。',
          ]),
        ],
      },
      {
        title: '添加模型并应用',
        blocks: [
          paragraph(
            '滚动到 Models → Model list，添加或展开模型项，在 Model ID 中填写本站支持的 Claude 模型，例如：',
          ),
          code('claude-sonnet-5-5', 'model-id'),
          image(
            '/console-docs/install/claude-app/windows/step-add-models.png',
            'Windows 添加 Claude 模型',
            '图 6：填写 Model ID 后点击右下角 Apply Changes。',
          ),
          paragraph(
            '按页面提示保存配置。应用自动重启后新建对话发送测试消息，并回到本站使用日志确认请求记录。',
          ),
        ],
      },
    ],
    SUPPORT_CONTACT,
  ),
  section('desktop-windows-troubleshooting', 'Windows 常见问题', [
    note('提示 Virtual Machine Platform not available', [
      '使用管理员权限重新打开 PowerShell，按 Claude App 提示安装或启用 Virtual Machine Platform。',
      '完成后重启电脑，再重新打开 Claude 桌面 App。',
    ]),
    note('一直停在 Setting up Claude workspace', [
      '首次运行需要下载 workspace 资源，请临时切换到可访问官方资源域名的网络。',
      '完成一次下载后可以切回常用网络。',
    ]),
  ]),
];

const CLAUDE_DESKTOP_PLATFORM = {
  id: 'desktop',
  label: '桌面 App',
  title: 'Claude 桌面 App 接入指南',
  description:
    '选择你的桌面系统，按对应系统截图完成 Developer Mode、第三方推理和模型配置。',
  defaultSubTab: 'macos-linux',
  subTabs: [
    {
      id: 'macos-linux',
      label: 'macOS / Linux',
      sections: CLAUDE_DESKTOP_MACOS_SECTIONS,
    },
    {
      id: 'windows',
      label: 'Windows',
      sections: CLAUDE_DESKTOP_WINDOWS_SECTIONS,
    },
  ],
};

export const CLAUDE_CODE_INSTALL_GUIDE = {
  productId: 'claude-code',
  productLabel: 'Claude Code',
  basePath: '/console/install/claude-code',
  highlights: ['零基础图文步骤', '官方 CLI', 'Claude 桌面 App'],
  quickActions: [
    { label: '创建 API Key', to: '/console/token', primary: true },
    { label: '查看模型价格', to: '/console/pricing' },
    { label: '桌面 App 指南', to: '/console/install/claude-code/desktop' },
  ],
  platforms: [
    {
      id: 'windows',
      label: 'Windows',
      title: 'Windows 接入 Claude Code',
      description:
        '从安装 Node.js、打开 PowerShell 到首次对话，每一步都提供截图和操作说明。',
      sections: [
        callout(
          'windows-overview',
          '推荐接入路径',
          '先安装官方 CLI，再创建 API Key 并配置网关环境变量。不希望在终端中工作时，可切换到顶部“桌面 App”指南。',
        ),
        section('windows-requirements', '系统要求', [
          paragraph(
            'Windows 10 1809 及以上，已安装 Node.js 22 LTS 和 npm。建议使用 PowerShell。',
          ),
        ]),
        stepsSection(
          'windows-steps',
          '安装与配置',
          [
            {
              title: '安装 Node.js 环境（已安装可跳过）',
              blocks: [
                BEGINNER_TERMINAL_TIP,
                richText(
                  'Claude Code 需要 Node.js。打开浏览器访问 ',
                  { text: 'Node.js 官网', href: 'https://nodejs.org/' },
                  '，下载并安装 LTS 版本。安装过程中保持默认选项，连续点击 Next 即可。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-01.webp',
                  'Windows Node.js 安装入口',
                  '图 1：打开 Node.js 官网并选择 LTS 版本。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-02.webp',
                  'Windows Node.js 安装向导',
                  '图 2：下载完成后双击安装包。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-03.webp',
                  'Windows Node.js 安装选项',
                  '图 3：保持默认安装选项。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-04.webp',
                  'Windows Node.js 安装过程',
                  '图 4：等待安装完成。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-05.webp',
                  'Windows Node.js 安装完成',
                  '图 5：看到 Finish 表示安装完成。',
                ),
                paragraph(
                  '重新打开 PowerShell，输入下面的命令检查是否安装成功：',
                ),
                code('node -v\nnpm -v'),
                note('看到版本号才算成功', [
                  '命令会分别显示 Node.js 和 npm 的版本号。',
                  '如果提示“不是内部或外部命令”，请重新启动电脑后再试。',
                ]),
              ],
            },
            {
              title: '安装 Claude Code CLI',
              blocks: [
                paragraph(
                  '按 Win 键搜索 PowerShell，打开蓝色终端窗口，然后复制并执行以下命令：',
                ),
                code(CLAUDE_WINDOWS_INSTALL),
                image(
                  '/console-docs/install/claude-code/windows-img-09.webp',
                  'Windows 安装 Claude Code',
                  '图 6：看到 claude --version 输出版本号，表示安装成功。',
                ),
              ],
            },
            API_KEY_STEP,
            {
              title: '配置本站网关',
              blocks: [
                paragraph(
                  '推荐先使用站点提供的一键配置脚本。打开 PowerShell 后执行：',
                ),
                code(CLAUDE_WINDOWS_SETUP_SCRIPT, 'powershell'),
                paragraph(
                  '脚本执行完成后重新打开 PowerShell。如果脚本下载失败或配置未生效，再使用下面的手动设置命令。',
                ),
                code(CLAUDE_WINDOWS_ENV, 'powershell'),
                image(
                  '/console-docs/install/claude-code/windows-configure.webp',
                  'Windows 配置 Claude Code 环境变量',
                  '图 7：PowerShell 环境变量配置效果参考，请以本页显示的命令为准。',
                ),
                note('修改环境变量后需要新开终端', [
                  '已经打开的终端不会自动读取新环境变量。',
                  '不要把带真实 API Key 的脚本提交到仓库或共享给他人。',
                ]),
              ],
            },
            {
              title: '验证并启动',
              blocks: [
                code(CLAUDE_VERIFY_AND_START),
                image(
                  '/console-docs/install/claude-code/introduce-01.webp',
                  'Claude Code 界面示意',
                  '图 8：Claude Code 启动后的界面示意。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-11.webp',
                  'Windows Claude Code 首次启动',
                  '图 9：首次启动时按界面提示继续。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-12.webp',
                  'Windows Claude Code 选择主题',
                  '图 10：可以选择喜欢的终端主题。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-13.webp',
                  'Windows Claude Code 权限确认',
                  '图 11：第一次使用时会询问工作目录权限。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-14.webp',
                  'Windows Claude Code 工作目录',
                  '图 12：选择或确认要交给 Claude Code 处理的项目目录。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-15.webp',
                  'Windows Claude Code 对话界面',
                  '图 13：进入对话界面后即可输入任务。',
                ),
                paragraph('在 Claude Code 中切换模型：'),
                code('/model'),
                image(
                  '/console-docs/install/claude-code/windows-img-16.webp',
                  'Windows Claude Code 模型选择',
                  '图 14：输入 /model 后选择可用模型。',
                ),
                image(
                  '/console-docs/install/claude-code/windows-img-17.webp',
                  'Windows Claude Code 模型列表',
                  '图 15：确认选择的模型并开始对话。',
                ),
              ],
            },
          ],
          SUPPORT_CONTACT,
        ),
        section('windows-troubleshooting', '常见问题', [
          note('PowerShell 提示命令不可用', [
            '重新打开 PowerShell，再运行 claude --version。',
            '确认 npm 全局 bin 目录已加入 PATH。',
          ]),
          note('设置了环境变量但仍连接官方账号', [
            '关闭所有终端和 IDE 后重新打开。',
            '分别检查 ANTHROPIC_BASE_URL 和 ANTHROPIC_AUTH_TOKEN 是否生效。',
          ]),
        ]),
      ],
    },
    {
      id: 'macos',
      label: 'macOS',
      title: 'macOS 接入 Claude Code',
      description:
        '从打开 Terminal 开始，按截图完成安装、配置、验证和首次对话。',
      sections: [
        callout(
          'macos-overview',
          '推荐接入路径',
          '官方 CLI 适合 Terminal、iTerm2、VS Code 和 JetBrains；需要图形化配置时可以切换到顶部“桌面 App”。',
        ),
        section('macos-requirements', '系统要求', [
          paragraph('macOS 12 及以上，并能够使用 Terminal。'),
        ]),
        stepsSection(
          'macos-steps',
          '安装与配置',
          [
            {
              title: '打开终端并安装 Claude Code',
              blocks: [
                BEGINNER_TERMINAL_TIP,
                paragraph(
                  '按 Command+空格，输入 Terminal 后回车，打开 macOS 自带的终端。',
                ),
                image(
                  '/console-docs/install/claude-code/macos-img-01.webp',
                  'macOS 打开终端',
                  '图 1：通过 Spotlight 搜索并打开 Terminal。',
                ),
                paragraph('在终端中粘贴并运行官方安装脚本：'),
                code('curl -fsSL https://claude.ai/install.sh | bash'),
                image(
                  '/console-docs/install/claude-code/macos-img-02.webp',
                  'macOS 安装 Claude Code',
                  '图 2：等待安装脚本执行完成。',
                ),
              ],
            },
            API_KEY_STEP,
            {
              title: '配置网关环境变量',
              blocks: [
                paragraph(
                  '推荐直接运行站点提供的一键配置脚本，脚本会帮助写入本站环境变量：',
                ),
                code(CLAUDE_POSIX_SETUP_SCRIPT),
                paragraph(
                  '执行完成后重新打开终端。如果一键脚本执行失败，再使用下面的手动配置方式。',
                ),
                paragraph(
                  '以下命令会写入 ~/.zshrc。使用 bash 时请把文件改为 ~/.bashrc。',
                ),
                code(CLAUDE_POSIX_ENV('.zshrc')),
                image(
                  '/console-docs/install/claude-code/macos-configure.webp',
                  'macOS 配置 Claude Code 环境变量',
                  '图 3：环境变量配置效果参考，请以本页显示的命令为准。',
                ),
              ],
            },
            {
              title: '验证并启动',
              blocks: [
                code(CLAUDE_VERIFY_AND_START),
                image(
                  '/console-docs/install/claude-code/macos-img-04.webp',
                  'macOS Claude Code 首次启动',
                  '图 4：首次启动时按界面提示继续。',
                ),
                image(
                  '/console-docs/install/claude-code/macos-img-05.webp',
                  'macOS Claude Code 选择主题',
                  '图 5：选择终端主题后继续。',
                ),
                image(
                  '/console-docs/install/claude-code/macos-img-06.webp',
                  'macOS Claude Code 登录提示',
                  '图 6：按界面提示完成首次使用设置。',
                ),
                image(
                  '/console-docs/install/claude-code/macos-img-07.webp',
                  'macOS Claude Code 工作目录',
                  '图 7：选择要交给 Claude Code 处理的项目目录。',
                ),
                image(
                  '/console-docs/install/claude-code/macos-img-08.webp',
                  'macOS Claude Code 对话界面',
                  '图 8：进入对话界面后即可输入任务。',
                ),
                paragraph('在 Claude Code 中切换模型：'),
                code('/model'),
                image(
                  '/console-docs/install/claude-code/macos-img-09.webp',
                  'macOS Claude Code 模型选择',
                  '图 9：输入 /model 后打开模型列表。',
                ),
                image(
                  '/console-docs/install/claude-code/macos-img-10.webp',
                  'macOS Claude Code 模型列表',
                  '图 10：从列表中选择需要的模型。',
                ),
                image(
                  '/console-docs/install/claude-code/macos-img-11.webp',
                  'macOS Claude Code 模型确认',
                  '图 11：确认模型后返回对话界面。',
                ),
              ],
            },
          ],
          SUPPORT_CONTACT,
        ),
        section('macos-troubleshooting', '常见问题', [
          note('macOS 阻止命令运行', [
            '打开“系统设置 → 隐私与安全性”，允许相关终端或二进制文件运行。',
            '不要为了绕过单次安全提示而长期关闭系统安全功能。',
          ]),
        ]),
      ],
    },
    {
      id: 'linux',
      label: 'Linux',
      title: 'Linux 接入 Claude Code',
      description: '从打开终端开始，按截图完成安装、配置、验证和首次对话。',
      sections: [
        callout(
          'linux-overview',
          '推荐接入路径',
          '适合大多数主流发行版。若使用图形桌面环境，也可以参考顶部“桌面 App”指南。',
        ),
        section('linux-requirements', '系统要求', [
          paragraph('主流 Linux 发行版，具备 curl、bash 和可写用户目录。'),
        ]),
        stepsSection(
          'linux-steps',
          '安装与配置',
          [
            {
              title: '打开终端并安装 Claude Code',
              blocks: [
                BEGINNER_TERMINAL_TIP,
                paragraph(
                  '在桌面按 Ctrl+Alt+T 打开终端。不同 Linux 桌面环境的快捷键可能略有不同。',
                ),
                image(
                  '/console-docs/install/claude-code/linux-img-01.webp',
                  'Linux 打开终端',
                  '图 1：打开 Linux 终端窗口。',
                ),
                paragraph('在终端中粘贴并运行官方安装脚本：'),
                code('curl -fsSL https://claude.ai/install.sh | bash'),
                image(
                  '/console-docs/install/claude-code/linux-img-03.webp',
                  'Linux 安装 Claude Code',
                  '图 2：等待安装脚本执行完成。',
                ),
              ],
            },
            API_KEY_STEP,
            {
              title: '配置网关环境变量',
              blocks: [
                paragraph(
                  '推荐直接运行站点提供的一键配置脚本，脚本会帮助写入本站环境变量：',
                ),
                code(CLAUDE_POSIX_SETUP_SCRIPT),
                paragraph(
                  '执行完成后重新打开终端。如果一键脚本执行失败，再使用下面的手动配置方式。',
                ),
                paragraph(
                  '以下命令写入 ~/.bashrc。使用 zsh 时请把文件名改为 ~/.zshrc。',
                ),
                code(CLAUDE_POSIX_ENV('.bashrc')),
                image(
                  '/console-docs/install/claude-code/macos-configure.webp',
                  'Linux 配置 Claude Code 环境变量',
                  '图 3：环境变量配置效果参考，请以本页显示的命令为准。',
                ),
              ],
            },
            {
              title: '验证并启动',
              blocks: [
                code(CLAUDE_VERIFY_AND_START),
                image(
                  '/console-docs/install/claude-code/linux-img-03-usage.webp',
                  'Linux Claude Code 首次启动',
                  '图 4：首次启动时按界面提示继续。',
                ),
                image(
                  '/console-docs/install/claude-code/linux-img-04.webp',
                  'Linux Claude Code 选择主题',
                  '图 5：选择终端主题后继续。',
                ),
                image(
                  '/console-docs/install/claude-code/linux-img-05.webp',
                  'Linux Claude Code 工作目录',
                  '图 6：选择要交给 Claude Code 处理的项目目录。',
                ),
                paragraph('在 Claude Code 中切换模型：'),
                code('/model'),
                image(
                  '/console-docs/install/claude-code/linux-img-06.webp',
                  'Linux Claude Code 模型选择',
                  '图 7：输入 /model 后打开模型列表。',
                ),
                image(
                  '/console-docs/install/claude-code/linux-img-07.webp',
                  'Linux Claude Code 模型列表',
                  '图 8：从列表中选择需要的模型。',
                ),
                image(
                  '/console-docs/install/claude-code/linux-img-08.webp',
                  'Linux Claude Code 模型列表',
                  '图 9：继续确认模型信息。',
                ),
                image(
                  '/console-docs/install/claude-code/linux-img-09.webp',
                  'Linux Claude Code 对话界面',
                  '图 10：确认模型后返回对话界面。',
                ),
              ],
            },
          ],
          SUPPORT_CONTACT,
        ),
      ],
    },
    CLAUDE_DESKTOP_PLATFORM,
  ],
};

const CODEX_WINDOWS_NATIVE_SECTIONS = [
  callout(
    'windows-native-overview',
    '推荐接入路径',
    '使用 PowerShell 完成 Node.js、Codex CLI 和配置文件设置，适合大多数 Windows 用户。',
  ),
  section('windows-native-requirements', '系统要求', [
    paragraph(
      'Windows 10 1809 及以上，并具备 PowerShell。首次安装 Node.js 和 NVM 后需要重新打开终端。',
    ),
  ]),
  stepsSection(
    'windows-native-steps',
    '安装与配置',
    [
      {
        title: '打开 PowerShell',
        blocks: [
          BEGINNER_TERMINAL_TIP,
          paragraph(
            '按 Win 键搜索 PowerShell，然后点击“Windows PowerShell”打开蓝色终端窗口。',
          ),
          image(
            '/console-docs/install/codex/windows-open-terminal.webp',
            'Windows 打开 PowerShell',
            '图 1：从 Windows 搜索中打开 PowerShell。',
          ),
        ],
      },
      {
        title: '安装 NVM',
        blocks: [
          paragraph('复制下面的命令并按回车，使用 winget 安装 NVM：'),
          code('winget install --id=CoreyButler.NVMforWindows -e'),
          image(
            '/console-docs/install/codex/windows-native-img-01.webp',
            'Windows 安装 NVM',
            '图 2：等待 NVM 安装完成。',
          ),
          paragraph(
            '安装结束后关闭当前 PowerShell，再重新打开一个新的 PowerShell 窗口。',
          ),
        ],
      },
      {
        title: '安装 Node.js 22',
        blocks: [
          paragraph('在新打开的 PowerShell 中执行：'),
          code('nvm install 22\nnvm use 22\nnode -v\nnpm -v'),
          image(
            '/console-docs/install/codex/windows-native-img-02.webp',
            'Windows 安装 Node.js',
            '图 3：看到 Node.js 和 npm 的版本号表示安装成功。',
          ),
        ],
      },
      {
        title: '设置 PowerShell 执行策略',
        blocks: [
          paragraph(
            '如果后面安装 npm 命令时出现红色报错，再执行以下命令，并在询问时输入 Y：',
          ),
          code(
            'Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned',
          ),
          image(
            '/console-docs/install/codex/windows-native-img-03.webp',
            'Windows 设置 PowerShell 执行策略',
            '图 4：按提示确认执行策略，不应出现红色错误。',
          ),
        ],
      },
      {
        title: '安装 Codex CLI',
        blocks: [
          code('npm install -g @openai/codex\ncodex -V'),
          image(
            '/console-docs/install/codex/windows-native-img-04.webp',
            'Windows 安装 Codex CLI',
            '图 5：看到 codex -V 输出版本号表示安装成功。',
          ),
        ],
      },
      API_KEY_STEP,
      {
        title: '创建 Codex 配置文件',
        blocks: [
          paragraph(
            '在 Windows 用户主目录下创建 .codex 文件夹，并分别新建 auth.json 与 config.toml。',
          ),
          code(CODEX_AUTH_JSON, 'json'),
          code(CODEX_CONFIG_TOML, 'toml'),
          image(
            '/console-docs/install/codex/windows-configure.webp',
            'Windows Codex 配置文件',
            '图 6：配置文件编辑效果参考，请以本页显示的 auth.json 和 config.toml 内容为准。',
          ),
          note('配置文件位置', [
            'PowerShell 中可以使用 $HOME\\.codex 打开目标目录。',
            '修改配置后关闭并重新打开终端。',
          ]),
        ],
      },
      {
        title: '验证并启动',
        blocks: [
          code(CODEX_VERIFY_AND_START),
          image(
            '/console-docs/install/codex/windows-img-09.webp',
            'Windows Codex 首次启动',
            '图 7：首次启动时按界面提示继续。',
          ),
          image(
            '/console-docs/install/codex/windows-img-10.webp',
            'Windows Codex 权限选择',
            '图 8：选择 Codex 修改文件时的权限方式。',
          ),
          paragraph('选择“需要手动确认”更安全；熟悉后再考虑允许自动修改文件。'),
          paragraph('在 Codex 中切换模型：'),
          code('/model'),
          image(
            '/console-docs/install/codex/windows-img-11.webp',
            'Windows Codex 模型选择',
            '图 9：输入 /model 后打开模型列表。',
          ),
          image(
            '/console-docs/install/codex/windows-img-12.webp',
            'Windows Codex 模型列表',
            '图 10：选择模型价格页中显示的模型。',
          ),
          image(
            '/console-docs/install/codex/windows-img-13.webp',
            'Windows Codex 模型确认',
            '图 11：继续确认模型信息。',
          ),
          image(
            '/console-docs/install/codex/windows-img-14.webp',
            'Windows Codex 对话界面',
            '图 12：确认模型后进入对话界面。',
          ),
        ],
      },
    ],
    SUPPORT_CONTACT,
  ),
  section('windows-native-troubleshooting', '常见问题', [
    note('codex 命令找不到', [
      '关闭并重新打开 PowerShell。',
      '重新执行 npm install -g @openai/codex，并检查 npm 全局 bin 目录是否在 PATH 中。',
    ]),
    note('请求仍然走官方账号', [
      '确认配置目录是 $HOME\\.codex，而不是项目目录中的 .codex。',
      '检查 config.toml 的 base_url 是否以 /v1 结尾。',
    ]),
  ]),
];

const CODEX_WINDOWS_WSL_SECTIONS = [
  callout(
    'windows-wsl-overview',
    'WSL 接入方式',
    '适合已经在 WSL2 中开发的用户。Codex 运行在 Linux 环境，但项目文件仍可放在 Windows 磁盘或 WSL 文件系统中。',
  ),
  section('wsl-requirements', '系统要求', [
    paragraph(
      '已启用 WSL2，并能在 Linux 终端中安装 Node.js。若尚未安装，请先在管理员 PowerShell 中安装 WSL。',
    ),
  ]),
  stepsSection(
    'wsl-steps',
    '安装与配置',
    [
      {
        title: '安装 WSL 与 Node.js',
        blocks: [
          BEGINNER_TERMINAL_TIP,
          code('wsl --install'),
          image(
            '/console-docs/install/codex/windows-img-03.webp',
            'Windows 安装 WSL',
            '图 1：等待 WSL 安装完成，并按提示重启电脑。',
          ),
          paragraph('重启 Windows 后进入 WSL，使用 NVM 安装 Node.js 22：'),
          code(
            'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash\nnvm install 22\nnvm use 22',
          ),
          image(
            '/console-docs/install/codex/windows-img-04.webp',
            'WSL 安装 NVM',
            '图 2：NVM 安装完成后的终端提示。',
          ),
          image(
            '/console-docs/install/codex/windows-img-05.webp',
            'WSL 安装 Node.js',
            '图 3：安装 Node.js 22 并检查版本。',
          ),
        ],
      },
      {
        title: '安装 Codex CLI',
        blocks: [
          code('npm install -g @openai/codex\ncodex -V'),
          image(
            '/console-docs/install/codex/windows-img-06.webp',
            'WSL 安装 Codex CLI',
            '图 4：看到 codex -V 输出版本号表示安装成功。',
          ),
        ],
      },
      API_KEY_STEP,
      {
        title: '写入 WSL 配置',
        blocks: [
          paragraph(
            '在 WSL 用户目录中创建 Codex 配置，确保不要使用 Windows 路径中的旧配置文件。',
          ),
          code(CODEX_POSIX_CONFIG('.bashrc')),
          image(
            '/console-docs/install/codex/windows-configure.webp',
            'WSL Codex 配置文件',
            '图 5：配置文件编辑效果参考，请以本页显示的配置内容为准。',
          ),
        ],
      },
      {
        title: '验证并启动',
        blocks: [
          code(CODEX_VERIFY_AND_START),
          image(
            '/console-docs/install/codex/windows-img-09.webp',
            'WSL Codex 首次启动',
            '图 6：首次启动时按界面提示继续。',
          ),
          image(
            '/console-docs/install/codex/windows-img-10.webp',
            'WSL Codex 权限选择',
            '图 7：选择 Codex 修改文件时的权限方式。',
          ),
          paragraph('在 Codex 中切换模型：'),
          code('/model'),
          image(
            '/console-docs/install/codex/windows-img-11.webp',
            'WSL Codex 模型选择',
            '图 8：输入 /model 后打开模型列表。',
          ),
          image(
            '/console-docs/install/codex/windows-img-12.webp',
            'WSL Codex 模型列表',
            '图 9：选择模型价格页中显示的模型。',
          ),
          image(
            '/console-docs/install/codex/windows-img-13.webp',
            'WSL Codex 模型确认',
            '图 10：继续确认模型信息。',
          ),
          image(
            '/console-docs/install/codex/windows-img-14.webp',
            'WSL Codex 对话界面',
            '图 11：确认模型后进入对话界面。',
          ),
        ],
      },
    ],
    SUPPORT_CONTACT,
  ),
];

export const CODEX_INSTALL_GUIDE = {
  productId: 'codex',
  productLabel: 'Codex',
  basePath: '/console/install/codex',
  highlights: ['零基础图文步骤', 'PowerShell / WSL', 'Codex 桌面版'],
  quickActions: [
    { label: '创建 API Key', to: '/console/token', primary: true },
    { label: '查看模型价格', to: '/console/pricing' },
    { label: 'Codex 桌面版', to: '/console/install/codex/desktop' },
  ],
  platforms: [
    {
      id: 'windows',
      label: 'Windows',
      title: 'Windows 接入 Codex',
      description:
        '从打开 PowerShell 和安装 Node.js 开始，按截图完成配置和首次对话。',
      defaultSubTab: 'native',
      subTabs: [
        {
          id: 'native',
          label: 'PowerShell',
          sections: CODEX_WINDOWS_NATIVE_SECTIONS,
        },
        {
          id: 'wsl',
          label: 'WSL',
          sections: CODEX_WINDOWS_WSL_SECTIONS,
        },
      ],
    },
    {
      id: 'macos',
      label: 'macOS',
      title: 'macOS 接入 Codex',
      description:
        '从打开 Terminal 开始，按截图完成 Homebrew、Node.js、Codex 和首次对话配置。',
      sections: [
        callout(
          'macos-overview',
          '推荐接入路径',
          '已安装 Homebrew 时可以直接用 brew 安装；否则使用 Node.js 22 和 npm。',
        ),
        section('macos-requirements', '系统要求', [
          paragraph('macOS 12 及以上，已安装 npm 或 Homebrew。'),
        ]),
        stepsSection(
          'macos-steps',
          '安装与配置',
          [
            {
              title: '安装 Homebrew（已安装可跳过）',
              blocks: [
                BEGINNER_TERMINAL_TIP,
                paragraph(
                  '打开 Terminal 后，检查是否已经安装 Homebrew。看到版本号即可跳到下一步：',
                ),
                code('brew --version'),
                image(
                  '/console-docs/install/codex/macos-img-01.webp',
                  'macOS 打开 Homebrew 官网',
                  '图 1：如果尚未安装，请打开 Homebrew 官网。',
                ),
                code(
                  '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
                ),
                image(
                  '/console-docs/install/codex/macos-img-02.webp',
                  'macOS 安装 Homebrew',
                  '图 2：按终端提示输入密码并确认安装。',
                ),
                image(
                  '/console-docs/install/codex/macos-img-03.webp',
                  'macOS Homebrew 安装过程',
                  '图 3：等待 Homebrew 下载和安装完成。',
                ),
                image(
                  '/console-docs/install/codex/macos-img-04.webp',
                  'macOS Homebrew 安装完成',
                  '图 4：看到安装成功提示后继续。',
                ),
              ],
            },
            {
              title: '安装 Node.js 22',
              blocks: [
                paragraph('使用 Homebrew 安装 Node.js：'),
                code('brew install node'),
                image(
                  '/console-docs/install/codex/macos-img-05.webp',
                  'macOS 安装 Node.js',
                  '图 5：等待 Node.js 安装完成。',
                ),
                image(
                  '/console-docs/install/codex/macos-img-06.webp',
                  'macOS 验证 Node.js',
                  '图 6：确认 node 和 npm 都能输出版本号。',
                ),
                code('node --version\nnpm --version'),
              ],
            },
            {
              title: '安装 Codex CLI',
              blocks: [
                code('npm install -g @openai/codex'),
                image(
                  '/console-docs/install/codex/macos-img-07.webp',
                  'macOS 安装 Codex CLI',
                  '图 7：等待 npm 安装完成。',
                ),
                paragraph('安装完成后检查版本：'),
                code('codex -V'),
              ],
            },
            API_KEY_STEP,
            {
              title: '写入 Codex 配置',
              blocks: [
                code(CODEX_POSIX_CONFIG('.zshrc')),
                image(
                  '/console-docs/install/codex/macos-configure.webp',
                  'macOS Codex 配置文件',
                  '图 8：配置文件写入结果参考，请以本页配置内容为准。',
                ),
                richText(
                  '配置中的 API 地址会自动使用当前站点域名。模型列表可在 ',
                  { text: '模型价格页', href: '/console/pricing' },
                  ' 查看。',
                ),
              ],
            },
            {
              title: '验证并启动',
              blocks: [
                code(CODEX_VERIFY_AND_START),
                image(
                  '/console-docs/install/codex/macos-img-09.webp',
                  'macOS Codex 首次启动',
                  '图 9：首次启动时按界面提示继续。',
                ),
                image(
                  '/console-docs/install/codex/macos-img-10.webp',
                  'macOS Codex 工作目录',
                  '图 10：确认要交给 Codex 处理的项目目录。',
                ),
                paragraph('选择 Codex 修改文件时的权限方式：'),
                image(
                  '/console-docs/install/codex/macos-img-11.webp',
                  'macOS Codex 权限选择',
                  '图 11：选择手动确认修改更安全。',
                ),
                image(
                  '/console-docs/install/codex/macos-img-12.webp',
                  'macOS Codex 权限说明',
                  '图 12：阅读权限说明后继续。',
                ),
                image(
                  '/console-docs/install/codex/macos-img-13.webp',
                  'macOS Codex 模型选择',
                  '图 13：选择模型价格页中显示的模型。',
                ),
                image(
                  '/console-docs/install/codex/macos-img-14.webp',
                  'macOS Codex 对话界面',
                  '图 14：进入对话界面后输入测试任务。',
                ),
              ],
            },
          ],
          SUPPORT_CONTACT,
        ),
        section('macos-troubleshooting', '常见问题', [
          note('权限错误', [
            '优先修复 npm 全局目录权限。',
            '如果必须使用 sudo，请确认安装来源和命令完全可信。',
          ]),
          note('模型名称报错', [
            '打开 config.toml，确认 model 与本站模型价格页中的名称一致。',
          ]),
        ]),
      ],
    },
    {
      id: 'linux',
      label: 'Linux',
      title: 'Linux 接入 Codex',
      description: '从打开终端开始，按截图完成 Node.js、Codex 和首次对话配置。',
      sections: [
        callout(
          'linux-overview',
          '推荐接入路径',
          '建议使用 Node.js 22。以下示例适用于 Ubuntu/Debian，其他发行版请替换对应的包管理命令。',
        ),
        section('linux-requirements', '系统要求', [
          paragraph('主流 Linux 发行版，具备 curl、bash 和 npm。'),
        ]),
        stepsSection(
          'linux-steps',
          '安装与配置',
          [
            {
              title: '打开终端并安装 Node.js',
              blocks: [
                BEGINNER_TERMINAL_TIP,
                paragraph(
                  '按 Ctrl+Alt+T 打开终端，执行下面的命令安装 Node.js：',
                ),
                code(
                  'curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -\nsudo apt-get install -y nodejs\nnode --version\nnpm --version',
                ),
                image(
                  '/console-docs/install/codex/linux-img-01.webp',
                  'Linux 安装 Node.js',
                  '图 1：等待 Node.js 安装完成。',
                ),
                image(
                  '/console-docs/install/codex/linux-img-02.webp',
                  'Linux 验证 Node.js',
                  '图 2：看到 node 和 npm 的版本号表示安装成功。',
                ),
              ],
            },
            {
              title: '安装 Codex CLI',
              blocks: [
                code('npm install -g @openai/codex\ncodex -V'),
                image(
                  '/console-docs/install/codex/linux-img-03.webp',
                  'Linux 安装 Codex CLI',
                  '图 3：看到 codex -V 输出版本号表示安装成功。',
                ),
              ],
            },
            API_KEY_STEP,
            {
              title: '写入 Codex 配置',
              blocks: [
                code(CODEX_POSIX_CONFIG('.bashrc')),
                image(
                  '/console-docs/install/codex/linux-configure.webp',
                  'Linux Codex 配置文件',
                  '图 4：配置文件写入结果参考，请以本页配置内容为准。',
                ),
              ],
            },
            {
              title: '验证并启动',
              blocks: [
                code(CODEX_VERIFY_AND_START),
                image(
                  '/console-docs/install/codex/linux-img-05.webp',
                  'Linux Codex 首次启动',
                  '图 5：首次启动时按界面提示继续。',
                ),
                image(
                  '/console-docs/install/codex/linux-img-06.webp',
                  'Linux Codex 工作目录',
                  '图 6：确认要交给 Codex 处理的项目目录。',
                ),
                paragraph('选择 Codex 修改文件时的权限方式：'),
                image(
                  '/console-docs/install/codex/linux-img-07.webp',
                  'Linux Codex 权限选择',
                  '图 7：选择手动确认修改更安全。',
                ),
                image(
                  '/console-docs/install/codex/linux-img-08.webp',
                  'Linux Codex 权限说明',
                  '图 8：阅读权限说明后继续。',
                ),
                image(
                  '/console-docs/install/codex/linux-img-09.webp',
                  'Linux Codex 模型选择',
                  '图 9：选择模型价格页中显示的模型。',
                ),
                image(
                  '/console-docs/install/codex/linux-img-10.webp',
                  'Linux Codex 对话界面',
                  '图 10：进入对话界面后输入测试任务。',
                ),
              ],
            },
          ],
          SUPPORT_CONTACT,
        ),
      ],
    },
    {
      id: 'desktop',
      label: '桌面版',
      title: 'Codex 桌面版安装指南',
      description:
        '安装官方 Codex 桌面客户端，并复用本站已经配置好的 Codex Provider 和 API Key。',
      sections: [
        callout(
          'desktop-overview',
          '先完成一次 CLI 配置',
          'Codex 桌面版会复用本机的 Codex 配置。请先按对应系统完成 CLI 安装，把本站 Base URL、API Key 和模型写入 config.toml 与 auth.json。',
        ),
        section('desktop-requirements', '系统要求', [
          paragraph(
            '官方桌面客户端当前是否向 Windows、macOS 或 Linux 提供安装包，以 Codex 官方落地页实际显示为准。桌面版不可用时仍可使用已配置好的 CLI。',
          ),
          note('安装前确认', [
            '已经在本站创建 API Key。',
            '已经完成对应系统的 Codex CLI 配置。',
            'config.toml 中的 base_url 使用本站地址，API Key 已写入 auth.json。',
          ]),
        ]),
        stepsSection(
          'desktop-steps',
          '安装与配置',
          [
            {
              title: '完成 Codex CLI 基础配置',
              blocks: [
                paragraph(
                  '打开对应系统的 Codex 安装页，完成 API Key、auth.json 和 config.toml 配置后，再继续安装桌面版。',
                ),
                richText(
                  '回到 ',
                  {
                    text: 'Codex 安装首页',
                    href: '/console/install/codex',
                  },
                  ' 选择 Windows、macOS 或 Linux，并按页面步骤完成配置。',
                ),
                code('codex -V\ncodex'),
                paragraph(
                  '只有 CLI 能正常启动并完成一次测试对话后，再安装桌面客户端，避免同时排查两套问题。',
                ),
              ],
            },
            {
              title: '下载官方 Codex 桌面客户端',
              blocks: [
                richText(
                  '打开 ',
                  {
                    text: 'Codex 官方桌面落地页',
                    href: 'https://chatgpt.com/codex?app-landing-page=true',
                  },
                  '，查看当前系统是否提供桌面版下载按钮。',
                ),
                richText(
                  'Codex 也包含在官方 ChatGPT 桌面应用中，也可以从 ',
                  {
                    text: 'ChatGPT 官方下载页',
                    href: 'https://chatgpt.com/download/',
                  },
                  ' 下载对应系统版本。',
                ),
                note('只使用官方来源', [
                  '不要从网盘、聊天群或第三方下载站获取安装包。',
                  '如果官方落地页当前没有提供你的系统版本，请继续使用 CLI。',
                ]),
              ],
            },
            {
              title: '安装并启动 Codex 桌面版',
              blocks: [
                paragraph(
                  '下载完成后运行安装包，按系统安装向导完成安装。安装结束后从应用列表启动 Codex 或 ChatGPT 桌面应用。',
                ),
                paragraph(
                  '如果已经安装 Codex CLI，并且当前版本支持桌面入口，也可以在终端执行：',
                ),
                code('codex app'),
                note('界面以当前客户端为准', [
                  '不同版本的桌面入口和设置页面可能变化。',
                  '本页不要求你在桌面客户端重新输入一次 API Key。',
                ]),
              ],
            },
            {
              title: '确认桌面版读取本站配置',
              blocks: [
                paragraph(
                  'Codex 桌面版会读取本机 Codex 配置目录。macOS/Linux 通常是 ~/.codex，Windows 通常是 $HOME\\.codex。',
                ),
                code(CODEX_CONFIG_TOML, 'toml'),
                note('如果桌面版仍显示 ChatGPT 登录', [
                  '确认 CLI 已使用本站配置并完成测试。',
                  '确认桌面客户端读取的是同一个用户目录。',
                  '如果客户端不提供自定义 Provider 选项，请返回 CLI 使用。',
                ]),
              ],
            },
            {
              title: '打开项目并验证',
              blocks: [
                paragraph(
                  '在 Codex 桌面版中打开一个已经纳入 Git 的测试项目，发送只读分析任务：',
                ),
                code(
                  '先只读分析这个项目，不要修改文件。告诉我技术栈、启动命令、测试命令和三个主要风险。',
                  'prompt',
                ),
                paragraph(
                  '收到回复后，回到本站使用日志，确认请求来自刚才创建的 API Key。',
                ),
                image(
                  '/console-docs/install/codex/introduce-01.webp',
                  'Codex 桌面工作区界面示意',
                  'Codex 工作区界面示意，实际布局以当前桌面版为准。',
                ),
              ],
            },
          ],
          SUPPORT_CONTACT,
        ),
        section('desktop-troubleshooting', '常见问题', [
          note('桌面版没有自定义 Provider 入口', [
            '不同版本开放程度不同，以客户端实际设置项为准。',
            '当前页面推荐先完成 CLI 配置，再让桌面版复用本机配置。',
          ]),
          note('请求仍进入 ChatGPT 账号额度', [
            '关闭桌面应用后，重新确认 config.toml 的 model_provider 和 base_url。',
            '重新启动桌面版，并在使用日志中检查请求是否进入本站。',
          ]),
          note('桌面版无法启动但 CLI 正常', [
            '优先重新安装官方桌面客户端。',
            '不要删除已经可用的 ~/.codex 配置，除非你确定问题来自配置文件本身。',
          ]),
        ]),
      ],
    },
  ],
};

const GEMINI_COMMON_AUTH_STEPS = [
  {
    title: '首次启动并信任项目目录',
    blocks: [
      paragraph(
        '重新打开终端，输入 gemini 启动。首次启动时选择 Trust folder，表示允许 Gemini CLI 读取当前项目文件夹。',
      ),
      code('gemini'),
      image(
        '/console-docs/install/gemini/macos/trust-folder.png',
        'Gemini CLI 选择 Trust folder',
        '图 1：使用方向键选择 Trust folder，按回车确认。',
      ),
    ],
  },
  {
    title: '选择 Gemini API Key 登录方式',
    blocks: [
      paragraph('在登录方式列表中选择 Use Gemini API Key，然后按回车。'),
      image(
        '/console-docs/install/gemini/macos/use-gemini-api-key.png',
        'Gemini CLI 选择 Use Gemini API Key',
        '图 2：选择 Use Gemini API Key，不要选择 Google 账号登录。',
      ),
      paragraph(
        '一键配置脚本已经写入 AIF4 的 API Key，所以下一步会看到预填密钥。直接按回车继续。',
      ),
      image(
        '/console-docs/install/gemini/macos/prefilled-key.png',
        'Gemini CLI 已预填 API Key',
        '图 3：确认已经预填 API Key 后直接回车。',
      ),
    ],
  },
];

const GEMINI_MODEL_STEP = (imageRoot) => ({
  title: '切换 Gemini 模型',
  blocks: [
    paragraph(
      '进入对话界面后输入 /model，选择 Manual 模式，再从列表中选择本站模型价格页中可用的 Gemini 模型。',
    ),
    code('/model'),
    image(
      `/console-docs/install/gemini/${imageRoot}/switch-model.png`,
      'Gemini CLI 输入 /model 并选择 Manual',
      '图 4：输入 /model，选择 2 Manual 模式。',
    ),
    image(
      `/console-docs/install/gemini/${imageRoot}/manual-supported-model.png`,
      'Gemini CLI Manual 模式选择模型',
      '图 5：在 Manual 模式中选择当前站点支持的 Gemini 模型。',
    ),
    richText(
      '模型名称和支持情况可在 ',
      { text: '模型价格页', href: '/console/pricing' },
      ' 查看，例如 gemini-4-carbon。',
    ),
  ],
});

const GEMINI_START_STEP = {
  title: '在项目中开始使用',
  blocks: [
    paragraph('先进入一个项目目录，再启动 Gemini CLI：'),
    code(
      '# 进入你的项目目录\ncd /path/to/your/project\n\n# 启动 Gemini CLI\ngemini',
    ),
    paragraph('先让 Gemini 只读分析项目，确认它理解仓库后，再授权修改文件。'),
  ],
};

export const GEMINI_INSTALL_GUIDE = {
  productId: 'gemini',
  productLabel: 'Gemini CLI',
  basePath: '/console/install/gemini',
  highlights: ['零基础图文步骤', '官方 Gemini CLI', '手动配置'],
  quickActions: [
    { label: '创建 API Key', to: '/console/token', primary: true },
    { label: '查看模型价格', to: '/console/pricing' },
  ],
  platforms: [
    {
      id: 'windows',
      label: 'Windows',
      title: 'Windows Gemini CLI 安装指南',
      description:
        '从打开 PowerShell 开始，安装官方 Gemini CLI 并手动写入本站 API Key。',
      sections: [
        callout(
          'windows-overview',
          '官方原版安装',
          '使用官方 @google/gemini-cli，并手动写入 AIF4 的 Gemini 环境变量。',
        ),
        section('windows-requirements', '系统要求', [
          paragraph('Windows 10 1809 及以上，已安装 Node.js LTS 和 npm。'),
        ]),
        stepsSection(
          'windows-steps',
          '安装与配置',
          [
            {
              title: '安装官方 Gemini CLI',
              blocks: [
                BEGINNER_TERMINAL_TIP,
                paragraph(
                  '按 Win 键搜索 PowerShell。为了安装全局 npm 命令，建议右键选择“以管理员身份运行”。',
                ),
                code(
                  'node -v\nnpm -v\nnpm install -g @google/gemini-cli@latest\ngemini --version',
                  'powershell',
                ),
              ],
            },
            {
              title: '创建 Gemini 配置文件',
              blocks: [
                paragraph(
                  '在 PowerShell 中创建配置目录，然后用记事本打开两个配置文件：',
                ),
                code(
                  'New-Item -ItemType Directory -Force "$HOME\\.gemini"\nnotepad "$HOME\\.gemini\\.env"\nnotepad "$HOME\\.gemini\\settings.json"',
                  'powershell',
                ),
                paragraph('.env 文件内容：'),
                code(GEMINI_ENV_CONTENT, 'text'),
                paragraph('settings.json 文件内容：'),
                code(GEMINI_SETTINGS_CONTENT, 'json'),
              ],
            },
            ...GEMINI_COMMON_AUTH_STEPS,
            GEMINI_MODEL_STEP('windows'),
            GEMINI_START_STEP,
          ],
          SUPPORT_CONTACT,
        ),
        section('windows-troubleshooting', '常见问题', [
          note('npm 安装失败', [
            '确认 PowerShell 是以管理员身份打开。',
            '确认 Node.js 和 npm 已经安装，并能在新终端中输出版本号。',
          ]),
          note('gemini 命令找不到', [
            '关闭并重新打开 PowerShell，再运行 gemini --version。',
            '确认 Node.js 和 npm 的全局 bin 目录已经加入 PATH。',
          ]),
        ]),
      ],
    },
    {
      id: 'macos',
      label: 'macOS',
      title: 'macOS Gemini CLI 安装指南',
      description:
        '从打开 Terminal 开始，安装官方 Gemini CLI 并手动写入本站 API Key。',
      sections: [
        callout(
          'macos-overview',
          '官方原版安装',
          '使用官方 @google/gemini-cli，并手动完成 API Key 和网关配置。',
        ),
        section('macos-requirements', '系统要求', [
          paragraph('macOS 10.15 及以上，已安装 Node.js LTS 和 npm。'),
        ]),
        stepsSection(
          'macos-steps',
          '安装与配置',
          [
            {
              title: '打开终端并安装官方 Gemini CLI',
              blocks: [
                BEGINNER_TERMINAL_TIP,
                paragraph(
                  '按 Command+空格，搜索 Terminal 并打开终端，然后运行：',
                ),
                code(
                  'node -v\nnpm -v\nnpm install -g @google/gemini-cli@latest\ngemini --version',
                ),
              ],
            },
            {
              title: '创建 Gemini 配置文件',
              blocks: [
                paragraph(
                  '在终端运行下面的命令，创建 ~/.gemini/.env 和 settings.json。已有配置时请先自行备份。',
                ),
                code(GEMINI_POSIX_CONFIG),
              ],
            },
            ...GEMINI_COMMON_AUTH_STEPS,
            GEMINI_MODEL_STEP('macos'),
            GEMINI_START_STEP,
          ],
          SUPPORT_CONTACT,
        ),
        section('macos-troubleshooting', '常见问题', [
          note('npm 全局安装权限错误', [
            '建议使用 Node 版本管理器或修复当前用户的 npm 全局目录权限。',
            '不要长期使用 sudo npm install 修改全局环境。',
          ]),
          note('没有预填 Key', [
            '检查 ~/.gemini/.env 是否包含 GEMINI_API_KEY 和 GOOGLE_GEMINI_BASE_URL。',
            '重新打开 .env 文件，确认 API Key 没有缺少字符或多余空格。',
          ]),
        ]),
      ],
    },
    {
      id: 'linux',
      label: 'Linux',
      title: 'Linux Gemini CLI 安装指南',
      description:
        '从打开终端开始，安装官方 Gemini CLI 并手动写入本站 API Key。',
      sections: [
        callout(
          'linux-overview',
          '官方原版安装',
          '使用官方 @google/gemini-cli，并手动完成 API Key 和网关配置。',
        ),
        section('linux-requirements', '系统要求', [
          paragraph('主流 Linux 发行版，已安装 Node.js LTS 和 npm。'),
        ]),
        stepsSection(
          'linux-steps',
          '安装与配置',
          [
            {
              title: '打开终端并安装官方 Gemini CLI',
              blocks: [
                BEGINNER_TERMINAL_TIP,
                paragraph('按 Ctrl+Alt+T 打开终端，然后运行：'),
                code(
                  'node -v\nnpm -v\nnpm install -g @google/gemini-cli@latest\ngemini --version',
                ),
              ],
            },
            {
              title: '创建 Gemini 配置文件',
              blocks: [
                paragraph(
                  '在终端运行下面的命令，创建 ~/.gemini/.env 和 settings.json。已有配置时请先自行备份。',
                ),
                code(GEMINI_POSIX_CONFIG),
              ],
            },
            ...GEMINI_COMMON_AUTH_STEPS,
            GEMINI_MODEL_STEP('macos'),
            GEMINI_START_STEP,
          ],
          SUPPORT_CONTACT,
        ),
        section('linux-troubleshooting', '常见问题', [
          note('Node.js 未安装', [
            '先通过发行版包管理器、NodeSource 或 nvm 安装 Node.js LTS。',
            '安装完成后重新执行 npm install -g @google/gemini-cli@latest。',
          ]),
          note('网关返回 404 或模型不存在', [
            '确认 ~/.gemini/.env 中 GOOGLE_GEMINI_BASE_URL 使用当前 AIF4 站点地址。',
            '确认模型名称与模型价格页一致，并在 /model 的 Manual 模式中选择。',
          ]),
        ]),
      ],
    },
  ],
};

export const INSTALL_GUIDES = {
  'claude-code': CLAUDE_CODE_INSTALL_GUIDE,
  codex: CODEX_INSTALL_GUIDE,
  gemini: GEMINI_INSTALL_GUIDE,
};
