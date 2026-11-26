// What the owner is allowed to see of a question.
function toJson(question) {
  return {
    id: question.question_id,
    set_id: question.set_id,
    position: question.position,
    text: question.question_text,
    time_limit_sec: question.time_limit_sec,
    choices: (question.choices || []).map((choice) => ({
      id: choice.choice_id,
      index: choice.choice_index,
      text: choice.choice_text,
      is_correct: choice.is_correct,
    })),
  };
}

module.exports = { toJson };