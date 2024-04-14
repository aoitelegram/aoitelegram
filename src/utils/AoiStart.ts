import { version } from "../index";
import { AoiLogger } from "../classes/AoiLogger";
import type { AoiClient } from "../classes/AoiClient";
import type { UserFromGetMe } from "@telegram.ts/types";
import onCallbackQuery from "../classes/handlers/CallbackQuery";
import onEditedMessage from "../classes/handlers/EditedMessage";
import onMyChatMember from "../classes/handlers/MyChatMember";
import onShippingQuery from "../classes/handlers/ShippingQuery";
import onChannelPost from "../classes/handlers/ChannelPost";
import onInlineQuery from "../classes/handlers/InlineQuery";
import onPoll from "../classes/handlers/Poll";
import onVariableCreate from "../classes/handlers/VariableCreate";
import onChatBoost from "../classes/handlers/ChatBoost";
import onLoop from "../classes/handlers/Loop";
import onPollAnswer from "../classes/handlers/PollAnswer";
import onVariableDelete from "../classes/handlers/VariableDelete";
import onChatJoinRequest from "../classes/handlers/ChatJoinRequest";
import onMessage from "../classes/handlers/Message";
import onPreCheckoutQuery from "../classes/handlers/PreCheckoutQuery";
import onVariableUpdate from "../classes/handlers/VariableUpdate";
import onChatMember from "../classes/handlers/ChatMember";
import onMessageReaction from "../classes/handlers/MessageReaction";
import onReady from "../classes/handlers/Ready";
import onEditedChannelPost from "../classes/handlers/EditedChannelPost";
import onDeletedBusinessMessages from "../classes/handlers/DeletedBusinessMessages";
import onEditedBusinessMessage from "../classes/handlers/EditedBusinessMessage";
import onBusinessMessage from "../classes/handlers/BusinessMessage";
import onBusinessConnection from "../classes/handlers/BusinessConnection";
import onMessageReactionCount from "../classes/handlers/MessageReactionCount";
import onRemovedChatBoost from "../classes/handlers/RemovedChatBoost";
import onAction from "../classes/handlers/command/Action";
import onCommand from "../classes/handlers/command/Command";

async function aoiStart(telegram: AoiClient): Promise<void> {
  const username = `@${telegram.botInfo.username}`;

  await onAction(telegram);
  await onCallbackQuery(telegram);
  await onEditedMessage(telegram);
  await onMyChatMember(telegram);
  await onShippingQuery(telegram);
  await onChannelPost(telegram);
  await onInlineQuery(telegram);
  await onPoll(telegram);
  await onVariableCreate(telegram);
  await onChatBoost(telegram);
  await onLoop(telegram);
  await onPollAnswer(telegram);
  await onVariableDelete(telegram);
  await onChatJoinRequest(telegram);
  await onCommand(telegram);
  await onMessage(telegram);
  await onPreCheckoutQuery(telegram);
  await onVariableUpdate(telegram);
  await onChatMember(telegram);
  await onMessageReaction(telegram);
  await onEditedChannelPost(telegram);
  await onDeletedBusinessMessages(telegram);
  await onEditedBusinessMessage(telegram);
  await onBusinessMessage(telegram);
  await onBusinessConnection(telegram);
  await onMessageReactionCount(telegram);
  await onRemovedChatBoost(telegram);
  await onReady(telegram);

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

export default aoiStart;
