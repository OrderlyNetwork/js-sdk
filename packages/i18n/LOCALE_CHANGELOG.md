# Locale Changelog

## 2.1.1

### Added Languages

| Locale Code | Language   |
| ----------- | ---------- |
| `ja`        | Japanese   |
| `es`        | Spanish    |
| `ko`        | Korean     |
| `vi`        | Vietnamese |
| `de`        | German     |
| `fr`        | French     |

### Added Keys

#### Language: **en**

| Key                                  | Value                                                                                                                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| languageSwitcher.language            | Language                                                                                                                                                                                            |
| languageSwitcher.tips                | AI-generated translations may not be fully accurate.                                                                                                                                                |
| announcement.type.listing            | Listing                                                                                                                                                                                             |
| announcement.type.maintenance        | Maintenance                                                                                                                                                                                         |
| announcement.type.delisting          | Delisting                                                                                                                                                                                           |
| maintenance.dialog.title             | System upgrade in progress                                                                                                                                                                          |
| maintenance.dialog.description       | Sorry, {{brokerName}} is temporarily unavailable due to a scheduled upgrade. The service is expected to be back by {{endDate}}.                                                                     |
| maintenance.tips.description         | {{brokerName}} will be temporarily unavailable for a scheduled upgrade from {{startDate}} to {{endDate}}.                                                                                           |
| restrictedInfo.description.default   | You are accessing {{brokerName}} from an IP address ({{ip}}) associated with a restricted country.                                                                                                  |
| connector.privy.loginIn              | Login in                                                                                                                                                                                            |
| connector.privy.logout               | Log out                                                                                                                                                                                             |
| connector.privy.email                | Email                                                                                                                                                                                               |
| connector.privy.google               | Google                                                                                                                                                                                              |
| connector.privy.twitter              | X / Twitter                                                                                                                                                                                         |
| connector.privy.myWallet             | My wallet                                                                                                                                                                                           |
| connector.privy.addEvmWallet         | Add Evm wallet                                                                                                                                                                                      |
| connector.privy.addSolanaWallet      | Add Solana wallet                                                                                                                                                                                   |
| connector.privy.createEvmWallet      | Create Evm wallet                                                                                                                                                                                   |
| connector.privy.createSolanaWallet   | Create Solana wallet                                                                                                                                                                                |
| connector.privy.termsOfUse           | By connecting your wallet, you acknowledge and agree to the <0>terms of use</0>.                                                                                                                    |
| connector.privy.supportedEvmChain    | Supported Evm chain                                                                                                                                                                                 |
| connector.privy.supportedSolanaChain | Supported Solana chain                                                                                                                                                                              |
| connector.privy.noWallet             | No wallet                                                                                                                                                                                           |
| connector.privy.noWallet.description | Please create a wallet to proceed. Only you can access the private key. You can export the private key and import your wallet into another wallet client, such as MetaMask or Phantom, at any time. |
| connector.privy.switchNetwork.tips   | Switch to {{chainName}} to continue.                                                                                                                                                                |
| connector.privy.addEvmWallet.tips    | Connect an EVM-compatible wallet to continue using the EVM network.                                                                                                                                 |
| connector.privy.addSolanaWallet.tips | Connect an Solana-compatible wallet to continue using the Solana network.                                                                                                                           |
| transfer.insufficientAllowance       | Insufficient allowance                                                                                                                                                                              |

#### Language: **zh**

| Key                                  | Value                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| languageSwitcher.language            | 语言                                                                                                             |
| languageSwitcher.tips                | 人工智能生成的翻译可能并不完全准确。                                                                             |
| announcement.type.listing            | Listing                                                                                                          |
| announcement.type.maintenance        | Maintenance                                                                                                      |
| announcement.type.delisting          | Delisting                                                                                                        |
| maintenance.dialog.title             | 系统升级进行中                                                                                                   |
| maintenance.dialog.description       | 抱歉，由于计划中的升级，{{brokerName}}暂时不可用。服务预计将在{{endDate}}恢复。                                  |
| maintenance.tips.description         | {{brokerName}}将因计划中的升级从{{startDate}}到{{endDate}}暂时不可用。                                           |
| restrictedInfo.description.default   | 您正在从与受限国家相关的 IP 地址（{{ip}}）访问{{brokerName}}。                                                   |
| connector.privy.loginIn              | 登录                                                                                                             |
| connector.privy.logout               | 登出                                                                                                             |
| connector.privy.email                | 电子邮件                                                                                                         |
| connector.privy.google               | 谷歌                                                                                                             |
| connector.privy.twitter              | X / 推特                                                                                                         |
| connector.privy.myWallet             | 我的钱包                                                                                                         |
| connector.privy.addEvmWallet         | 添加 Evm 钱包                                                                                                    |
| connector.privy.addSolanaWallet      | 添加 Solana 钱包                                                                                                 |
| connector.privy.createEvmWallet      | 创建 EVM 钱包                                                                                                    |
| connector.privy.createSolanaWallet   | 创建 Solana 钱包                                                                                                 |
| connector.privy.termsOfUse           | 通过连接您的钱包，您确认并同意<0>使用条款</0>。                                                                  |
| connector.privy.supportedEvmChain    | 支持的 Evm 链                                                                                                    |
| connector.privy.supportedSolanaChain | 支持的 Solana 链                                                                                                 |
| connector.privy.noWallet             | 没有钱包                                                                                                         |
| connector.privy.noWallet.description | 请创建钱包以继续。只有您可以访问私钥。您可以随时导出私钥，并将钱包导入到其他钱包客户端，如 MetaMask 或 Phantom。 |
| connector.privy.switchNetwork.tips   | 切换到{{chainName}}以继续。                                                                                      |
| connector.privy.addEvmWallet.tips    | 连接一个 EVM 兼容的钱包以继续使用 EVM 网络。                                                                     |
| connector.privy.addSolanaWallet.tips | 连接一个 Solana 兼容的钱包以继续使用 Solana 网络。                                                               |
| transfer.insufficientAllowance       | 授权额度不足                                                                                                     |

### Removed Keys

#### Language: **en**

| Key                                         | Value                                                                                                                                                                                               |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| common.language                             | Language                                                                                                                                                                                            |
| scaffold.maintenance.dialog.title           | System upgrade in progress                                                                                                                                                                          |
| scaffold.maintenance.dialog.description     | Sorry, {{brokerName}} is temporarily unavailable due to a scheduled upgrade. The service is expected to be back by {{endDate}}.                                                                     |
| scaffold.maintenance.tips.description       | {{brokerName}} will be temporarily unavailable for a scheduled upgrade from {{startDate}} to {{endDate}}.                                                                                           |
| scaffold.restrictedInfo.description.default | You are accessing {{brokerName}} from an IP address ({{ip}}) associated with a restricted country.                                                                                                  |
| connector.loginIn                           | Login in                                                                                                                                                                                            |
| connector.logout                            | Log out                                                                                                                                                                                             |
| connector.email                             | Email                                                                                                                                                                                               |
| connector.google                            | Google                                                                                                                                                                                              |
| connector.twitter                           | X / Twitter                                                                                                                                                                                         |
| connector.myWallet                          | My wallet                                                                                                                                                                                           |
| connector.addEvmWallet                      | Add Evm wallet                                                                                                                                                                                      |
| connector.addSolanaWallet                   | Add Solana wallet                                                                                                                                                                                   |
| connector.createEvmWallet                   | Create Evm wallet                                                                                                                                                                                   |
| connector.createSolanaWallet                | Create Solana wallet                                                                                                                                                                                |
| connector.termsOfUse                        | By connecting your wallet, you acknowledge and agree to the <0>terms of use</0>.                                                                                                                    |
| connector.supportedEvmChain                 | Supported Evm chain                                                                                                                                                                                 |
| connector.supportedSolanaChain              | Supported Solana chain                                                                                                                                                                              |
| connector.noWallet                          | No wallet                                                                                                                                                                                           |
| connector.noWallet.description              | Please create a wallet to proceed. Only you can access the private key. You can export the private key and import your wallet into another wallet client, such as MetaMask or Phantom, at any time. |

#### Language: **zh**

| Key                                         | Value                                                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| common.language                             | 语言                                                                                                             |
| scaffold.maintenance.dialog.title           | 系统升级进行中                                                                                                   |
| scaffold.maintenance.dialog.description     | 抱歉，由于计划中的升级，{{brokerName}}暂时不可用。服务预计将在{{endDate}}恢复。                                  |
| scaffold.maintenance.tips.description       | {{brokerName}}将因计划中的升级从{{startDate}}到{{endDate}}暂时不可用。                                           |
| scaffold.restrictedInfo.description.default | 您正在从与受限国家相关的 IP 地址（{{ip}}）访问{{brokerName}}。                                                   |
| connector.loginIn                           | 登录中                                                                                                           |
| connector.logout                            | 登出                                                                                                             |
| connector.email                             | 电子邮件                                                                                                         |
| connector.google                            | 谷歌                                                                                                             |
| connector.twitter                           | X / 推特                                                                                                         |
| connector.myWallet                          | 我的钱包                                                                                                         |
| connector.addEvmWallet                      | 添加 Evm 钱包                                                                                                    |
| connector.addSolanaWallet                   | 添加 Solana 钱包                                                                                                 |
| connector.createEvmWallet                   | 创建 EVM 钱包                                                                                                    |
| connector.createSolanaWallet                | 创建 Solana 钱包                                                                                                 |
| connector.termsOfUse                        | 通过连接您的钱包，您确认并同意<0>使用条款</0>。                                                                  |
| connector.supportedEvmChain                 | 支持的 Evm 链                                                                                                    |
| connector.supportedSolanaChain              | 支持的 Solana 链                                                                                                 |
| connector.noWallet                          | 没有钱包                                                                                                         |
| connector.noWallet.description              | 请创建钱包以继续。只有您可以访问私钥。您可以随时导出私钥，并将钱包导入到其他钱包客户端，如 MetaMask 或 Phantom。 |
