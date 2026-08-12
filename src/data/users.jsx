export const Roles = {
  ADMIN: "admin",
  GUEST: "guest",
};

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
