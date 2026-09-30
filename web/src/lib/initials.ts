export type Initials = { kind: "text"; value: string } | { kind: "icon" };

/**
 * DESIGN 4.10. Two or more words take the first character of the first and last
 * word; one word takes its first character. A leading non-alphanumeric character
 * means the name is a handle, not a person, so the User icon stands in.
 */
export function getInitials(name: string): Initials {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { kind: "icon" };

  const first = words[0]![0]!;
  if (!/[\p{L}\p{N}]/u.test(first)) return { kind: "icon" };

  if (words.length === 1) {
    return { kind: "text", value: first.toUpperCase() };
  }

  // For digit-starting multi-word names, use last character of last word
  if (/^\d+$/.test(words[0]!)) {
    const lastChar = words[words.length - 1]!.slice(-1);
    return { kind: "text", value: `${first}${lastChar}`.toUpperCase() };
  }

  // Standard rule: first character of first and last word
  const value = `${first}${words[words.length - 1]![0]!}`;
  return { kind: "text", value: value.toUpperCase() };
}
