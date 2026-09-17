import {
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

export const USER_SORT_FIELDS = ["createdAt", "username", "name"] as const;
export const USER_SORT_ORDERS = ["asc", "desc"] as const;
export const USER_PAGE_LIMITS = [10, 20, 50] as const;

export type UserSortField = (typeof USER_SORT_FIELDS)[number];
export type UserSortOrder = (typeof USER_SORT_ORDERS)[number];

export const usersSearchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  sort: parseAsStringLiteral(USER_SORT_FIELDS).withDefault("createdAt"),
  order: parseAsStringLiteral(USER_SORT_ORDERS).withDefault("desc"),
  user: parseAsString,
};

export const serializeUsersSearch = createSerializer(usersSearchParams);
