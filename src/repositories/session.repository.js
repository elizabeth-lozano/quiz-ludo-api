const { GameSession } = require('../models');

// The code is what players type, so the URL uses it instead of the id.
function findByCode(code) {
  return GameSession.findOne({ where: { join_pin: code } }); // a row, or null
}

function create(data) {
  return GameSession.create(data);
}

function update(session, changes) {
  return session.update(changes);
}

module.exports = { findByCode, create, update };