# Kythia Engine - Coding Standards

Welcome, You are interacting with the **Kythia Engine**, an advanced, highly-modular, class-based Discord bot framework. When editing, modifying, or reviewing code for this project, you **MUST** strictly adhere to the following architectural standards and conventions.

## 1. Addon Directory Structure

Kythia uses a strict folder-based separation of concerns. Every addon must split its functionality into the designated directories. **Do not** clump all logic into the `commands/` folder or a single file.

**Standard Addon Structure:**

```text
addons/my-addon/    # 'my-addon' must be kebab-case
├── commands/       # Slash commands (and their subcommands)
├── buttons/        # Button interaction handlers
├── select_menus/   # Select menu interaction handlers
├── modals/         # Modal submission handlers
├── helpers/        # Internal logic and helper functions
├── tasks/          # Scheduled cron jobs or background tasks
├── database/       # Database models and migrations
├── lang/           # i18n translation files (en-US.json, etc.)
└── addon.json      # Addon configuration and metadata
```

- **Interaction Handlers**: If a command sends a button or select menu, the handler for that button MUST be placed in `buttons/` or `select_menus/` respectively, not inside the command file.
- **Helpers**: Complex business logic should be extracted into `helpers/` and required inside your commands, keeping the command files slim.
- **Tasks**: Any recurring logic must be placed inside the `tasks/` directory.

## 2. Directory & Class-Based Command Architecture

Kythia uses a highly modular directory structure to split complex commands (subcommands and groups) into separate files. The loader follows strict rules based on file names.

### A. Single File Command (No Subcommands)

If a command has no subcommands, it is a single file exporting an ES6 class extending `BaseCommand`.

```javascript
const { SlashCommandBuilder } = require("discord.js");
const { BaseCommand } = require("kythia-core");

class ExampleCommand extends BaseCommand {
  slashCommand = new SlashCommandBuilder()
    .setName("example")
    .setDescription("...");
  guildOnly = true;

  async execute(interaction) {
    const container = this.container;
    // ... implementation
  }
}
exports.default = ExampleCommand;
```

### B. Complex Command Hierarchy (Folders)

If a command has subcommands, it can be structured in a dedicated subfolder OR directly inside the `commands/` root if the addon only has one main command.

**Folder Structure Example (Directly in root):**

```text
commands/                  // The base command container (/market)
├── _command.js            // Defines the base command builder (OBJECT EXPORT)
├── buy.js                 // Subcommand (/market buy)
├── sell.js                // Subcommand (/market sell)
└── limit/                 // Subcommand Group (/market limit)
    ├── _group.js          // Defines the group builder (CLASS EXPORT)
    ├── create.js          // Subcommand (/market limit create)
    └── cancel.js          // Subcommand (/market limit cancel)
```

_(Note: You can also nest this inside `commands/market/` if your addon has multiple base commands)._

**Rule 1: `_command.js` (Base Command)**
`_command.js` defines the base container for subcommands. It is a class extending `BaseCommand`, but it only needs to define the `slashCommand` builder and configuration properties (no `execute` method is required).

```javascript
// addons/my-addon/commands/_command.js
const { SlashCommandBuilder } = require("discord.js");
const { BaseCommand } = require("kythia-core");

class MarketCommand extends BaseCommand {
  guildOnly = true;

  slashCommand = new SlashCommandBuilder()
    .setName("market")
    .setDescription("Market commands");
}
exports.default = MarketCommand;
```

**Rule 2: `_group.js` (Subcommand Group)**
A `_group.js` file defines a subcommand group. It **IS** a class extending `BaseCommand`, with `subcommand = true`.

```javascript
// addons/myaddon/commands/market/limit/_group.js
const { BaseCommand } = require("kythia-core");
class LimitGroup extends BaseCommand {
  subcommand = true;
  slashCommand = (group) =>
    group.setName("limit").setDescription("Limit orders");
}
exports.default = LimitGroup;
```

**Rule 3: Subcommand Files (e.g., `buy.js`)**
Subcommand files **ARE** classes extending `BaseCommand`, with `subcommand = true`.

```javascript
// addons/myaddon/commands/market/buy.js
const { BaseCommand } = require("kythia-core");
class BuyCommand extends BaseCommand {
  subcommand = true;
  slashCommand = (subcommand) =>
    subcommand.setName("buy").setDescription("Buy asset"); // MUST (subcommand) dont s or subcmd
  // .addStringOption((option) =>
  // 			option..
  // for (option) too, dont (o) or (opt)

  async autocomplete(interaction) {
    /* ... */
  } // if needed
  async execute(interaction) {
    /* ... */
  }
}
exports.default = BuyCommand;
```

**Rule 4: Ignored Files**
Any file starting with `_` (except `_command.js` and `_group.js`) is completely ignored by the command loader. Use this for `_helpers.js`, `_constants.js`, etc.

## 3. Dependency Injection (DI)

Do not use `require` for core modules, configurations, or database models. Always extract them from `this.container` inside the `execute` method.
_Note: You may `require` local helpers that belong exclusively to the same addon._

```javascript
async execute(interaction) {
	const container = this.container;
	const {
		t,               // Translator function
		models,          // Database models
		kythiaConfig,    // Bot configuration
		helpers,         // Core helpers
		logger,          // Winston logger instance
		redis            // Redis client
	} = container;

	const { KythiaUser } = models;
	const { simpleContainer } = helpers.discord;
	const { formatNumber } = helpers.economy; // (if needed, though moved to utils in core)
}
```

## 4. UI Construction (Components V2 & `simpleContainer`)

**CRITICAL**: Kythia Engine relies heavily on Discord's **V2 UI Components** (`ContainerBuilder`, `TextDisplayBuilder`, `SeparatorBuilder`, etc.). Never use legacy `EmbedBuilder` or basic text replies `interaction.reply({ content: ... })`.

**Rule 1: Use `simpleContainer` for Standard Replies**
For simple text-based responses or errors, always use the `simpleContainer` wrapper from `helpers.discord`.

```javascript
const { simpleContainer } = helpers.discord;

// Success / Default response
const components = await simpleContainer(
  interaction,
  await t(interaction, "myaddon.success_message"),
);

// Simple Container Docs
/**
 * Create a simple Discord container reply with optional color & auto-footer.
 * @param {object} interaction - Discord interaction (for t)
 * @param {object} container - Dependency injection
 * @param {string} content - Main response text
 * @param {object} [options={}] - Extra options
 * @param {string} [options.color] - Accent color (hex/discord)
 * @param {boolean} [options.withFooter=false] - Whether to include footer
 * @returns {Promise<object>} - Discord reply obj ({ components, flags })
 */

// Sending the reply (Must ALWAYS include IsComponentsV2 flag)
// if using IsComponentsV2, you cannot send contents, only components
await interaction.reply({
  components,
  flags: MessageFlags.IsComponentsV2,
});
```

**Rule 2: Complex UIs Require ContainerBuilder**
If you need buttons, lists, or structured views, construct the UI manually using V2 Builders imported from `discord.js`.

> [!WARNING]
> **Never hardcode Markdown formatting (like `## ` for titles) inside your JavaScript code!**
> All formatting must be included inside the `lang/en-US.json` file.
> For example, do not write: `` `## ${await t(interaction, "title_key")}` ``.
> Instead, write: `await t(interaction, "title_key")` and define the key in your JSON as `"title_key": "## My Title"`.

```javascript
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  MessageFlags,
} = require("discord.js");

const { t, kythiaConfig, helpers } = interaction.client.container;
const { convertColor } = helpers.color;

const mainContainer = new ContainerBuilder()
  .setAccentColor(
    convertColor(kythiaConfig.bot.color, { from: "hex", to: "decimal" }), // general usage
  )
  .addTextDisplayComponents(
    new TextDisplayBuilder().setContent(await t(interaction, "title_key")),
  )
  .addSeparatorComponents(
    new SeparatorBuilder()
      .setSpacing(SeparatorSpacingSize.Small)
      .setDivider(true),
  )
  .addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Click Me")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("btn_1"),
    ),
  );

await interaction.editReply({
  components: [mainContainer],
  flags: MessageFlags.IsComponentsV2,
});
```

## 5. Localization (i18n) - VERY IMPORTANT

Hardcoded strings in user-facing replies are strictly prohibited. You must **always** use the `t()` function from the container for all text. AI systems frequently misinterpret this function, so follow these exact rules:

### Translation Key Namespace Concept
Kythia uses a strictly defined namespace hierarchy for translation keys. The structure must directly map to the file path of the code executing the translation:
`{addon}.{folder}.{file}.[subfile...].{action_or_response}`

**Examples:**
- If you are in `addons/ai/events/messageCreate.js` handling memory addition:
  `ai.events.messageCreate.memory.added`
- If you are in `addons/economy/commands/market/limit.js` returning a success message:
  `economy.commands.market.limit.success`
- If you are in `addons/core/buttons/ticket/close.js` returning an error:
  `core.buttons.ticket.close.error`

**JSON Structure Mapping:**
The keys must be mapped to a deeply nested JSON object in the addon's `lang/en-US.json` file. **Do not use flat keys** like `"ai.events.messageCreate": "..."`.
```json
{
  "ai": {
    "events": {
      "messageCreate": {
        "memory": {
          "added": "Okay, I'll remember that! ^-^",
          "duplicate": "I already know that! 😉",
		  "variable": "if needed {variable}"
        }
      }
    }
  }
}
```

### The `t()` Function Signature

The `t()` function takes exactly two or three arguments:

1. `interaction`: The current Discord interaction object.
2. `key`: The **translation key** as a string (e.g., `"economy.commands.market.limit.success"`). **THIS IS NEVER A FALLBACK STRING OR DEFAULT TEXT.** Do not pass English phrases like `"Successfully bought"` as the second argument.
3. `variables` (Optional): An object containing variables to inject into the translation string.

**✅ CORRECT USAGE:**

```javascript
const text = await t(interaction, "economy.commands.market.limit.invalid_side");
const textWithVars = await t(interaction, "economy.commands.market.limit.success", {
  side: side.toUpperCase(),
  quantity: formatNumber(quantity),
});
```

**❌ INCORRECT USAGE:**

```javascript
await t(interaction, "You do not have enough money"); // WRONG
await t(interaction, "eco.error", "Not enough money"); // WRONG
```

## 6. Database, Caching & KythiaModel

Kythia uses a highly complex custom wrapper over Sequelize called **`KythiaModel`**, which automatically binds models to their respective migrations and integrates a robust Redis caching layer.

**Rule 1: NEVER create models or migrations manually.**
Because of the auto-binding logic, you must always use the built-in Kythia CLI tools to scaffold database files.

- To create a model: `bunx kythia make:model ModelName`
- To create a migration: `bunx kythia make:migration migration_name`
- (Or `npx` if using npm). This ensures the complex internal linkages between the model schema and migration history are preserved.

**Rule 2: Table Naming Conventions**
`KythiaModel` automatically infers the database table name from the class name by converting it to plural `snake_case` (e.g., `KythiaUser` becomes `kythia_users`).
If your table name differs from this convention, you MUST explicitly define it using the `static table` property.

```javascript
const { KythiaModel } = require("kythia-core");

class BotGrowthSnapshot extends KythiaModel {
  static guarded = [];
  static table = "bot_growth_snapshots"; // Explicit table name override

  static get structure() {
    return { options: { timestamps: true } };
  }
}
module.exports = BotGrowthSnapshot;
```

**Rule 3: Caching over Direct DB Queries**
Because of `KythiaModel`, **never** use raw `findOne`, `findAll`, or `create` for read-heavy operations unless absolutely necessary.
Always use the cache-wrapped methods provided by `KythiaModel`:

- `Model.getCache({ where: { id: 1 }, ttl: 5 * 60 * 1000 })`
- `Model.getAllCache({ where: { status: 'active' }, limit: 10, order: [['createdAt', 'DESC']] })`
- `const [instance] = await Model.findOrCreateWithCache({ where: { id: 1 }, defaults: { name: 'test' } })`

**Rule 4: Cache Invalidation**
Cache is invalidated automatically via Sequelize hooks (`afterSave`, `afterDestroy`).

- If you must clear cache manually, use `await Model.invalidateByTags(['ModelName'])` or `await Model.clearCache('specific:key')`.
- **DO NOT** use the deprecated `invalidateCache()` method.

## 7. Error Handling & Execution Flow

1. **Defer Early**: If a command takes time (e.g., fetching DB or external API), call `await interaction.deferReply()` immediately inside `execute`, and use `interaction.editReply()` later.
2. **Try/Catch Block**: Wrap execution logic in a `try/catch`.
3. **Logger**: In the `catch` block, use `container.logger.error()`.
4. **Error Reply**: Send an ephemeral or edited `simpleContainer` using `{ mode: 'error' }`.

```javascript
async execute(interaction) {
	const container = this.container;
	const { t, helpers, logger } = container;

	await interaction.deferReply();

	try {
		// Business logic
	} catch (error) {
		logger.error(`[addon] Error: ${error.message || String(error)}`, { label: 'addon' });
		const components = await helpers.discord.simpleContainer(
			interaction,
			await t(interaction, 'common.error'),
			{ mode: 'error' }
		);
		await interaction.editReply({ components, flags: MessageFlags.IsComponentsV2 });
	}
}
```

## 8. Exports

Every command must export its class as the `default` export.
`exports.default = MyCommandClass;`

## 9. Development Workflows & CLI

After generating or modifying code, you must **always** perform the following steps to ensure code quality and project consistency:

1. **Linting & Formatting**: Run `bun fix` (or `npm run fix`) to automatically format the code and fix any linting errors. Kythia has strict ESLint/Prettier rules.
2. **Translation Check**: Run `bunx kythia lang:check` to parse the codebase and ensure there are no missing or unused translation keys.
3. **Namespace Fixer**: Run `bunx kythia dev:namespace` to automatically generate or fix the JSDoc `/** @namespace: ... */` comment block at the very top of the modified file(s).
