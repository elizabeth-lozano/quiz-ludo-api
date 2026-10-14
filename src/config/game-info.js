// What the Library Game Hub shows about YOUR game (Hub Contract, rule 1).
// Lab Step 6: replace every CHANGE_ME value with your own.
const pkg = require('../../package.json');

module.exports = {
  slug: 'quiz-ludo',            // your group's game, lower case with hyphens, for example shelf-climb
  name: 'Quiz Ludo',            // the name players will see
  team: 'Group 10 (3-1)',            // your group's name and section, for example Bookworms (3-1)
  developer: 'elizabeth-lozano',       // YOUR GitHub username: this build is yours
  description: 'Answer first, roll the dice, and race your tokens home.',     // one sentence about how the game is played
  min_players: 1,               // change to the limits your game is designed for
  max_players: 4,
  version: pkg.version,         // read from package.json, do not edit here
};
