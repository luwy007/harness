# Task Cost Preview

在执行任何任务前，自动估算本次任务的 token 消耗、耗时和 USD 费用，并等待用户确认后再继续。
<video controls src="../resources/task-cost-preview.mp4" title="Title"></video>

## 效果预览

当你向 Claude Code 提出一个任务请求时，Claude 会先输出如下预估卡片，等你确认后再开始执行：

```
## 任务成本预估

| 项目           | 估算值              |
|----------------|---------------------|
| 任务描述       | 为登录模块添加单元测试 |
| 复杂度         | 中等                |
| 输入 tokens    | ~3,000              |
| 输出 tokens    | ~2,500              |
| 总 tokens      | ~5,500              |
| 预计耗时       | ~31 秒              |
| 输入费用       | ~USD 0.0090         |
| 输出费用       | ~USD 0.0375         |
| 总费用         | ~USD 0.0465         |

> 以上为估算值，实际用量可能因执行路径有 ±50% 偏差。

是否继续执行？
```

## 安装

### 第一步：获取技能文件

将本仓库克隆到本地：

```bash
git clone https://github.com/YOUR_USERNAME/harness-agent.git
```

### 第二步：配置 Claude Code

Claude Code 通过 `settings.json` 加载自定义技能。打开对应的配置文件（项目级 `.claude/settings.json` 或全局 `~/.claude/settings.json`），添加技能目录路径：

```json
{
  "skills": [
    "/path/to/harness-agent"
  ]
}
```

将 `/path/to/harness-agent` 替换为你克隆仓库的实际路径。Claude Code harness 会自动扫描该目录下所有包含 `SKILL.md` 的子目录，将其注册为可用技能。

也可以通过 `/update-config` 命令在对话中直接修改配置，无需手动编辑文件。

### 第三步：重启 Claude Code

配置完成后重启 Claude Code，技能即生效。

> **验证安装**：在对话中输入 `/task-cost-preview`，如果看到成本预估卡片，说明安装成功。

## 使用方式

### 自动触发（推荐）

安装后，每当你向 Claude 描述一个需要执行的任务，harness 会根据 `SKILL.md` 中的 `description` 字段自动匹配并调用此技能，无需手动输入命令。

**示例对话：**

```
你：帮我把这个 Python 脚本重构成异步版本

Claude：
## 任务成本预估
...
是否继续执行？

你：继续

Claude：好的，开始重构...
```

### 手动触发

在对话中输入斜杠命令：

```
/task-cost-preview
```

适用于想主动了解即将执行任务成本的场景，或 harness 未自动触发时手动调用。

## 行为说明

- **必须等待确认**：输出预估后，Claude 会暂停并等待用户明确回复（如"继续"、"好的"、"yes"）才开始执行，不会自动跳过。
- **多分支估算**：如果任务有明显不确定性（如"可能需要也可能不需要大量网络搜索"），会给出两个场景的估算范围。
- **模糊任务处理**：如果任务描述过于模糊，会先用一句话确认理解后再估算，不展开执行。

## 定价基准

当前基于 `claude-sonnet-4-6` 定价：

| 类型 | 单价 |
|------|------|
| 输入 tokens | USD 3.00 / 1M tokens |
| 输出 tokens | USD 15.00 / 1M tokens |
| 输出速度（耗时估算） | ~80 tokens/秒 |

如使用其他模型，可修改 `SKILL.md` 中第三步的定价参数。

## 文件说明

| 文件 | 说明 |
|------|------|
| `SKILL.md` | 技能元数据（frontmatter）与完整行为规范（正文） |
| `README.md` | 本文档 |

## 预估逻辑
- 注意：自动触发并不是 100% 可靠，因为 skill 触发依赖 Claude 的主动判断。如果想让每次任务都强制预估，更可靠的方式是设置 hook——需要的话我可以用 /update-config 来配置一个 pre-tool hook。