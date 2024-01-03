const axios = require("axios");

const { YEAR, essayModes } = require("../constants");
const { prisma } = require("./prisma");
const { OPEN_AI_API_KEY } = require("../config");

const getPrompt = async (userEssay) => {
  const {
    collegeApplication: {
      userId: studentId,
      university: { name },
      user,
    },
    essay: { text, categoryId, maxWordLimit },
  } = userEssay;

  const [essayCategory, allUserQuestions] = await Promise.all([
    prisma.essayCategory.findUnique({
      where: { id: +categoryId },
    }),
    prisma.interviewQuestion.findMany({
      where: {
        OR: [{ studentId: null }, { studentId }],
      },
      include: {
        interviewAnswers: {
          where: { studentId },
          select: {
            answerText: true,
            interviewQuestionId: true,
            customAnswer: true,
          },
        },
      },
    }),
  ]);

  const allUserAnswers = allUserQuestions
    .map((question) => question.interviewAnswers[0])
    .filter((answer) => answer);

  const allUserAdjectivesAnswers = allUserQuestions
    .filter((question) => question.dependentOnQuestionId)
    .map((question) => ({
      id: question.id,
      answer: question.interviewAnswers[0],
    }))
    .sort((a, b) => a.id - b.id);

  const allPromptQuestions =
    await prisma.interviewQuestionEssayCategory.findMany({
      where: {
        essayCategoryLetter: {
          in: essayCategory.list,
        },
      },
      orderBy: {
        essayCategoryLetter: "asc",
      },
    });

  const promptQuestionsForZAndB = allPromptQuestions.filter(
    (pq) => pq.essayCategoryLetter === "b" || pq.essayCategoryLetter === "z"
  );

  const userMajorQuestionAnswer =
    promptQuestionsForZAndB.length > 0 &&
    allUserAnswers.find((answer) =>
      promptQuestionsForZAndB.find(
        (pq) => pq.interviewQuestionId === answer.interviewQuestionId
      )
    );

  const promptQuestionsByInterviewId = allPromptQuestions
    .filter(
      (q) => q.essayCategoryLetter !== "b" && q.essayCategoryLetter !== "z"
    )
    .reduce((grouped, object) => {
      let found = grouped.find(
        (item) => item.key === object.interviewQuestionId
      );
      if (found) {
        found.questions.push(object);
      } else {
        grouped.push({ key: object.interviewQuestionId, questions: [object] });
      }
      return grouped;
    }, []);

  let promptContent = "";
  promptQuestionsByInterviewId.forEach((item) => {
    if (!item.key) {
      allUserAdjectivesAnswers.forEach(({ answer }, i) => {
        const promptQuestion = item.questions[i];
        promptContent = `${promptContent} ${
          promptQuestion.promptQuestionBefore || ""
        } ${answer.answerText} ${promptQuestion.promptQuestionAfter || ""}`;
      });
    } else if (item.questions.length > 1 && item.key) {
      const answer = allUserAnswers.find(
        (answer) => answer.interviewQuestionId === +item.key
      );
      if (answer) {
        Object.keys(answer.customAnswer).forEach((answerKey, i) => {
          const answerVal = answer.customAnswer[answerKey];
          if (!answerKey.includes("type"))
            promptContent = `${promptContent}
                  ${
                    item.questions[i]?.promptQuestionBefore || ""
                  } ${answerVal}  ${
              item.questions[i]?.promptQuestionAfter || ""
            }`;
        });
      }
    } else {
      const questionsEssayCategory = item.questions[0];
      const questionsEssayCategoryAnswer = allUserAnswers.find(
        (answer) =>
          answer.interviewQuestionId ===
          questionsEssayCategory.interviewQuestionId
      );

      if (
        questionsEssayCategoryAnswer &&
        questionsEssayCategoryAnswer.customAnswer
      ) {
        if (Array.isArray(questionsEssayCategoryAnswer.customAnswer)) {
          promptContent = `${promptContent} ${
            questionsEssayCategory?.promptQuestionBefore || ""
          } ${questionsEssayCategoryAnswer.customAnswer.join(", ")} ${
            questionsEssayCategory?.promptQuestionAfter || ""
          }`;
        } else {
          Object.values(questionsEssayCategoryAnswer.customAnswer).forEach(
            (answer) => {
              promptContent = `${promptContent} ${
                questionsEssayCategory?.promptQuestionBefore || ""
              } ${answer} ${questionsEssayCategory?.promptQuestionAfter || ""}`;
            }
          );
        }
      } else if (
        questionsEssayCategoryAnswer &&
        questionsEssayCategoryAnswer.answerText
      ) {
        promptContent = `${promptContent} ${
          questionsEssayCategory?.promptQuestionBefore || ""
        } ${questionsEssayCategoryAnswer.answerText} ${
          questionsEssayCategory?.promptQuestionAfter || ""
        }`;
      }
    }
  });

  const uniName = essayCategory.list.includes("a")
    ? `End the essay by stating why the ${name} is perfect for me.`
    : "";

  const userMajor = userMajorQuestionAnswer
    ? essayCategory.list.includes("z")
      ? `I am interested in ${userMajorQuestionAnswer.answerText}`
      : `Highlight why the school is good for students planning to major in ${userMajorQuestionAnswer.answerText}. Include school-specific examples of why.`
    : "";

  const initialPrompt =
    user.essayMode === essayModes.brainstorm
      ? `Write a ${maxWordLimit} word essay for college admission. The topic is ${text} End the essay by stating why the ${uniName}`
      : `Need an Admission application ESSAY OUTLINE for the topic ${text} The college I am applying to is ${name} Below is more about me. Use the information to provide a CLEAR  ESSAY OUTLINE ONLY.`;

  const lastPrompt =
    user.essayMode === essayModes.brainstorm
      ? "Use the information to write the IDEAL ESSAY."
      : "Use the information to provide an ESSAY OUTLINE ONLY.";

  const finalPrompt = `${initialPrompt} ${userMajor} ${promptContent} ${lastPrompt}`;

  return {
    prompt: finalPrompt,
    essayCategory,
  };
};

const getEssaysWithTheirStatus = (essays, essaySubmissions) => {
  return essays.map((essay) => {
    const updatedEssaySubmission = essaySubmissions.find(
      (es) => es.essayPromptId === essay.id
    );
    return {
      ...essay,
      isAIGenerated: updatedEssaySubmission?.isCompleted,
      isAIGenerating:
        !!updatedEssaySubmission?.v1 ||
        !!updatedEssaySubmission?.personalizeText,
      selected: !!updatedEssaySubmission,
    };
  });
};

const getCollegeWithStatus = (essaySubmissions) => {
  const completed = essaySubmissions.every(
    (submission) => submission.isCompleted
  );

  const inProgress = essaySubmissions.some(
    (submission) =>
      (submission.v1 || submission.personalizeText) && !submission.isCompleted
  );

  if (completed) {
    return "completed";
  } else if (inProgress) {
    return "inProgress";
  } else {
    return "notStarted";
  }
};

const mapTypeToNumber = (type) => {
  if (type === "safety") return 0;
  if (type === "target") return 1;
  if (type === "reach") return 2;
  return -1; // just in case
};

const calculateDaysLeft = (deadlineDate) => {
  const today = new Date();

  // Set the time for both dates to midnight to get a pure day difference
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const differenceInTime = deadlineDate.getTime() - today.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert milliseconds to days

  return Math.ceil(differenceInDays);
};

const calculateWeeksLeft = (deadlineDate) => {
  const currentDate = new Date();
  const targetDate = new Date(YEAR, 9, 1); // 9 represents October

  const today =
    currentDate.getTime() > targetDate.getTime() ? currentDate : targetDate;

  // Set the time for both dates to midnight to get a pure day difference

  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const differenceInTime = deadlineDate.getTime() - today.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert milliseconds to days
  const differenceInWeeks = differenceInDays / 7; // Convert days to weeks

  return Math.ceil(differenceInWeeks);
};

const calculateRangeValue = (deadlineDate) => {
  const differenceInWeeks = calculateDaysLeft(deadlineDate) / 7;
  return Math.ceil(differenceInWeeks);
};

const generateWeekRanges = (maxWeeks) => {
  const categories = [];
  let startWeek = 1;

  while (startWeek <= maxWeeks) {
    let endWeek = startWeek + 3; // This gives a range of 4 weeks. You can adjust as needed.
    if (endWeek > maxWeeks) endWeek = maxWeeks;

    categories.push(`${startWeek}-${endWeek}`);
    startWeek = endWeek + 1;
  }

  return categories;
};

const fetchTextFromOpenAiApi = async (
  temperature,
  prompt,
  systemGuidance,
  model,
  top_p,
  frequency_penalty,
  presence_penalty,
  tokens
) => {
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPEN_AI_API_KEY}`,
  };

  const requestBody = {
    model: model,
    messages: [
      {
        content: prompt,
        role: "user",
      },
      {
        content: systemGuidance,
        role: "system",
      },
    ],
    temperature,
    ...(tokens && { max_tokens: tokens }),
    top_p,
    frequency_penalty,
    presence_penalty,
  };

  const { data } = await axios.post(apiUrl, requestBody, { headers });
  return data.choices[0].message.content;
};

const processResponse = (assistantMessage) => {
  const recommendationRegex = /\d+\.\s+(.*?)(?=\n\n\d+\.|\n*$)/g;

  let recommendations = [];

  let match;
  while ((match = recommendationRegex.exec(assistantMessage))) {
    recommendations.push(match[1]);
  }

  return recommendations
    .map((recommendation, index) => {
      return `${index + 1}. ${recommendation}`;
    })
    .join("\n");
};

const executeApiCall = async (userEssay, ask) => {
  const essay = userEssay.essay;
  const college = userEssay.collegeApplication.university;
  const essayContent = userEssay.personalizeText;
  const collegeName = college.name;
  const essayPrompt = essay.text;
  const essayLength = essay.maxWordLimit;

  const collegeText = "Evaluate admission essay. The college is:";
  const essayText = "The essay prompt is:";
  const inputConnector = "The essay that needs evaluation starts here:";
  const askConnector = "That was end of essay. Evaluate per this guidance:";
  const essayTextLength = "The requested length is:";
  const systemGuidance =
    "Provide 5 impactful recommendations to make the essay a 5/5 in the asked for category. Focus on the single category only. List should be numbered & bulletted. Recommendations that are specific, actionable are preferred.";
  const prompt = `${collegeText} ${collegeName} ${essayText} ${essayPrompt} ${essayTextLength} ${essayLength}\n\n${inputConnector}\n\n${essayContent}\n\n${askConnector}\n\n${ask}`;

  for (let i = 0; i < 3; i++) {
    try {
      const assistantMessage = await fetchTextFromOpenAiApi(
        0.7,
        prompt,
        systemGuidance,
        "gpt-3.5-turbo",
        1,
        1,
        1
      );
      if (assistantMessage) {
        return processResponse(assistantMessage);
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed with error: ${error}`);
    }
  }
};

const processEssayCoachingResponse = (outputStr) => {
  const lines = outputStr.split("\n");
  const data = {};
  let currentCategory = "";
  lines.forEach((line) => {
    if (line.includes(": ")) {
      const [key, value] = line.split(": ");
      if (key.includes(" rating")) {
        currentCategory = key.replace(" rating", "");
        if (!data[currentCategory]) {
          data[currentCategory] = { rating: parseFloat(value) };
        }
      } else if (key.includes(" feedback")) {
        data[currentCategory].feedback = value;
      } else {
        data[key] = value;
      }
    }
  });
  return data;
};

const processResponseOfEssayCoaching = (response, processLogic) => {
  let extractedValues = [];
  processLogic.forEach(({ regex, errorMessage }) => {
    const match = response.match(regex);
    if (match && match[1]) {
      extractedValues.push(match[1].trim());
    } else {
      console.error(errorMessage);
      extractedValues.push("Not found");
    }
  });
  return extractedValues;
};

const saveRecommendationsTexts = async (
  essayId,
  oldRecommendations,
  newRecommendation,
  recommendationKey
) => {
  const recommendations = {
    ...oldRecommendations,
    [recommendationKey]: newRecommendation,
  };

  await prisma.essaySubmission.update({
    where: {
      id: +essayId,
    },
    data: {
      recommendations,
    },
  });
};

module.exports = {
  getPrompt,
  getEssaysWithTheirStatus,
  mapTypeToNumber,
  calculateRangeValue,
  generateWeekRanges,
  calculateDaysLeft,
  calculateWeeksLeft,
  fetchTextFromOpenAiApi,
  executeApiCall,
  processEssayCoachingResponse,
  processResponseOfEssayCoaching,
  getCollegeWithStatus,
  saveRecommendationsTexts,
};
