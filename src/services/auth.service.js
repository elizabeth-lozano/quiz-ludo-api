const userRepository = require('../repositories/user.repository');
const password = require('../security/password');
const token = require('../security/token');
const { unauthorized } = require('../errors/app-error');

// Rule: whoever registers is a PLAYER. A client can never choose the role.
// A taken school ID or email is refused by the database (UNIQUE), not checked here,
// because two requests in the same instant would both pass a check first.
async function register(data) {
  const passwordHash = await password.hash(data.password); // a new salt every time
  return userRepository.create({
    school_id: data.school_id,
    full_name: data.full_name,
    email: data.email,
    role: 'PLAYER',
    password_hash: passwordHash,
  });
}

// Rule: a wrong password and an unknown school ID get the SAME answer, so the
// login cannot be used to find out which school IDs have accounts.
async function login(schoolId, plainPassword) {
  const account = await userRepository.findForLogin(schoolId);

  // matches() also runs when the account does not exist (against a dummy hash),
  // so both failures take the same time.
  const ok = await password.matches(plainPassword, account && account.password_hash);
  if (!account || !ok) {
    throw unauthorized('Wrong school ID or password.', 'INVALID_CREDENTIALS');
  }

  const jwt = token.issue(account);
  const payload = token.verify(jwt); // read back exp and iat, so the seconds are always right
  return { token: jwt, expiresIn: payload.exp - payload.iat, user: account };
}

module.exports = { register, login };