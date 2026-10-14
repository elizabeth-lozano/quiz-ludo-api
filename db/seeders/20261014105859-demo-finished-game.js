'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const db = queryInterface.sequelize;

    // 1. the host, created by the earlier seeder
    const [[host]] = await db.query("SELECT user_id FROM users WHERE school_id = '2099-0001'");

    // 2. a question set with three questions
    await queryInterface.bulkInsert('question_sets', [
      { host_id: host.user_id, title: 'Library Orientation Basics', category: 'Library Skills',
        description: 'Seed set about using the library.' },
    ]);
    const [[set]] = await db.query("SELECT set_id FROM question_sets WHERE title = 'Library Orientation Basics'");

    const questions = [
      { text: 'Which system do many libraries use to arrange nonfiction books by subject?',
        choices: ['Dewey Decimal Classification', 'Alphabetical by title', 'By book color', 'By publication year'], correct: 0 },
      { text: 'Where do you find recent newspapers and magazines?',
        choices: ['Reference section', 'Fiction shelves', 'Periodicals section', "Children's corner"], correct: 2 },
      { text: 'What do you usually need to borrow a book?',
        choices: ["A guard's permission", 'A valid school ID', 'A bookmark', 'A bag tag'], correct: 1 },
    ];
    await queryInterface.bulkInsert('questions', questions.map((q) => ({
      set_id: set.set_id, question_text: q.text, time_limit_sec: 15,
    })));
    const [qRows] = await db.query(
      'SELECT question_id, question_text FROM questions WHERE set_id = :setId',
      { replacements: { setId: set.set_id } });
    const idByText = Object.fromEntries(qRows.map((r) => [r.question_text, r.question_id]));

    // 3. their answer choices
    const choiceRows = [];
    questions.forEach((q) => q.choices.forEach((text, i) => choiceRows.push({
      question_id: idByText[q.text], choice_index: i, choice_text: text, is_correct: i === q.correct,
    })));
    await queryInterface.bulkInsert('choices', choiceRows);

    // 4. a game that has ENDED
    await queryInterface.bulkInsert('game_sessions', [{
      set_id: set.set_id, host_id: host.user_id, join_pin: '418263', status: 'CLOSED',
      current_question_index: 3, last_die: 5, last_event: 'Mika brought both tokens home and won!',
      winner_nickname: 'Mika',
      started_at: new Date('2026-10-09T01:00:00Z'), ended_at: new Date('2026-10-09T01:12:00Z'),
    }]);
    const [[game]] = await db.query("SELECT session_id FROM game_sessions WHERE join_pin = '418263'");

    // 5. four seats: Mika wins, Jon and Lia tie on score, Ben leaves early (a bot takes his seat)
    const [users] = await db.query(
      "SELECT user_id, school_id FROM users WHERE school_id IN ('2099-1001','2099-1002','2099-1003','2099-1004')");
    const uid = Object.fromEntries(users.map((u) => [u.school_id, u.user_id]));
    const seats = [
      { school: '2099-1001', nickname: 'Mika', color: 'Red', score: 520, t1: 28, t2: 28, bot: false },
      { school: '2099-1002', nickname: 'Jon', color: 'Green', score: 340, t1: 20, t2: 9, bot: false },
      { school: '2099-1003', nickname: 'Lia', color: 'Yellow', score: 340, t1: 14, t2: 0, bot: false },
      { school: '2099-1004', nickname: 'Ben', color: 'Blue', score: 100, t1: 3, t2: 0, bot: true },
    ];
    await queryInterface.bulkInsert('players', seats.map((s) => ({
      session_id: game.session_id, user_id: uid[s.school], nickname: s.nickname, color: s.color,
      score: s.score, token_1_pos: s.t1, token_2_pos: s.t2, is_bot: s.bot,
    })));
    const [pRows] = await db.query(
      'SELECT player_id, nickname FROM players WHERE session_id = :sid',
      { replacements: { sid: game.session_id } });
    const pid = Object.fromEntries(pRows.map((p) => [p.nickname, p.player_id]));

    // 6. their answers: [was it correct, response time in ms], one per question
    const [cRows] = await db.query(
      'SELECT choice_id, question_id, is_correct FROM choices WHERE question_id IN (:ids)',
      { replacements: { ids: Object.values(idByText) } });
    const plan = {
      Mika: [[true, 3100], [true, 4200], [true, 2900]],
      Jon: [[true, 5200], [false, 6100], [true, 4800]],
      Lia: [[false, 7400], [true, 5600], [false, 8000]],
      Ben: [[true, 6900]],
    };
    const answers = [];
    Object.entries(plan).forEach(([nick, list]) => list.forEach(([ok, ms], qi) => {
      const qid = idByText[questions[qi].text];
      const choice = cRows.find((c) => c.question_id === qid && c.is_correct === ok);
      answers.push({ player_id: pid[nick], question_id: qid, choice_id: choice.choice_id,
        q_index: qi, is_correct: ok, response_time_ms: ms });
    }));
    await queryInterface.bulkInsert('answers', answers);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('game_sessions', { join_pin: '418263' }, {});
    await queryInterface.bulkDelete('question_sets', { title: 'Library Orientation Basics' }, {});
  },
};