const axios = require("axios");

const {
  prisma,
  sendResponse,
  getPrompt,
  sendEmail,
  getEssaysWithTheirStatus,
  mapTypeToNumber,
  generateWeekRanges,
} = require("../utils");
const { CustomErrorHandler } = require("../services");
const {
  ESSAYGEN_TOKEN,
  ESSAY_GEN_NOTIFICATION_TEMPLATE_ID,
  AI_CHECK_API_KEY,
  FRONTEND_URL,
} = require("../config");
const { sendGridEmailAddresses } = require("../constants");
const { calculateWeeksLeft } = require("../utils/essay");

const getCollegeApplicationDetails = async (collegeApplicationId) => {
  return await prisma.userUniversityDeadline.findUnique({
    where: {
      id: +collegeApplicationId,
    },
    include: {
      essaySubmissions: true,
      university: {
        include: {
          essays: true,
        },
      },
    },
  });
};

const createNewEssay = async (req, res, next) => {
  const { text, minWordLimit, maxWordLimit, universityId } = req.body;
  try {
    const newEssay = await prisma.essay.create({
      data: {
        text,
        minWordLimit,
        maxWordLimit,
        universityId: parseInt(universityId),
      },
    });
    sendResponse(res, 201, newEssay, "New Essay Successfully Created");
  } catch (error) {
    return next(error);
  }
};

const getAllSelectedUniversitiesEssays = async (req, res, next) => {
  const { id: studentId } = req.user;

  try {
    const selections = await prisma.userUniversityDeadline.findMany({
      where: { userId: +studentId },
      include: {
        essaySubmissions: true,
        university: {
          select: {
            name: true,
            numberOfRequiredEssays: true,
            isDefault: true,
            essays: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
        deadline: {
          select: {
            id: true,
            name: true,
            deadline: true,
          },
        },
      },
    });

    const selectedUniversities = selections.map((selection) => {
      const selectedEssayIds = selection.essaySubmissions.map(
        (es) => es.essayPromptId
      );
      const noOfSelectedEssays = selectedEssayIds.length;
      const essays = getEssaysWithTheirStatus(
        selection.university.essays,
        selection.essaySubmissions
      );

      return {
        id: selection.id,
        name: selection.university.name,
        numberOfRequiredEssays: selection.university.numberOfRequiredEssays,
        essays,
        isDefault: selection.university.isDefault,
        deadlineId: selection.deadline.id,
        deadlineName: selection.deadline.name,
        deadline: selection.deadline.deadline,
        type: selection.type,
        noOfSelectedEssays,
      };
    });

    sendResponse(
      res,
      200,
      selectedUniversities,
      "All selected universities essays fetched."
    );
  } catch (error) {
    return next(error);
  }
};

const getAllSelectedUniversitiesWithEssaysForDashboard = async (
  req,
  res,
  next
) => {
  const { id: studentId } = req.user;

  try {
    const selections = await prisma.userUniversityDeadline.findMany({
      where: {
        userId: +studentId,
      },
      select: {
        id: true,
        university: {
          select: {
            name: true,
            isDefault: true,
          },
        },
        essaySubmissions: {
          select: {
            id: true,
            essayPromptId: true,
            final: true,
            finalInput: true,
            isGenerating: true,
            personalizeText: true,
            noOfRegenerations: true,
            isAllowForEssential: true,
            v1: true,
            v2: true,
            v3: true,
            submission: true,
            isCompleted: true,
            essay: {
              select: {
                text: true,
              },
            },
          },
        },
      },
    });

    const userSelectedColleges = selections
      .filter((selection) => selection.essaySubmissions.length)
      .map((selection) => {
        const essayStatuses = {
          notStarted: 0,
          inProgress: 0,
          completed: 0,
        };
        const selectedEssays = selection.essaySubmissions.map(
          ({
            id,
            essayPromptId,
            isGenerating,
            v1,
            v2,
            v3,
            noOfRegenerations,
            final,
            essay,
            personalizeText,
            ...es
          }) => {
            const updatedEssay = {
              id,
              essayId: essayPromptId,
              isGenerating,
              essayText: essay.text,
              v1,
              v2,
              v3,
              noOfRegenerations,
              final,
              inProgress: !!(v1 || personalizeText),
              notStarted: !v1 && !personalizeText,
              personalizeText,
              ...Object.fromEntries(
                Object.entries(es).map(([key, value]) => [key, Boolean(value)])
              ),
            };

            if (updatedEssay.isCompleted) essayStatuses.completed++;
            else if (updatedEssay.v1 || updatedEssay.personalizeText)
              essayStatuses.inProgress++;
            else essayStatuses.notStarted++;
            return updatedEssay;
          }
        );
        return {
          id: selection.id,
          universityName: selection.university.name,
          isDefault: selection.university.isDefault,
          selectedEssays,
          essayStatuses,
        };
      });

    sendResponse(
      res,
      200,
      userSelectedColleges,
      "All selected universities essays fetched."
    );
  } catch (error) {
    return next(error);
  }
};

const submitEssay = async (req, res, next) => {
  const { collegeApplicationId, essayId } = req.body;

  try {
    const college = await getCollegeApplicationDetails(collegeApplicationId);

    const isEssayAssociated = college.university.essays.some(
      (essay) => essay.id === +essayId
    );

    if (!isEssayAssociated) {
      return next(
        CustomErrorHandler.customError(
          400,
          "The provided essay is not associated with the selected college."
        )
      );
    }

    const existingSubmission = college.essaySubmissions.find(
      (submission) => submission.essayPromptId === +essayId
    );

    if (existingSubmission?.v1) {
      return next(
        CustomErrorHandler.customError(
          400,
          "The provided essay is AI-generated and cannot be selected or deselected."
        )
      );
    }

    if (existingSubmission) {
      await prisma.essaySubmission.delete({
        where: {
          id: existingSubmission.id,
        },
      });
    } else {
      await prisma.essaySubmission.create({
        data: {
          collegeApplicationId: +collegeApplicationId,
          essayPromptId: +essayId,
          noOfAiScans: "3",
        },
      });
    }

    const updatedCollege = await getCollegeApplicationDetails(
      collegeApplicationId
    );

    const essays = getEssaysWithTheirStatus(
      updatedCollege.university.essays,
      updatedCollege.essaySubmissions
    );

    const responseData = {
      universityId: updatedCollege.university.id,
      name: updatedCollege.university.name,
      essays,
    };

    sendResponse(
      res,
      200,
      responseData,
      existingSubmission
        ? "Essay successfully deselected."
        : "Essay successfully selected."
    );
  } catch (error) {
    return next(error);
  }
};

const getAllSelectedEssays = async (req, res, next) => {
  const { id: studentId } = req.user;

  const { page = 1, pageSize = 10, sortOrder = "asc", sortField } = req.query;
  const skip = (page - 1) * pageSize;

  try {
    const essays = await prisma.essaySubmission.findMany({
      where: {
        collegeApplication: {
          userId: studentId,
        },
      },
      include: {
        collegeApplication: {
          include: {
            university: true,
          },
        },
        essay: true,
      },
      skip: parseInt(skip),
      take: parseInt(pageSize),
      orderBy: [
        { v1: "asc" },
        { isGenerating: "desc" },
        { generatedOn: "desc" },
        ...(sortField ? { [sortField]: sortOrder } : []),
      ],
    });

    const totalRecords = await prisma.essaySubmission.count({
      where: {
        collegeApplication: {
          userId: studentId,
        },
      },
    });

    const result = essays.map((submission) => {
      const { collegeApplication, essay } = submission;
      const { university } = collegeApplication;

      const {
        essay: _,
        collegeApplication: __,
        ...submissionWithoutEssayAndCollegeApplication
      } = submission;

      return {
        ...submissionWithoutEssayAndCollegeApplication,
        collegeName: university.name,
        essayId: essay.id,
        essayText: essay.text,
      };
    });

    const totalPages = Math.ceil(totalRecords / pageSize);

    sendResponse(
      res,
      200,
      {
        data: result,
        currentPage: page,
        pageSize,
        totalPages,
        totalRecords,
      },
      "Student submitted essays fetched successfully."
    );
  } catch (error) {
    return next(error);
  }
};

const getEssaySubmissionsStats = async (req, res, next) => {
  const { id: studentId } = req.user;

  try {
    const [completed, inProgress, notGenerated] = await Promise.all([
      prisma.essaySubmission.count({
        where: {
          collegeApplication: {
            userId: studentId,
          },
          isCompleted: {
            equals: true,
          },
        },
      }),
      prisma.essaySubmission.count({
        where: {
          collegeApplication: {
            userId: studentId,
          },
          OR: [{ v1: { not: null } }, { personalizeText: { not: null } }],
          isCompleted: {
            equals: false,
          },
        },
      }),
      prisma.essaySubmission.count({
        where: {
          collegeApplication: { userId: studentId },
          AND: [{ v1: null }, { personalizeText: null }],
        },
      }),
    ]);

    sendResponse(
      res,
      200,
      {
        inProgress,
        completed,
        notGenerated,
      },
      "Essay submissions stats fetched successfully"
    );
  } catch (error) {
    return next(error);
  }
};

const getEssaySubmissionStatsForCalender = async (req, res, next) => {
  const { id: userId } = req.user;

  try {
    let userUniversityDeadlines = await prisma.userUniversityDeadline.findMany({
      where: { userId },
      include: { deadline: true, essaySubmissions: true, university: true },
    });

    userUniversityDeadlines = userUniversityDeadlines.filter(
      (el) => !el.university.isDefault
    );

    const inProgressData = [];
    const notStartedData = [];
    const completedData = [];
    let maxWeeks = 0;
    for (const entry of userUniversityDeadlines) {
      const weeksLeft = calculateWeeksLeft(entry.deadline.deadline);
      if (entry.essaySubmissions?.length) {
        for (const submission of entry.essaySubmissions) {
          if (weeksLeft > maxWeeks) maxWeeks = weeksLeft;
          if (!submission.v1 && !submission.personalizeText) {
            notStartedData.push([
              weeksLeft,
              mapTypeToNumber(entry.type),
              entry.university?.name,
            ]);
          } else if (submission.v1 || submission.personalizeText) {
            inProgressData.push([
              weeksLeft,
              mapTypeToNumber(entry.type),
              entry.university?.name,
            ]);
          } else if (submission.isCompleted) {
            completedData.push([
              weeksLeft,
              mapTypeToNumber(entry.type),
              entry.university?.name,
            ]);
          }
        }
      } else {
        notStartedData.push([
          weeksLeft,
          mapTypeToNumber(entry.type),
          entry.university?.name,
        ]);
      }
    }
    const categories = generateWeekRanges(maxWeeks);

    const groupedData = {
      data: [
        { name: "In Progress", data: inProgressData },
        { name: "Not Started", data: notStartedData },
        { name: "Completed", data: completedData },
      ],
      categories: categories,
    };

    sendResponse(res, 200, groupedData);
  } catch (error) {
    return next(error);
  }
};

const generateRealEssay = async (req, res, next) => {
  const { userEssay } = req.user;
  const { essaySubmissionId } = req.body;

  const user = userEssay.collegeApplication.user;
  const planName = user.plan.name;
  const isGeneratingFirstTime = Boolean(
    !userEssay.v1 && !userEssay.v2 && !userEssay.v3
  );

  try {
    if (isGeneratingFirstTime && +user.noOfEssaysToGenerate === 0) {
      return next(
        CustomErrorHandler.customError(
          401,
          "You don't have credits to generated an essay with AI"
        )
      );
    } else if (
      !isGeneratingFirstTime &&
      (planName === "Pro Plus+"
        ? userEssay.noOfRegenerations === 3
        : userEssay.noOfRegenerations === 1)
    ) {
      return next(
        CustomErrorHandler.customError(
          401,
          "Your re-generation essay limit reached"
        )
      );
    }

    const { prompt, essayCategory, longAnswerText } = await getPrompt(
      userEssay
    );
    // http://localhost:3000/
    const essayRequest = await axios.post("https://essaygen.goodgoblin.ai/", {
      ESSAYGEN_TOKEN,
      essayId: essaySubmissionId,
      essayWordCount: userEssay.essay.maxWordLimit,
      prompt,
      user: userEssay.collegeApplication.user,
      essayCategory,
      longAnswerText,
    });

    const {
      data: { estimatedTime },
    } = essayRequest;

    const updatedEssaySubmission = await prisma.essaySubmission.update({
      where: {
        id: +essaySubmissionId,
      },
      data: {
        isGenerating: true,
        prompt,
        initialRequestedOn: new Date().toISOString(),
        ...(!isGeneratingFirstTime && {
          noOfRegenerations: userEssay.noOfRegenerations + 1,
        }),
        // noOfRegenerations:
        // isGeneratingFirstTime
        //   ? planName === "Pro Plus+"
        //     ? "unlimited"
        //     : 1
        //   : userEssay.noOfRegenerations - 1,
        // noOfAiScans: "3",
        // +user.noOfAiChecks >= 1
        //   ? "unlimited" || user.noOfAiChecks === "unlimited"
        //   : "3",
      },
    });

    if (isGeneratingFirstTime) {
      await prisma.user.update({
        where: {
          id: +user.id,
        },
        data: {
          ...(+user.noOfEssaysToGenerate >= 1 && {
            noOfEssaysToGenerate: String(+user.noOfEssaysToGenerate - 1),
          }),
          // ...(+user.noOfAiChecks >= 1 && {
          //   noOfAiChecks: String(+user.noOfAiChecks - 1),
          // }),
        },
      });
    }

    res.status(200).send({
      message: "Your essays are being generated",
      estimatedTime,
      essaySubmission: updatedEssaySubmission,
    });
  } catch (error) {
    return next(error);
  }
};

const saveEssay = async (req, res, next) => {
  const { essaySubmissionId, essayText } = req.body;

  try {
    await prisma.essaySubmission.update({
      where: {
        id: +essaySubmissionId,
      },
      data: {
        finalInput: essayText,
      },
    });

    res.status(200).send({
      message: "Your essay has been saved successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const getThingsBeforeGeneratingFinalEssay = async (req, res, next) => {
  const { userEssay } = req.user;
  const { essayText } = req.body;

  const user = userEssay.collegeApplication.user;
  const essayCategoryId = userEssay.essay.categoryId;
  const favoriteVersionText = userEssay[userEssay.favrouiteVersion];
  const essayWordCount = userEssay.essay.maxWordLimit;
  let systemGuidanceTextForFinalInterim = null;

  try {
    const essayCategory = await prisma.essayCategory.findUnique({
      where: {
        id: essayCategoryId,
      },
      select: {
        systemGuidanceFinal: true,
        systemGuidanceFinalInterim: true,
      },
    });

    if (essayText || userEssay.finalInput) {
      systemGuidanceTextForFinalInterim =
        await prisma.systemGuidance.findUnique({
          where: {
            id: essayCategory.systemGuidanceFinalInterim,
          },
        });
    }

    // const [longestAnswer] = await prisma.$queryRaw`
    // SELECT answerText
    // FROM InterviewAnswer
    // WHERE studentId = ${user.id}
    // AND answerText IS NOT NULL
    // AND answerText != ''
    // ORDER BY LENGTH(answerText) - LENGTH(REPLACE(answerText, ' ', '')) + 1 DESC
    // LIMIT 1;
    // `;

    const questions = await prisma.interviewQuestionEssayCategory.findMany({
      where: {
        essayCategoryLetter: {
          in: ["e", "j", "k"],
        },
      },
      orderBy: {
        essayCategoryLetter: "asc",
      },
    });

    const questionsIds = questions.map((question) => question.id);

    const answers = await prisma.interviewAnswer.findMany({
      where: {
        studentId: user.id,
        interviewQuestionId: {
          in: questionsIds,
        },
      },
    });

    let longestAnswerText = "";
    answers.forEach((answer) => {
      longestAnswerText = longestAnswerText.concat(`. ${answer.answerText}`);
    });

    const systemGuidanceTextForFinal = await prisma.systemGuidance.findUnique({
      where: {
        id: essayCategory.systemGuidanceFinal,
      },
    });

    sendResponse(res, 200, {
      user,
      longestAnswerText,
      favoriteVersionText,
      essayWordCount,
      systemGuidanceTextForFinalInterimText:
        systemGuidanceTextForFinalInterim?.text || null,
      systemGuidanceTextForFinalText: systemGuidanceTextForFinal.text,
      essaySnippets: userEssay.finalInput || essayText,
      essaySubmissionSystemGuidance: userEssay.systemGuidance,
    });
  } catch (error) {
    return next(error);
  }
};

const updateEssay = async (req, res, next) => {
  const { success, essayId, data, user, versionsSystemGuidance, dataOfFinal } =
    req.body;

  try {
    const essaySubmission = await prisma.essaySubmission.findUnique({
      where: {
        id: +essayId,
      },
      select: {
        essay: {
          select: {
            text: true,
            university: {
              select: {
                name: true,
              },
            },
          },
        },
        v1: true,
      },
    });

    const dataToUpdate = dataOfFinal || {
      ...data,
      systemGuidance: versionsSystemGuidance,
      isGenerating: false,
      favrouiteVersion: data.v1 ? "v1" : data.v2 ? "v2" : "v3",
      final: null,
      finalInput: null,
      submission: null,
      personalizeText: null,
      ...(success && { generatedOn: new Date().toISOString() }),
      ...(!success &&
        !essaySubmission.v1 && { prompt: null, initialRequestedOn: null }),
    };

    await prisma.essaySubmission.update({
      where: {
        id: +essayId,
      },
      data: dataToUpdate,
    });

    if (!dataOfFinal) {
      await sendEmail(
        user.email,
        sendGridEmailAddresses.essayGenNotification,
        {
          university_name: essaySubmission.essay.university.name,
          essay_prompt: essaySubmission.essay.text,
          btn_url: `${FRONTEND_URL}essayEditor/${essayId}?activeTab=v1`,
        },
        ESSAY_GEN_NOTIFICATION_TEMPLATE_ID
      );
    }

    sendResponse(res, 200, { success: true }, "Essay successfully updated");
  } catch (error) {
    sendResponse(
      res,
      500,
      { success: false, error },
      "Couldn't update your essay"
    );
  }
};

const getAllSystemGuidanceByIds = async (req, res, next) => {
  const { systemGuidanceIds } = req.body;

  try {
    const systemGuidance = await prisma.systemGuidance.findMany({
      where: {
        id: {
          in: systemGuidanceIds,
        },
      },
    });

    sendResponse(
      res,
      200,
      systemGuidance,
      "System guidance by their ids successfully fetched."
    );
  } catch (error) {
    return next(error);
  }
};

const getEssaySubmissionById = async (req, res, next) => {
  const { id: userId } = req.user;
  const { id } = req.params;

  try {
    const essaySubmission = await prisma.essaySubmission.findFirst({
      where: {
        id: +id,
        collegeApplication: {
          userId: +userId,
        },
      },
      include: {
        essay: {
          select: {
            maxWordLimit: true,
            minWordLimit: true,
            text: true,
          },
        },
        collegeApplication: {
          select: {
            university: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!essaySubmission) {
      return next(
        CustomErrorHandler.customError(404, "There is no essay present.")
      );
    }

    sendResponse(
      res,
      200,
      essaySubmission,
      "Student submitted essay successfully fetched."
    );
  } catch (error) {
    return next(error);
  }
};

const consolePrompt = async (req, res, next) => {
  const { id: userId } = req.user;
  const { essaySubmissionId } = req.body;

  try {
    const userEssay = await prisma.essaySubmission.findFirst({
      where: {
        id: parseInt(essaySubmissionId),
        collegeApplication: {
          userId: parseInt(userId),
        },
      },
      include: {
        essay: true,
        collegeApplication: {
          include: {
            university: true,
          },
        },
      },
    });

    const prompt = await getPrompt(userEssay);

    console.log(prompt);

    res.send("hello!");
  } catch (error) {
    console.log(error);
  }
};

const markFavoriteEssay = async (req, res, next) => {
  const { id } = req.params;
  const { versionName } = req.body;

  try {
    await prisma.essaySubmission.update({
      where: {
        id: +id,
      },
      data: {
        favrouiteVersion: versionName,
      },
    });
    sendResponse(
      res,
      200,
      null,
      `${versionName} of essay successfully marked.`
    );
  } catch (error) {
    return next(error);
  }
};

const updatePersonalizeEssay = async (req, res, next) => {
  const { id } = req.params;
  const { essayText } = req.body;
  const { userEssay } = req.user;

  const user = userEssay.collegeApplication.user;
  const planName = user.plan.name;

  try {
    await prisma.essaySubmission.update({
      where: {
        id: +id,
      },
      data: {
        personalizeText: essayText,
        ...(planName === "Basic" && {
          isAllowForEssential: true,
        }),
      },
    });

    if (planName === "Basic" && user.noOfEssentials > 0) {
      await prisma.user.update({
        where: {
          id: +user.id,
        },
        data: {
          noOfEssentials: 0,
        },
      });
    }
    sendResponse(res, 200, null, "Personalize essay saved successfully");
  } catch (error) {
    return next(error);
  }
};

const scanEssayWithAi = async (req, res, next) => {
  const { id } = req.params;
  let { userEssay } = req.user;

  let user = userEssay.collegeApplication.user;

  // if (
  //   +user.noOfAiChecks > 0 &&
  //   userEssay.noOfAiScans !== "unlimited" &&
  //   userEssay.noOfAiScans === "0"
  // ) {
  //   userEssay = await prisma.essaySubmission.update({
  //     where: {
  //       id: +userEssay.id,
  //     },
  //     data: {
  //       noOfAiScans: "unlimited",
  //     },
  //   });
  //   user = await prisma.user.update({
  //     where: {
  //       id: +user.id,
  //     },
  //     data: {
  //       noOfAiChecks: String(+user.noOfAiChecks - 1),
  //     },
  //   });
  // }

  const isUserCanDoAiScan =
    user.noOfAiChecks === "unlimited" ||
    // userEssay.noOfAiScans === "unlimited" ||
    +userEssay.noOfAiScans > 0;

  if (!isUserCanDoAiScan) {
    return next(
      CustomErrorHandler.customError(401, "You don't have enough Ai-Checks")
    );
  }

  if (!userEssay.personalizeText) {
    return next(
      CustomErrorHandler.customError(
        403,
        "You first have to generate final version of your essay"
      )
    );
  }

  const headers = {
    "Content-Type": "application/json",
    "X-OAI-API-KEY": AI_CHECK_API_KEY,
  };

  const requestBody = {
    content: userEssay.personalizeText,
    title: userEssay.id,
    aiModelVersion: "1",
  };

  try {
    const { data } = await axios.post(
      "https://api.originality.ai/api/v1/scan/ai",
      requestBody,
      { headers }
    );

    const aiScore = data.score.ai * 100;
    const humanScore = data.score.original * 100;
    const isEssayPassedAiCheck = aiScore <= 40;

    await prisma.essaySubmission.update({
      where: {
        id: +id,
      },
      data: {
        humanScore,
        ...(isEssayPassedAiCheck && { submission: userEssay.personalizeText }),
        // noOfAiScans:
        //   userEssay.noOfAiScans !== "unlimited"
        //     ? +userEssay.noOfAiScans >= 1
        //       ? String(+userEssay.noOfAiScans - 1)
        //       : "0"
        //     : "unlimited",
        ...(user.noOfAiChecks !== "unlimited" && {
          noOfAiScans: String(+userEssay.noOfAiScans - 1),
        }),
      },
    });

    sendResponse(res, 200, {
      status: isEssayPassedAiCheck,
      message: `AI check ${isEssayPassedAiCheck ? "passed" : "failed"}`,
      humanScore,
    });
  } catch (error) {
    return next(error);
  }
};

const markEssayCompletedOrInCompleted = async (req, res, next) => {
  const { id } = req.params;
  const { userEssay } = req.user;

  try {
    const updatedMark = !userEssay.isCompleted;

    await prisma.essaySubmission.update({
      where: {
        id: +id,
      },
      data: {
        isCompleted: updatedMark,
      },
    });
    sendResponse(
      res,
      200,
      null,
      `The requested essay has been ${
        updatedMark ? "" : "un"
      }marked successfully.`
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllSelectedUniversitiesEssays,
  getAllSelectedUniversitiesWithEssaysForDashboard,
  getAllSelectedEssays,
  getEssaySubmissionsStats,
  getEssaySubmissionStatsForCalender,
  createNewEssay,
  submitEssay,
  generateRealEssay,
  // generateFinalEssay,
  updateEssay,
  getEssaySubmissionById,
  consolePrompt,
  saveEssay,
  markFavoriteEssay,
  updatePersonalizeEssay,
  scanEssayWithAi,
  getAllSystemGuidanceByIds,
  getThingsBeforeGeneratingFinalEssay,
  markEssayCompletedOrInCompleted,
};
