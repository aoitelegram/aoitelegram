# AoiTelegram

[![NPM Version](https://img.shields.io/npm/v/aoitelegram)](https://www.npmjs.com/package/aoitelegram)
[![Bot API](https://img.shields.io/badge/Bot%20API-v.7.5-00aced.svg?style=flat-square&logo=telegram)](https://core.telegram.org/bots/api)
[![NPM Downloads](https://img.shields.io/npm/dt/aoitelegram.svg?maxAge=3600)](https://www.npmjs.com/package/aoitelegram)
[![License](https://img.shields.io/npm/l/aoitelegram)](https://github.com/aoitelegram/aoitelegram/blob/v1/LICENSE)

`aoitelegram` is a `JavaScript/TypeScript` library for creating `Telegram` bots with ease. It simplifies the process of building and managing `Telegram` bot functionality, similar to `aoijs` but tailored for `Telegram`.

## Features

- **Over 200 Pre-built Functions:** `aoitelegram` comes equipped with more than 200 pre-built functions, empowering you to effortlessly create dynamic and interactive Telegram bots.

- **Built-in Custom Function System:** `aoitelegram` has very good support for custom functions. Besides, `aoitelegram` has classes for working with extensions that you can create.

- **CommonJS/ESM Support**: `aoitelegram` now supports modules like CommonJS/ESM for more convenient development on `NodeJS`.

- **User-Friendly Design:** `aoitelegram` is perfect for beginners with its straightforward function interface. The `$` prefix simplifies command writing, ensuring a swift launch for your bot. 🚀

> Starting from v1, aoitelegram has an improved parser/interpreter that ensures proper functioning of $if/$else/$endif similar to bdfd.

## Installation

To use `aoitelegram` in your project, you can install it via npm:

```shell
npm install aoitelegram
```

## Usage

Here's a quick example of how to use `aoitelegram` to create a Telegram bot:

```typescript
// CommonJS
const { AoiClient, LoadCommands } = require("aoitelegram");
// Esm/TypeScript
import { AoiClient, LoadCommands } from "aoitelegram";

const bot = new AoiClient("YOUR_BOT_TOKEN_HERE", {
  /** Optional request options for fetch **/
  telegram?: RequestInit;
  /** Functions that will be removed from the library's loading functions. **/
  disableFunctions?: string[],
  /** An array of AoiExtension functions **/
  extension?: AoiExtension[],
  /** For the error handler of functions **/
  functionError?: boolean,
  /** To disable text errors **/
  sendMessageError?: boolean,
  /** Outputting system messages to the console. **/
  logging?: boolean,
  /** Auto register bot commands **/
  myCommands?: {
    /** Allow command registration **/
    register?: boolean;
    /** An object, describing scope of users for which the commands are relevant. Defaults to BotCommandScopeDefault. */
    scope?: BotCommandScope;
   /** A two-letter ISO 639-1 language code. If empty, commands will be applied to all users from the given scope, for whose language there are no dedicated commands */
    language_code?: string;
  },
  /** Checks for available package updates and performs an update if enabled **/
  autoUpdate?: {
    /** Displaying messages about new versions. **/
    aoiWarning?: boolean,
    /**  Whether automatic updates are enabled. **/
    autoUpdate?: boolean,
    /** Whether to enable development versions. **/
    enableDev?: boolean,
    /** Whether to enable beta versions. **/
    enableBeta?: boolean,
  },
});

bot.functionErrorCommand({
  code: `$sendMessage[Sorry, but there was an error in the $handleError[function] function within the $handleError[command] command: $handleError[error]]`,
});

bot.readyCommand({
  code: `$print[Starting @$getObjectKey[$getMe;username]]`,
});

bot.messageCommand({
  code: `$print[Message Handle]`,
});

bot.callbackQueryCommand({
  code: `$print[Action Handle]`,
});

// Define a command to print a message.
bot.addCommand({
  command: "say",
  code: `$sendMessage[$message]`,
});

// Define a command to check the bot's ping.
bot.addCommand({
  command: "ping",
  code: `$replyMessage[Bot ping: $pingms]`,
});

// Define a command to display bot information.
bot.addCommand({
  command: "botinfo",
  code: `
$replyMessage[
Bot ID: $clientId
Name: $clientFirstName
Username: $clientUsername
Ping: $pingms
]`,
});

const loader = new LoadCommands(bot);
loader.loadCommands("./command/");

bot.connect();
```

## Documentation

For detailed documentation and usage instructions, please refer to the [aoitelegram Wiki](https://aoitelegram.vercel.app/).

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/aoitelegram/aoitelegram/blob/main/LICENSE) file for details.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please create a `GitHub` issue or submit a pull request. Additionally, feel free to reach out to me on Telegram via my group [AoiTelegram](https://t.me/aoitegram) or on Discord using my username `sempaika_chess`.

<table>
  <td><image src="https://avatars.githubusercontent.com/u/101444750?v=4"><a href="https://github.com/Asayukiii">Asayukiii</a></td>
  <td><image src="https://avatars.githubusercontent.com/u/141875262?v=4"><a href="https://github.com/gdeVanezus">gdeVanezus</a></td>
</table>
