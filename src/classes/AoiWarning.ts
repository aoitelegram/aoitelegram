import axios from "axios";
import { version } from "../../package.json";
import { AoijsError } from "./AoiError";

async function AoiWarning() {
  try {
    const response = await axios.get("https://registry.npmjs.org/aoitelegram");
    const resData = response.data["dist-tags"].latest;
    if (version !== resData) {
      console.warn(
        "\x1b[31m[ AoiWarning ]: \u001b[33mv" +
          resData +
          " is available to install.\u001b[0m" +
          " (\x1b[31mnpm i aoitelegram@" +
          resData +
          "\x1b[0m)",
      );
    }
  } catch (error) {
    const messageError = error as { response: { data: { error: string } } };
    console.warn(
      `\x1b[31m[ AoiWarning ]: failed to check for updates: \u001b[33m ${messageError.response?.data?.error}`,
    );
  }
}

export { AoiWarning };
