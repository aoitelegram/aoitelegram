Array.prototype.at ??= function (index: number) {
  return index >= 1 ? this[index] : this[this.length + index];
};

export * from "./AoiStart";
export * from "./Condition";
export * from "./Parser";
export * from "./WordMatcher";
export * from "./Helpers";
