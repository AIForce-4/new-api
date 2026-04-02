const codeBlock = (strings, ...values) =>
  String.raw({ raw: strings }, ...values).trim();

const INSTALL_GUIDE_ASSETS = {
  fingerImage: '/console-docs/install/finger-up.svg',
  supportQrCode: '/console-docs/install/support-wechat-qr.jpg',
  pricingContactQrCode: '/pricing-contact-qr.jpg',
  claudeWindowsStep01: '/console-docs/install/claude-code/windows-img-01.webp',
  claudeWindowsStep02: '/console-docs/install/claude-code/windows-img-02.webp',
  claudeWindowsStep03: '/console-docs/install/claude-code/windows-img-03.webp',
  claudeWindowsStep04: '/console-docs/install/claude-code/windows-img-04.webp',
  claudeWindowsStep05: '/console-docs/install/claude-code/windows-img-05.webp',
  claudeWindowsStep06: '/console-docs/install/claude-code/windows-img-06.webp',
  claudeWindowsStep07: '/console-docs/install/claude-code/windows-img-07.webp',
  claudeWindowsStep08: '/console-docs/install/claude-code/windows-img-08.webp',
  claudeWindowsStep09: '/console-docs/install/claude-code/windows-img-09.webp',
  claudeWindowsConfigure: '/console-docs/install/claude-code/windows-configure.webp',
  claudeWindowsStep11: '/console-docs/install/claude-code/windows-img-11.webp',
  claudeWindowsStep12: '/console-docs/install/claude-code/windows-img-12.webp',
  claudeWindowsStep13: '/console-docs/install/claude-code/windows-img-13.webp',
  claudeWindowsStep14: '/console-docs/install/claude-code/windows-img-14.webp',
  claudeWindowsStep15: '/console-docs/install/claude-code/windows-img-15.webp',
  claudeWindowsStep16: '/console-docs/install/claude-code/windows-img-16.webp',
  claudeWindowsStep17: '/console-docs/install/claude-code/windows-img-17.webp',
  codexWindowsOpenTerminal: '/console-docs/install/codex/windows-open-terminal.webp',
  codexWindowsStep03: '/console-docs/install/codex/windows-img-03.webp',
  codexWindowsStep04: '/console-docs/install/codex/windows-img-04.webp',
  codexWindowsStep05: '/console-docs/install/codex/windows-img-05.webp',
  codexWindowsStep06: '/console-docs/install/codex/windows-img-06.webp',
  codexWindowsConfigure: '/console-docs/install/codex/windows-configure.webp',
  codexWindowsStep09: '/console-docs/install/codex/windows-img-09.webp',
  codexWindowsStep10: '/console-docs/install/codex/windows-img-10.webp',
  codexWindowsStep11: '/console-docs/install/codex/windows-img-11.webp',
  codexWindowsStep12: '/console-docs/install/codex/windows-img-12.webp',
  codexWindowsStep13: '/console-docs/install/codex/windows-img-13.webp',
  codexWindowsStep14: '/console-docs/install/codex/windows-img-14.webp',
};

const SUPPORT_CONTACT = {
  fingerImage: INSTALL_GUIDE_ASSETS.fingerImage,
  buttonText: '有疑问? 技术支持',
  title: '扫码添加客服微信',
  description: '微信扫一扫，添加客服获取帮助',
  qrCodeImage: INSTALL_GUIDE_ASSETS.supportQrCode,
  qrCodeAlt: '客服微信二维码',
};

const WINDOWS_SUPPORT_CONTACT = {
  ...SUPPORT_CONTACT,
  qrCodeImage: INSTALL_GUIDE_ASSETS.pricingContactQrCode,
};

const CLAUDE_START_CODE = codeBlock`
# 导航到您的项目
$ cd your-project-folder

# 启动 Claude Code
$ claude
`;

const CODEX_START_CODE = codeBlock`
# 导航到您的项目
$ cd your-project-folder

# 启动 Codex
$ codex
`;

const CODEX_AUTH_JSON = codeBlock`
{
  "OPENAI_API_KEY": "你的API_KEY"
}
`;

const CODEX_CONFIG_TOML = codeBlock`
model_provider = "aicodemirror"
model = "gpt-5.4"
model_reasoning_effort = "xhigh"
disable_response_storage = true
preferred_auth_method = "apikey"

[model_providers.aicodemirror]
name = "aicodemirror"
base_url = "https://api.aicodemirror.com/api/codex/backend-api/codex"
wire_api = "responses"
`;

const WINDOWS_NODE_VERIFY_CODE = codeBlock`
node -v
npm -v
`;

const WINDOWS_GIT_VERIFY_CODE = codeBlock`
git --version
`;

const CLAUDE_WINDOWS_INSTALL_CODE = codeBlock`
npm install -g @anthropic-ai/claude-code
`;

const CLAUDE_WINDOWS_PATH_CODE = codeBlock`
[Environment]::SetEnvironmentVariable('Path', ([Environment]::GetEnvironmentVariable('Path','User') + ";$HOME\\.local\\bin"), 'User')
`;

const CLAUDE_WINDOWS_VERIFY_CODE = codeBlock`
claude --version
`;

const CLAUDE_WINDOWS_SETUP_CODE = codeBlock`
iex (irm 'https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/claude-cli-setup.ps1')
`;

const CODEX_WINDOWS_WSL_CODE = codeBlock`
wsl --install
`;

const CODEX_WINDOWS_NVM_INSTALL_CODE = codeBlock`
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
`;

const CODEX_WINDOWS_NODE_INSTALL_CODE = codeBlock`
wsl

nvm install 22
`;

const CODEX_WINDOWS_INSTALL_CODE = codeBlock`
npm i -g @openai/codex
`;

const CODEX_WINDOWS_VERIFY_CODE = codeBlock`
codex -V
`;

const CLAUDE_CODE_MARKDOWN_SECTIONS = [
  {
    id: 'overview',
    label: '概览',
    content: String.raw`
## 效果演示

![introduce-01.webp](/console-docs/install/claude-code/introduce-01.webp)

![introduce-02.webp](/console-docs/install/claude-code/introduce-02.webp)

### 特性

| **功能分类** | **特性** |
| --- | --- |
| **代码理解** | 深度代码库分析，利用智能代理搜索理解项目结构和依赖 |
|  | 自动生成高层次代码概述，快速帮助用户理解代码库 |
| **代码编辑** | 支持多文件协同编辑，适用于复杂代码修改 |
|  | 提供符合项目模式和架构的实际可用代码建议 |
| **集成能力** | 支持在终端中直接运行，无需切换上下文 |
|  | 与VS Code和JetBrains IDE无缝集成，无需复制粘贴 |
| **代码生成和优化** | 自动生成代码、创建测试、修复错误，支持从概念到提交的完整流程 |
|  | 为代码生成和理解优化，结合Claude Opus 4等先进模型 |
| **安全与灵活性** | 改动需获得用户明确授权，文件和命令操作更安全 |
|  | 适应用户代码规范，支持自定义配置 |
| **工具链整合** | 支持与GitHub、GitLab等工具结合，实现自动化工作流程 |
|  | 与测试套件、构建系统集成，增强现有开发工具 |
| **跨平台与扩展** | 支持Windows、macOS、Linux操作系统 |
|  | 可配置运行在SDK或GitHub Actions中，灵活适配不同需求 |
| **主要应用场景** | 代码库入门和理解、新成员快速上手 |
|  | 代码问题修复与优化流程，从分析问题到提交PR |
|  | 项目代码重构与新功能实现 |
| **用户反馈亮点** | 提升日常开发效率，省去例行任务消耗的时间 |
|  | 处理复杂多步骤任务表现优异，扩展开发可能性 |
`,
    codeBlocks: [],
  },
  {
    id: 'windows',
    label: 'Windows',
    content: String.raw`
#### 1.安装 Node.js 环境

Claude Code 需要 Node.js 环境才能运行。

> **Node.js 环境安装步骤**
> - 打开浏览器访问 [https://nodejs.org/](https://nodejs.org/)
> - 点击 "LTS"版本进行下载（推荐长期支持版本）
> - 下载完成后双击 .msi 文件
> - 按照安装向导完成安装，保持默认设置即可

> **Windows 注意事项**
> - 建议使用 PowerShell 而不是 CMD
> - 如果遇到权限问题，尝试以管理员身份运行
> - 某些杀毒软件可能会误报，需要添加白名单

![windows-img-01.webp](/console-docs/install/claude-code/windows-img-01.webp)

![windows-img-02.webp](/console-docs/install/claude-code/windows-img-02.webp)

![windows-img-03.webp](/console-docs/install/claude-code/windows-img-03.webp)

![windows-img-04.webp](/console-docs/install/claude-code/windows-img-04.webp)

![windows-img-05.webp](/console-docs/install/claude-code/windows-img-05.webp)

> **验证安装是否成功**
> 安装完成后，打开 PowerShell 或 CMD，输入以下命令。

#### 2.安装 Git Bash

> **Windows 注意事项**
> Windows 环境下需要使用 Git Bash 安装 Claude code。安装完成后，环境变量设置和使用 Claude Code 仍然在普通的 PowerShell 或 CMD 中进行。

> **下载并安装 Git for Windows**
> - 访问 [https://git-scm.com/downloads/win](https://git-scm.com/downloads/win)
> - 点击 "Download for Windows" 下载安装包
> - 运行下载的 .exe 安装文件
> - 在安装过程中保持默认设置，直接点击 "Next" 完成安装

![windows-img-06.webp](/console-docs/install/claude-code/windows-img-06.webp)

![windows-img-07.webp](/console-docs/install/claude-code/windows-img-07.webp)

![windows-img-08.webp](/console-docs/install/claude-code/windows-img-08.webp)

> **验证 Git Bash 安装**
> 安装完成后，打开 Git Bash，输入以下命令验证。

#### 3.安装 Claude Code

> **安装 Claude Code**
> 打开 PowerShell，运行以下命令。

![windows-img-09.webp](/console-docs/install/claude-code/windows-img-09.webp)

> **将 ~/.local/bin 加入 PATH（仅当提示要求时）**

> **验证 Claude Code 安装**
> 安装完成后，输入以下命令检查是否安装成功。

#### 4.设置环境变量

> **一键设置命令 (Windows 系统)**
> 为了让 Claude Code 连接到你的中转服务，需要设置多个环境变量。

![windows-configure](/console-docs/install/claude-code/windows-configure.webp)

#### 5.开始使用 Claude Code

现在你可以开始使用 Claude Code 了！

> **启动 Claude Code**
> 打开 PowerShell，直接启动 Claude Code。

![windows-img-11.webp](/console-docs/install/claude-code/windows-img-11.webp)

![windows-img-12.webp](/console-docs/install/claude-code/windows-img-12.webp)

![windows-img-13.webp](/console-docs/install/claude-code/windows-img-13.webp)

![windows-img-14.webp](/console-docs/install/claude-code/windows-img-14.webp)

![windows-img-15.webp](/console-docs/install/claude-code/windows-img-15.webp)

> **选择模型**

![windows-img-16.webp](/console-docs/install/claude-code/windows-img-16.webp)

![windows-img-17.webp](/console-docs/install/claude-code/windows-img-17.webp)

> 注意：设置环境变量修改后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。
`,
    codeBlocks: [
      { id: 'windows-code-1', language: 'bash', code: 'node --version\nnpm --version' },
      { id: 'windows-code-2', language: 'bash', code: 'git --version' },
      { id: 'windows-code-3', language: 'bash', code: 'npm install -g @anthropic-ai/claude-code' },
      { id: 'windows-code-4', language: 'powershell', code: `[Environment]::SetEnvironmentVariable('Path', ([Environment]::GetEnvironmentVariable('Path','User') + ";$HOME\\.local\\bin"), 'User')` },
      { id: 'windows-code-5', language: 'bash', code: 'claude --version' },
      { id: 'windows-code-6', language: 'powershell', code: `iex (irm 'https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/claude-cli-setup.ps1')` },
      { id: 'windows-code-7', language: 'bash', code: `claude\n\n# 进入你的项目目录\ncd C:\\path\\to\\your\\project\n\n# 启动 Claude Code\nclaude` },
      { id: 'windows-code-8', language: 'bash', code: '/model' },
    ],
  },
  {
    id: 'macos',
    label: 'macOS',
    content: String.raw`
#### 1.安装 Claude Code CLI

打开终端。

![macos-img-01.webp](/console-docs/install/claude-code/macos-img-01.webp)

> **安装 Claude Code**
> 打开终端，运行以下命令。

\`\`\`bash
curl -fsSL https://claude.ai/install.sh | bash
\`\`\`

![macos-img-02.webp](/console-docs/install/claude-code/macos-img-02.webp)

#### 2.设置环境变量

为了让 Claude Code 连接到第三方中转服务，需要设置环境变量。

> **一键设置 Claude Code 环境变量**
> 输入命令。

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/claude-cli-setup.sh | bash
\`\`\`

![macos-configure](/console-docs/install/claude-code/macos-configure.webp)

> **验证 Claude Code 安装**
> 安装完成后，输入以下命令检查是否安装成功。

\`\`\`bash
claude --version
\`\`\`

#### 3.开始使用 Claude Code

现在你可以开始使用 Claude Code 了！

> **启动 Claude Code**
> 直接启动 Claude Code。

\`\`\`bash
claude

# 进入你的项目目录
cd /path/to/your/project

# 启动 Claude Code
claude
\`\`\`

![macos-img-04.webp](/console-docs/install/claude-code/macos-img-04.webp)

![macos-img-05.webp](/console-docs/install/claude-code/macos-img-05.webp)

![macos-img-06.webp](/console-docs/install/claude-code/macos-img-06.webp)

![macos-img-07.webp](/console-docs/install/claude-code/macos-img-07.webp)

![macos-img-08.webp](/console-docs/install/claude-code/macos-img-08.webp)

> **选择模型 (可选)**

\`\`\`bash
/model
\`\`\`

![macos-img-09.webp](/console-docs/install/claude-code/macos-img-09.webp)

![macos-img-10.webp](/console-docs/install/claude-code/macos-img-10.webp)

![macos-img-11.webp](/console-docs/install/claude-code/macos-img-11.webp)

> 注意：设置环境变量修改 \`ANTHROPIC_BASE_URL\` 后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。

#### 4.macOS 常见问题解决

> **macOS 安全设置阻止运行**
> 如果系统阻止运行 Claude Code：
> - 打开"系统偏好设置" → "安全性与隐私"
> - 点击"仍要打开"或"允许"
> - 或者在 Terminal 中运行：\`sudo spctl --master-disable\`
`,
    codeBlocks: [
      { id: 'macos-code-1', language: 'terminal', code: 'curl -fsSL https://claude.ai/install.sh | bash' },
      { id: 'macos-code-2', language: 'terminal', code: `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc` },
      { id: 'macos-code-3', language: 'terminal', code: `curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/claude-cli-setup.sh | bash` },
      { id: 'macos-code-4', language: 'terminal', code: 'claude --version' },
      { id: 'macos-code-5', language: 'terminal', code: `claude\n\n# 进入你的项目目录\ncd /path/to/your/project\n\n# 启动 Claude Code\nclaude` },
      { id: 'macos-code-6', language: 'terminal', code: '/model' },
    ],
  },
  {
    id: 'linux',
    label: 'Linux',
    content: String.raw`
#### 1.安装 Claude Code

![linux-img-01.webp](/console-docs/install/claude-code/linux-img-01.webp)

> **安装 Claude Code**
> 打开终端，运行以下命令。

\`\`\`bash
curl -fsSL https://claude.ai/install.sh | bash
\`\`\`

> 如果普通安装失败，可尝试使用 sudo：

\`\`\`bash
sudo curl -fsSL https://claude.ai/install.sh | bash
\`\`\`

![linux-img-03.webp](/console-docs/install/claude-code/linux-img-03.webp)

> **验证 Claude Code 安装**
> 安装完成后，输入以下命令检查是否安装成功。

\`\`\`bash
claude --version
\`\`\`

#### 2.设置环境变量

为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量。

> **一键修改环境变量**
> 输入命令。

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/claude-cli-setup.sh | bash
\`\`\`

![macos-configure](/console-docs/install/claude-code/linux-configure.webp)

#### 3.开始使用 Claude Code

现在你可以开始使用 Claude Code 了！

> **启动 Claude Code**
> 直接启动 Claude Code。

\`\`\`bash
claude

# 进入你的项目目录
cd /path/to/your/project

# 启动 Claude Code
claude
\`\`\`

![linux-img-03.webp](/console-docs/install/claude-code/linux-img-03-usage.webp)

![linux-img-04.webp](/console-docs/install/claude-code/linux-img-04.webp)

![linux-img-05.webp](/console-docs/install/claude-code/linux-img-05.webp)

> **选择模型**

\`\`\`bash
/model
\`\`\`

![linux-img-06.webp](/console-docs/install/claude-code/linux-img-06.webp)

![linux-img-07.webp](/console-docs/install/claude-code/linux-img-07.webp)

![linux-img-08.webp](/console-docs/install/claude-code/linux-img-08.webp)

![linux-img-09.webp](/console-docs/install/claude-code/linux-img-09.webp)

> 注意：设置环境变量修改 \`ANTHROPIC_BASE_URL\` 后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。

#### 4.Linux 常见问题解决

> **缺少依赖库**
> 某些 Linux 发行版需要安装额外依赖。

\`\`\`bash
# Ubuntu/Debian
sudo apt install build-essential

# CentOS/RHEL
sudo dnf groupinstall "Development Tools"
\`\`\`

> **环境变量不生效**
> 检查以下几点：
> - 确认修改了正确的配置文件（\`.bashrc\` 或 \`.zshrc\`）
> - 重新启动终端或运行 \`source ~/.bashrc\`
> - 验证设置：\`echo $ANTHROPIC_BASE_URL\`
`,
    codeBlocks: [
      { id: 'linux-code-1', language: 'terminal', code: 'curl -fsSL https://claude.ai/install.sh | bash' },
      { id: 'linux-code-2', language: 'terminal', code: 'sudo curl -fsSL https://claude.ai/install.sh | bash' },
      { id: 'linux-code-3', language: 'terminal', code: 'claude --version' },
      { id: 'linux-code-4', language: 'terminal', code: `curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/claude-cli-setup.sh | bash` },
      { id: 'linux-code-5', language: 'terminal', code: `claude\n\n# 进入你的项目目录\ncd /path/to/your/project\n\n# 启动 Claude Code\nclaude` },
      { id: 'linux-code-6', language: 'terminal', code: '/model' },
      { id: 'linux-code-7', language: 'terminal', code: `# Ubuntu/Debian\nsudo apt install build-essential\n\n# CentOS/RHEL\nsudo dnf groupinstall "Development Tools"` },
    ],
  },
];

const CODEX_MARKDOWN_SECTIONS = [
  {
    id: 'overview',
    label: '概览',
    content: String.raw`
## 效果演示

![introduce-01.webp](/console-docs/install/codex/introduce-01.webp)

### 特性

| **功能分类** | **特性** |
| --- | --- |
| 终端式编码助手 | Codex CLI 是一个基于终端的交互式编码助理，用于在命令行中编辑代码、生成补丁并运行命令。 |
| 工具驱动架构 | 提供 \`apply_patch\`、\`shell\`、\`update_plan\`、\`multi_tool_use\` 等工具，用于对仓库文件和操作进行可控修改。 |
| 原子补丁编辑 | 使用专门的补丁格式通过 \`apply_patch\` 原子地添加/更新/删除文件，便于审计与回滚。 |
| 沙箱与审批 | 支持沙箱策略（如 \`workspace-write\`、\`read-only\`）和审批模式（\`on-request\`、\`on-failure\`、\`never\`），控制写入与网络访问权限。 |
| 计划追踪 | \`update_plan\` 用于列出步骤并跟踪状态，要求始终只有一个 \`in_progress\` 步骤以保持明确进度。 |
| 交互规范 | 在重要操作前发送简短前导说明，保持语气友好、简洁并提供进度更新。 |
| 安全约束 | 遵循严格规则（不随意更改无关文件、不添加版权头、不执行破坏性命令），需要用户批准敏感操作。 |
| 测试与格式化 | 推荐在修改后运行相关测试与格式化工具，但不负责修复与当前任务无关的问题。 |
| 输出与风格 | 最终输出遵循 CLI 渲染规范（例如 \`**\` 标题、反引号表示路径/命令），保持可扫描的简洁结构。 |
| 并行执行 | 支持通过 \`multi_tool_use.parallel\` 并行运行多个工具以提升效率。 |
`,
    codeBlocks: [],
  },
  {
    id: 'windows',
    label: 'Windows',
    content: String.raw`
#### 1.打开终端

![windows_open_terminal](/console-docs/install/codex/windows-open-terminal.webp)

#### 2.安装 WSL

为在 Windows 上获得最佳性能，请安装并使用 Windows Subsystem for Linux (WSL2)。

> **安装 WSL2，重启 Windows 计算机**

> **Windows 注意事项**
> - 建议使用 PowerShell 而不是 CMD
> - 如果遇到权限问题，尝试以管理员身份运行
> - 某些杀毒软件可能会误报，需要添加白名单

![windows-img-03.webp](/console-docs/install/codex/windows-img-03.webp)

> **下载 Node Version Manager (NVM)**

![windows-img-04.webp](/console-docs/install/codex/windows-img-04.webp)

> **NVM 安装 Node.js 22**
> 标签栏新开一个 PowerShell 窗口，打开 WSL。

![windows-img-05.webp](/console-docs/install/codex/windows-img-05.webp)

#### 3.安装 Codex CLI

> **安装 Codex CLI**
> 这个命令会从 npm 官方仓库下载并安装最新版本的 Codex CLI。

![windows-img-06.webp](/console-docs/install/codex/windows-img-06.webp)

#### 4.修改配置文件

> **一键修改 Codex CLI 配置文件**

![windows-configure](/console-docs/install/codex/windows-configure.webp)

#### 5.开始使用 Codex CLI

现在你可以开始使用 Codex CLI 了！

> **启动 Codex CLI**
> 按 Enter 启动 Codex CLI。

![windows-img-09.webp](/console-docs/install/codex/windows-img-09.webp)

![windows-img-10.webp](/console-docs/install/codex/windows-img-10.webp)

> 设置 Codex CLI 的权限：1. 允许 Codex 直接修改文件；2. Codex 修改文件需要手动授权

> **选择模型**

![windows-img-11.webp](/console-docs/install/codex/windows-img-11.webp)

![windows-img-12.webp](/console-docs/install/codex/windows-img-12.webp)

![windows-img-13.webp](/console-docs/install/codex/windows-img-13.webp)

![windows-img-14.webp](/console-docs/install/codex/windows-img-14.webp)

> 注意：修改接口地址后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。
`,
    codeBlocks: [
      { id: 'codex-windows-code-1', language: 'powershell', code: 'wsl --install' },
      { id: 'codex-windows-code-2', language: 'bash', code: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash' },
      { id: 'codex-windows-code-3', language: 'bash', code: 'wsl\n\nnvm install 22' },
      { id: 'codex-windows-code-4', language: 'bash', code: 'npm i -g @openai/codex' },
      { id: 'codex-windows-code-5', language: 'powershell', code: `iex (irm 'https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/codex-cli-setup.ps1')` },
      { id: 'codex-windows-code-6', language: 'bash', code: `wsl\n\ncodex\n\ncd mnt/c/path/to/your/project\ncodex` },
      { id: 'codex-windows-code-7', language: 'bash', code: '/model' },
    ],
  },
  {
    id: 'macos',
    label: 'macOS',
    content: String.raw`
#### 1.安装 Homebrew (已安装请跳过)

Homebrew 是 macOS 缺失的软件包的管理器。

官网：[https://brew.sh](https://brew.sh)

![macos-img-01.webp](/console-docs/install/codex/macos-img-01.webp)

> **安装 Homebrew**

\`\`\`bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
\`\`\`

![macos-img-02.webp](/console-docs/install/codex/macos-img-02.webp)

![macos-img-03.webp](/console-docs/install/codex/macos-img-03.webp)

![macos-img-04.webp](/console-docs/install/codex/macos-img-04.webp)

#### 2.安装 Node.js 环境

> **Node.js 环境安装步骤**
> 更新 Homebrew并安装 Node.js。

\`\`\`bash
brew update
brew install node
\`\`\`

> **macOS 注意事项**
> - 如果遇到权限问题，可能需要使用 \`sudo\`
> - 首次运行可能需要在系统偏好设置中允许
> - 建议使用 Terminal 或 iTerm2

![macos-img-05.webp](/console-docs/install/codex/macos-img-05.webp)

![macos-img-06.webp](/console-docs/install/codex/macos-img-06.webp)

> **验证安装是否成功**
> 安装完成后，打开终端，输入以下命令。

\`\`\`bash
node --version
npm --version
\`\`\`

#### 3.安装 Codex CLI

> **安装 Codex CLI**
> 打开终端，运行以下命令。

\`\`\`bash
npm install -g @openai/codex
\`\`\`

> 如果遇到权限问题，可尝试：

\`\`\`bash
sudo npm install -g @openai/codex
\`\`\`

![macos-img-07.webp](/console-docs/install/codex/macos-img-07.webp)

> **验证 Codex CLI 安装**
> 安装完成后，输入以下命令检查是否安装成功。

\`\`\`bash
codex --version
\`\`\`

#### 4.修改配置文件

> **一键修改 Codex CLI 配置文件**

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/codex-cli-setup.sh | bash
\`\`\`

![macos-configure](/console-docs/install/codex/macos-configure.webp)

#### 5.开始使用 Codex CLI

现在你可以开始使用 Codex CLI 了！

> **启动 Codex CLI**
> 按 Enter 启动 Codex CLI。

\`\`\`bash
codex

cd /path/to/your/project
codex
\`\`\`

![macos-img-09.webp](/console-docs/install/codex/macos-img-09.webp)

![macos-img-10.webp](/console-docs/install/codex/macos-img-10.webp)

> 设置 Codex CLI 的权限：1. 允许 Codex 直接修改文件；2. Codex 修改文件需要手动授权

![macos-img-11.webp](/console-docs/install/codex/macos-img-11.webp)

![macos-img-12.webp](/console-docs/install/codex/macos-img-12.webp)

![macos-img-13.webp](/console-docs/install/codex/macos-img-13.webp)

![macos-img-14.webp](/console-docs/install/codex/macos-img-14.webp)

> 注意：修改接口地址后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。

#### 6.macOS 常见问题解决

> **安装时提示权限错误**
> 尝试以下解决方法。

> **macOS 安全设置阻止运行**
> 如果系统阻止运行 Codex CLI：
> - 打开"系统偏好设置" → "安全性与隐私"
> - 点击"仍要打开"或"允许"
> - 或者在 Terminal 中运行：\`sudo spctl --master-disable\`
`,
    codeBlocks: [
      { id: 'codex-macos-code-1', language: 'terminal', code: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"' },
      { id: 'codex-macos-code-2', language: 'terminal', code: 'brew update\nbrew install node' },
      { id: 'codex-macos-code-3', language: 'terminal', code: 'node --version\nnpm --version' },
      { id: 'codex-macos-code-4', language: 'terminal', code: '# 全局安装 Codex CLI\nnpm install -g @openai/codex' },
      { id: 'codex-macos-code-5', language: 'terminal', code: 'sudo npm install -g @openai/codex' },
      { id: 'codex-macos-code-6', language: 'terminal', code: 'codex --version' },
      { id: 'codex-macos-code-7', language: 'terminal', code: `curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/codex-cli-setup.sh | bash` },
      { id: 'codex-macos-code-8', language: 'terminal', code: 'codex\n\ncd /path/to/your/project\ncodex' },
    ],
  },
  {
    id: 'linux',
    label: 'Linux',
    content: String.raw`
#### 1.安装 Node.js 环境

Codex CLI 需要 Node.js 环境才能运行。

> **Node.js 环境安装步骤**
> 添加 NodeSource 仓库并安装 Node.js。

\`\`\`bash
sudo curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
\`\`\`

> **Linux 注意事项**
> - 某些发行版可能需要安装额外的依赖
> - 如果遇到权限问题，使用 sudo
> - 确保你的用户在 npm 的全局目录有写权限

![linux-img-01.webp](/console-docs/install/codex/linux-img-01.webp)

![linux-img-02.webp](/console-docs/install/codex/linux-img-02.webp)

> **验证安装是否成功**
> 安装完成后，打开终端，输入以下命令。

\`\`\`bash
node --version
npm --version
\`\`\`

#### 2.安装 Codex CLI

> **安装 Codex CLI**
> 打开终端，运行以下命令。

\`\`\`bash
npm install -g @openai/codex
\`\`\`

> 如果遇到权限问题，可尝试：

\`\`\`bash
sudo npm install -g @openai/codex
\`\`\`

![linux-img-03.webp](/console-docs/install/codex/linux-img-03.webp)

> **验证 Codex CLI 安装**
> 安装完成后，输入以下命令检查是否安装成功。

\`\`\`bash
codex --version
\`\`\`

#### 3.修改配置文件

> **一键修改 Codex CLI 配置文件**

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/codex-cli-setup.sh | bash
\`\`\`

![macos-configure](/console-docs/install/codex/linux-configure.webp)

#### 4.开始使用 Codex CLI

现在你可以开始使用 Codex CLI 了！

> **启动 Codex CLI**
> 按 Enter 启动 Codex CLI。

\`\`\`bash
# 进入你的项目目录
cd /path/to/your/project

# 启动 Codex CLI
codex
\`\`\`

![linux-img-05.webp](/console-docs/install/codex/linux-img-05.webp)

![linux-img-06.webp](/console-docs/install/codex/linux-img-06.webp)

> 设置 Codex CLI 的权限：1. 允许 Codex 直接修改文件；2. Codex 修改文件需要手动授权

![linux-img-07.webp](/console-docs/install/codex/linux-img-07.webp)

![linux-img-08.webp](/console-docs/install/codex/linux-img-08.webp)

![linux-img-09.webp](/console-docs/install/codex/linux-img-09.webp)

![linux-img-10.webp](/console-docs/install/codex/linux-img-10.webp)

> 注意：修改接口地址后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。

#### 5.Linux 常见问题解决

> **安装时提示权限错误**
> 尝试以下解决方法。

\`\`\`bash
sudo npm install -g @openai/codex
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
\`\`\`

> **缺少依赖库**
> 某些 Linux 发行版需要安装额外依赖。

\`\`\`bash
# Ubuntu/Debian
sudo apt install build-essential

# CentOS/RHEL
sudo dnf groupinstall "Development Tools"
\`\`\`
`,
    codeBlocks: [
      { id: 'codex-linux-code-1', language: 'terminal', code: 'sudo curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -\nsudo apt-get install -y nodejs' },
      { id: 'codex-linux-code-2', language: 'terminal', code: 'node --version\nnpm --version' },
      { id: 'codex-linux-code-3', language: 'terminal', code: '# 全局安装 Codex CLI\nnpm install -g @openai/codex' },
      { id: 'codex-linux-code-4', language: 'terminal', code: 'sudo npm install -g @openai/codex' },
      { id: 'codex-linux-code-5', language: 'terminal', code: 'codex --version' },
      { id: 'codex-linux-code-6', language: 'terminal', code: `curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/codex-cli-setup.sh | bash` },
      { id: 'codex-linux-code-7', language: 'terminal', code: `# 进入你的项目目录\ncd /path/to/your/project\n\n# 启动 Codex CLI\ncodex` },
      { id: 'codex-linux-code-8', language: 'terminal', code: `sudo npm install -g @openai/codex\nnpm config set prefix ~/.npm-global\nexport PATH=~/.npm-global/bin:$PATH` },
      { id: 'codex-linux-code-9', language: 'terminal', code: `# Ubuntu/Debian\nsudo apt install build-essential\n\n# CentOS/RHEL\nsudo dnf groupinstall "Development Tools"` },
    ],
  },
];

export const CLAUDE_CODE_INSTALL_GUIDE = {
  productId: 'claude-code',
  productLabel: 'Claude Code',
  basePath: '/console/install/claude-code',
  platforms: [
    {
      id: 'windows',
      label: 'Windows',
      title: 'Windows ClaudeCode安装指南',
      description: '在 Windows 系统上安装官方 Claude Code CLI',
      sections: [
        {
          id: 'official-package',
          type: 'callout',
          tone: 'success',
          title: '官方原版安装',
          blocks: [
            {
              type: 'paragraph',
              text: '此流程100%使用官方原版安装包，确保服务体验与官方完全一致。',
            },
          ],
        },
        {
          id: 'requirements',
          type: 'section',
          title: '系统要求',
          blocks: [
            {
              type: 'paragraph',
              text: 'Windows 10 (版本 1809 / build 17763) 及以上。',
            },
          ],
        },
        {
          id: 'steps',
          type: 'steps',
          title: '安装步骤',
          supportContact: WINDOWS_SUPPORT_CONTACT,
          steps: [
            {
              title: '1. 安装 Node.js 环境',
              blocks: [
                {
                  type: 'paragraph',
                  text: 'Claude Code 需要 Node.js 环境才能运行。',
                },
                {
                  type: 'richText',
                  segments: [
                    { type: 'text', text: '打开浏览器访问 ' },
                    {
                      type: 'link',
                      text: 'https://nodejs.org/',
                      href: 'https://nodejs.org/',
                    },
                    { type: 'text', text: '，点击 “LTS” 版本进行下载。' },
                  ],
                },
                {
                  type: 'paragraph',
                  text: '下载完成后双击 .msi 文件，按照安装向导完成安装，保持默认设置即可。',
                },
                {
                  type: 'note',
                  title: 'Windows 注意事项',
                  items: [
                    '建议使用 PowerShell 而不是 CMD',
                    '如果遇到权限问题，尝试以管理员身份运行',
                    '某些杀毒软件可能会误报，需要添加白名单',
                  ],
                },
                {
                  type: 'paragraph',
                  text: '安装过程参考下列截图：',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep01,
                  alt: 'Windows Node.js 安装步骤 1',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep02,
                  alt: 'Windows Node.js 安装步骤 2',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep03,
                  alt: 'Windows Node.js 安装步骤 3',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep04,
                  alt: 'Windows Node.js 安装步骤 4',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep05,
                  alt: 'Windows Node.js 安装步骤 5',
                },
                {
                  type: 'paragraph',
                  text: '验证安装是否成功。安装完成后，打开 PowerShell 或 CMD，输入以下命令：',
                },
                {
                  type: 'code',
                  code: WINDOWS_NODE_VERIFY_CODE,
                },
              ],
            },
            {
              title: '2. 安装 Git Bash',
              blocks: [
                {
                  type: 'paragraph',
                  text: 'Windows 环境下需要使用 Git Bash 安装 Claude Code。安装完成后，环境变量设置和使用 Claude Code 仍然在普通的 PowerShell 或 CMD 中进行。',
                },
                {
                  type: 'richText',
                  segments: [
                    { type: 'text', text: '访问 ' },
                    {
                      type: 'link',
                      text: 'https://git-scm.com/downloads/win',
                      href: 'https://git-scm.com/downloads/win',
                    },
                    { type: 'text', text: '，点击 “Download for Windows” 下载安装包。' },
                  ],
                },
                {
                  type: 'paragraph',
                  text: '运行下载的 .exe 安装文件，在安装过程中保持默认设置，直接点击 “Next” 完成安装。',
                },
                {
                  type: 'paragraph',
                  text: '安装过程参考下列截图：',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep06,
                  alt: 'Windows Git Bash 安装步骤 1',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep07,
                  alt: 'Windows Git Bash 安装步骤 2',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep08,
                  alt: 'Windows Git Bash 安装步骤 3',
                },
                {
                  type: 'paragraph',
                  text: '安装完成后，打开 Git Bash，输入以下命令验证：',
                },
                {
                  type: 'code',
                  code: WINDOWS_GIT_VERIFY_CODE,
                },
              ],
            },
            {
              title: '3. 安装 Claude Code',
              blocks: [
                {
                  type: 'paragraph',
                  text: '打开 PowerShell，运行以下命令安装 Claude Code：',
                },
                {
                  type: 'code',
                  code: CLAUDE_WINDOWS_INSTALL_CODE,
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep09,
                  alt: 'Windows Claude Code 安装步骤',
                },
                {
                  type: 'paragraph',
                  text: '仅当终端提示要求时，再将 ~/.local/bin 加入 PATH：',
                },
                {
                  type: 'code',
                  code: CLAUDE_WINDOWS_PATH_CODE,
                },
                {
                  type: 'paragraph',
                  text: '安装完成后，输入以下命令检查是否安装成功：',
                },
                {
                  type: 'code',
                  code: CLAUDE_WINDOWS_VERIFY_CODE,
                },
              ],
            },
            {
              title: '4. 设置环境变量',
              blocks: [
                {
                  type: 'paragraph',
                  text: '为了让 Claude Code 连接到你的中转服务，需要设置多个环境变量。',
                },
                {
                  type: 'paragraph',
                  text: '一键设置命令（Windows 系统）如下：',
                },
                {
                  type: 'code',
                  code: CLAUDE_WINDOWS_SETUP_CODE,
                },
                {
                  type: 'paragraph',
                  text: '命令执行效果如下图所示：',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsConfigure,
                  alt: 'Windows Claude Code 环境变量配置',
                },
              ],
            },
            {
              title: '5. 开始使用 Claude Code',
              blocks: [
                {
                  type: 'paragraph',
                  text: '现在你可以开始使用 Claude Code 了。打开 PowerShell，直接启动 Claude Code。',
                },
                {
                  type: 'code',
                  code: CLAUDE_START_CODE,
                },
                {
                  type: 'paragraph',
                  text: '启动与模型选择流程参考下列截图：',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep11,
                  alt: 'Windows Claude Code 使用步骤 1',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep12,
                  alt: 'Windows Claude Code 使用步骤 2',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep13,
                  alt: 'Windows Claude Code 使用步骤 3',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep14,
                  alt: 'Windows Claude Code 使用步骤 4',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep15,
                  alt: 'Windows Claude Code 使用步骤 5',
                },
                {
                  type: 'paragraph',
                  text: '选择模型：',
                },
                {
                  type: 'code',
                  code: '/model',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep16,
                  alt: 'Windows Claude Code 模型选择步骤 1',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.claudeWindowsStep17,
                  alt: 'Windows Claude Code 模型选择步骤 2',
                },
                {
                  type: 'paragraph',
                  text: '注意：设置环境变量修改后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'macos',
      label: 'macOS',
      title: 'macOS ClaudeCode安装指南',
      description: '在 macOS 系统上安装官方 Claude Code CLI',
      sections: [
        {
          id: 'official-package',
          type: 'callout',
          tone: 'success',
          title: '官方原版安装',
          blocks: [
            {
              type: 'paragraph',
              text: '此流程100%使用官方原版安装包，确保服务体验与官方完全一致。',
            },
          ],
        },
        {
          id: 'requirements',
          type: 'section',
          title: '系统要求',
          blocks: [
            {
              type: 'paragraph',
              text: 'macOS 12 及以上。',
            },
          ],
        },
        {
          id: 'steps',
          type: 'steps',
          title: '安装步骤',
          steps: [
            {
              title: '1. 安装 Claude Code CLI',
              blocks: [
                {
                  type: 'paragraph',
                  text: '打开终端。',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-01.webp',
                  alt: 'macOS Claude Code 打开终端',
                },
                {
                  type: 'paragraph',
                  text: '打开终端，运行以下命令。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'curl -fsSL https://claude.ai/install.sh | bash',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-02.webp',
                  alt: 'macOS Claude Code 安装步骤',
                },
              ],
            },
            {
              title: '2. 设置环境变量',
              blocks: [
                {
                  type: 'paragraph',
                  text: '为了让 Claude Code 连接到第三方中转服务，需要设置环境变量。',
                },
                {
                  type: 'paragraph',
                  text: '输入一键设置 Claude Code 环境变量命令。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/claude-cli-setup.sh | bash',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-configure.webp',
                  alt: 'macOS Claude Code 配置环境变量',
                },
                {
                  type: 'paragraph',
                  text: '安装完成后，输入以下命令检查是否安装成功。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'claude --version',
                },
              ],
            },
            {
              title: '3. 开始使用 Claude Code',
              blocks: [
                {
                  type: 'paragraph',
                  text: '现在你可以开始使用 Claude Code 了。',
                },
                {
                  type: 'paragraph',
                  text: '直接启动 Claude Code。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'claude\n\n# 进入你的项目目录\ncd /path/to/your/project\n\n# 启动 Claude Code\nclaude',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-04.webp',
                  alt: 'macOS Claude Code 使用步骤 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-05.webp',
                  alt: 'macOS Claude Code 使用步骤 2',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-06.webp',
                  alt: 'macOS Claude Code 使用步骤 3',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-07.webp',
                  alt: 'macOS Claude Code 使用步骤 4',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-08.webp',
                  alt: 'macOS Claude Code 使用步骤 5',
                },
                {
                  type: 'paragraph',
                  text: '选择模型（可选）。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: '/model',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-09.webp',
                  alt: 'macOS Claude Code 选择模型 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-10.webp',
                  alt: 'macOS Claude Code 选择模型 2',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-img-11.webp',
                  alt: 'macOS Claude Code 选择模型 3',
                },
                {
                  type: 'paragraph',
                  text: '注意：设置环境变量修改 ANTHROPIC_BASE_URL 后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。',
                },
              ],
            },
            {
              title: '4. macOS 常见问题解决',
              blocks: [
                {
                  type: 'note',
                  title: 'macOS 安全设置阻止运行',
                  items: [
                    '如果系统阻止运行 Claude Code，打开“系统偏好设置” → “安全性与隐私”',
                    '点击“仍要打开”或“允许”',
                    '或者在 Terminal 中运行：sudo spctl --master-disable',
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'linux',
      label: 'Linux',
      title: 'Linux ClaudeCode安装指南',
      description: '在 Linux 系统上安装官方 Claude Code CLI',
      sections: [
        {
          id: 'official-package',
          type: 'callout',
          tone: 'success',
          title: '官方原版安装',
          blocks: [
            {
              type: 'paragraph',
              text: '此流程100%使用官方原版安装包，确保服务体验与官方完全一致。',
            },
          ],
        },
        {
          id: 'requirements',
          type: 'section',
          title: '系统要求',
          blocks: [
            {
              type: 'paragraph',
              text: '主流 Linux 发行版，建议使用最新稳定版终端环境。',
            },
          ],
        },
        {
          id: 'steps',
          type: 'steps',
          title: '安装步骤',
          steps: [
            {
              title: '1. 安装 Claude Code',
              blocks: [
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/linux-img-01.webp',
                  alt: 'Linux Claude Code 安装步骤 1',
                },
                {
                  type: 'paragraph',
                  text: '打开终端，运行以下命令。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'curl -fsSL https://claude.ai/install.sh | bash',
                },
                {
                  type: 'paragraph',
                  text: '如果普通安装失败，可尝试使用 sudo。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'sudo curl -fsSL https://claude.ai/install.sh | bash',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/linux-img-03.webp',
                  alt: 'Linux Claude Code 安装步骤 2',
                },
                {
                  type: 'paragraph',
                  text: '安装完成后，输入以下命令检查是否安装成功。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'claude --version',
                },
              ],
            },
            {
              title: '2. 设置环境变量',
              blocks: [
                {
                  type: 'paragraph',
                  text: '为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量。',
                },
                {
                  type: 'paragraph',
                  text: '输入一键修改环境变量命令。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/claude-cli-setup.sh | bash',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/macos-configure.webp',
                  alt: 'Linux Claude Code 配置环境变量',
                },
              ],
            },
            {
              title: '3. 开始使用 Claude Code',
              blocks: [
                {
                  type: 'paragraph',
                  text: '现在你可以开始使用 Claude Code 了。',
                },
                {
                  type: 'paragraph',
                  text: '直接启动 Claude Code。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'claude\n\n# 进入你的项目目录\ncd /path/to/your/project\n\n# 启动 Claude Code\nclaude',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/linux-img-03-usage.webp',
                  alt: 'Linux Claude Code 使用步骤 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/linux-img-04.webp',
                  alt: 'Linux Claude Code 使用步骤 2',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/linux-img-05.webp',
                  alt: 'Linux Claude Code 使用步骤 3',
                },
                {
                  type: 'paragraph',
                  text: '选择模型。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: '/model',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/linux-img-06.webp',
                  alt: 'Linux Claude Code 选择模型 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/linux-img-07.webp',
                  alt: 'Linux Claude Code 选择模型 2',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/linux-img-08.webp',
                  alt: 'Linux Claude Code 选择模型 3',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/claude-code/linux-img-09.webp',
                  alt: 'Linux Claude Code 选择模型 4',
                },
                {
                  type: 'paragraph',
                  text: '注意：设置环境变量修改 ANTHROPIC_BASE_URL 后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。',
                },
              ],
            },
            {
              title: '4. Linux 常见问题解决',
              blocks: [
                {
                  type: 'paragraph',
                  text: '某些 Linux 发行版需要安装额外依赖。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: '# Ubuntu/Debian\nsudo apt install build-essential\n\n# CentOS/RHEL\nsudo dnf groupinstall "Development Tools"',
                },
                {
                  type: 'note',
                  title: '环境变量不生效',
                  items: [
                    '确认修改了正确的配置文件（.bashrc 或 .zshrc）',
                    '重新启动终端或运行 source ~/.bashrc',
                    '验证设置：echo $ANTHROPIC_BASE_URL',
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const CODEX_INSTALL_GUIDE = {
  productId: 'codex',
  productLabel: 'Codex',
  basePath: '/console/install/codex',
  platforms: [
    {
      id: 'windows',
      label: 'Windows',
      title: 'Windows Codex安装指南',
      description: '在 Windows 系统上安装官方 Codex CLI',
      sections: [
        {
          id: 'official-package',
          type: 'callout',
          tone: 'success',
          title: '官方原版安装',
          blocks: [
            {
              type: 'paragraph',
              text: '此流程100%使用官方原版安装包，确保服务体验与官方完全一致。',
            },
          ],
        },
        {
          id: 'requirements',
          type: 'section',
          title: '系统要求',
          blocks: [
            {
              type: 'paragraph',
              text: 'Windows 10 (版本 1809 / build 17763) 及以上。',
            },
          ],
        },
        {
          id: 'steps',
          type: 'steps',
          title: '安装步骤',
          supportContact: WINDOWS_SUPPORT_CONTACT,
          steps: [
            {
              title: '1. 打开终端',
              blocks: [
                {
                  type: 'paragraph',
                  text: '先打开 PowerShell，后续安装步骤都从这里开始。',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsOpenTerminal,
                  alt: 'Windows Codex 打开终端',
                },
              ],
            },
            {
              title: '2. 安装 WSL',
              blocks: [
                {
                  type: 'paragraph',
                  text: '为在 Windows 上获得最佳性能，请安装并使用 Windows Subsystem for Linux (WSL2)。',
                },
                {
                  type: 'paragraph',
                  text: '安装 WSL2 后，按提示重启 Windows 计算机。',
                },
                {
                  type: 'note',
                  title: 'Windows 注意事项',
                  items: [
                    '建议使用 PowerShell 而不是 CMD',
                    '如果遇到权限问题，尝试以管理员身份运行',
                    '某些杀毒软件可能会误报，需要添加白名单',
                  ],
                },
                {
                  type: 'code',
                  code: CODEX_WINDOWS_WSL_CODE,
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep03,
                  alt: 'Windows Codex WSL 安装步骤',
                },
                {
                  type: 'paragraph',
                  text: '继续下载并安装 Node Version Manager (NVM)：',
                },
                {
                  type: 'code',
                  code: CODEX_WINDOWS_NVM_INSTALL_CODE,
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep04,
                  alt: 'Windows Codex NVM 安装步骤',
                },
                {
                  type: 'paragraph',
                  text: '标签栏新开一个 PowerShell 窗口，打开 WSL 后安装 Node.js 22：',
                },
                {
                  type: 'code',
                  code: CODEX_WINDOWS_NODE_INSTALL_CODE,
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep05,
                  alt: 'Windows Codex Node.js 安装步骤',
                },
              ],
            },
            {
              title: '3. 安装 Codex CLI',
              blocks: [
                {
                  type: 'paragraph',
                  text: '在 WSL 中运行以下命令安装 Codex CLI。这个命令会从 npm 官方仓库下载并安装最新版本的 Codex CLI。',
                },
                {
                  type: 'code',
                  code: CODEX_WINDOWS_INSTALL_CODE,
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep06,
                  alt: 'Windows Codex CLI 安装步骤',
                },
              ],
            },
            {
              title: '4. 修改配置文件',
              blocks: [
                {
                  type: 'paragraph',
                  text: '删除 C:\\Users\\你的用户\\.codex 下已存在的 auth.json 和 config.toml（若有），然后按下面内容重新创建。',
                },
                {
                  type: 'paragraph',
                  text: 'auth.json 内容：',
                },
                {
                  type: 'code',
                  code: CODEX_AUTH_JSON,
                },
                {
                  type: 'paragraph',
                  text: 'config.toml 内容：',
                },
                {
                  type: 'code',
                  code: CODEX_CONFIG_TOML,
                },
                {
                  type: 'paragraph',
                  text: '也可以参考下列一键修改配置文件截图：',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsConfigure,
                  alt: 'Windows Codex 配置文件修改',
                },
              ],
            },
            {
              title: '5. 开始使用 Codex CLI',
              blocks: [
                {
                  type: 'paragraph',
                  text: '现在你可以开始使用 Codex CLI 了。先验证安装结果，然后进入项目目录启动 Codex。',
                },
                {
                  type: 'code',
                  code: CODEX_WINDOWS_VERIFY_CODE,
                },
                {
                  type: 'code',
                  code: CODEX_START_CODE,
                },
                {
                  type: 'paragraph',
                  text: '首次启动与权限设置参考下列截图：',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep09,
                  alt: 'Windows Codex 使用步骤 1',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep10,
                  alt: 'Windows Codex 使用步骤 2',
                },
                {
                  type: 'paragraph',
                  text: '设置 Codex CLI 的权限：1. 允许 Codex 直接修改文件；2. Codex 修改文件需要手动授权。',
                },
                {
                  type: 'paragraph',
                  text: '选择模型：',
                },
                {
                  type: 'code',
                  code: '/model',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep11,
                  alt: 'Windows Codex 模型选择步骤 1',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep12,
                  alt: 'Windows Codex 模型选择步骤 2',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep13,
                  alt: 'Windows Codex 模型选择步骤 3',
                },
                {
                  type: 'image',
                  src: INSTALL_GUIDE_ASSETS.codexWindowsStep14,
                  alt: 'Windows Codex 模型选择步骤 4',
                },
                {
                  type: 'paragraph',
                  text: '注意：修改接口地址后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'macos',
      label: 'macOS',
      title: 'macOS Codex安装指南',
      description: '在 macOS 系统上安装官方 Codex CLI',
      sections: [
        {
          id: 'official-package',
          type: 'callout',
          tone: 'success',
          title: '官方原版安装',
          blocks: [
            {
              type: 'paragraph',
              text: '此流程100%使用官方原版安装包，确保服务体验与官方完全一致。',
            },
          ],
        },
        {
          id: 'requirements',
          type: 'section',
          title: '系统要求',
          blocks: [
            {
              type: 'paragraph',
              text: 'macOS 12 及以上。',
            },
          ],
        },
        {
          id: 'steps',
          type: 'steps',
          title: '安装步骤',
          steps: [
            {
              title: '1. 安装 Homebrew (已安装请跳过)',
              blocks: [
                {
                  type: 'paragraph',
                  text: 'Homebrew 是 macOS 缺失的软件包的管理器。',
                },
                {
                  type: 'richText',
                  segments: [
                    { type: 'text', text: '官网：' },
                    { type: 'link', text: 'https://brew.sh', href: 'https://brew.sh' },
                  ],
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-01.webp',
                  alt: 'macOS Codex Homebrew 步骤 1',
                },
                {
                  type: 'paragraph',
                  text: '安装 Homebrew。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-02.webp',
                  alt: 'macOS Codex Homebrew 步骤 2',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-03.webp',
                  alt: 'macOS Codex Homebrew 步骤 3',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-04.webp',
                  alt: 'macOS Codex Homebrew 步骤 4',
                },
              ],
            },
            {
              title: '2. 安装 Node.js 环境',
              blocks: [
                {
                  type: 'paragraph',
                  text: '更新 Homebrew 并安装 Node.js。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'brew update\nbrew install node',
                },
                {
                  type: 'note',
                  title: 'macOS 注意事项',
                  items: [
                    '如果遇到权限问题，可能需要使用 sudo',
                    '首次运行可能需要在系统偏好设置中允许',
                    '建议使用 Terminal 或 iTerm2',
                  ],
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-05.webp',
                  alt: 'macOS Codex Node 安装步骤 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-06.webp',
                  alt: 'macOS Codex Node 安装步骤 2',
                },
                {
                  type: 'paragraph',
                  text: '安装完成后，打开终端，输入以下命令。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'node --version\nnpm --version',
                },
              ],
            },
            {
              title: '3. 安装 Codex CLI',
              blocks: [
                {
                  type: 'paragraph',
                  text: '打开终端，运行以下命令。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: '# 全局安装 Codex CLI\nnpm install -g @openai/codex',
                },
                {
                  type: 'paragraph',
                  text: '如果遇到权限问题，可尝试：',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'sudo npm install -g @openai/codex',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-07.webp',
                  alt: 'macOS Codex CLI 安装步骤',
                },
                {
                  type: 'paragraph',
                  text: '安装完成后，输入以下命令检查是否安装成功。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'codex --version',
                },
              ],
            },
            {
              title: '4. 修改配置文件',
              blocks: [
                {
                  type: 'paragraph',
                  text: '一键修改 Codex CLI 配置文件。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/codex-cli-setup.sh | bash',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-configure.webp',
                  alt: 'macOS Codex 配置文件',
                },
              ],
            },
            {
              title: '5. 开始使用 Codex CLI',
              blocks: [
                {
                  type: 'paragraph',
                  text: '现在你可以开始使用 Codex CLI 了。',
                },
                {
                  type: 'paragraph',
                  text: '按 Enter 启动 Codex CLI。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'codex\n\ncd /path/to/your/project\ncodex',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-09.webp',
                  alt: 'macOS Codex 使用步骤 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-10.webp',
                  alt: 'macOS Codex 使用步骤 2',
                },
                {
                  type: 'paragraph',
                  text: '设置 Codex CLI 的权限：1. 允许 Codex 直接修改文件；2. Codex 修改文件需要手动授权。',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-11.webp',
                  alt: 'macOS Codex 权限设置 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-12.webp',
                  alt: 'macOS Codex 权限设置 2',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-13.webp',
                  alt: 'macOS Codex 权限设置 3',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/macos-img-14.webp',
                  alt: 'macOS Codex 权限设置 4',
                },
                {
                  type: 'paragraph',
                  text: '注意：修改接口地址后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。',
                },
              ],
            },
            {
              title: '6. macOS 常见问题解决',
              blocks: [
                {
                  type: 'paragraph',
                  text: '安装时提示权限错误，可尝试以下解决方法。',
                },
                {
                  type: 'note',
                  title: 'macOS 安全设置阻止运行',
                  items: [
                    '如果系统阻止运行 Codex CLI，打开“系统偏好设置” → “安全性与隐私”',
                    '点击“仍要打开”或“允许”',
                    '或者在 Terminal 中运行：sudo spctl --master-disable',
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'linux',
      label: 'Linux',
      title: 'Linux Codex安装指南',
      description: '在 Linux 系统上安装官方 Codex CLI',
      sections: [
        {
          id: 'official-package',
          type: 'callout',
          tone: 'success',
          title: '官方原版安装',
          blocks: [
            {
              type: 'paragraph',
              text: '此流程100%使用官方原版安装包，确保服务体验与官方完全一致。',
            },
          ],
        },
        {
          id: 'requirements',
          type: 'section',
          title: '系统要求',
          blocks: [
            {
              type: 'paragraph',
              text: '主流 Linux 发行版，需预先具备终端环境和 sudo 权限。',
            },
          ],
        },
        {
          id: 'steps',
          type: 'steps',
          title: '安装步骤',
          steps: [
            {
              title: '1. 安装 Node.js 环境',
              blocks: [
                {
                  type: 'paragraph',
                  text: 'Codex CLI 需要 Node.js 环境才能运行。',
                },
                {
                  type: 'paragraph',
                  text: '添加 NodeSource 仓库并安装 Node.js。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'sudo curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -\nsudo apt-get install -y nodejs',
                },
                {
                  type: 'note',
                  title: 'Linux 注意事项',
                  items: [
                    '某些发行版可能需要安装额外的依赖',
                    '如果遇到权限问题，使用 sudo',
                    '确保你的用户在 npm 的全局目录有写权限',
                  ],
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-img-01.webp',
                  alt: 'Linux Codex Node 安装步骤 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-img-02.webp',
                  alt: 'Linux Codex Node 安装步骤 2',
                },
                {
                  type: 'paragraph',
                  text: '安装完成后，打开终端，输入以下命令。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'node --version\nnpm --version',
                },
              ],
            },
            {
              title: '2. 安装 Codex CLI',
              blocks: [
                {
                  type: 'paragraph',
                  text: '打开终端，运行以下命令。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: '# 全局安装 Codex CLI\nnpm install -g @openai/codex',
                },
                {
                  type: 'paragraph',
                  text: '如果遇到权限问题，可尝试：',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'sudo npm install -g @openai/codex',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-img-03.webp',
                  alt: 'Linux Codex CLI 安装步骤',
                },
                {
                  type: 'paragraph',
                  text: '安装完成后，输入以下命令检查是否安装成功。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'codex --version',
                },
              ],
            },
            {
              title: '3. 修改配置文件',
              blocks: [
                {
                  type: 'paragraph',
                  text: '一键修改 Codex CLI 配置文件。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'curl -fsSL https://raw.githubusercontent.com/QuantumNous/new-api-docs/refs/heads/main/helper/codex-cli-setup.sh | bash',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-configure.webp',
                  alt: 'Linux Codex 配置文件',
                },
              ],
            },
            {
              title: '4. 开始使用 Codex CLI',
              blocks: [
                {
                  type: 'paragraph',
                  text: '现在你可以开始使用 Codex CLI 了。',
                },
                {
                  type: 'paragraph',
                  text: '按 Enter 启动 Codex CLI。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: '# 进入你的项目目录\ncd /path/to/your/project\n\n# 启动 Codex CLI\ncodex',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-img-05.webp',
                  alt: 'Linux Codex 使用步骤 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-img-06.webp',
                  alt: 'Linux Codex 使用步骤 2',
                },
                {
                  type: 'paragraph',
                  text: '设置 Codex CLI 的权限：1. 允许 Codex 直接修改文件；2. Codex 修改文件需要手动授权。',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-img-07.webp',
                  alt: 'Linux Codex 权限设置 1',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-img-08.webp',
                  alt: 'Linux Codex 权限设置 2',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-img-09.webp',
                  alt: 'Linux Codex 权限设置 3',
                },
                {
                  type: 'image',
                  src: '/console-docs/install/codex/linux-img-10.webp',
                  alt: 'Linux Codex 权限设置 4',
                },
                {
                  type: 'paragraph',
                  text: '注意：修改接口地址后，使用所有模型（包括官方预设模型）均调用自定义接入点，而不使用官方账号额度。',
                },
              ],
            },
            {
              title: '5. Linux 常见问题解决',
              blocks: [
                {
                  type: 'paragraph',
                  text: '安装时提示权限错误，可尝试以下解决方法。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: 'sudo npm install -g @openai/codex\nnpm config set prefix ~/.npm-global\nexport PATH=~/.npm-global/bin:$PATH',
                },
                {
                  type: 'paragraph',
                  text: '某些 Linux 发行版需要安装额外依赖。',
                },
                {
                  type: 'code',
                  language: 'terminal',
                  code: '# Ubuntu/Debian\nsudo apt install build-essential\n\n# CentOS/RHEL\nsudo dnf groupinstall "Development Tools"',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
export const INSTALL_GUIDES = {
  'claude-code': CLAUDE_CODE_INSTALL_GUIDE,
  codex: CODEX_INSTALL_GUIDE,
};
