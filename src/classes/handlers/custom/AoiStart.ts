import { version } from "../../../index";
import { AoiLogger } from "../../AoiLogger";
import type { AoiClient } from "../../AoiClient";

async function aoiStart(telegram: AoiClient): Promise<void> {
  const username = `@${telegram.botInfo.username}`;

  const loopCommands = telegram.events.get("loop");
  const readyCommands = telegram.events.get("ready");

  if (loopCommands) {
    const { default: loopHandlers } = require("../Loop");
    loopHandlers(telegram);
  }

  if (readyCommands) {
    const { default: readyHandlers } = require("../Ready");
    await readyHandlers(telegram);
  }

  AoiLogger.custom({
    title: {
      text: "[ AoiClient ]:",
      color: "red",
      bold: true,
    },
    args: [
      {
        text: "Initialized on",
        color: "yellow",
        bold: true,
      },
      {
        text: "aoitelegram",
        color: "cyan",
        bold: true,
      },
      {
        text: `v${version}`,
        color: "blue",
        bold: true,
      },
      {
        text: "|",
        color: "yellow",
        bold: true,
      },
      {
        text: username,
        color: "green",
        bold: true,
      },
      {
        text: "|",
        color: "yellow",
        bold: true,
      },
      {
        text: "Sempai Development",
        color: "cyan",
        bold: true,
      },
    ],
  });

  AoiLogger.custom({
    title: {
      text: "[ Official Docs ]:",
      color: "yellow",
      bold: true,
    },
    args: [
      {
        text: "https://aoitelegram.vercel.app/",
        color: "blue",
        bold: true,
      },
    ],
  });

  AoiLogger.custom({
    title: {
      text: "[ Official GitHub ]:",
      color: "yellow",
      bold: true,
    },
    args: [
      {
        text: "https://github.com/aoitelegram/aoitelegram.git",
        color: "blue",
        bold: true,
      },
    ],
  });
}

export default aoiStart;
