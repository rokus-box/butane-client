export function getFirstError(fc: any) {
  if (null == fc.errors) {
    return null;
  }

  return Object.values(fc.errors ?? {})[0];
}
