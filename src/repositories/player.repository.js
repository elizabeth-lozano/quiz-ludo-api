const { Op } = require('sequelize');
const { Player, GameSession } = require('../models');

// This account's seat in this game, or null.
function findSeat(sessionId, userId) {
  return Player.findOne({ where: { session_id: sessionId, user_id: userId } });
}

// Every seat of a game, best score first.
function findAllBySession(sessionId) {
  return Player.findAll({
    where: { session_id: sessionId },
    order: [['score', 'DESC'], ['nickname', 'ASC']],
  });
}

// A seat of this account in ANOTHER game that is RUNNING, or null.
function findRunningSeatElsewhere(userId, sessionId) {
  return Player.findOne({
    where: { user_id: userId, session_id: { [Op.ne]: sessionId }, left_at: null },
    include: [{ model: GameSession, where: { status: 'RUNNING' }, attributes: ['join_pin'] }],
  });
}

function create(data) {
  return Player.create(data);
}

module.exports = { findSeat, findAllBySession, findRunningSeatElsewhere, create };