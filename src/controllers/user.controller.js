const { matchedData } = require('express-validator');
const userService = require('../services/user.service');

// password_hash is never in this list.
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

async function list(req, res) {
  const users = await userService.list();
  res.status(200).json(users.map(toJson));
}

async function changeRole(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const { role } = matchedData(req, { locations: ['body'] });
  const user = await userService.changeRole(id, role, req.user);
  res.status(200).json({ user: toJson(user) });
}

module.exports = { list, changeRole };