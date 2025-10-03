## 📁 Command Category: Store

### 💾 `/category`

**Description:** Kelola kategori produk di database toko.

### 💻 Usage

`/category create <name> [description]`
`/category edit <old_name> [new_name] [description]`
`/category delete <name>`
`/category list`

### 🔧 Subcommands

**`/category create <name> [<description>]`**
> Membuat kategori produk baru.

**Options for this subcommand:**
- **`name*`**
  - **Description:** Nama kategori produk
  - **Type:** Text
- **`description`**
  - **Description:** Deskripsi kategori (opsional)
  - **Type:** Text
**`/category edit <old_name> [<new_name>] [<description>]`**
> Edit kategori produk yang sudah ada.

**Options for this subcommand:**
- **`old_name*`**
  - **Description:** Nama kategori yang ingin diedit
  - **Type:** Text
- **`new_name`**
  - **Description:** Nama kategori baru (opsional)
  - **Type:** Text
- **`description`**
  - **Description:** Deskripsi baru (opsional)
  - **Type:** Text
**`/category delete <name>`**
> Hapus kategori produk.

**Options for this subcommand:**
- **`name*`**
  - **Description:** Nama kategori yang ingin dihapus
  - **Type:** Text
**`/category list`**
> Lihat semua kategori produk yang tersedia.




### 💾 `/close`

**Description:** Tutup toko di server ini.

### 💻 Usage

`/close`



### 💾 `/open`

**Description:** Buka toko di server ini.

### 💻 Usage

`/open`



### 💾 `/payment`

**Description:** Kelola metode pembayaran di database toko.

### 💻 Usage

`/payment create <name> [description] [emoji] [image]`
`/payment edit <old_name> [new_name] [description] [emoji] [image]`
`/payment delete <name>`
`/payment list`

### 🔧 Subcommands

**`/payment create <name> [<description>] [<emoji>] [<image>]`**
> Membuat metode pembayaran baru.

**Options for this subcommand:**
- **`name*`**
  - **Description:** Nama metode pembayaran
  - **Type:** Text
- **`description`**
  - **Description:** Deskripsi metode pembayaran (opsional)
  - **Type:** Text
- **`emoji`**
  - **Description:** Emoji metode pembayaran (opsional)
  - **Type:** Text
- **`image`**
  - **Description:** Gambar metode pembayaran (opsional)
  - **Type:** Attachment
**`/payment edit <old_name> [<new_name>] [<description>] [<emoji>] [<image>]`**
> Edit metode pembayaran yang sudah ada.

**Options for this subcommand:**
- **`old_name*`**
  - **Description:** Nama metode pembayaran yang ingin diedit
  - **Type:** Text
- **`new_name`**
  - **Description:** Nama metode pembayaran baru (opsional)
  - **Type:** Text
- **`description`**
  - **Description:** Deskripsi metode pembayaran (opsional)
  - **Type:** Text
- **`emoji`**
  - **Description:** Emoji metode pembayaran (opsional)
  - **Type:** Text
- **`image`**
  - **Description:** Gambar metode pembayaran (opsional)
  - **Type:** Attachment
**`/payment delete <name>`**
> Hapus metode pembayaran.

**Options for this subcommand:**
- **`name*`**
  - **Description:** Nama metode pembayaran yang ingin dihapus
  - **Type:** Text
**`/payment list`**
> Lihat semua metode pembayaran yang tersedia.




### 💾 `/product`

**Description:** Kelola produk di database toko.

### 💻 Usage

`/product create <name> <category> <price> [description] [stock]`
`/product edit <old_name> [new_name] [category] [price] [description] [stock]`
`/product delete <name>`
`/product list`

### 🔧 Subcommands

**`/product create <name> <category> <price> [<description>] [<stock>]`**
> Membuat produk baru.

**Options for this subcommand:**
- **`name*`**
  - **Description:** Nama produk
  - **Type:** Text
- **`category*`**
  - **Description:** Kategori produk
  - **Type:** Text
- **`price*`**
  - **Description:** Harga produk
  - **Type:** Integer
- **`description`**
  - **Description:** Deskripsi produk (opsional)
  - **Type:** Text
- **`stock`**
  - **Description:** Stok produk (opsional)
  - **Type:** Integer
**`/product edit <old_name> [<new_name>] [<category>] [<price>] [<description>] [<stock>]`**
> Edit produk yang sudah ada.

**Options for this subcommand:**
- **`old_name*`**
  - **Description:** Nama produk yang ingin diedit
  - **Type:** Text
- **`new_name`**
  - **Description:** Nama produk baru (opsional)
  - **Type:** Text
- **`category`**
  - **Description:** Kategori produk
  - **Type:** Text
- **`price`**
  - **Description:** Harga baru (opsional)
  - **Type:** Integer
- **`description`**
  - **Description:** Deskripsi baru (opsional)
  - **Type:** Text
- **`stock`**
  - **Description:** Stok baru (opsional)
  - **Type:** Integer
**`/product delete <name>`**
> Hapus produk.

**Options for this subcommand:**
- **`name*`**
  - **Description:** Nama produk yang ingin dihapus
  - **Type:** Text
**`/product list`**
> Lihat semua produk yang tersedia.




### 💾 `/store`

**Description:** Store settings for this server.

### 💻 Usage

`/store set <channel> <type> [open_nameformat] [open_title] [open_description] [open_color] [close_nameformat] [close_title] [close_description] [close_color]`

### 🔧 Subcommands

**`/store set <channel> <type> [<open_nameformat>] [<open_title>] [<open_description>] [<open_color>] [<close_nameformat>] [<close_title>] [<close_description>] [<close_color>]`**
> Setup channel and store open/close configuration.

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel for open/close store.
  - **Type:** Channel
- **`type*`**
  - **Description:** Store action type (change channel name, send message, or both).
  - **Type:** Text
  - **Choices:** `Change Channel Name` (`channelname`), `Send Embed Message` (`channelmessage`), `Name + Message` (`channelnameandmessage`)
- **`open_nameformat`**
  - **Description:** Format channel name when store is OPEN.
  - **Type:** Text
- **`open_title`**
  - **Description:** Embed title when store is OPEN.
  - **Type:** Text
- **`open_description`**
  - **Description:** Embed description when store is OPEN.
  - **Type:** Text
- **`open_color`**
  - **Description:** Embed color when store is OPEN (ex: Green)
  - **Type:** Text
- **`close_nameformat`**
  - **Description:** Format channel name when store is CLOSED.
  - **Type:** Text
- **`close_title`**
  - **Description:** Embed title when store is CLOSED.
  - **Type:** Text
- **`close_description`**
  - **Description:** Embed description when store is CLOSED.
  - **Type:** Text
- **`close_color`**
  - **Description:** Embed color when store is CLOSED (ex: Red)
  - **Type:** Text


### 💾 `/transaction`

**Description:** Kelola transaksi pembelian produk di toko.

### 💻 Usage

`/transaction create <product> <description> <quantity> <buyer> [image]`

### 🔧 Subcommands

**`/transaction create <product> <description> <quantity> <buyer> [<image>]`**
> Buat transaksi pembelian produk.

**Options for this subcommand:**
- **`product*`**
  - **Description:** Nama produk yang ingin dibeli
  - **Type:** Text
- **`description*`**
  - **Description:** deskripsi produk
  - **Type:** Text
- **`quantity*`**
  - **Description:** Jumlah produk yang ingin dibeli
  - **Type:** Integer
- **`buyer*`**
  - **Description:** Pembeli (user Discord)
  - **Type:** User
- **`image`**
  - **Description:** gambar (opsional)
  - **Type:** Attachment


