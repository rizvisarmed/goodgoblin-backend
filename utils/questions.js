const reorderQuestions = (questions) => {
  const reorderedQuestions = [];

  for (const question of questions) {
    if (question.dependentOnQuestionId === null) {
      reorderedQuestions.push(question);
    }
  }

  for (const parentQuestion of reorderedQuestions.slice()) {
    for (const question of questions) {
      if (question.dependentOnQuestionId === parentQuestion.id) {
        reorderedQuestions.splice(
          reorderedQuestions.indexOf(parentQuestion) + 1,
          0,
          question
        );
      }
    }
  }

  return reorderedQuestions;
};

module.exports = {
  reorderQuestions,
};
