import { InlineKeyboardID } from "../index";
import { InlineKeyboard } from "telegramsjs";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$addInlineKeyboard")
  .setBrackets(true)
  .setFields({
    name: "index",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "type",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "other",
    rest: true,
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [index, type, ...other] = await func.resolveFields(context);
    const markup = context.variable.get(InlineKeyboardID);

    switch (type) {
      case "text": {
        const [text, data = text] = other;
        markup[index - 1] ??= new InlineKeyboard();
        markup[index - 1].text(text, data);
        context.variable.set(InlineKeyboardID, markup);
        break;
      }
      case "url": {
        const [text, url] = other;
        markup[index - 1] ??= new InlineKeyboard();
        markup[index - 1].url(text, url);
        context.variable.set(InlineKeyboardID, markup);
        break;
      }
      case "webApp": {
        const [text, url] = other;
        markup[index - 1] ??= new InlineKeyboard();
        markup[index - 1].webApp(text, url);
        context.variable.set(InlineKeyboardID, markup);
        break;
      }
      case "login": {
        const [text, url] = other;
        markup[index - 1] ??= new InlineKeyboard();
        markup[index - 1].login(text, url);
        context.variable.set(InlineKeyboardID, markup);
        break;
      }
      case "switchInline": {
        const [text, query] = other;
        markup[index - 1] ??= new InlineKeyboard();
        markup[index - 1].switchInline(text, query);
        context.variable.set(InlineKeyboardID, markup);
        break;
      }
      case "switchInlineCurrent": {
        const [text, query] = other;
        markup[index - 1] ??= new InlineKeyboard();
        markup[index - 1].switchInlineCurrent(text, query);
        context.variable.set(InlineKeyboardID, markup);
        break;
      }
      case "switchInlineChosen": {
        const [text, query] = other;
        markup[index - 1] ??= new InlineKeyboard();
        markup[index - 1].switchInlineChosen(text, query);
        context.variable.set(InlineKeyboardID, markup);
        break;
      }
      case "game": {
        const [text] = other;
        markup[index - 1] ??= new InlineKeyboard();
        markup[index - 1].game(text);
        context.variable.set(InlineKeyboardID, markup);
        break;
      }
      case "pay": {
        const [text] = other;
        markup[index - 1] ??= new InlineKeyboard();
        markup[index - 1].pay(text);
        context.variable.set(InlineKeyboardID, markup);
        break;
      }
      default: {
        return func.reject(`Invalid type "${type}"`);
      }
    }

    return func.resolve();
  });
