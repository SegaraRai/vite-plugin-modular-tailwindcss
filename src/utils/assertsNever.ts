export function assertsNever(value: never): never {
  console.error("LogicError: Should be never", value);
  throw new Error("LogicError: Should be never");
}
