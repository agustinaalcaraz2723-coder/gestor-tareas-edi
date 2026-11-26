export function isValidTaskTitle(title: string): boolean {
  const value = title.trim();
  return value.length > 0 && utf8Length(value) <= 200;
}

export function getTaskTitleError(title: string): string | null {
  return isValidTaskTitle(title) ? null : 'Ingresá un título de 1 a 200 bytes.';
}

export function utf8Length(value: string): number {
  let bytes = 0;
  for (const character of value) {
    const code = character.codePointAt(0)!;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return bytes;
}
