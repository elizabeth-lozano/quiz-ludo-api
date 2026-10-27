const playerRepository = require('../repositories/player.repository');
const sessionService = require('./session.service');
const { constraintOf } = require('../errors/db-errors');
const { conflict } = require('../errors/app-error');

const MAX_PLAYERS = 4;
const COLORS = ['Red', 'Green', 'Yellow', 'Blue'];

async function join(code, nickname, user) {
  // Q3: does a game with this code exist? (404)
  const session = await sessionService.findOrFail(code);

  // Q4: does this account already have a seat here? Then it is a rejoin: same seat, same score.
  const seat = await playerRepository.findSeat(session.session_id, user.user_id);
   if (seat) {
    await playerRepository.markSeen(seat);
    return { session, player: seat, created: false };
  }

  // Q5: Hub Contract v1.2, one game at a time.
  const elsewhere = await playerRepository.findRunningSeatElsewhere(user.user_id, session.session_id);
  if (elsewhere) {
    throw conflict('ALREADY_IN_GAME', 'You are still playing another game. Finish it first.');
  }

  // Q6: a new seat only while the game is in the lobby.
  if (session.status === 'CLOSED') throw conflict('SESSION_ENDED', 'This game has ended.');
  if (session.status !== 'LOBBY') {
    throw conflict('SESSION_NOT_JOINABLE', 'This game has already started.');
  }

  // Q7: is there room left?
  const seats = await playerRepository.findAllBySession(session.session_id);
  if (seats.length >= MAX_PLAYERS) throw conflict('SESSION_FULL', 'This game is full.');
  const color = COLORS.find((c) => !seats.some((p) => p.color === c));

  // Q8: is the nickname free? The database decides: UNIQUE (session_id, nickname).
  try {
        const player = await playerRepository.create({
      session_id: session.session_id,
      user_id: user.user_id,
      nickname,
      color,
      last_seen_at: new Date(),
    });
    return { session, player, created: true };
  } catch (error) {
    // The same account sent two join requests at the same instant, and the other one won.
    if (constraintOf(error) === 'uq_players_session_user') {
      const existing = await playerRepository.findSeat(session.session_id, user.user_id);
      return { session, player: existing, created: false };
    }
    throw error; // a taken nickname reaches the error handler and answers 409
  }
}

async function list(code) {
  const session = await sessionService.findOrFail(code);
  return playerRepository.findAllBySession(session.session_id);
}

module.exports = { join, list };