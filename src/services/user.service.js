const userRepository = require('../repositories/user.repository');
const { notFound, conflict } = require('../errors/app-error');

function list() {
  return userRepository.findAll();
}

// Rule: an admin cannot change their own role, so the library can never end up
// with no admin by accident.
async function changeRole(id, role, admin) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw notFound('USER_NOT_FOUND', `No account has the id ${id}.`);
  }
  if (user.user_id === admin.user_id) {
    throw conflict('CANNOT_CHANGE_OWN_ROLE', 'An admin cannot change their own role.');
  }
  return userRepository.update(user, { role });
}

module.exports = { list, changeRole };