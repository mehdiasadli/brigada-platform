import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  ...adminAc.statements,
});

export const moderatorRole = ac.newRole({
  user: ["list", "get", "ban", "update"],
  session: ["list", "revoke"],
});

export const userRole = ac.newRole({
  ...userAc.statements,
});

export const roles = {
  admin: adminRole,
  moderator: moderatorRole,
  user: userRole,
};
