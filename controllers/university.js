const { prisma, sendResponse, getPagination } = require("../utils");
const { CustomErrorHandler } = require("../services");

const createNewUniversity = async (req, res, next) => {
  const { name, numberOfRequiredEssays, deadlines, state } = req.body;
  try {
    const newUniversity = await prisma.university.create({
      data: {
        name,
        numberOfRequiredEssays,
        state,
        deadlines: {
          create: deadlines.map((deadline) => ({
            deadline: new Date(deadline),
          })),
        },
      },
    });
    sendResponse(
      res,
      201,
      newUniversity,
      "New University Successfully Created"
    );
  } catch (error) {
    return next(error);
  }
};

const getAllUniversities = async (req, res, next) => {
  try {
    const { page, pageSize, sortOrder, sortField } = req.query;
    const result = await getPagination(
      prisma.university,
      page,
      pageSize,
      sortOrder,
      sortField,
      {
        deadlines: {
          select: {
            id: true,
            name: true,
            deadline: true,
          },
        },
      }
    );

    sendResponse(res, 200, result);
  } catch (error) {
    return next(error);
  }
};

const getUniversityById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const university = await prisma.university.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!university) {
      return next(CustomErrorHandler.notFound());
    }
    sendResponse(res, 200, university);
  } catch (error) {
    return next(error);
  }
};

const updateUniversityById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const university = await prisma.university.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!university) {
      return next(CustomErrorHandler.notFound());
    }
    const updatedUniversity = await prisma.university.update({
      where: {
        id: parseInt(id),
      },
      data: {
        ...req.body,
      },
    });
    sendResponse(
      res,
      201,
      updatedUniversity,
      "New University Successfully Updated"
    );
  } catch (error) {
    return next(error);
  }
};

const deleteUniversityById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const university = await prisma.university.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!university) {
      return next(CustomErrorHandler.notFound());
    }

    await prisma.university.delete({
      where: {
        id: parseInt(id),
      },
    });
    sendResponse(res, 200, university, "University Successfully Deleted");
  } catch (error) {
    return next(error);
  }
};

const getAllUniversitiesForDropdown = async (req, res, next) => {
  const { id: studentId } = req.user;

  try {
    const userSelections = await prisma.userUniversityDeadline.findMany({
      where: { userId: parseInt(studentId) },
      select: { universityId: true },
    });

    const selectedUniversityIds = new Set(
      userSelections.map((selection) => selection.universityId)
    );

    const universities = await prisma.university.findMany({
      select: { id: true, name: true, state: true, acronym: true },
    });

    const universitiesWithSelectionStatus = universities.map((university) => ({
      ...university,
      selected: selectedUniversityIds.has(university.id),
    }));
    sendResponse(res, 200, universitiesWithSelectionStatus);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createNewUniversity,
  getAllUniversities,
  getAllUniversitiesForDropdown,
  getUniversityById,
  updateUniversityById,
  deleteUniversityById,
};
