export const escapeSpecialCharacterFromString = (str: string) => {
  return str.replace('+', '\\+')
}
