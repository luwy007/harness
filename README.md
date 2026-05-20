# Harness Agent

一个通用 AI agent 技能（skill）集合，通过 harness 机制为不同的 AI agent 平台扩展能力。

## 简介

本仓库以结构化的方式维护可复用的 agent skill。每个 skill 描述一段独立的行为规范，可被支持 harness 协议的 agent 平台加载并调用——手动触发或由平台根据上下文自动调用。

## 技能列表

| 技能 | 斜杠命令 | 功能 |
|---|---|---|
| cost-planner | `/cost-planner` | 在执行任务前估算时间和 token 消耗，支持 quick / standard / thorough 三种模式 |

## 目录结构

每个技能独占一个子目录：

```
<skill-name>/
  SKILL.md                  # 必须：技能元数据 + 行为规范
  agents/<provider>.yaml    # 可选：agent 接口配置（展示名称、默认 prompt、调用策略）
  references/<topic>.md     # 可选：按需加载的参考文档（schema、查找表等）
```

## 添加新技能

1. 新建目录 `<skill-name>/`，在其中创建 `SKILL.md`：

   ```yaml
   ---
   name: <skill-name>
   description: <一行描述，供 harness 判断是否自动触发>
   ---

   # 技能名称

   （行为规范正文）
   ```

2. 如有大量参考资料，放入 `references/<topic>.md`，并在 `SKILL.md` 正文中注明"何时加载"。

3. 如需配置 agent 接口，添加 `agents/<provider>.yaml`：

   ```yaml
   interface:
     display_name: "..."
     short_description: "..."
     default_prompt: "..."

   policy:
     allow_implicit_invocation: true
   ```

## 使用方式

将本仓库路径配置到目标 agent 平台的 skills 目录后重启即可生效。技能加载后：

- **手动触发**：在对话中输入 `/<skill-name>`
- **自动触发**：harness 根据 `SKILL.md` 中的 `description` 字段匹配上下文，自动调用相关技能
