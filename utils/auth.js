const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");

const { prisma } = require("./prisma");
const { SENDGRID_API_KEY } = require("../config");
const { CustomErrorHandler, JwtService } = require("../services");

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashed) => {
  return bcrypt.compare(password, hashed);
};

const sendEmail = async (
  recipientEmail,
  fromEmail,
  dynamic_template_data,
  templateId
) => {
  sgMail.setApiKey(SENDGRID_API_KEY);

  const msg = {
    to: recipientEmail,
    from: fromEmail,
    templateId,
    dynamic_template_data,
  };

  await sgMail.send(msg);
};

const createNewUser = async (user, isSocial, next) => {
  const { email, password } = user;

  const exist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (exist) {
    if (isSocial) {
      const token = JwtService.sign({
        id: exist.id,
      });
      return {
        ...exist,
        token,
      };
    } else {
      return next(
        CustomErrorHandler.alreadyExist("This email is already taken.")
      );
    }
  } else {
    const hashedPassword =
      !isSocial && password ? await hashPassword(password) : null;

    const newUser = await prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
        planId: 1,
        noOfAiChecks: "0",
        noOfEssaysToGenerate: "1",
        noOfEssentials: 1,
      },
    });

    const token = JwtService.sign({
      id: newUser.id,
    });

    let defaultUniversities = await prisma.university.findMany({
      where: {
        isDefault: true,
      },
      include: {
        deadlines: true,
      },
    });

    defaultUniversities = defaultUniversities.map((uni) => ({
      universityId: uni.id,
      deadlineId: uni.deadlines[0].id,
      userId: newUser.id,
      type: "target",
    }));

    await prisma.userUniversityDeadline.createMany({
      data: defaultUniversities,
    });

    delete newUser.password;

    return {
      ...newUser,
      token,
    };
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  sendEmail,
  createNewUser,
};
