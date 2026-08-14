export const ROLES = {
  ADMIN: "Admin",
  GUEST: "Guest",
};

export const RolesList = Object.values(ROLES);

const users = [
  {
    username: "1",
    password: "1",
    role: ROLES.GUEST,
  },
  {
    username: "tomHolland",
    password: "spiderman123",
    role: ROLES.GUEST,
  },
  {
    username: "homer",
    password: "theOdyssey",
    role: ROLES.ADMIN,
  },
];

export default users;
