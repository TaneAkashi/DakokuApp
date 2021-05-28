type ConditionTuple<T> = [T, boolean];

export const filter = <T>(l: ConditionTuple<T>[]): T[] => {
  return l.reduce((acc: T[], tuple) => {
    if (tuple[1]) {
      acc.push(tuple[0]);
    }
    return acc;
  }, []);
};
