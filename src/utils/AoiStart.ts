import { UserFromGetMe } from "@telegram.ts/types";
import { AoiLogger } from "../classes/AoiLogger";
import { version } from "../index";

export default function aoiStart(context: UserFromGetMe) {
  const username = `@${context.username}`;

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
        text: "https://github.com/Sempai-07/aoitelegram/issues",
        color: "blue",
        bold: true,
      },
    ],
  });
}
