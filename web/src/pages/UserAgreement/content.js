export const userAgreementStyle = `
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #f9fafb;
        }
        .container {
            background: #ffffff;
            padding: 50px 60px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        h1 {
            font-size: 28px;
            color: #111827;
            text-align: center;
            margin-bottom: 5px;
        }
        .date {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 40px;
        }
        h2 {
            font-size: 20px;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-top: 40px;
            margin-bottom: 20px;
        }
        h3 {
            font-size: 16px;
            color: #374151;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        
        /* 双语排版核心样式 */
        p.en {
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
            font-size: 15px;
        }
        p.zh {
            color: #4b5563;
            margin-bottom: 24px;
            font-size: 14px;
        }
        
        ul {
            padding-left: 24px;
            margin-bottom: 24px;
        }
        li {
            margin-bottom: 16px;
        }
        li .en {
            font-weight: 600;
            color: #111827;
            display: block;
            margin-bottom: 4px;
            font-size: 15px;
        }
        li .zh {
            color: #4b5563;
            display: block;
            font-size: 14px;
        }

        .alert .en {
            color: #b91c1c;
        }
        .alert .zh {
            color: #dc2626;
        }
    `;

export const userAgreementBody = `
    <div class="container">
        <h1>AIForce Terms of Service<br>AIForce 服务条款</h1>
        <div class="date">Last Updated: May 16, 2026 / 最后更新日期：2026年5月16日</div>
        
        <p class="en">This Agreement ("Agreement") is entered into by and between you ("User" or "Developer") and AIForce ("Company", "we", "us", or "our").</p>
        <p class="zh">本协议（"协议"）由您（"用户"或"开发者"）与 AIForce（"公司"、"我们"）之间订立。</p>

        <p class="en">By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by the following terms and conditions.</p>
        <p class="zh">访问或使用我们的服务即表示您已阅读、理解并同意受以下条款和条件的约束。</p>

        <p class="en">If you do not agree to these terms, please do not use the Service.</p>
        <p class="zh">如果您不同意这些条款，请勿使用本服务。</p>

        <h2>Article 1: Service Overview / 第一条 服务概述</h2>
        <p class="en">AIForce operates a unified API integration platform (the "Service") that enables users and developers to access various third-party artificial intelligence models ("AI Models") provided by different vendors (such as AI service providers like OpenAI, Google, Anthropic, etc.) through a single API endpoint.</p>
        <p class="zh">AIForce 运营一个统一的 API 集成平台（"服务"），使用户和开发者能够通过单一 API 端点访问由不同供应商（如 OpenAI、Google、Anthropic 等人工智能服务提供商）提供的各种第三方人工智能模型（"AI 模型"）。</p>

        <p class="en">AIForce may add, modify, or remove AI Models from the Service at any time. For the removal of or major changes to models, we will make reasonable efforts to post an announcement on our website in advance.</p>
        <p class="zh">AIForce 可随时添加、修改或移除服务中的 AI 模型。如需移除或对模型进行重大更改，我们将尽合理努力提前在网站上发布公告。</p>

        <h2>Article 2: Eligibility / 第二条 使用资格</h2>
        <p class="en">You must be at least 13 years old to use the Service. If you have not reached the age of majority in your jurisdiction, your parent or legal guardian must agree to these Terms on your behalf.</p>
        <p class="zh">您必须年满13周岁方可使用本服务。如果您未达到您所在司法管辖区的成年年龄，您的父母或法定监护人必须代表您同意本条款。</p>

        <p class="en">By agreeing to these Terms, you represent and warrant that:</p>
        <p class="zh">同意本条款即表示您声明并保证：</p>
        <ul>
            <li>
                <span class="en">(1) You are at least 13 years old;</span>
                <span class="zh">（一）您已年满13周岁；</span>
            </li>
            <li>
                <span class="en">(2) You have not previously been suspended or removed from the Service;</span>
                <span class="zh">（二）您此前未被暂停或移除出本服务；</span>
            </li>
            <li>
                <span class="en">(3) Your registration and use comply with all applicable laws and regulations.</span>
                <span class="zh">（三）您的注册和使用符合所有适用的法律法规。</span>
            </li>
        </ul>

        <p class="en">If you are using the Service on behalf of an entity, organization, or company, you represent and warrant that you have the authority to bind that organization to these Terms.</p>
        <p class="zh">如果您代表实体、组织或公司使用本服务，您声明并保证您有权将该组织约束于本条款。</p>

        <h2>Article 3: Account and Registration / 第三条 账户与注册</h2>
        <p class="en">To access most features of the Service, you must register for an account. You agree that:</p>
        <p class="zh">使用本服务的大部分功能需要注册账户。您同意：</p>
        <ul>
            <li>
                <span class="en">The information provided during registration is accurate and complete;</span>
                <span class="zh">注册时提供的信息准确、完整；</span>
            </li>
            <li>
                <span class="en">You will promptly update your account information;</span>
                <span class="zh">及时更新账户信息；</span>
            </li>
            <li>
                <span class="en">You are solely responsible for maintaining the confidentiality of your account credentials;</span>
                <span class="zh">您对维护账户凭证的保密性负全部责任；</span>
            </li>
            <li>
                <span class="en">You accept responsibility for all activities that occur under your account;</span>
                <span class="zh">您对在您账户下发生的所有活动承担责任；</span>
            </li>
            <li>
                <span class="en">You will notify us immediately if you believe your account has been compromised.</span>
                <span class="zh">如果您认为账户已被泄露，应立即通知我们。</span>
            </li>
        </ul>

        <h2>Article 4: Compliance and Prohibited Conduct / 第四条 合规使用与禁止行为</h2>
        
        <h3>4.1 Basic Obligations / 4.1 基本义务</h3>
        <p class="en">You agree to use the Service only for lawful purposes and in compliance with these Terms, all applicable local, national, and international laws and regulations, as well as the terms of service of each AI model vendor you access through our platform.</p>
        <p class="zh">您同意仅出于合法目的使用本服务，并遵守本条款、所有适用的地方、国家和国际法律法规，以及您通过我们平台访问的每个 AI 模型供应商的服务条款。</p>

        <h3>4.2 Prohibited Conduct / 4.2 禁止行为</h3>
        <p class="en">You agree not to use the Service to engage in the following conduct:</p>
        <p class="zh">您同意不得使用本服务从事以下行为：</p>
        <ul>
            <li>
                <span class="en">Violate the rights of others or any applicable laws and regulations;</span>
                <span class="zh">侵犯他人权利或违反任何适用的法律法规；</span>
            </li>
            <li>
                <span class="en">Violate these Terms, our policies, or the terms of third-party AI vendors;</span>
                <span class="zh">违反本条款、我们的政策或第三方 AI 供应商的条款；</span>
            </li>
            <li>
                <span class="en">Generate, disseminate, or facilitate the creation of pornographic, obscene, vulgar, sexually explicit, or other content that violates community standards;</span>
                <span class="zh">生成、传播或协助制作色情、淫秽、低俗、色情露骨或其他违反社区标准的内容；</span>
            </li>
            <li>
                <span class="en">Utilize this platform (including any third-party role-playing/chat tools such as SillyTavern) to generate vulgar, pornographic, or allegedly illegal dialogues or content;</span>
                <span class="zh">利用本平台（包括 SillyTavern 酒馆等任何第三方角色扮演/聊天工具）生成低俗、色情或涉嫌违法的对话或内容；</span>
            </li>
            <li>
                <span class="en">Generate or disseminate content that promotes violence, terrorism, extremism, or hatred;</span>
                <span class="zh">生成或传播宣扬暴力、恐怖主义、极端主义或仇恨的内容；</span>
            </li>
            <li>
                <span class="en">Generate or disseminate politically sensitive, defamatory, or harmful false information;</span>
                <span class="zh">生成或传播政治敏感、诽谤性或有害的虚假信息；</span>
            </li>
            <li>
                <span class="en">Misrepresent AI-generated content as being human-authored;</span>
                <span class="zh">将 AI 生成的内容冒充为人工创作的内容；</span>
            </li>
            <li>
                <span class="en">Reverse engineer, decompile, or attempt to derive the source code of our Service or any AI model;</span>
                <span class="zh">对我们的服务或任何 AI 模型进行逆向工程、反编译或试图获取源代码；</span>
            </li>
            <li>
                <span class="en">Use the Service maliciously, including introducing malware, viruses, or bypassing security measures;</span>
                <span class="zh">恶意使用服务，包括引入恶意软件、病毒或绕过安全措施；</span>
            </li>
            <li>
                <span class="en">Exceed the usage limits set by us, or create multiple accounts to evade payment or usage restrictions;</span>
                <span class="zh">超出我们设定的使用限制，或创建多个账户以规避付款或使用限制；</span>
            </li>
            <li>
                <span class="en">Use unauthorized methods such as web scrapers or automated tools to extract data from the Service;</span>
                <span class="zh">使用网页爬虫或自动化工具等未经授权的方法从服务中提取数据；</span>
            </li>
            <li class="alert">
                <span class="en">Use any deceptive means (including but not limited to modifying IP addresses, forging geographic location information, using VPNs or proxies) to circumvent the geographic restrictions of this platform;</span>
                <span class="zh">使用任何欺骗性手段（包括但不限于修改 IP 地址、伪造地理位置信息、使用 VPN 或代理）以规避本平台的地理限制；</span>
            </li>
            <li>
                <span class="en">Sell, transfer, or sublicense your access to the Service without prior written consent;</span>
                <span class="zh">未经书面同意，出售、转让或分授权您对服务的访问权；</span>
            </li>
            <li>
                <span class="en">Interfere with the operation of the Service or other users' enjoyment of the Service;</span>
                <span class="zh">干扰服务的运营或其他用户对服务的使用；</span>
            </li>
            <li>
                <span class="en">Engage in any fraudulent activity, including impersonating any person or entity;</span>
                <span class="zh">进行任何欺诈行为，包括冒充任何个人或实体；</span>
            </li>
            <li>
                <span class="en">Attempt to engage in any of the foregoing, or assist or permit anyone to do so.</span>
                <span class="zh">尝试从事上述任何行为，或协助、允许任何人从事上述行为。</span>
            </li>
        </ul>

        <h3>4.3 Content Review / 4.3 内容审查</h3>
        <p class="en">We reserve the right to monitor, review, and remove any content or activity that violates these Terms. We may suspend or terminate accounts engaged in prohibited conduct without prior notice.</p>
        <p class="zh">我们保留监控、审查和移除任何违反本条款的内容或活动的权利。我们可能在不事先通知的情况下暂停或终止从事违禁行为的账户。</p>

        <h2>Article 5: Geographic Restrictions and Service Availability / 第五条 地区限制与服务可用性</h2>
        
        <h3>5.1 Geographic Restrictions Statement / 5.1 限制地区声明</h3>
        <p class="en">AIForce’s services are not available to residents, individuals, or entities located in the Mainland of the People's Republic of China (hereinafter referred to as the "Restricted Region"). We do not provide any form of API calls, account registration, topping up, or technical support services to the Restricted Region.</p>
        <p class="zh">AIForce 的服务不向中华人民共和国大陆地区（下称“限制地区”）的居民、位于该地区内的个人或实体开放。我们不向限制地区提供任何形式的 API 调用、账户注册、充值或技术支持服务。</p>

        <h3>5.2 Consequences of Circumvention / 5.2 违规绕过后果</h3>
        <p class="en">Users shall not bypass the geographic restrictions of this platform through any Virtual Private Network (VPN), proxy servers, or other technical means. If a user is found accessing or using the Service within the Restricted Region, AIForce reserves the right to immediately terminate your account and access permissions without prior notice. For accounts terminated due to violation of this geographic restriction clause, all remaining prepaid credits or balances in the account will be directly forfeited, and no refunds or settlements of any kind will be provided.</p>
        <p class="zh">用户不得通过任何虚拟专用网络（VPN）、代理服务器或其他技术手段绕过本平台的地理位置限制。一经发现用户在限制地区内访问或使用本服务，AIForce 保留不经事先通知，立即终止您的账户及服务访问权限的权利。因违反本地区限制条款而被终止账户的，账户内所有剩余的预付积分或余额将被直接没收，概不提供任何形式的退款或清算。</p>

        <h2>Article 6: Payment / 第六条 付款</h2>
        
        <h3>6.1 Prepaid Credits / 6.1 预付积分</h3>
        <p class="en">Use of the Service may require you to purchase prepaid credits ("Credits"). Before purchasing, you will have the opportunity to review the applicable fees. Once purchased, Credits are generally non-refundable unless otherwise required by applicable law.</p>
        <p class="zh">使用本服务可能需要您购买预付积分（"积分"）。购买前，您将有机会查看适用的费用。积分一经购买，除适用法律另有要求外，通常不予退款。</p>

        <h3>6.2 Payment Methods / 6.2 支付方式</h3>
        <p class="en">Payments may be processed through third-party payment processors. You agree to comply with the terms and conditions of any third-party payment processor you use.</p>
        <p class="zh">付款可通过第三方支付处理商处理。您同意遵守所使用的任何第三方支付处理商的条款和条件。</p>

        <h3>6.3 Price Changes / 6.3 价格变更</h3>
        <p class="en">AIForce reserves the right to change prices at any time. For major price changes, we will provide advance notice on our website. Continued use of the Service after the change constitutes acceptance of the new prices.</p>
        <p class="zh">AIForce 保留随时更改价格的权利。对于重大价格变更，我们将在网站上提前通知。变更后继续使用服务即视为接受新价格。</p>

        <h2>Article 7: User Content / 第七条 用户内容</h2>
        
        <h3>7.1 Input and Output / 7.1 输入与输出</h3>
        <p class="en">You may provide input to the Service ("Input") and receive output generated by the AI models ("Output"; Input and Output are collectively referred to as "User Content"). You retain ownership of your Input.</p>
        <p class="zh">您可以向服务提供输入（"输入"），并接收由 AI 模型生成的输出（"输出"；输入和输出统称为"用户内容"）。您保留对您输入内容的所有权。</p>

        <h3>7.2 Ownership of Output / 7.2 输出所有权</h3>
        <p class="en">Your ownership of the Output is subject to the terms of the respective AI model vendors. We recommend that you review the relevant AI model vendor's terms regarding output ownership.</p>
        <p class="zh">您对输出的所有权受各 AI 模型供应商条款的约束。我们建议您查阅相关 AI 模型供应商关于输出所有权的条款。</p>

        <h3>7.3 Representations and Warranties / 7.3 声明与保证</h3>
        <p class="en">By providing Input, you represent and warrant that:</p>
        <p class="zh">提供输入即表示您声明并保证：</p>
        <ul>
            <li>
                <span class="en">You are the owner of the Input, or have the necessary rights and licenses;</span>
                <span class="zh">您是输入内容的所有者，或拥有必要的权利和许可；</span>
            </li>
            <li>
                <span class="en">Your Input does not infringe the intellectual property, privacy, or other rights of any third party;</span>
                <span class="zh">您的输入不侵犯任何第三方的知识产权、隐私权或其他权利；</span>
            </li>
            <li>
                <span class="en">Your Input complies with all applicable laws and these Terms.</span>
                <span class="zh">您的输入符合所有适用法律和本条款。</span>
            </li>
        </ul>

        <h3>7.4 Disclaimer / 7.4 免责声明</h3>
        <p class="en">We are not responsible for the accuracy, quality, legality, or reliability of any Output generated through the Service. Your use of the Output is at your own risk.</p>
        <p class="zh">我们不对通过服务生成的任何输出的准确性、质量、合法性或可靠性负责。您使用输出的风险由您自行承担。</p>

        <h2>Article 8: Intellectual Property / 第八条 知识产权</h2>
        <p class="en">The Service and its software, interfaces, designs, and documentation ("Materials") are the property of AIForce or its licensors. Use of the Service does not transfer any intellectual property rights to you. Without our prior written consent, you may not copy, distribute, or create derivative works based on these Materials.</p>
        <p class="zh">本服务及其软件、界面、设计和文档（"材料"）为 AIForce 或其许可方的财产。使用本服务不向您转让任何知识产权。未经我们事先书面同意，您不得复制、分发或基于这些材料创建衍生作品。</p>

        <h2>Article 9: Privacy / 第九条 隐私</h2>
        <p class="en">Our Privacy Policy describes how we collect, use, store, and disclose your personal information and is incorporated into these Terms by reference. By using the Service, you consent to the practices described in the Privacy Policy.</p>
        <p class="zh">我们的隐私政策描述了我们如何收集、使用、存储和披露您的个人信息，该隐私政策以引用方式纳入本条款。使用本服务即表示您同意隐私政策中所述的做法。</p>

        <h2>Article 10: Disclaimers / 第十条 免责声明</h2>
        <p class="en">The Service and all Materials are provided on an "as is" and "as available" basis, without warranties of any kind, either express or implied. AIForce does not warrant that:</p>
        <p class="zh">本服务及所有材料均按"现状"和"可用"基础提供，不附带任何明示或暗示的保证。AIForce 不对以下情况作出保证：</p>
        <ul>
            <li>
                <span class="en">The Service will operate uninterrupted, secure, or error-free;</span>
                <span class="zh">服务将不间断、安全或无错误运行；</span>
            </li>
            <li>
                <span class="en">The Output generated through the Service will be accurate, complete, or reliable;</span>
                <span class="zh">通过服务生成的输出将准确、完整或可靠；</span>
            </li>
            <li>
                <span class="en">Any defects in the Service will be corrected.</span>
                <span class="zh">服务中的任何缺陷将被修正。</span>
            </li>
        </ul>
        <p class="en">Any risk of damage that may result from your use of the Service is borne solely by you.</p>
        <p class="zh">您因使用本服务而可能产生的任何损害风险由您自行承担。</p>

        <h2>Article 11: Limitation of Liability / 第十一条 责任限制</h2>
        <p class="en">To the maximum extent permitted by law, AIForce shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use or inability to use the Service, whether based on warranty, contract, tort, or any other legal theory.</p>
        <p class="zh">在法律允许的最大范围内，AIForce 不对因您使用或无法使用本服务而产生的任何间接、附带、特殊、后果性或惩罚性损害承担责任，无论其基于保证、合同、侵权还是任何其他法律理论。</p>

        <p class="en">The aggregate liability of AIForce for all claims arising out of or related to the Service shall not exceed the greater of:</p>
        <p class="zh">AIForce 对因服务引起或与服务相关的所有索赔的累计责任不超过以下两者中的较大者：</p>
        <ul>
            <li>
                <span class="en">(A) The remaining unused prepaid balance in your account at the time the claim arises, where "unused prepaid balance" means the total amount of credits or prepayments deposited into your account less all fees incurred due to API usage prior to the event giving rise to the claim; or</span>
                <span class="zh">(A) 索赔发生时您账户中剩余的未使用预付余额，其中“未使用预付余额”指存入您账户的总积分或预付款金额减去引发索赔事件之前因 API 使用产生的所有费用；或</span>
            </li>
            <li>
                <span class="en">(B) USD 100.</span>
                <span class="zh">(B) 100 美元。</span>
            </li>
        </ul>

        <p class="en">For the avoidance of doubt, if you use a pay-as-you-go or post-paid billing plan and have no prepaid balance, the maximum liability limit is USD 100.</p>
        <p class="zh">为避免疑义，如果您使用按次付费或后付费计费计划且无预付余额，则最大责任限额为 100 美元。</p>

        <h2>Article 12: Indemnification / 第十二条 赔偿</h2>
        <p class="en">You agree to defend, indemnify, and hold harmless AIForce and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with:</p>
        <p class="zh">您同意对 AIForce 及其管理人员、董事、员工和代理人因以下原因产生的任何索赔、责任、损害、损失和费用（包括合理的律师费）进行辩护、赔偿并使其免受损害：</p>
        <ul>
            <li>
                <span class="en">Your use of the Service;</span>
                <span class="zh">您对服务的使用；</span>
            </li>
            <li>
                <span class="en">Your violation of these Terms;</span>
                <span class="zh">您违反本条款；</span>
            </li>
            <li>
                <span class="en">Your violation of any applicable laws or regulations;</span>
                <span class="zh">您违反任何适用法律法规；</span>
            </li>
            <li>
                <span class="en">Your violation of any third-party right;</span>
                <span class="zh">您侵犯任何第三方权利；</span>
            </li>
            <li>
                <span class="en">Any User Content you provide through the Service.</span>
                <span class="zh">您通过服务提供的任何用户内容。</span>
            </li>
        </ul>

        <h2>Article 13: Termination / 第十三条 终止</h2>
        <p class="en">We may suspend or terminate your access to the Service at any time and for any reason, including for violation of these Terms. You may terminate your account by ceasing use of the Service and contacting us. Upon termination:</p>
        <p class="zh">我们可随时以任何原因暂停或终止您对服务的访问，包括违反本条款。您可以通过停止使用并联系我们来终止您的账户。终止后：</p>
        <ul>
            <li>
                <span class="en">Your right to use the Service ceases immediately;</span>
                <span class="zh">您使用服务的权利立即停止；</span>
            </li>
            <li>
                <span class="en">Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, disclaimers, indemnity, and limitations of liability;</span>
                <span class="zh">本条款中因其性质应在终止后继续有效的条款将继续适用，包括所有权、责任、赔偿和争议解决条款；</span>
            </li>
            <li>
                <span class="en">Any remaining credits may be forfeited, except as required by applicable law for refunds.</span>
                <span class="zh">除适用法律要求退款外，任何剩余积分可能被没收。</span>
            </li>
        </ul>

        <h2>Article 14: Governing Law and Dispute Resolution / 第十四条 争议解决与适用法律</h2>
        
        <h3>14.1 Governing Law / 14.1 适用法律</h3>
        <p class="en">The formation, execution, interpretation of these Terms, and all disputes arising out of or in connection with your use of the Service shall be governed by and construed in accordance with the laws of Malaysia, without regard to its conflict of law principles.</p>
        <p class="zh">本条款的订立、执行、解释及所有与您使用服务有关的争议，均受马来西亚法律管辖，并排除任何冲突法原则的适用。</p>

        <h3>14.2 Dispute Resolution and Jurisdiction / 14.2 争议解决与管辖权</h3>
        <p class="en">Any dispute, controversy, or claim arising out of or relating to these Terms or your use of the Service shall first be attempted to be resolved through friendly consultation. If the dispute cannot be resolved through consultation and must be handled through legal proceedings (and provided that applicable law does not mandatory require arbitration), you agree to submit the dispute to the exclusive jurisdiction of the competent courts of Malaysia.</p>
        <p class="zh">与本条款或您使用服务有关的任何争议、纠纷或索赔，应首先尝试通过友好协商解决。如果协商无法解决且必须通过法律途径处理（且适用法律未强制要求仲裁的），您同意将该争议提交至马来西亚有管辖权的法院进行专属管辖。</p>

        <h2>Article 15: Modifications to Terms / 第十五条 条款修改</h2>
        <p class="en">We may modify these Terms at any time. For material changes, we will provide advance notice via our website or email. Continued use of the Service after receiving notice constitutes acceptance of the modified Terms. If you do not agree, please stop using the Service.</p>
        <p class="zh">我们可随时修改本条款。对于重大变更，我们将通过网站或电子邮件提前通知。收到通知后继续使用服务即视为接受修改后的条款。如果您不同意，请停止使用服务。</p>

        <h2>Article 16: General Terms / 第十六条 一般条款</h2>
        <ul>
            <li>
                <span class="en">Entire Agreement: These Terms, together with the Privacy Policy, constitute the entire agreement between you and AIForce regarding the Service.</span>
                <span class="zh">完整协议：本条款连同隐私政策构成您与 AIForce 之间就本服务达成的完整协议。</span>
            </li>
            <li>
                <span class="en">Severability: If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.</span>
                <span class="zh">可分割性：如本条款的任何条款被认定为不可执行，其余条款仍完全有效。</span>
            </li>
            <li>
                <span class="en">Waiver: Failure to enforce any provision of these Terms does not constitute a waiver of that provision.</span>
                <span class="zh">弃权：未能执行本条款的任何条款不构成对该条款的放弃。</span>
            </li>
            <li>
                <span class="en">Assignment: You may not assign these Terms without our consent. We may assign these Terms at any time.</span>
                <span class="zh">转让：未经我们同意，您不得转让本条款。我们可随时转让本条款。</span>
            </li>
            <li>
                <span class="en">Electronic Communications: By using the Service, you consent to receive electronic communications from us.</span>
                <span class="zh">电子通信：使用本服务即表示您同意接收我们的电子通信。</span>
            </li>
        </ul>

        <h2>Article 17: Contact Information / 第十七条 联系方式</h2>
        <p class="en">If you have any questions about these Terms, please contact us through the channels provided on our website.</p>
        <p class="zh">如果您对本条款有任何疑问，请通过我们网站上提供的渠道联系我们。</p>
    </div>
`;
