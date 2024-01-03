const { prisma, sendResponse, getPagination } = require("../utils");
const { CustomErrorHandler } = require("../services");

const createNewDeadline = async (req, res, next) => {
  const { deadline, universityId } = req.body;
  try {
    const newDeadline = await prisma.deadline.create({
      data: {
        deadline,
        universityId: parseInt(universityId),
      },
    });
    sendResponse(res, 201, newDeadline, "New Deadline Successfully Created");
  } catch (error) {
    return next(error);
  }
};

const getAllDeadlines = async (req, res, next) => {
  try {
    const { page, pageSize, sortOrder, sortField } = req.query;
    const result = await getPagination(
      prisma.deadline,
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

const getDeadlineById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deadline = await prisma.deadline.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!deadline) {
      return next(CustomErrorHandler.notFound());
    }
    sendResponse(res, 200, deadline);
  } catch (error) {
    return next(error);
  }
};

const updateDeadlineById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deadline = await prisma.deadline.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!deadline) {
      return next(CustomErrorHandler.notFound());
    }
    const updatedDeadline = await prisma.deadline.update({
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
      updatedDeadline,
      "New Deadline Successfully Updated"
    );
  } catch (error) {
    return next(error);
  }
};

const deleteDeadlineById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deadline = await prisma.deadline.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!deadline) {
      return next(CustomErrorHandler.notFound());
    }

    await prisma.deadline.delete({
      where: {
        id: parseInt(id),
      },
    });
    sendResponse(res, 200, deadline, "Deadline Successfully Deleted");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createNewDeadline,
  getAllDeadlines,
  getDeadlineById,
  updateDeadlineById,
  deleteDeadlineById,
};
