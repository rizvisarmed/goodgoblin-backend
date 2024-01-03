const {
  prisma,
  sendResponse,
  getPagination,
  prepAiAnsweredQuestionsPercentage,
  hashPassword,
  comparePassword,
  uploadImage,
  deleteImage,
  getCollegeWithStatus,
} = require("../utils");
const { CustomErrorHandler } = require("../services");

const getAllUsers = async (req, res, next) => {
  try {
    const { page, pageSize, sortOrder, sortField } = req.query;
    const result = await getPagination(
      prisma.user,
      page,
      pageSize,
      sortOrder,
      sortField
    );
    sendResponse(res, 200, result);
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!user) {
      return next(CustomErrorHandler.notFound());
    }
    sendResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

const getCurrentUserDetails = async (req, res, next) => {
  const { id: userId } = req.user;
  try {
    const currentUser = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
      include: {
        plan: true,
      },
    });
    delete currentUser.password;
    sendResponse(
      res,
      200,
      currentUser,
      "Current user detail successfully fetched."
    );
  } catch (error) {
    return next(error);
  }
};

const submitOrientation = async (req, res, next) => {
  const { id: studentId } = req.user;

  try {
    await prisma.user.update({
      where: {
        id: +studentId,
      },
      data: {
        isOrientationCompleted: true,
      },
    });
    sendResponse(res, 200, null, "Student orientation completed.");
  } catch (error) {
    return next(error);
  }
};

const updateUserDetails = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { essayMode } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: +studentId,
      },
      include: {
        plan: true,
      },
    });

    const userPlanName = user.plan.name;

    if (essayMode && !userPlanName.includes("Pro")) {
      return next(
        CustomErrorHandler.unAuthorized(
          "You don't have access to customize essay mode."
        )
      );
    }

    if (
      req.body.hasOwnProperty("isToneMatching") &&
      !userPlanName.includes("Plus")
    ) {
      return next(
        CustomErrorHandler.unAuthorized(
          "You don't have access to customize tone matching."
        )
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: +studentId,
      },
      data: {
        ...req.body,
      },
    });

    sendResponse(res, 200, updatedUser, "User details updated successfully.");
  } catch (error) {
    return next(error);
  }
};

const getPrepAiStatus = async (req, res, next) => {
  const { id: studentId } = req.user;

  try {
    const sections = await prisma.interviewSection.findMany({
      where: {
        isRequired: true,
      },
      include: {
        interviewQuestions: {
          where: {
            OR: [{ studentId: null }, { studentId }],
            isRequired: true,
          },
          include: {
            interviewAnswers: {
              where: {
                studentId,
              },
            },
          },
        },
      },
    });

    const prepAiProgress = await prepAiAnsweredQuestionsPercentage(sections);

    const status = {
      completionStatus: prepAiProgress,
    };
    sendResponse(res, 200, status, "Prep AI status successfully fetched");
  } catch (error) {
    return next(error);
  }
};

const getCollegesStatus = async (req, res, next) => {
  const { id: studentId } = req.user;

  try {
    const selectedUserColleges = await prisma.userUniversityDeadline.findMany({
      where: {
        userId: +studentId,
      },
      select: {
        essaySubmissions: true,
        university: true,
      },
    });

    const statusCounts = selectedUserColleges
      .filter((el) => !el.university.isDefault)
      .reduce(
        (acc, userUniversity) => {
          const essaySubmissions = userUniversity.essaySubmissions;
          if (essaySubmissions.length) {
            const status = getCollegeWithStatus(essaySubmissions);
            acc[status] = (acc[status] || 0) + 1;
          } else {
            acc["notStarted"] = (acc["notStarted"] || 0) + 1;
          }
          return acc;
        },
        {
          notStarted: 0,
          inProgress: 0,
          completed: 0,
        }
      );

    sendResponse(
      res,
      200,
      statusCounts,
      "User colleges status successfully fetched"
    );
  } catch (error) {
    console.log("er", error);
    return next(error);
  }
};

const getEssaysStatus = async (req, res, next) => {
  const { id: studentId } = req.user;

  try {
    const selectedUserColleges = await prisma.userUniversityDeadline.findMany({
      where: {
        userId: +studentId,
      },
    });

    const selectedCollegeIds = selectedUserColleges.map((college) => {
      return college.id;
    });

    const userEssays = await prisma.essaySubmission.findMany({
      where: {
        collegeApplicationId: {
          in: selectedCollegeIds,
        },
      },
    });

    const notStartedEssayCount = userEssays.filter((essay) => {
      return !essay.v1 && !essay.personalizeText;
    }).length;

    const inProgressEssayCount = userEssays.filter((essay) => {
      return (essay.v1 || essay.personalizeText) && !essay.isCompleted;
    }).length;

    const completedEssayCount = userEssays.filter((essay) => {
      return essay.isCompleted;
    }).length;

    const counts = {
      notStarted: notStartedEssayCount,
      inProgress: inProgressEssayCount,
      completed: completedEssayCount,
    };

    return sendResponse(
      res,
      200,
      counts,
      "User essays status successfully fetched"
    );
  } catch (error) {
    return next(error);
  }
};

const updateProfilePicture = async (req, res, next) => {
  const { id: studentId } = req.user;

  if (!req.file || !req.file?.buffer)
    return sendResponse(res, 400, null, "You have to provide a profile image");

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: studentId,
      },
    });

    const { imgKey } = user;

    if (imgKey) {
      await deleteImage(imgKey);
    }

    const image = req.file.buffer;
    const response = await uploadImage(image, studentId);

    const imgUrl = response.Location;

    await prisma.user.update({
      where: {
        id: studentId,
      },
      data: {
        imgUrl,
        imgKey: response.Key,
      },
    });

    return sendResponse(
      res,
      200,
      {
        imgUrl,
      },
      "Profile image updated successfully"
    );
  } catch (error) {
    return next(error);
  }
};

const deleteProfilePicture = async (req, res, next) => {
  const { id: studentId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!user.imgKey)
      return sendResponse(res, 400, null, "You don't have a profile image");

    const response = await deleteImage(user.imgKey);
    await prisma.user.update({
      where: {
        id: studentId,
      },
      data: {
        imgKey: null,
        imgUrl: null,
      },
    });
    console.log(response);
    return sendResponse(res, 200, null, "Profile image deleted successfully");
  } catch (error) {
    return next(error);
  }
};

const updateName = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { firstName, lastName } = req.body;
  try {
    await prisma.user.update({
      where: {
        id: studentId,
      },
      data: {
        firstName,
        lastName,
      },
    });

    return sendResponse(res, 200, req.body, "Name updated successfully");
  } catch (error) {
    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: studentId,
      },
    });

    const isOldPasswordCorrect = await comparePassword(
      oldPassword,
      user.password
    );

    if (!isOldPasswordCorrect) {
      return next(CustomErrorHandler.notFound("Old password is incorrect"));
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: {
        id: studentId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return sendResponse(res, 200, null, "Password updated successfully");
  } catch (error) {
    return next(error);
  }
};

const deleteUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!user) {
      return CustomErrorHandler.notFound();
    }

    await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });

    return sendResponse(res, 200, user, "User Successfully Deleted");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getCurrentUserDetails,
  submitOrientation,
  updateUserDetails,
  getPrepAiStatus,
  getCollegesStatus,
  getEssaysStatus,
  updateProfilePicture,
  deleteProfilePicture,
  updateName,
  updatePassword,
  deleteUserById,
};
