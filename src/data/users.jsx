export const Roles = {
  ADMIN: "Admin",
  GUEST: "Guest",
};

export const RolesList = Object.values(Roles);

const users = [
  {
    username: "1",
    password: "1",
    role: Roles.GUEST,
  },
  {
    username: "tomHolland",
    password: "spiderman123",
    role: Roles.GUEST,
  },
  {
    username: "homer",
    password: "theOdyssey",
    role: Roles.ADMIN,
  },
];

export default users;
