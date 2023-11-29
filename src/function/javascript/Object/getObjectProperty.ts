interface Data {
  [key: string]: any;
}

export function getObjectKey<T extends Data, K extends keyof T>(
  data: T,
  path: string,
): T[K] {
  const properties = path.split(".");
  function getProperty(obj: Data, props: string[]): any {
    const [currentProp, ...rest] = props;
    if (obj && obj[currentProp]) {
      if (rest.length > 0) {
        return getProperty(obj[currentProp], rest);
      } else {
        return obj[currentProp];
      }
    }
    return undefined;
  }
  return getProperty(data, properties) as T[K];
}

export default {
  name: "$getObjectProperty",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$getObjectProperty");
    const args = await ctx.getEvaluateArgs();
    const object = JSON.parse(JSON.stringify(args[0]));
    return getObjectKey(object, args[1]);
  },
};
