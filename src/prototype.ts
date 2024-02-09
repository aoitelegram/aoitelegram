/**
 * Replaces the last occurrence of a substring in a string.
 * @param search - The substring to search for.
 * @param replacement - The string to replace the last occurrence with.
 * @returns The modified string.
 */
function replaceLast(text: string, search: string, replacement: string) {
  const lastIndex = text.lastIndexOf(search);

  if (lastIndex === -1) {
    return text.toString();
  }

  const before = text.substring(0, lastIndex);
  const after = text.substring(lastIndex + search.length);

  return `${before}${replacement}${after}`;
};

/**
 * Searches for all occurrences of a pattern in a text.
 * @param pat - The pattern to search for.
 * @param txt - The text to search within.
 * @returns An array of indexes where the pattern is found.
 */
function searchIndexes(pat: string, txt: string) {
  const patLength = pat.length;
  const txtLength = txt.length;

  const lps = new Int32Array(patLength);

  processPattern(pat, patLength, lps);

  const indexes: number[] = [];

  let patIndex = 0;
  let txtIndex = 0;

  while (txtIndex < txtLength) {
    if (pat[patIndex] === txt[txtIndex]) {
      patIndex++;
      txtIndex++;
    }

    if (patIndex === patLength) {
      indexes.push(txtIndex - patIndex);
      patIndex = lps[patIndex - 1];
    } else if (txtIndex < txtLength && pat[patIndex] !== txt[txtIndex]) {
      if (patIndex !== 0) {
        patIndex = lps[patIndex - 1];
      } else {
        txtIndex++;
      }
    }
  }

  return indexes;
}

/**
 * Processes the pattern to generate the Longest Prefix Suffix array.
 * @param pat - The pattern to process.
 * @param patLength - The length of the pattern.
 * @param lps - The Longest Prefix Suffix array.
 */
function processPattern(pat: string, patLength: number, lps: Int32Array) {
  let len = 0;
  let index = 1;

  while (index < patLength) {
    if (pat[index] === pat[len]) {
      len++;
      lps[index++] = len;
    } else if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[index++] = 0;
    }
  }
}

/**
 * Extracts information from the string after the first occurrence of "[".
 * @returns An object with information about the extracted part.
 */
function after(text: string): {
  inside?: string;
  total: string;
  splits: string[];
  toString(): string;
} {
  const afterIndex = text.indexOf("[");
  const after = text.replace(/(\s|\n)/gim, "").startsWith("[")
    ? text.split("[").slice(1).join("[")
    : undefined;

  let inside;
  let total = "";
  let splits: string[] = [];

  if (after) {
    const before = text.substring(0, afterIndex);
    const rightIndexes = searchIndexes("[", after);
    const leftIndexes = searchIndexes("]", after);

    if (leftIndexes.length === 0) {
      inside = after;
      total = `${before}[${inside}`;
    } else if (rightIndexes.length === 0) {
      inside = after.substring(0, leftIndexes[0]);
      total = `${before}[${inside}]`;
    } else {
      const merged: { index: number; isLeft: boolean }[] = [];
      let leftIndex = 0;

      for (let i = 0; i < rightIndexes.length; ++i) {
        const right = rightIndexes[i];
        let left = leftIndexes[leftIndex];

        while (left < right && typeof left === "number") {
          merged.push({
            index: left,
            isLeft: true,
          });

          left = leftIndexes[++leftIndex];
        }

        merged.push({
          index: right,
          isLeft: false,
        });

        if (typeof left !== "number") break;
      }

      while (leftIndex < leftIndexes.length) {
        const left = leftIndexes[leftIndex++];
        merged.push({
          index: left,
          isLeft: true,
        });
      }

      let index = 0;
      let depth = 1;

      for (let i = 0; i < merged.length; ++i) {
        const obj = merged[i];
        index = obj.index;

        if (obj.isLeft) --depth;
        else ++depth;

        if (!depth) break;
      }

      if (depth) index = after.length;

      inside = after.substring(0, index);
      total = `${before}[${inside}${depth ? "" : "]"}`;
    }

    splits = inside.split(";");
  }

  return {
    inside,
    total,
    splits,
    toString() {
      return total;
    },
  };
};

/**
 * Unpacks a portion of code based on a specified function signature.
 * @param code - The code to unpack.
 * @param func - The function signature to use for unpacking.
 * @returns An object with information about the unpacked part.
 */
function unpack(
  code: string,
  func: string,
): {
  inside?: string;
  total: string;
  splits: string[];
  toString(): string;
} {
  const last = code.split(func.replace("[", "")).length - 1;

  const sliced = code.split(func.replace("[", ""))[last];

  return after(sliced);
}

/**
 * Finds and transforms specified strings in an array based on a regular expression.
 * @param str - The input string to search and transform.
 * @param array - An array of strings to be used for replacement.
 * @returns The modified string after applying transformations.
 */
function findAndTransform(str: string, array: string[]) {
  const regex = /\$(!?[a-zA-Z_][a-zA-Z0-9_]*)(\[\.\.\.\])?/g;
  if (!str || array.length < 1) return str;
  array.forEach((element) => {
    str = str.replace(regex, (match) => match.toLowerCase());
  });

  return str;
}

/**
 * Replaces placeholders in an input string with values from arrays.
 * @param inputString - The input string containing placeholders.
 * @param array - The array of placeholders to be replaced.
 * @param arrayParams - The array of values to replace placeholders with.
 * @returns - The updated string with replaced values.
 */
function updateParamsFromArray(
  inputString: string,
  array: string[],
  arrayParams: (undefined | string)[],
) {
  if (array.length > arrayParams.length) {
    arrayParams = [
      ...arrayParams,
      ...Array(array.length - arrayParams.length).fill(undefined),
    ];
  }

  for (let i = 0; i < array.length; i++) {
    const regex = new RegExp(`{${array[i]}}`, "g");
    inputString = inputString.replace(regex, `${arrayParams[i]}`);
  }
  return inputString;
}

export { unpack, after, replaceLast, findAndTransform, updateParamsFromArray };
