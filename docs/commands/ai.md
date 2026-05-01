## 📁 Command Category: Ai

### 💾 `/imagen`

**Description:** 🎨 Generate an image from a prompt or transform an existing image using Gemini AI.

### 💻 Usage

`/imagen [prompt] [image]`

### ⚙️ Options

- **`prompt`**
  - **Description:** What do you want to generate or how to transform the image?
  - **Type:** Text
- **`image`**
  - **Description:** Optional source image to transform (image-to-image).
  - **Type:** Attachment


### 💾 `/translate`

**Description:** 🌐 Translate text to another language using Gemini AI.

### 💻 Usage

`/translate <text> <lang>`

### ⚙️ Options

- **`text*`**
  - **Description:** Text to translate
  - **Type:** Text
- **`lang*`**
  - **Description:** Target language (e.g. en, id, ja, etc)
  - **Type:** Text


### 💾 `/ai`

**Description:** 🧠 All commands related to kythia ai system.

### 💻 Usage

`/ai disable`
`/ai enable`
`/ai fact-delete <number>`
`/ai facts`
`/ai forget`
`/ai help`
`/ai list`
`/ai personality <style>`

### 🔧 Subcommands

**`/ai disable`**
> Disable AI in this channel
> _Aliases: `aioff`_
> _User Permissions: `ManageChannels`_


**`/ai enable`**
> Enable AI in this channel
> _Aliases: `aion`_
> _User Permissions: `ManageChannels`_


**`/ai fact-delete <number>`**
> Delete a specific fact about you

**Options for this subcommand:**
- **`number*`**
  - **Description:** Fact number from /ai facts (1, 2, 3...)
  - **Type:** Integer
**`/ai facts`**
> View all facts/memories AI has learned about you


**`/ai forget`**
> Clear your conversation history with AI


**`/ai help`**
> Learn how to use AI features


**`/ai list`**
> View list of AI-enabled channels


**`/ai personality <style>`**
> Change AI personality/conversation style

**Options for this subcommand:**
- **`style*`**
  - **Description:** Choose conversation style
  - **Type:** Text
  - **Choices:** `🔄 Follow config default setting` (`default`), `😊 Warm, casual, and approachable` (`friendly`), `💼 Formal, clear, and concise` (`professional`), `😄 Witty, playful, and fun` (`humorous`), `🤓 Detailed, precise, and informative` (`technical`), `😎 Relaxed, laid-back, and chill` (`casual`)


