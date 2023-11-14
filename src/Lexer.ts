import { AoijsError } from "./classes/AoiError";

const SYNTAX = "[]\\;$";
const OPS = /[!=<>]+$/;
const FN_DEF = /[a-z_]/i;

type TokenString = { type: "string"; value: string };
type TokenInteger = { type: "integer"; value: number };
type TokenFloat = { type: "float"; value: number };
type TokenBoolean = { type: "boolean"; value: boolean };
type TokenNull = { type: "null"; value: null };
type TokenObject = { type: "object"; value: object };
type TokenUndefined = { type: "undefined"; value: undefined };
type TokenCall = {
  type: "call";
  value: string;
  child: TokenArgument[];
  pos: number;
  line: number;
};
type TokenOpen = { type: "open" };
type TokenClose = { type: "close" };
type TokenNewArg = { type: "newArg" };
type TokenOperator = {
  type: "operator";
  value: "==" | "!=" | ">=" | "<=" | ">" | "<" | "!";
};
type TokenArgument = { type: "argument"; child: Token[] };
type TokenProgram = { type: "program"; child: Token[] };
type Token = { pos: number; line: number } & (
  | TokenArgument
  | TokenProgram
  | TokenString
  | TokenInteger
  | TokenFloat
  | TokenBoolean
  | TokenNull
  | TokenUndefined
  | TokenObject
  | TokenCall
  | TokenOpen
  | TokenClose
  | TokenNewArg
  | TokenOperator
);

/**
 * The Lexer class is responsible for tokenizing input strings.
 */
class Lexer {
  currentPosition = 0;
  currentLine = 0;
  currentColumn = 0;
  isEscapedCharacter = false;

  /**
   * Creates a new instance of the Lexer.
   * @param input - The input string to tokenize.
   */
  constructor(public input: string) {
    if (typeof input !== "string" || !input) {
      throw new AoijsError(
        "type",
        "input arg must be non-empty and of type string!",
      );
    }
  }

  /**
   * Tokenizes the input and returns an array of tokens.
   * @returns An array of tokens.
   */
  main() {
    const Tokens: Token[] = [];
    while (true) {
      let response = this.advance();
      if (response) Tokens.push(response);
      if (this.isEndOfInput()) break;
    }
    return this.mergeAdjacentStringTokens(Tokens);
  }

  /**
   * Peeks at a character in the input string without consuming it.
   * @param offset - The offset to peek (default is 0).
   * @returns The character at the specified offset.
   */
  getCharacterAtOffset(offset = 0) {
    return this.input[this.currentPosition + offset];
  }

  /**
   * Advances to the next character in the input string and returns it.
   * Updates the line and column numbers.
   * @returns The current character.
   */
  advanceToNextCharacter() {
    let current = this.input[this.currentPosition++];
    if (this.getCharacterAtOffset() === "\n") {
      this.currentLine += 1;
      this.currentColumn = 0;
    } else {
      this.currentColumn += 1;
    }
    return current;
  }

  /**
   * Checks if the end of the input string has been reached.
   * @returns True if the end of the input is reached, otherwise false.
   */
  isEndOfInput() {
    return (
      this.getCharacterAtOffset() === "" ||
      this.getCharacterAtOffset() === undefined
    );
  }

  /**
   * Checks if a character is an operator.
   * @param content - The character to check.
   * @returns True if the character is an operator, otherwise false.
   */
  isOperator(content: string) {
    return OPS.test(content);
  }

  /**
   * Checks if a character is a syntax character.
   * @param content - The character to check.
   * @returns True if the character is a syntax character, otherwise false.
   */
  isSyntax(content: string) {
    return SYNTAX.indexOf(content) > -1;
  }

  /**
   * Checks if a string represents a valid integer.
   * @param {string} content - The string to check.
   * @returns {boolean} True if the string is a valid integer or BigInt, otherwise false.
   */
  isInteger(content: string): boolean {
    let isBigInt: boolean = false;
    try {
      BigInt(content);
      isBigInt = true;
    } catch (err) {
      isBigInt = false;
    }
    return (
      Number.isInteger(Number(content)) &&
      !this.isBoolean(content) &&
      !this.isNull(content) &&
      isBigInt
    );
  }

  /**
   * Checks if a string represents a valid floating-point number.
   * @param {string} content - The string to check.
   * @returns {boolean} True if the string is a valid floating-point number, otherwise false.
   */
  isFloat(content: string) {
    if (!content.includes(".")) return false;
    if (!Number.isNaN(parseFloat(content))) return true;
    else return false;
  }

  /**
   * Checks if a string represents a boolean value ("true" or "false").
   * @param {string} content - The string to check.
   * @returns {boolean} True if the string represents a boolean value, otherwise false.
   */
  isBoolean(content: string) {
    if (content === "true") return true;
    else if (content === "false") return true;
    else return false;
  }

  /**
   * Checks if a string represents the value null.
   * @param {string} content - The string to check.
   * @returns {boolean} True if the string represents the value null, otherwise false.
   */
  isNull(content: string) {
    if (content === "null") return true;
    else return false;
  }

  /**
   * Checks if a string represents a valid JSON object.
   * @param {string} content - The string to check.
   * @returns {boolean} True if the string is a valid JSON object, otherwise false.
   */
  isObject(content: string) {
    if (content?.startsWith("{") && content.endsWith("}")) {
      try {
        return !!JSON.parse(content);
      } catch (err) {
        return false;
      }
    }
    return false;
  }

  /**
   * Checks if a string represents the value "undefined".
   * @param {string} content - The string to check.
   * @returns {boolean} True if the string represents the value "undefined", otherwise false.
   */
  isUndefined(content: string) {
    if (content === "undefined") return true;
    else return false;
  }

  /**
   * Parses an operator character into a token.
   * @param character - The operator character to parse.
   * @returns A token representing the operator character.
   */
  parseOperator(character: string): Token {
    switch (character) {
      case "==":
      case "!=":
      case ">=":
      case "<=":
      case ">":
      case "<":
        return {
          type: "operator",
          value: character,
          pos: this.currentColumn,
          line: this.currentLine,
        };
    }
    return {
      type: "string",
      value: character,
      pos: this.currentColumn,
      line: this.currentLine,
    };
  }

  /**
   * Validates a call token and parses it.
   * @returns A parsed call token.
   */
  validateCall(call: string) {
    return FN_DEF.test(call);
  }

  /**
   * Parses a call token.
   * @returns A parsed call token.
   */
  parseCall(): Token {
    const fun = this.readInput(this.validateCall);
    if (!fun) {
      return {
        type: "string",
        value: "$",
        pos: this.currentColumn,
        line: this.currentLine,
      };
    }
    return {
      type: "call",
      value: `$${fun.toLowerCase()}`,
      child: [],
      pos: this.currentColumn,
      line: this.currentLine,
    };
  }

  /**
   * Validates a string token and parses it.
   * @returns A parsed string token.
   */
  validateString(content: string) {
    return !(this.isSyntax(content) || this.isOperator(content));
  }

  /**
   * Parses a string token.
   * @returns A parsed string token.
   */
  parseString(): Token {
    const str = this.readInput(this.validateString);
    if (this.isInteger(str)) {
      return {
        type: "integer",
        value: parseInt(str),
        pos: this.currentColumn,
        line: this.currentLine,
      };
    }
    if (this.isFloat(str)) {
      return {
        type: "float",
        value: parseFloat(str),
        pos: this.currentColumn,
        line: this.currentLine,
      };
    }
    if (this.isObject(str)) {
      return {
        type: "object",
        value: JSON.parse(str),
        pos: this.currentColumn,
        line: this.currentLine,
      };
    }
    if (this.isBoolean(str)) {
      return {
        type: "boolean",
        value: str === "true" ? true : false,
        pos: this.currentColumn,
        line: this.currentLine,
      };
    }
    if (this.isNull(str)) {
      return {
        type: "null",
        value: null,
        pos: this.currentColumn,
        line: this.currentLine,
      };
    }
    if (this.isUndefined(str)) {
      return {
        type: "undefined",
        value: undefined,
        pos: this.currentColumn,
        line: this.currentLine,
      };
    }
    return {
      type: "string",
      value: str,
      pos: this.currentColumn,
      line: this.currentLine,
    };
  }

  /**
   * Reads and returns characters while they pass a validation function.
   * @param validator - The validation function for characters.
   * @returns A string composed of valid characters.
   */
  readInput(validator: (content: string) => boolean) {
    let str = "";
    while (
      !this.isEndOfInput() &&
      validator.apply(this, [this.getCharacterAtOffset()])
    ) {
      str += this.advanceToNextCharacter();
    }
    return str;
  }

  /**
   * Advances the lexer to the next character and returns a token.
   * @returns The parsed token.
   */
  advance(): Token | undefined {
    let character = this.getCharacterAtOffset();
    if (this.isEscapedCharacter) {
      this.isEscapedCharacter = false;
      this.advanceToNextCharacter();
      if (this.isSyntax(character) || this.isOperator(character)) {
        return {
          type: "string",
          value: character,
          pos: this.currentColumn,
          line: this.currentLine,
        };
      }
      return {
        type: "string",
        value: "\\" + character,
        pos: this.currentColumn,
        line: this.currentLine,
      };
    }
    switch (character) {
      case "[": {
        this.advanceToNextCharacter();
        return {
          type: "open",
          pos: this.currentColumn,
          line: this.currentLine,
        };
      }
      case "]": {
        this.advanceToNextCharacter();
        return {
          type: "close",
          pos: this.currentColumn,
          line: this.currentLine,
        };
      }
      case ";": {
        this.advanceToNextCharacter();
        return {
          type: "newArg",
          pos: this.currentColumn,
          line: this.currentLine,
        };
      }
      case "\\": {
        this.advanceToNextCharacter();
        this.isEscapedCharacter = true;
        return undefined;
      }
      case "$": {
        this.advanceToNextCharacter();
        return this.parseCall();
      }
    }

    if (this.isOperator(character)) {
      this.advanceToNextCharacter();
      if (this.isOperator(character + this.getCharacterAtOffset())) {
        return this.parseOperator(character + this.advanceToNextCharacter());
      }
      return this.parseOperator(character);
    }
    return this.parseString();
  }

  /**
   * Cleans up adjacent string tokens by merging them.
   * @param tokens - An array of tokens to clean.
   * @returns The cleaned array of tokens.
   */
  mergeAdjacentStringTokens(tokens: Token[]) {
    let mergedTokens: Token[] = [];
    let currentToken: Token | undefined;

    for (const token of tokens) {
      if (!currentToken) {
        currentToken = token;
      } else if (currentToken.type === "string" && token.type === "string") {
        currentToken.value += token.value;
      } else {
        mergedTokens.push(currentToken);
        currentToken = token;
      }
    }

    if (currentToken) {
      mergedTokens.push(currentToken);
    }

    return mergedTokens;
  }
}

export {
  Lexer,
  Token,
  TokenString,
  TokenArgument,
  TokenProgram,
  TokenCall,
  TokenOpen,
  TokenClose,
  TokenNewArg,
  TokenOperator,
};
