export const Roles = {
  ADMIN: 'admin',
  GUEST: 'guest',
};

const users = [
    {
        username: "tomHolland",
        password: "spiderman123",
        role: Roles.GUEST
    },
    {
        username: "homer",
        password: "theOdyssey",
        role: Roles.ADMIN
    }
]

export default users;