const { CustomErrorHandler } = require("../services");
const {
  prisma,
  sendResponse,
  fetchTextFromOpenAiApi,
  executeApiCall,
  processEssayCoachingResponse,
  saveRecommendationsTexts,
} = require("../utils");

const transformInspire = async (req, res, next) => {
  const { userEssay } = req.user;
  const { textSelection, ask } = req.body;

  const essay = userEssay.essay;
  const college = userEssay.collegeApplication.university;

  const collegeName = college.name;
  // const essayPrompt = essay.text;
  const inputConnector = "The selected text is:";
  const askConnector = "Transform the text per this guidance:";
  const prompt = `${collegeName} \n${inputConnector}\n\n${textSelection}\n\n${askConnector}\n\n${ask}`;
  const systemGuidance =
    "Where possible response should be relevant to college.";

  try {
    const revampedText = await fetchTextFromOpenAiApi(
      0.7,
      prompt,
      systemGuidance,
      "gpt-3.5-turbo",
      1,
      1,
      1
    );

    const finalText = userEssay.personalizeText.replace(
      textSelection,
      revampedText
    );

    await prisma.essaySubmission.update({
      where: {
        id: +userEssay.id,
      },
      data: {
        personalizeText: finalText,
      },
    });

    sendResponse(
      res,
      200,
      finalText,
      "Transformation of the selected text done"
    );
  } catch (error) {
    return next(error);
  }
};

const expandInspire = async (req, res, next) => {
  const { userEssay } = req.user;
  const { textSelection, ask } = req.body;

  const essay = userEssay.essay;
  const college = userEssay.collegeApplication.university;

  const collegeName = college.name;
  // const essayPrompt = essay.text;
  const inputConnector = "The selected text is:";
  const askConnector = "Expand the text per this guidance:";
  const prompt = `${collegeName} \n${inputConnector}\n\n${textSelection}\n\n${askConnector}\n\n${ask}`;
  const systemGuidance =
    "Where possible response should be relevant to college.";

  try {
    const revampedText = await fetchTextFromOpenAiApi(
      0.7,
      prompt,
      systemGuidance,
      "gpt-3.5-turbo",
      1,
      1,
      1
    );

    const finalText = userEssay.personalizeText.replace(
      textSelection,
      revampedText
    );

    const essaySubmission = await prisma.essaySubmission.update({
      where: {
        id: +userEssay.id,
      },
      data: {
        personalizeText: finalText,
      },
    });

    sendResponse(res, 200, finalText, "Expansion of the selected text done");
  } catch (error) {
    return next(error);
  }
};

const summarizeInspire = async (req, res, next) => {
  const { userEssay } = req.user;
  const { textSelection, ask } = req.body;

  const essay = userEssay.essay;
  const college = userEssay.collegeApplication.university;

  const collegeName = college.name;
  // const essayPrompt = essay.text;
  const inputConnector = "The selected text is:";
  const askConnector = "Summarize the text per this guidance:";
  const prompt = `${collegeName} \n${inputConnector}\n\n${textSelection}\n\n${askConnector}\n\n${ask}`;
  const systemGuidance =
    "Where possible response should be relevant to college.";

  try {
    const revampedText = await fetchTextFromOpenAiApi(
      0.7,
      prompt,
      systemGuidance,
      "gpt-3.5-turbo",
      1,
      1,
      1
    );

    const finalText = userEssay.personalizeText.replace(
      textSelection,
      revampedText
    );

    await prisma.essaySubmission.update({
      where: {
        id: +userEssay.id,
      },
      data: {
        personalizeText: finalText,
      },
    });

    sendResponse(
      res,
      200,
      finalText,
      "Summarization of the selected text done"
    );
  } catch (error) {
    return next(error);
  }
};

// const essayCoaching = async (req, res, next) => {
//   const { userEssay } = req.user;

//   const essay = userEssay.essay;
//   const college = userEssay.collegeApplication.university;
//   const essayContent = userEssay.personalizeText;
//   const collegeName = college.name;
//   const essayPrompt = essay.text;
//   const essayLength = essay.maxWordLimit;
//   const collegeText = "Evaluate admission essay. The college is:";
//   const essayText = "The essay prompt is:";
//   const essayTextLength = "The requested length is:";
//   const inputConnector = "The essay that needs evaluation starts here:";
//   const askRatingConnector =
//     "That was end of essay. Evaluate per this guidance:";
//   const askRating =
//     "Fill this rating matrix (scale of 5).\nOverall Rating: <Rating>,\nClarity and Coherence: <Rating>,\nGrammar and Spelling: <Rating>,\nStructural Strength: <Rating>,\nEngaging Storytelling: <Rating>,\nPrompt Relevance: <Rating>,\nConciseness: <Rating>";
//   const askFeedbackConnector = "Next, fill the feedback matrix:";
//   const askFeedback =
//     "Clarity and Coherence: <75 word feedback>,\nGrammar and Spelling: <75 word feedback>,\nStructural Strength: <75 word feedback>,\nEngaging Storytelling: <75 word feedback>,\nPrompt Relevance: <75 word feedback>,\nConciseness: <75 word feedback>";
//   const prompt = `${collegeText} ${collegeName} ${essayText} ${essayPrompt} ${essayTextLength} ${essayLength}\n\n${inputConnector}\n\n${essayContent}\n\n${askRatingConnector}\n\n${askRating}\n\n${askFeedbackConnector}\n\n${askFeedback}`;
//   const ratingSystemGuidance =
//     "Give me overall rating (on scale of 5) first and then rating for each of the categories.";
//   const feedbackSystemGuidance = "provide 75-word feedback for each category.";

//   const ratingProcessLogic = [
//     {
//       regex: /Overall Rating: ([0-9](\.[0-9])?)/,
//       errorMessage: "Unexpected rating format for Overall Rating",
//     },
//     {
//       regex: /Clarity and Coherence: ([0-9](\.[0-9])?)/,
//       errorMessage: "Unexpected rating format for Clarity and Coherence",
//     },
//     {
//       regex: /Grammar and Spelling: ([0-9](\.[0-9])?)/,
//       errorMessage: "Unexpected rating format for Grammar and Spelling",
//     },
//     {
//       regex: /Structural Strength: ([0-9](\.[0-9])?)/,
//       errorMessage: "Unexpected rating format for Structural Strength",
//     },
//     {
//       regex: /Compelling Storytelling: ([0-9](\.[0-9])?)/,
//       errorMessage: "Unexpected rating format for Compelling Storytelling",
//     },
//     {
//       regex: /Prompt Relevance: ([0-9](\.[0-9])?)/,
//       errorMessage: "Unexpected rating format for Prompt Relevance",
//     },
//     {
//       regex: /Conciseness: ([0-9](\.[0-9])?)/,
//       errorMessage: "Unexpected rating format for Conciseness",
//     },
//   ];

//   const feedbackProcessLogic = [
//     {
//       regex: /Clarity and Coherence: (.*?)(?=\n\n|Grammar and Spelling:|$)/s,
//       errorMessage: "Failed to extract feedback for Clarity and Coherence",
//     },
//     {
//       regex: /Grammar and Spelling: (.*?)(?=\n\n|Structural Strength:|$)/s,
//       errorMessage: "Failed to extract feedback for Grammar and Spelling",
//     },
//     {
//       regex: /Structural Strength: (.*?)(?=\n\n|Compelling Storytelling:|$)/s,
//       errorMessage: "Failed to extract feedback for Structural Strength",
//     },
//     {
//       regex: /Compelling Storytelling: (.*?)(?=\n\n|Prompt Relevance:|$)/s,
//       errorMessage: "Failed to extract feedback for Compelling Storytelling",
//     },
//     {
//       regex: /Prompt Relevance: (.*?)(?=\n\n|Conciseness:|$)/s,
//       errorMessage: "Failed to extract feedback for Prompt Relevance",
//     },
//     {
//       regex: /Conciseness: (.*?)(?=\n\n|$)/s,
//       errorMessage: "Failed to extract feedback for Conciseness",
//     },
//   ];

//   try {
//     const makeApiCall = async (systemGuidance, processLogic) => {
//       const assistantMessage = await fetchTextFromOpenAiApi(
//         0.7,
//         prompt,
//         systemGuidance,
//         "gpt-3.5-turbo",
//         0.8,
//         1,
//         1
//       );

//       return processResponseOfEssayCoaching(assistantMessage, processLogic);
//     };

//     const [ratings, feedbacks] = await Promise.all([
//       makeApiCall(ratingSystemGuidance, ratingProcessLogic),
//       makeApiCall(feedbackSystemGuidance, feedbackProcessLogic),
//     ]);

//     sendResponse(
//       res,
//       200,
//       {
//         ratings,
//         feedbacks,
//       },
//       "Feedback of essay is successfully generated"
//     );
//   } catch (error) {
//     return next(error);
//   }
// };

const essayCoaching = async (req, res, next) => {
  const { userEssay } = req.user;

  const essay = userEssay.essay;
  const college = userEssay.collegeApplication.university;
  const essayContent = userEssay.personalizeText;
  const collegeName = college.name;
  const essayPrompt = essay.text;
  const essayLength = essay.maxWordLimit;
  const collegeText = "Evaluate admission essay. The college is:";
  const essayText = "The essay prompt is:";
  const essayTextLength = "The requested length is:";
  const inputConnector = "The essay that needs evaluation starts here:";
  const askRatingConnector =
    "That was end of essay. Evaluate per this guidance:";
  const askRating =
    "Fill this rating matrix (scale of 5).\nOverall Rating:<Rating>\nClarity and Coherence: <Rating>,\nGrammar and Spelling: <Rating>,\nStructural Strength: <Rating>,\nEngaging Storytelling: <Rating>,\nPrompt Relevance: <Rating>,\nConciseness: <Rating>.";
  const askFeedbackConnector = "Next, fill the feedback matrix:";
  const askFeedback =
    "Clarity and Coherence: <75 word feedback>,\nGrammar and Spelling: <75 word feedback>,\nStructural Strength: <75 word feedback>,\nEngaging Storytelling: <75 word feedback>,\nPrompt Relevance: <75 word feedback>,\nConciseness: <75 word feedback>.";
  const prompt = `${collegeText} ${collegeName} ${essayText} ${essayPrompt} ${essayTextLength} ${essayLength}\n\n${inputConnector}\n\n${essayContent}\n\n${askRatingConnector}\n\n${askRating}\n\n${askFeedbackConnector}\n\n${askFeedback}`;
  const systemGuidance =
    "Give me overall rating (on scale of 5) first and then rating for each of the categories. Separately, provide a 75-word feedback for each category.";

  const maxRetries = 3;
  let retryCount = 0;

  const categories = [
    "Clarity and Coherence",
    "Grammar and Spelling",
    "Structural Strength",
    "Engaging Storytelling",
    "Prompt Relevance",
    "Conciseness",
  ];
  let totalRating = 0;
  let output = "Overall Rating: ";

  try {
    const makeApiCall = async () => {
      const assistantMessage = await fetchTextFromOpenAiApi(
        0.7,
        prompt,
        systemGuidance,
        "gpt-3.5-turbo",
        0.8,
        1,
        1
      );

      categories.forEach((category) => {
        const ratingRegex = new RegExp(`${category}:\\s*([0-9](\\.[0-9])?)`);
        const ratingMatch = assistantMessage.match(ratingRegex);
        const feedbackRegex = new RegExp(
          `${category}:\\s*\\n(.*?)(?=\\n\\n|$)`,
          "s"
        );
        const feedbackMatch = assistantMessage.match(feedbackRegex);

        if (ratingMatch) {
          const ratingValue = ratingMatch[1];
          totalRating += parseFloat(ratingValue);
          output += `\n${category} rating: ${ratingValue}`;
        } else {
          output += `\n${category} rating: Not found`;
        }

        if (feedbackMatch && feedbackMatch[1]) {
          const feedback = feedbackMatch[1].trim();
          output += `\n${category} feedback: ${feedback}`;
        } else {
          output += `\n${category} feedback: Not found`;
        }
      });

      const overallRating = (totalRating / categories.length).toFixed(1);
      output = output.replace(
        "Overall Rating: ",
        `Overall Rating: ${overallRating}`
      );

      const allRequiredInformationExtracted = !output.includes("Not found");

      if (allRequiredInformationExtracted) {
        const feedbackObj = processEssayCoachingResponse(output);

        await prisma.essaySubmission.update({
          where: {
            id: userEssay.id,
          },
          data: {
            counselling: feedbackObj,
          },
        });

        sendResponse(
          res,
          200,
          feedbackObj,
          "Feedback of essay is successfully generated"
        );
      } else if (retryCount < maxRetries) {
        retryCount++;
        await makeApiCall();
      } else {
        return next(
          CustomErrorHandler.customError(
            404,
            "the server encountered delays - please try again in a moment"
          )
        );
      }
    };

    await makeApiCall();
  } catch (error) {
    return next(error);
  }
};

const clarityAndCoherence = async (req, res, next) => {
  const { userEssay } = req.user;
  const ask = "Evaluate the essay ONLY for Clarity and Coherence.";

  try {
    const numberedBulletedList = await executeApiCall(userEssay, ask);

    await saveRecommendationsTexts(
      userEssay.id,
      userEssay.recommendations,
      numberedBulletedList,
      "Clarity and Coherence"
    );

    sendResponse(
      res,
      200,
      numberedBulletedList,
      "Clarity & Coherence evaluation completed."
    );
  } catch (error) {
    return next(error);
  }
};

const compellingStorytelling = async (req, res, next) => {
  const { userEssay } = req.user;
  const ask = "Evaluate the essay ONLY for Engaging Storytelling.";

  try {
    const numberedBulletedList = await executeApiCall(userEssay, ask);

    await saveRecommendationsTexts(
      userEssay.id,
      userEssay.recommendations,
      numberedBulletedList,
      "Engaging Storytelling"
    );

    sendResponse(
      res,
      200,
      numberedBulletedList,
      "Compelling & Storytelling evaluation completed."
    );
  } catch (error) {
    return next(error);
  }
};

const conciseness = async (req, res, next) => {
  const { userEssay } = req.user;
  const ask = "Evaluate the essay ONLY for Conciseness.";

  try {
    const numberedBulletedList = await executeApiCall(userEssay, ask);

    await saveRecommendationsTexts(
      userEssay.id,
      userEssay.recommendations,
      numberedBulletedList,
      "Conciseness"
    );

    sendResponse(
      res,
      200,
      numberedBulletedList,
      "Compelling & Storytelling evaluation completed."
    );
  } catch (error) {
    return next(error);
  }
};

const grammarSpelling = async (req, res, next) => {
  const { userEssay } = req.user;
  const ask = "Evaluate the essay ONLY for Grammar and Spelling.";

  try {
    const numberedBulletedList = await executeApiCall(userEssay, ask);

    await saveRecommendationsTexts(
      userEssay.id,
      userEssay.recommendations,
      numberedBulletedList,
      "Grammar and Spelling"
    );

    sendResponse(
      res,
      200,
      numberedBulletedList,
      "Grammar & Spelling evaluation completed."
    );
  } catch (error) {
    return next(error);
  }
};

const promptRelevance = async (req, res, next) => {
  const { userEssay } = req.user;
  const ask = "Evaluate the essay ONLY for Prompt Relevance.";

  try {
    const numberedBulletedList = await executeApiCall(userEssay, ask);

    await saveRecommendationsTexts(
      userEssay.id,
      userEssay.recommendations,
      numberedBulletedList,
      "Prompt Relevance"
    );

    sendResponse(
      res,
      200,
      numberedBulletedList,
      "Prompt & Relevance evaluation completed."
    );
  } catch (error) {
    return next(error);
  }
};

const structuralStrength = async (req, res, next) => {
  const { userEssay } = req.user;
  const ask = "Evaluate the essay ONLY for Structural Strength.";

  try {
    const numberedBulletedList = await executeApiCall(userEssay, ask);

    await saveRecommendationsTexts(
      userEssay.id,
      userEssay.recommendations,
      numberedBulletedList,
      "Structural Strength"
    );

    sendResponse(
      res,
      200,
      numberedBulletedList,
      "Structural & Strength evaluation completed."
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  transformInspire,
  expandInspire,
  summarizeInspire,
  essayCoaching,
  clarityAndCoherence,
  compellingStorytelling,
  conciseness,
  grammarSpelling,
  promptRelevance,
  structuralStrength,
};
