# 需求分析命令 (Requirement Analysis)

## 命令概述

此命令用于基于 Jira issue 自动生成结构化的需求分析文档。它会读取项目中的 Jira issue 信息，并使用 AI 填充需求分析模板。

## 使用方法

```
@specflow-req.md <JIRA_ISSUE_ID_OR_URL>
```

**参数说明：**

- `JIRA_ISSUE_ID_OR_URL`: Jira issue ID 或 Jira URL
  - **ID 格式**：如 `DEX-2610`
  - **URL 格式**：如 `https://orderly-network.atlassian.net/browse/DEX-2642`

**示例：**

```
@specflow-req.md DEX-2610
@specflow-req.md https://orderly-network.atlassian.net/browse/DEX-2642
```

## 执行流程

### 1. 验证前置条件

- **检查 Jira MCP 配置**：确认 `~/.cursor/mcp.json` 中配置了 Jira MCP 服务器
  - 如果未配置，停止执行并提示用户配置 Jira MCP
  - 配置示例：
    ```json
    {
      "mcpServers": {
        "jira": {
          "url": "your-jira-mcp-server-url"
        }
      }
    }
    ```

### 2. 解析 Issue ID

- 如果参数是 URL 格式（如 `https://orderly-network.atlassian.net/browse/DEX-2642`），从 URL 中提取 issue ID（如 `DEX-2642`）
- 如果参数已经是 ID 格式（如 `DEX-2610`），直接使用

### 3. 查找 Issue 目录

- 在 `./specflow/specs` 目录下递归查找包含指定 issue ID 的目录
- 目录结构示例：`./specflow/specs/2025-12-12/DEX-2610/`

### 4. 读取 State 文件

- 读取目录中的 `state.json` 文件
- 提取 `jiraIssueUrl` 字段，例如：
  ```json
  {
    "jiraIssueUrl": "https://orderly-network.atlassian.net/browse/DEX-2610"
  }
  ```

### 5. 获取 Jira Issue 信息

- 使用 Jira MCP 调用 API 获取 issue 详细信息
- 需要获取的信息包括：
  - Issue 标题 (summary)
  - Issue 描述 (description)
  - Issue 类型 (issue type)
  - 优先级 (priority)
  - 状态 (status)
  - 负责人 (assignee)
  - 创建日期 (created)
  - 相关附件和链接
  - 评论和讨论内容

### 6. AI 需求分析

基于 `.specflow/templates/req-tpl.md` 模板，使用 AI 分析 Jira issue 内容并自动填充：

**自动填充的部分：**

- **文档元数据**：
  - 需求名称：从 issue summary 提取
  - 需求 ID：使用 Jira issue ID
  - 创建日期：从 issue created 日期提取
  - 负责人：从 state.json 的 owner 字段或 Jira assignee 提取
  - 优先级：根据 Jira priority 映射（Critical/High → P0, Medium → P1, Low → P2）
  - 状态：根据当前阶段设置为"分析中"
  - 关联任务：使用 Jira issue ID

- **背景部分**：
  - 业务背景：从 issue description 中提取业务相关内容
  - 问题描述：从 issue description 中提取问题描述
  - 目标用户：根据 issue 内容推断目标用户群体

- **需求概述**：
  - 综合 issue 信息生成 1-2 段概述

- **功能需求**：
  - 从 issue description 和 acceptance criteria 中提取功能点
  - 转换为结构化的功能描述格式

- **功能验收标准**：
  - 将 Jira 中的验收标准转换为 GIVEN-WHEN-THEN 格式
  - 如果 issue 中没有明确的验收标准，基于功能描述生成

- **参考资料**：
  - 添加 Jira issue URL
  - 列出 issue 中的附件链接
  - 添加 state.json 中的 figmaUrls

**需要交互确认的部分：**

- **约束条件**：技术约束、业务约束、时间约束、资源约束
- **依赖关系**：前置依赖、后续影响
- **风险评估**：技术风险、业务风险
- **数据模型**：如果涉及数据结构（除非 issue 中有明确说明）
- **接口定义**：API 接口规范（除非 issue 中有明确说明）

### 7. 生成文档

- 创建 `req.md` 文件
- 保存在与 `state.json` 相同的目录下
- 路径示例：`./specflow/specs/2025-12-12/DEX-2610/req.md`
- 生成文档时移除掉模板中的注释部分

### 8. 交互式补充

对于不明确或无法从 Jira issue 中提取的信息，逐步询问用户：

- 明确列出需要补充的章节
- 提供建议选项或示例
- 等待用户输入后更新文档

### 9. 完成确认

- 显示生成的文档路径
- 提示用户查看和修改文档
- 询问是否需要进一步调整

## 错误处理

- **Jira MCP 未配置**：提示配置方法并停止执行
- **Issue ID 不存在**：提示在 `./specflow/specs` 目录下未找到对应的 issue 目录
- **state.json 缺失**：提示 state.json 文件不存在
- **jiraIssueUrl 缺失**：提示 state.json 中缺少 jiraIssueUrl 字段
- **Jira API 调用失败**：提示网络错误或权限问题，显示具体错误信息

## 注意事项

1. 确保有 Jira API 的访问权限
2. 生成的文档是初稿，需要人工审核和完善
3. AI 填充的内容基于 issue 描述，可能需要根据实际情况调整
4. 对于复杂的技术细节，建议在生成后进行人工补充
5. 文档生成后会更新 state.json 中的相关状态信息

## 相关模板

- 需求分析模板：`.specflow/templates/req-tpl.md`
- UI/UX 设计模板：`.specflow/templates/ux-tpl.md`
- 测试文档模板：`.specflow/templates/test-tpl.md`
- 技术方案模板：`.specflow/templates/tech-tpl.md`
