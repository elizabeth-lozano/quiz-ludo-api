const questionSetRepository = require('../repositories/question-set.repository');
const sessionRepository = require('../repositories/session.repository');
const { constraintOf } = require('../errors/db-errors');
const { notFound, forbidden, conflict } = require('../errors/app-error');

// Hub Contract rule 5: six digits. 100000 to 999999 never starts with 0.
function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function findOrFail(code) {
  const session = await sessionRepository.findByCode(code);
  if (!session) {
    throw notFound('SESSION_NOT_FOUND', `No game has the code ${code}.`);
  }
  return session;
}

// Rule: a host starts a game from one of their own question sets.
// Rule: the server makes the code. A client can never choose it.
async function create(setId, user) {
  const questionSet = await questionSetRepository.findById(setId);
  if (!questionSet) {
    throw notFound('QUESTION_SET_NOT_FOUND', `No question set has the id ${setId}.`);
  }
  const mayUse = questionSet.host_id === user.user_id || user.role === 'ADMIN';
  if (!mayUse) throw forbidden('This question set belongs to another host.');

  // A random code can already be in use. The UNIQUE rule on join_pin tells us, and we try again.
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await sessionRepository.create({
        set_id: questionSet.set_id,
        host_id: user.user_id,
        join_pin: randomCode(),
      });
    } catch (error) {
      if (constraintOf(error) !== 'game_sessions_join_pin_key') throw error;
    }
  }
  throw new Error('Could not find a free join code after 5 attempts.');
}

function get(code) {
  return findOrFail(code);
}

// Rule: which status may follow which.
const NEXT_STATUS = {
  LOBBY: ['RUNNING', 'CLOSED'],
  RUNNING: ['CLOSED'],
  CLOSED: [],
};

// Rule: only the host of this game (or an admin) changes its status.
async function changeStatus(code, status, user) {
  const session = await findOrFail(code);
  if (session.host_id !== user.user_id && user.role !== 'ADMIN') {
    throw forbidden('This game belongs to another host.');
  }
  if (!NEXT_STATUS[session.status].includes(status)) {
    throw conflict('INVALID_STATUS_CHANGE', `A ${session.status} game cannot become ${status}.`);
  }
  const changes = { status };
  if (status === 'RUNNING') changes.started_at = new Date();
  if (status === 'CLOSED') changes.ended_at = new Date(); // this is what makes it appear in /results
  return sessionRepository.update(session, changes);
}

module.exports = { findOrFail, create, get, changeStatus };