# Kythia Addons Features Report

This report details all features currently implemented in each addon of the Kythia Discord bot, based on actual commands, events, and capabilities found in the codebase.

## Activity (activity)
**Description:** Track raw activity statistics for your server members! Monitor total messages sent and total time spent in voice channels, with leaderboards to see who's most active.

### Commands / Features
- **Stats**: Command implementation for `stats`.
- **Leaderboard**: Command implementation for `leaderboard`.
- **Event Tracking**: Listens for `messageCreate` events to automate features.
- **Event Tracking**: Listens for `voiceStateUpdate` events to automate features.

## Adventure (adventure)
**Description:** Embark on epic adventures with a full-featured RPG system! Battle fierce monsters, collect legendary items, manage your inventory, and explore mysterious realms. Level up your character and become the ultimate adventurer in your Discord server.

### Commands / Features
- **Start**: Command implementation for `start`.
- **Shop**: Command implementation for `shop`.
- **Battle**: Command implementation for `battle`.
- **Use**: Command implementation for `use`.
- **Recall**: Command implementation for `recall`.
- **Profile**: Command implementation for `profile`.
- **Inventory**: Command implementation for `inventory`.

## AI (ai)
**Description:** Harness the power of Google's Gemini AI to bring intelligent conversations to your server! Get smart responses, translations, creative writing assistance, and engaging AI interactions that make your Discord community more dynamic and helpful.

### Commands / Features
- **Translate**: Command implementation for `translate`.
- **Imagen**: Command implementation for `imagen`.
- **Personality**: Command implementation for `personality`.
- **Fact-delete**: Command implementation for `fact-delete`.
- **Forget**: Command implementation for `forget`.
- **Disable**: Command implementation for `disable`.
- **Help**: Command implementation for `help`.
- **List**: Command implementation for `list`.
- **Enable**: Command implementation for `enable`.
- **Optout**: Command implementation for `optout`.
- **Facts**: Command implementation for `facts`.
- **Event Tracking**: Listens for `messageCreate` events to automate features.
- **Background Task**: Runs scheduled task `daily-greeter`.

## API (api)
**Description:** The bridge between Kythia and the dashboard.

### Commands / Features
- Core backend logic, helpers, or API routing.

## Automod (automod)
**Description:** Advanced auto-moderation system: spam detection, badword filtering, invite & link blocking, caps lock, emoji spam, zalgo text, username checks, and a complete moderation log with per-guild configuration.

### Commands / Features
- **Say**: Command implementation for `say`.
- **Announce**: Command implementation for `announce`.
- **Unpin**: Command implementation for `unpin`.
- **Lock**: Command implementation for `lock`.
- **Pin**: Command implementation for `pin`.
- **Unban**: Command implementation for `unban`.
- **Autosetup**: Command implementation for `autosetup`.
- **Unlock**: Command implementation for `unlock`.
- **Warnings**: Command implementation for `warnings`.
- **Unmute**: Command implementation for `unmute`.
- **Clear**: Command implementation for `clear`.
- **Ban**: Command implementation for `ban`.
- **Role**: Command implementation for `role`.
- **Kick**: Command implementation for `kick`.
- **Warn**: Command implementation for `warn`.
- **Timeout**: Command implementation for `timeout`.
- **Slowmode**: Command implementation for `slowmode`.
- **Mute**: Command implementation for `mute`.
- **Automod-setting**: Command implementation for `automod-setting`.
- **Event Tracking**: Listens for `autoModerationRuleUpdate` events to automate features.
- **Event Tracking**: Listens for `autoModerationActionExecution` events to automate features.
- **Event Tracking**: Listens for `roleDelete` events to automate features.
- **Event Tracking**: Listens for `autoModerationRuleDelete` events to automate features.
- **Event Tracking**: Listens for `messageCreate` events to automate features.
- **Event Tracking**: Listens for `autoModerationRuleCreate` events to automate features.
- **Event Tracking**: Listens for `channelCreate` events to automate features.
- **Event Tracking**: Listens for `messageUpdate` events to automate features.
- **Event Tracking**: Listens for `webhooksUpdate` events to automate features.
- **Event Tracking**: Listens for `channelDelete` events to automate features.
- **Event Tracking**: Listens for `guildBanAdd` events to automate features.
- **Event Tracking**: Listens for `guildMemberUpdate` events to automate features.

## AutoReact (autoreact)
**Description:** Automatically react to messages with custom triggers or in specific channels.

### Commands / Features
- **Add**: Command implementation for `add`.
- **Remove**: Command implementation for `remove`.
- **List**: Command implementation for `list`.
- **Event Tracking**: Listens for `messageCreate` events to automate features.

## Autoreply (autoreply)
**Description:** Create custom auto-replies for your server.

### Commands / Features
- **Add**: Command implementation for `add`.
- **Remove**: Command implementation for `remove`.
- **List**: Command implementation for `list`.
- **Event Tracking**: Listens for `messageCreate` events to automate features.

## Birthday (birthday)
**Description:** track user birthdays and celebrate them automatically.

### Commands / Features
- **Set**: Command implementation for `set`.
- **Check**: Command implementation for `check`.
- **Remove**: Command implementation for `remove`.
- **List**: Command implementation for `list`.
- **Edit**: Command implementation for `edit`.
- **View**: Command implementation for `view`.
- **Background Task**: Runs scheduled task `announcer`.

## Booster (booster)
**Description:** Server boost messages with visually customized banner cards.

### Commands / Features
- **Background**: Command implementation for `background`.
- **Channel**: Command implementation for `channel`.
- **Text**: Command implementation for `text`.
- **Test**: Command implementation for `test`.
- **Style**: Command implementation for `style`.
- **Event Tracking**: Listens for `guildMemberUpdate` events to automate features.

## Checklist (checklist)
**Description:** Stay organized and boost productivity with powerful checklist management! Create, share, and track tasks collaboratively. Perfect for project management, event planning, or keeping your community organized with interactive to-do lists.

### Commands / Features
- **Add**: Command implementation for `add`.
- **Remove**: Command implementation for `remove`.
- **Clear**: Command implementation for `clear`.
- **List**: Command implementation for `list`.
- **Toggle**: Command implementation for `toggle`.
- **Add**: Command implementation for `add`.
- **Remove**: Command implementation for `remove`.
- **Clear**: Command implementation for `clear`.
- **List**: Command implementation for `list`.
- **Toggle**: Command implementation for `toggle`.

## Core (core)
**Description:** The foundation that powers everything! Essential bot functionalities including moderation tools, server management, utilities, and core systems that keep your Discord server running smoothly and efficiently.

### Commands / Features
- **Vote-leaderboard**: Command implementation for `vote-leaderboard`.
- **Stats**: Command implementation for `stats`.
- **About**: Command implementation for `about`.
- **User-info**: Command implementation for `user-info`.
- **Test-event**: Command implementation for `test-event`.
- **Afk**: Command implementation for `afk`.
- **Help**: Command implementation for `help`.
- **Grab**: Command implementation for `grab`.
- **Legal**: Command implementation for `legal`.
- **Server-info**: Command implementation for `server-info`.
- **Ping**: Command implementation for `ping`.
- **Cache**: Command implementation for `cache`.
- **Vote**: Command implementation for `vote`.
- **Report**: Command implementation for `report`.
- **Restart**: Command implementation for `restart`.
- **Command-id**: Command implementation for `command-id`.
- **Servers**: Command implementation for `servers`.
- **Mass-leave**: Command implementation for `mass-leave`.
- **Guildinvite**: Command implementation for `guildinvite`.
- **Debug**: Command implementation for `debug`.
- **Chat**: Command implementation for `chat`.
- **Maintenance**: Command implementation for `maintenance`.
- **Leave**: Command implementation for `leave`.
- **Flush**: Command implementation for `flush`.
- **Shards**: Command implementation for `shards`.
- **Status**: Command implementation for `status`.
- **Set**: Command implementation for `set`.
- **Activity**: Command implementation for `activity`.
- **Afk**: Command implementation for `afk`.
- **Avatar**: Command implementation for `avatar`.
- **Banner**: Command implementation for `banner`.
- **Username**: Command implementation for `username`.
- **Bio**: Command implementation for `bio`.
- **Edit**: Command implementation for `edit`.
- **Add**: Command implementation for `add`.
- **List**: Command implementation for `list`.
- **Delete**: Command implementation for `delete`.
- **Info**: Command implementation for `info`.
- **User-add**: Command implementation for `user-add`.
- **User-list**: Command implementation for `user-list`.
- **User-remove**: Command implementation for `user-remove`.
- **Guild-remove**: Command implementation for `guild-remove`.
- **Guild-list**: Command implementation for `guild-list`.
- **Guild-add**: Command implementation for `guild-add`.
- **Add**: Command implementation for `add`.
- **List**: Command implementation for `list`.
- **Delete**: Command implementation for `delete`.
- **Add**: Command implementation for `add`.
- **Reset**: Command implementation for `reset`.
- **Remove**: Command implementation for `remove`.
- **Info**: Command implementation for `info`.
- **Temperature**: Command implementation for `temperature`.
- **Data**: Command implementation for `data`.
- **Currency**: Command implementation for `currency`.
- **Mass**: Command implementation for `mass`.
- **Volume**: Command implementation for `volume`.
- **Area**: Command implementation for `area`.
- **Length**: Command implementation for `length`.
- **Simple**: Command implementation for `simple`.
- **Complex**: Command implementation for `complex`.
- **Setting**: Command implementation for `setting`.
- **Encrypt**: Command implementation for `encrypt`.
- **Instagram**: Command implementation for `instagram`.
- **Tiktok**: Command implementation for `tiktok`.
- **Obfuscate**: Command implementation for `obfuscate`.
- **Avatar**: Command implementation for `avatar`.
- **Decrypt**: Command implementation for `decrypt`.
- **Banner**: Command implementation for `banner`.
- **Ascii**: Command implementation for `ascii`.
- **Crack-hash**: Command implementation for `crack-hash`.
- **Hash**: Command implementation for `hash`.
- **Testall**: Command implementation for `testall`.
- **Add**: Command implementation for `add`.
- **Remove**: Command implementation for `remove`.
- **Set**: Command implementation for `set`.
- **Remove**: Command implementation for `remove`.
- **List**: Command implementation for `list`.
- **Event Tracking**: Listens for `guildDelete` events to automate features.
- **Event Tracking**: Listens for `messageReactionRemoveEmoji` events to automate features.
- **Event Tracking**: Listens for `clientReady` events to automate features.
- **Event Tracking**: Listens for `guildCreate` events to automate features.
- **Event Tracking**: Listens for `guildSoundboardSoundCreate` events to automate features.
- **Event Tracking**: Listens for `stageInstanceDelete` events to automate features.
- **Event Tracking**: Listens for `stickerCreate` events to automate features.
- **Event Tracking**: Listens for `inviteCreate` events to automate features.
- **Event Tracking**: Listens for `roleDelete` events to automate features.
- **Event Tracking**: Listens for `messageDelete` events to automate features.
- **Event Tracking**: Listens for `stickerUpdate` events to automate features.
- **Event Tracking**: Listens for `messageReactionAdd` events to automate features.
- **Event Tracking**: Listens for `messageCreate` events to automate features.
- **Event Tracking**: Listens for `stageInstanceCreate` events to automate features.
- **Event Tracking**: Listens for `guildScheduledEventUserAdd` events to automate features.
- **Event Tracking**: Listens for `voiceStateUpdate` events to automate features.
- **Event Tracking**: Listens for `threadMembersUpdate` events to automate features.
- **Event Tracking**: Listens for `threadUpdate` events to automate features.
- **Event Tracking**: Listens for `inviteDelete` events to automate features.
- **Event Tracking**: Listens for `threadDelete` events to automate features.
- **Event Tracking**: Listens for `roleCreate` events to automate features.
- **Event Tracking**: Listens for `applicationCommandPermissionsUpdate` events to automate features.
- **Event Tracking**: Listens for `guildUpdate` events to automate features.
- **Event Tracking**: Listens for `channelCreate` events to automate features.
- **Event Tracking**: Listens for `guildBanRemove` events to automate features.
- **Event Tracking**: Listens for `guildIntegrationsUpdate` events to automate features.
- **Event Tracking**: Listens for `emojiDelete` events to automate features.
- **Event Tracking**: Listens for `guildScheduledEventCreate` events to automate features.
- **Event Tracking**: Listens for `guildScheduledEventDelete` events to automate features.
- **Event Tracking**: Listens for `threadCreate` events to automate features.
- **Event Tracking**: Listens for `messageUpdate` events to automate features.
- **Event Tracking**: Listens for `guildScheduledEventUpdate` events to automate features.
- **Event Tracking**: Listens for `userUpdate` events to automate features.
- **Event Tracking**: Listens for `emojiUpdate` events to automate features.
- **Event Tracking**: Listens for `guildMemberAdd` events to automate features.
- **Event Tracking**: Listens for `channelPinsUpdate` events to automate features.
- **Event Tracking**: Listens for `messagePollVoteAdd` events to automate features.
- **Event Tracking**: Listens for `stickerDelete` events to automate features.
- **Event Tracking**: Listens for `interactionCreate` events to automate features.
- **Event Tracking**: Listens for `roleUpdate` events to automate features.
- **Event Tracking**: Listens for `stageInstanceUpdate` events to automate features.
- **Event Tracking**: Listens for `guildSoundboardSoundUpdate` events to automate features.
- **Event Tracking**: Listens for `webhooksUpdate` events to automate features.
- **Event Tracking**: Listens for `messageReactionRemove` events to automate features.
- **Event Tracking**: Listens for `channelDelete` events to automate features.
- **Event Tracking**: Listens for `guildSoundboardSoundDelete` events to automate features.
- **Event Tracking**: Listens for `guildMemberRemove` events to automate features.
- **Event Tracking**: Listens for `channelUpdate` events to automate features.
- **Event Tracking**: Listens for `messageDeleteBulk` events to automate features.
- **Event Tracking**: Listens for `messageReactionRemoveAll` events to automate features.
- **Event Tracking**: Listens for `guildBanAdd` events to automate features.
- **Event Tracking**: Listens for `messagePollVoteRemove` events to automate features.
- **Event Tracking**: Listens for `threadMemberUpdate` events to automate features.
- **Event Tracking**: Listens for `guildMemberUpdate` events to automate features.
- **Event Tracking**: Listens for `guildScheduledEventUserRemove` events to automate features.
- **Event Tracking**: Listens for `emojiCreate` events to automate features.

## Economy (economy)
**Description:** Build a thriving virtual economy! Members can earn coins, claim daily rewards, work jobs, gamble, shop for items, and trade with others. Create an engaging economic ecosystem that keeps your community active and invested.

### Commands / Features
- **Bank**: Command implementation for `bank`.
- **Shop**: Command implementation for `shop`.
- **Beg**: Command implementation for `beg`.
- **Coin**: Command implementation for `coin`.
- **Hack**: Command implementation for `hack`.
- **Daily**: Command implementation for `daily`.
- **Coinflip**: Command implementation for `coinflip`.
- **Lootbox**: Command implementation for `lootbox`.
- **Withdraw**: Command implementation for `withdraw`.
- **Give**: Command implementation for `give`.
- **Slots**: Command implementation for `slots`.
- **Leaderboard**: Command implementation for `leaderboard`.
- **Deposit**: Command implementation for `deposit`.
- **Transfer**: Command implementation for `transfer`.
- **Profile**: Command implementation for `profile`.
- **Inventory**: Command implementation for `inventory`.
- **Work**: Command implementation for `work`.
- **Rob**: Command implementation for `rob`.
- **Edit**: Command implementation for `edit`.
- **Create**: Command implementation for `create`.
- **History**: Command implementation for `history`.
- **Buy**: Command implementation for `buy`.
- **View**: Command implementation for `view`.
- **Portfolio**: Command implementation for `portfolio`.
- **Cancel**: Command implementation for `cancel`.
- **Stoploss**: Command implementation for `stoploss`.
- **Sell**: Command implementation for `sell`.
- **Limit**: Command implementation for `limit`.
- **Background Task**: Runs scheduled task `order-processor`.

## Embed Builder (embed-builder)
**Description:** Design, save, and send beautiful Discord embeds or Components V2 containers directly from your dashboard or via slash commands. All designs are persisted in the database so you can edit them anytime.

### Commands / Features
- **Edit**: Command implementation for `edit`.
- **Create**: Command implementation for `create`.
- **List**: Command implementation for `list`.
- **Delete**: Command implementation for `delete`.
- **Send**: Command implementation for `send`.

## Fun (fun)
**Description:** Bring laughter and entertainment to your server! Enjoy classic games like 8-ball predictions, number guessing challenges, tic-tac-toe battles, and more interactive fun that keeps conversations lively and members engaged.

### Commands / Features
- **Roast**: Command implementation for `roast`.
- **Meme**: Command implementation for `meme`.
- **Fact**: Command implementation for `fact`.
- **Rps**: Command implementation for `rps`.
- **Quote**: Command implementation for `quote`.
- **Tictactoe**: Command implementation for `tictactoe`.
- **Act**: Command implementation for `act`.
- **Math**: Command implementation for `math`.
- **8ball**: Command implementation for `8ball`.
- **Summon**: Command implementation for `summon`.
- **Joke**: Command implementation for `joke`.
- **Wordle**: Command implementation for `wordle`.
- **Add**: Command implementation for `add`.
- **Remove**: Command implementation for `remove`.
- **List**: Command implementation for `list`.
- **Kiss**: Command implementation for `kiss`.
- **Propose**: Command implementation for `propose`.
- **Divorce**: Command implementation for `divorce`.
- **Profile**: Command implementation for `profile`.

## Giveaway (giveaway)
**Description:** Host exciting giveaways that drive engagement! Create timed contests, set entry requirements, manage participants, and automatically select winners. Perfect for growing your community and rewarding loyal members.

### Commands / Features
- **End**: Command implementation for `end`.
- **Start**: Command implementation for `start`.
- **Reroll**: Command implementation for `reroll`.
- **Cancel**: Command implementation for `cancel`.

## Global Chat (globalchat)
**Description:** Connect your server with others around the world! Enable cross-server conversations in a dedicated channel, fostering community and engagement beyond your own members in real time.

### Commands / Features
- **Setup**: Command implementation for `setup`.
- **Remove**: Command implementation for `remove`.
- **Info**: Command implementation for `info`.
- **Event Tracking**: Listens for `messageCreate` events to automate features.
- **Background Task**: Runs scheduled task `webhook-health-check`.

## Global Voice (globalvoice)
**Description:** Global Voice is a feature that allows users to create and manage global voice channels in their server.

### Commands / Features
- **Connect**: Command implementation for `connect`.

## Image (image)
**Description:** Upload, store, and manage images in your server. Users can add images, retrieve direct URLs, and organize image assets for fun, moderation, or utility purposes.

### Commands / Features
- **Add**: Command implementation for `add`.
- **List**: Command implementation for `list`.
- **Delete**: Command implementation for `delete`.

## Invite (invite)
**Description:** Reward your community builders! Track who invites new members, create leaderboards, set up invite rewards, and recognize your most active recruiters. Gamify server growth and build a stronger community together.

### Commands / Features
- **Add**: Command implementation for `add`.
- **Reset**: Command implementation for `reset`.
- **Remove**: Command implementation for `remove`.
- **Leaderboard**: Command implementation for `leaderboard`.
- **User**: Command implementation for `user`.
- **Channels**: Command implementation for `channels`.
- **Event Tracking**: Listens for `inviteCreate` events to automate features.
- **Event Tracking**: Listens for `inviteDelete` events to automate features.
- **Event Tracking**: Listens for `guildMemberAdd` events to automate features.
- **Event Tracking**: Listens for `guildMemberRemove` events to automate features.

## Leveling (leveling)
**Description:** Motivate members with a comprehensive leveling system! Earn XP through activity, unlock new roles and perks as you level up, compete on leaderboards, and watch your community engagement soar with gamified progression.

### Commands / Features
- **Add**: Command implementation for `add`.
- **Set**: Command implementation for `set`.
- **Xp-set**: Command implementation for `xp-set`.
- **Xp-add**: Command implementation for `xp-add`.
- **Leaderboard**: Command implementation for `leaderboard`.
- **Profile**: Command implementation for `profile`.
- **Rolereward**: Command implementation for `rolereward`.
- **Channel**: Command implementation for `channel`.
- **Cooldown**: Command implementation for `cooldown`.
- **Xp**: Command implementation for `xp`.
- **Event Tracking**: Listens for `messageReactionAdd` events to automate features.
- **Event Tracking**: Listens for `messageCreate` events to automate features.
- **Event Tracking**: Listens for `voiceStateUpdate` events to automate features.

## Minecraft (minecraft)
**Description:** Look up Minecraft: Java Edition player visuals including avatar, body, head, and skin renders directly in Discord.

### Commands / Features
- **Wallpaper**: Command implementation for `wallpaper`.
- **Body**: Command implementation for `body`.
- **Pose**: Command implementation for `pose`.
- **Skin**: Command implementation for `skin`.
- **Help**: Command implementation for `help`.
- **Avatar**: Command implementation for `avatar`.
- **Head**: Command implementation for `head`.
- **Status**: Command implementation for `status`.
- **Autosetup**: Command implementation for `autosetup`.
- **Ip**: Command implementation for `ip`.
- **Port-channel**: Command implementation for `port-channel`.
- **Port**: Command implementation for `port`.
- **Ip-channel**: Command implementation for `ip-channel`.
- **Status-channel**: Command implementation for `status-channel`.
- **Background Task**: Runs scheduled task `mcstats-updater`.

## Modmail (modmail)
**Description:** Let users contact your moderation team privately by DMing the bot. Messages are relayed to a private inbox thread where your staff can reply, discuss internally, and manage tickets — all with full transcript logs and anonymous reply support.

### Commands / Features
- **Setup**: Command implementation for `setup`.
- **Reply**: Command implementation for `reply`.
- **Close**: Command implementation for `close`.
- **Unblock**: Command implementation for `unblock`.
- **Areply**: Command implementation for `areply`.
- **Block**: Command implementation for `block`.
- **Add**: Command implementation for `add`.
- **Remove**: Command implementation for `remove`.
- **List**: Command implementation for `list`.
- **Use**: Command implementation for `use`.
- **Event Tracking**: Listens for `messageCreate` events to automate features.

## Music (music)
**Description:** Turn your Discord into a concert hall! Stream high-quality music from various sources, create playlists, control playback with intuitive commands, and enjoy synchronized listening experiences with your community.

### Commands / Features
- **Reload-node**: Command implementation for `reload-node`.
- **Music**: Command implementation for `music`.

## NSFW (nsfw)
**Description:** NSFW random content (only in nsfw channel)

### Commands / Features
- **Get**: Command implementation for `get`.
- **Favorites**: Command implementation for `favorites`.

## Pet (pet)
**Description:** Adopt adorable virtual companions! Care for your digital pets, feed them, play games, watch them grow, and compete with friends. Experience the joy of pet ownership without the real-world responsibilities.

### Commands / Features
- **Adopt**: Command implementation for `adopt`.
- **Gacha**: Command implementation for `gacha`.
- **Feed**: Command implementation for `feed`.
- **Info**: Command implementation for `info`.
- **Leaderboard**: Command implementation for `leaderboard`.
- **Use**: Command implementation for `use`.
- **Sell**: Command implementation for `sell`.
- **Play**: Command implementation for `play`.
- **Editname**: Command implementation for `editname`.
- **Add**: Command implementation for `add`.
- **List**: Command implementation for `list`.
- **Delete**: Command implementation for `delete`.

## Subdomain (pro)
**Description:** Manage your subdomains and monitors.

### Commands / Features
- **Subdomain**: Command implementation for `subdomain`.
- **Set**: Command implementation for `set`.
- **Help**: Command implementation for `help`.
- **List**: Command implementation for `list`.
- **Delete**: Command implementation for `delete`.

## QuestNotifier (quest)
**Description:** Fetches Discord quests from an API and notifies servers.

### Commands / Features
- **Setup**: Command implementation for `setup`.
- **Remove**: Command implementation for `remove`.
- **Background Task**: Runs scheduled task `quest-scheduler`.

## Reaction Role (reaction-role)
**Description:** Manage reaction roles for your server. Automatically assign roles when users react to messages.

### Commands / Features
- **Edit**: Command implementation for `edit`.
- **Add**: Command implementation for `add`.
- **Remove**: Command implementation for `remove`.
- **List**: Command implementation for `list`.
- **Create**: Command implementation for `create`.
- **List**: Command implementation for `list`.
- **Delete**: Command implementation for `delete`.
- **Event Tracking**: Listens for `messageReactionAdd` events to automate features.
- **Event Tracking**: Listens for `messageReactionRemove` events to automate features.

## Server (server)
**Description:** Master your Discord server management! Access advanced server configuration tools, automate setup processes, manage channels and roles efficiently, and maintain your community with professional-grade administrative features.

### Commands / Features
- **Backup**: Command implementation for `backup`.
- **Autobuild**: Command implementation for `autobuild`.
- **Restore**: Command implementation for `restore`.
- **Reset**: Command implementation for `reset`.

## Server Stats (server-stats)
**Description:** Server statistics addon for Kythia

### Commands / Features
- **Edit**: Command implementation for `edit`.
- **Add**: Command implementation for `add`.
- **Disable**: Command implementation for `disable`.
- **Remove**: Command implementation for `remove`.
- **Category**: Command implementation for `category`.
- **Enable**: Command implementation for `enable`.
- **Background Task**: Runs scheduled task `stats-updater`.

## Social Alerts (social-alerts)
**Description:** Track YouTube channels and post alerts when new videos are uploaded.

### Commands / Features
- **Add**: Command implementation for `add`.
- **Remove**: Command implementation for `remove`.
- **List**: Command implementation for `list`.
- **Edit**: Command implementation for `edit`.
- **View**: Command implementation for `view`.
- **Background Task**: Runs scheduled task `poller`.

## Streak (streak)
**Description:** Build habits and celebrate consistency! Track daily activity streaks, reward dedication, create challenges, and motivate your community to stay engaged with gamified streak tracking and achievement systems.

### Commands / Features
- **Restore**: Command implementation for `restore`.
- **Reset**: Command implementation for `reset`.
- **Claim**: Command implementation for `claim`.
- **Leaderboard**: Command implementation for `leaderboard`.
- **User**: Command implementation for `user`.
- **Minimum**: Command implementation for `minimum`.
- **Rolereward**: Command implementation for `rolereward`.
- **Nickname**: Command implementation for `nickname`.
- **Emoji**: Command implementation for `emoji`.
- **Quota**: Command implementation for `quota`.
- **Timezone**: Command implementation for `timezone`.
- **Event Tracking**: Listens for `messageCreate` events to automate features.

## TempVoice (tempvoice)
**Description:** Create temporary voice channels for your community! Allow users to create their own voice channels by joining a specific channel, and manage them with a control panel.

### Commands / Features
- **Setup**: Command implementation for `setup`.
- **Remove**: Command implementation for `remove`.
- **Repair**: Command implementation for `repair`.
- **Event Tracking**: Listens for `voiceStateUpdate` events to automate features.

## Ticket (ticket)
**Description:** Deliver professional customer support! Create private ticket channels, manage support queues, track issue resolution, and provide seamless help desk functionality that ensures no member request goes unanswered.

### Commands / Features
- **Add**: Command implementation for `add`.
- **Transcript**: Command implementation for `transcript`.
- **Remove**: Command implementation for `remove`.
- **Close**: Command implementation for `close`.
- **Create**: Command implementation for `create`.
- **Delete**: Command implementation for `delete`.
- **Create**: Command implementation for `create`.
- **Delete**: Command implementation for `delete`.
- **Reload**: Command implementation for `reload`.

## Verification (verification)
**Description:** Advanced member verification with captcha challenges (math, emoji, image). Protects your server from bots and raids by requiring new members to solve a captcha before accessing channels.

### Commands / Features
- **Status**: Command implementation for `status`.
- **Reset**: Command implementation for `reset`.
- **Revoke**: Command implementation for `revoke`.
- **Force**: Command implementation for `force`.
- **Button**: Command implementation for `button`.
- **Text**: Command implementation for `text`.
- **Color**: Command implementation for `color`.
- **Send**: Command implementation for `send`.
- **Welcome-message**: Command implementation for `welcome-message`.
- **Type**: Command implementation for `type`.
- **Attempts**: Command implementation for `attempts`.
- **Channel**: Command implementation for `channel`.
- **Unverified-role**: Command implementation for `unverified-role`.
- **Kick-on-timeout**: Command implementation for `kick-on-timeout`.
- **Role**: Command implementation for `role`.
- **Kick-on-fail**: Command implementation for `kick-on-fail`.
- **Log-channel**: Command implementation for `log-channel`.
- **Timeout**: Command implementation for `timeout`.
- **Event Tracking**: Listens for `messageCreate` events to automate features.
- **Event Tracking**: Listens for `guildMemberAdd` events to automate features.
- **Event Tracking**: Listens for `interactionCreate` events to automate features.

## Welcomer (welcomer)
**Description:** Welcome and farewell messages with banner cards, role assignment, and direct messages for new members.

### Commands / Features
- **In-style**: Command implementation for `in-style`.
- **Test**: Command implementation for `test`.
- **Dm-text**: Command implementation for `dm-text`.
- **Out-style**: Command implementation for `out-style`.
- **Out-channel**: Command implementation for `out-channel`.
- **Role**: Command implementation for `role`.
- **Out-text**: Command implementation for `out-text`.
- **In-background**: Command implementation for `in-background`.
- **In-text**: Command implementation for `in-text`.
- **Out-background**: Command implementation for `out-background`.
- **In-channel**: Command implementation for `in-channel`.
- **Event Tracking**: Listens for `guildMemberAdd` events to automate features.
- **Event Tracking**: Listens for `guildMemberRemove` events to automate features.
