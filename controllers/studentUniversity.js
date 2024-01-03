const { prisma, sendResponse } = require("../utils");
const { CustomErrorHandler } = require("../services");

const createNewStudentUniversity = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { universityId } = req.body;

  try {
    const [existingSelection, university] = await prisma.$transaction([
      prisma.userUniversityDeadline.findFirst({
        where: {
          userId: parseInt(studentId),
          universityId: parseInt(universityId),
        },
      }),
      prisma.university.findUnique({
        where: { id: universityId },
        select: {
          name: true,
          deadlines: { select: { id: true, name: true, deadline: true } },
        },
      }),
    ]);

    if (!university) {
      return next(CustomErrorHandler.notFound("University not found"));
    }

    if (existingSelection) {
      return next(
        CustomErrorHandler.alreadyExist(
          "The student already selected this university"
        )
      );
    }

    if (university.deadlines.length === 0) {
      return next(
        CustomErrorHandler.unprocessableEntity(
          "No deadlines for this university"
        )
      );
    }

    let deadline = null;
    const deadlineIndex = university.deadlines.findIndex(
      (el) => el.name === "Regular_Decision"
    );
    if (deadlineIndex !== -1) {
      deadline = university.deadlines[deadlineIndex];
    } else {
      deadline = university.deadlines.find(
        (el) => el.name === "Rolling_Admission"
      );
    }

    if (!deadline) {
      return next(CustomErrorHandler.notFound("Deadline not found"));
    }

    const selection = await prisma.userUniversityDeadline.create({
      data: {
        universityId: +universityId,
        deadlineId: deadline.id,
        userId: studentId,
        type: "target",
      },
      select: {
        id: true,
        type: true,
      },
    });

    sendResponse(
      res,
      201,
      {
        ...selection,
        name: university.name,
        deadlines: university.deadlines,
        deadlineId: deadline.id,
        deadlineName: deadline.name,
        deadline: deadline.deadline,
      },
      "New Student University Successfully Created"
    );
  } catch (error) {
    return next(error);
  }
};

const getAllStudentUniversities = async (req, res, next) => {
  const { id: studentId } = req.user;
  try {
    const selections = await prisma.userUniversityDeadline.findMany({
      where: { userId: parseInt(studentId) },
      select: {
        id: true,
        university: {
          select: {
            id: true,
            name: true,
            deadlines: true,
            isDefault: true,
          },
        },
        deadline: {
          select: {
            id: true,
            name: true,
            deadline: true,
          },
        },
        type: true,
        essaySubmissions: true,
      },
    });

    const selectedUniversities = selections
      .filter((selection) => !selection.university.isDefault)
      .map((selection) => ({
        id: selection.id,
        name: selection.university.name,
        deadlines: selection.university.deadlines,
        deadlineId: selection.deadline.id,
        deadlineName: selection.deadline.name,
        deadline: selection.deadline.deadline,
        type: selection.type,
        isAnyEssayPicked: selection.essaySubmissions.length ? true : false,
      }));

    sendResponse(
      res,
      200,
      selectedUniversities,
      "All student universities fetched."
    );
  } catch (error) {
    return next(error);
  }
};

const getStudentUniversitiesTypeStats = async (req, res, next) => {
  const { id: studentId } = req.user;
  try {
    const universityTypes = await prisma.userUniversityDeadline.findMany({
      where: {
        userId: studentId,
      },
      include: {
        university: {
          select: {
            isDefault: true,
          },
        },
      },
    });

    const counts = {
      reach: 0,
      target: 0,
      safety: 0,
    };

    universityTypes
      .filter((el) => !el.university.isDefault)
      .forEach((universityType) => {
        counts[universityType.type]++;
      });

    sendResponse(res, 200, counts);
  } catch (error) {
    return next(error);
  }
};

const updateStudentUniversityField = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { userUniversityDeadlineId } = req.params;

  try {
    const existingSelection = await prisma.userUniversityDeadline.findUnique({
      where: { id: parseInt(userUniversityDeadlineId) },
      include: {
        university: { select: { name: true, deadlines: true } },
        deadline: { select: { id: true, name: true, deadline: true } },
      },
    });

    if (!existingSelection) {
      return next(CustomErrorHandler.notFound("Selected college not found"));
    }

    if (existingSelection.userId !== studentId) {
      return next(
        CustomErrorHandler.customError(
          403,
          "You can only update your own selected college"
        )
      );
    }

    if (req.body.deadlineId) {
      const deadline = existingSelection.university.deadlines.find(
        (el) => el.id === parseInt(req.body.deadlineId)
      );

      if (!deadline) {
        return next(CustomErrorHandler.notFound("Deadline not found"));
      }
    }

    const { university } = existingSelection;

    const updatedSelection = await prisma.userUniversityDeadline.update({
      where: { id: parseInt(userUniversityDeadlineId) },
      data: { ...req.body },
      select: {
        id: true,
        type: true,
        deadline: true,
      },
    });

    const { deadline } = updatedSelection;

    sendResponse(
      res,
      200,
      {
        ...updatedSelection,
        name: university.name,
        deadlines: university.deadlines,
        deadlineId: deadline.id,
        deadlineName: deadline.name,
        deadline: deadline.deadline,
      },
      "Selected college field updated successfully"
    );
  } catch (error) {
    return next(error);
  }
};

const deleteStudentUniversityById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const record = await prisma.userUniversityDeadline.findUnique({
      where: { id: parseInt(id) },
      include: { essaySubmissions: true },
    });

    if (!record) {
      return next(CustomErrorHandler.notFound());
    }

    if (record.essaySubmissions.some((essaySubmission) => essaySubmission.v1)) {
      return next(
        CustomErrorHandler.customError(
          400,
          "Cannot delete university. There are essays submitted for this university."
        )
      );
    }

    if (record.essaySubmissions.length) {
      const essaySubmissionsIds = record.essaySubmissions.map(
        (essaySubmission) => essaySubmission.id
      );

      await prisma.essaySubmission.deleteMany({
        where: {
          id: {
            in: essaySubmissionsIds,
          },
        },
      });
    }

    await prisma.userUniversityDeadline.delete({
      where: { id: parseInt(id) },
    });

    sendResponse(res, 200, "Record deleted successfully.");
  } catch (error) {
    return next(error);
  }
};

const getSelectedCollegesCount = async (req, res, next) => {
  const { id: studentId } = req.user;
  try {
    const selectedColleges = await prisma.userUniversityDeadline.findMany({
      where: {
        userId: studentId,
        university: {
          isDefault: false,
        },
      },
    });
    sendResponse(
      res,
      200,
      selectedColleges.length,
      "Successfully fetched selected colleges count."
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createNewStudentUniversity,
  getAllStudentUniversities,
  getStudentUniversitiesTypeStats,
  updateStudentUniversityField,
  deleteStudentUniversityById,
  getSelectedCollegesCount,
};
