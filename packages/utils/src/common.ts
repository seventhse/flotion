
export function assertNever(value: never, message: string | null, softAssert?: boolean) {
  if (!message) {
    return value
  }
  if (softAssert) {
    console.error(message)
    return value
  }
  throw new Error(message)
}