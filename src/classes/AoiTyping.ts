import type { AoiClient } from "./AoiClient";
import type { ArgsType } from "./AoiFunction";
import type { Context, IEventFunctions } from "telegramsjs";
import type {
  Container,
  ParserFunction,
  ICallbackResolve,
  ICallbackReject,
} from "./core/";
import {
  Update,
  UserFromGetMe,
  Message,
  MessageReactionUpdated,
  MessageReactionCountUpdated,
  CallbackQuery,
  InlineQuery,
  ShippingQuery,
  PreCheckoutQuery,
  Poll,
  PollAnswer,
  ChatMemberUpdated,
  ChatJoinRequest,
  MessageEntity,
  ChatBoostUpdated,
  ChatBoostRemoved,
} from "@telegram.ts/types";

interface CaptionableMessage {
  caption: string;
  caption_entities?: MessageEntity[];
}

interface AwaitedEvent {
  name: string;
  count: number;
  outData: Record<string, ReturnPrimitive>;
}

interface EventHandlers extends IEventFunctions {
  addAwaited: (event: AwaitedEvent, data: Container) => void;
  functionError: (
    eventContext: Container,
    errorData: {
      errorMessage: string;
      functionName: string;
      outData: { [key: string]: any };
    },
  ) => void;
}

interface CustomAoiFunction {
  name: string;
  code: string;
  type: "aoitelegram";
  params?: string[];
  version?: string;
  aliases?: string[];
  reverseReading?: boolean;
}

type Primitive = string | number | boolean | undefined | null;

type ReturnObject = Record<string, Primitive>;

type ReturnArray = Array<Primitive>;

type ReturnPrimitive = Primitive | ReturnObject | ReturnArray;

type DefaultFnValue = (ctx: Container) => PossiblyAsync<ReturnPrimitive>;

type CustomJSFunction =
  | {
      name: string;
      type?: "javascript";
      aliases?: string[];
      fields: (
        | {
            name: string;
            required?: false;
            defaultValue?: DefaultFnValue | ReturnPrimitive;
          }
        | {
            name: string;
            rest?: boolean;
            type?: ArgsType[];
            converType?: ArgsType;
            required: true;
          }
      )[];
      brackets: true;
      other?: any;
      version?: string;
      callback: (
        context: Container,
        func: ParserFunction,
        code?: string,
      ) => PossiblyAsync<ICallbackResolve | ICallbackReject>;
    }
  | {
      name: string;
      other?: any;
      type?: "javascript";
      aliases?: string[];
      brackets?: false;
      version?: string;
      callback: (
        context: Container,
        func: ParserFunction,
        code?: string,
      ) => PossiblyAsync<ICallbackResolve | ICallbackReject>;
    };

type CommandData<OutOptions = { [key: string]: any }> = {
  code: string;
  chatId?: number | string;
  searchFailed?: boolean;
  reverseReading?: boolean;
} & OutOptions;

type DataFunction = CustomAoiFunction | CustomJSFunction;

type ContextEvent = Context &
  UserFromGetMe &
  Message &
  MessageReactionUpdated &
  MessageReactionCountUpdated &
  CallbackQuery &
  InlineQuery &
  ShippingQuery &
  PreCheckoutQuery &
  Poll &
  PollAnswer &
  ChatMemberUpdated &
  ChatJoinRequest &
  ChatBoostUpdated &
  ChatBoostRemoved & { api: AoiClient };

type PossiblyAsync<T> = T | Promise<T>;

type MaybeArray<T> = T | Array<T>;

type EventType = "callbackQuery"
  | "editedMessage"
  | "myChatMember"
  | "shippingQuery"
  | "channelPost" 
  | "inlineQuery"
  | "poll"
  | "chatBoost"
  | "loop"
  | "pollAnswer"
  | "chatJoinRequest"
  | "message"
  | "preCheckoutQuery"
  | "chatMember"
  | "messageReaction"
  | "rateLimit"
  | "ready"
  | "editedChannelPost"
  | "businessConnection"
  | "businessMessage"
  | "editedBusinessMessage"
  | "deletedBusinessMessages"
  | "messageReactionCount"
  | "removedChatBoost"
  | "functionError";

export {
  EventHandlers,
  ContextEvent,
  EventType,
  CustomJSFunction,
  CustomAoiFunction,
  DefaultFnValue,
  ReturnPrimitive,
  DataFunction,
  CommandData,
  MaybeArray,
  PossiblyAsync,
};
