const { matchedData } = require('express-validator');
const authService = require('../services/auth.service');

// What a client is allowed to see of an account. password_hash is never in this list.
function toJson(user) {
  return {
    id: user.user_id,
    school_id: user.school_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

async function register(req, res) {
  const data = matchedData(req, { locations: ['body'] }); // only fields that have a rule
  const user = await authService.register(data);
  res.status(201).json({ user: toJson(user) });
}

async function login(req, res) {
  const { school_id, password } = matchedData(req, { locations: ['body'] });
  const { token, expiresIn, user } = await authService.login(school_id, password);
  res.status(200).json({
    token,
    token_type: 'Bearer',
    expires_in: expiresIn,
    user: toJson(user),
  });
}

// current-user.js already loaded the full account into req.account.
async function me(req, res) {
  res.status(200).json({ user: toJson(req.account) });
}

module.exports = { register, login, me };