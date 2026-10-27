const { matchedData } = require('express-validator');
const playerService = require('../services/player.service');

async function join(req, res) {
  const { code, nickname } = matchedData(req);
  const { session, player, created } = await playerService.join(code, nickname, req.user);

  // 201 Created for a new seat, 200 OK when the account already had one (rejoin).
  res.status(created ? 201 : 200).json({
    player_id: player.player_id,
    nickname: player.nickname,
    color: player.color,
    score: player.score,
    tokens: [player.token_1_pos, player.token_2_pos],
    rejoined: !created,
    session: {
      code: session.join_pin,
      status: session.status,
      current_question_index: session.current_question_index,
    },
  });
}

// Nicknames and scores only. Never the school ID, name or email of another player.
async function list(req, res) {
  const { code } = matchedData(req);
  const players = await playerService.list(code);
  res.status(200).json(
    players.map((p) => ({ nickname: p.nickname, color: p.color, score: p.score, is_bot: p.is_bot }))
  );
}

module.exports = { join, list };