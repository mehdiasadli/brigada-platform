export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

/** letter, then alphanumerics, underscores only as separators */
const USERNAME_PATTERN = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

export function isBrigadaUsername(value: string): boolean {
  return (
    value.length >= USERNAME_MIN_LENGTH &&
    value.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(value)
  );
}
