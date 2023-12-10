/**
 * Utility class for checking conditions and solving logical expressions.
 */
class ConditionChecker {
  /**
   * Checks if the given message includes the specified operator.
   *
   * @param {string} msg - The message to check.
   * @param {string} operator - The operator to look for.
   * @returns {boolean} - True if the operator is found, otherwise false.
   */
  static hasOperator(msg: string, operator: string) {
    return msg.includes(operator);
  }

  /**
   * Solves a comparison operation based on the provided operator.
   *
   * @param {string} part - The part of the expression to solve.
   * @param {string} operator - The comparison operator.
   * @returns {boolean} - True if the comparison is true, otherwise false.
   */
  static solveComparison(part: string, operator: string) {
    const parts = part.split(operator);
    let pass = true;

    if (operator === "==") {
      pass = parts[0].trim() === parts[1].trim();
    } else if (operator === "!=") {
      pass = parts[0].trim() !== parts[1].trim();
    } else {
      const [num1, num2] = parts.map((x) =>
        isNaN(Number(x)) ? x.trim() : Number(x.trim()),
      );
      switch (operator) {
        case ">":
          pass = num1 > num2;
          break;
        case "<":
          pass = num1 < num2;
          break;
        case ">=":
          pass = num1 >= num2;
          break;
        case "<=":
          pass = num1 <= num2;
          break;
      }
    }
    return pass;
  }

  /**
   * Solves logical AND expressions in the provided part.
   *
   * @param {string} part - The part of the expression to solve.
   * @returns {string} - The result of solving the AND expressions.
   */
  static solveAnd(part: string) {
    const conditions = part.split("&&");
    const finalConditions: string[] = [];

    for (const condition of conditions) {
      const trimmedCondition = condition.trim();
      if (trimmedCondition === "") {
        finalConditions.push("");
        continue;
      }

      const hasBracket = trimmedCondition.includes(")") ? ")" : "";
      const cleanCondition = trimmedCondition.split(")")[0];
      let result = "";

      if (this.hasOperator(cleanCondition, "||")) {
        result = this.solveOr(cleanCondition) + hasBracket;
      } else {
        const operators = ["==", "!=", ">", "<", ">=", "<="];
        let operatorFound = false;

        for (const operator of operators) {
          if (this.hasOperator(cleanCondition, operator)) {
            result =
              this.solveComparison(cleanCondition, operator) + hasBracket;
            operatorFound = true;
            break;
          }
        }

        if (!operatorFound) {
          finalConditions.push(trimmedCondition);
          continue;
        }
      }
      finalConditions.push(result);
    }

    return finalConditions.join("&&");
  }

  /**
   * Solves logical OR expressions in the provided part.
   *
   * @param {string} part - The part of the expression to solve.
   * @returns {string} - The result of solving the OR expressions.
   */
  static solveOr(part: string) {
    const conditions = part.split("||");
    const finalConditions: string[] = [];

    for (const condition of conditions) {
      const trimmedCondition = condition.trim();
      if (trimmedCondition === "") {
        finalConditions.push("");
        continue;
      }

      const hasBracket = trimmedCondition.includes(")") ? ")" : "";
      const cleanCondition = trimmedCondition.split(")")[0];
      let result = "";

      const operators = ["==", "!=", ">", "<", ">=", "<="];
      let operatorFound = false;

      for (const operator of operators) {
        if (this.hasOperator(cleanCondition, operator)) {
          result = this.solveComparison(cleanCondition, operator) + hasBracket;
          operatorFound = true;
          break;
        }
      }

      if (!operatorFound) {
        finalConditions.push(trimmedCondition);
        continue;
      }

      finalConditions.push(result);
    }

    return finalConditions.join("||");
  }

  /**
   * Solves logical expressions in the provided message.
   *
   * @param {string} msg - The message containing logical expressions.
   * @returns {string} - The result of solving the logical expressions.
   */
  static solve(msg: string) {
    const parts = msg.split("(");
    const finalConditions: string[] = [];

    for (const part of parts) {
      if (part.trim() === "") {
        finalConditions.push("");
        continue;
      }
      const solvedAnd = this.solveAnd(part);
      finalConditions.push(solvedAnd);
    }

    let result = finalConditions.join("(");
    const openBrackets = result.split("(").length;
    const closeBrackets = result.split(")").length;

    if (openBrackets !== closeBrackets) {
      result += ")".repeat(openBrackets - closeBrackets);
    }

    return result;
  }
}

export { ConditionChecker };
