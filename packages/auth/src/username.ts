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

function sanitizeDiscordHandle(handle: string): string {
  let value = handle.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  value = value.replace(/_+/g, "_").replace(/^_|_$/g, "");
  if (/^[0-9]/.test(value)) {
    value = `u_${value}`;
  }
  if (value.length > USERNAME_MAX_LENGTH) {
    value = value.slice(0, USERNAME_MAX_LENGTH).replace(/_+$/g, "");
  }
  return value;
}

export function usernameFromDiscord(handle: string, discordId: string): string {
  const candidate = sanitizeDiscordHandle(handle);
  if (isBrigadaUsername(candidate)) {
    return candidate;
  }
  return `d${discordId}`;
}

export function userFieldsFromDiscordProfile(profile: {
  id: string;
  username: string;
  global_name?: string | null;
  email?: string | null;
  image_url?: string;
}) {
  return {
    email: profile.email ?? `discord-${profile.id}@users.noreply.brigada.local`,
    name: profile.global_name ?? profile.username,
    image: profile.image_url,
    username: usernameFromDiscord(profile.username, profile.id),
  };
}
