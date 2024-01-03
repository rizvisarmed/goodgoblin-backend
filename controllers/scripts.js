const path = require("path");
const XLSX = require("xlsx");

const {
  prisma,
  sendResponse,
  convertToNumber,
  convertToText,
  optionalProperty,
  stripe,
  categorizeElements,
} = require("../utils");

const uploadAllUniversities = async (req, res, next) => {
  const { filePath, isDefault = false } = req.body;

  try {
    const inputFile = path.join(__dirname, filePath);

    const workbook = XLSX.readFile(inputFile);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

    const data = rows.slice(1).map((row) => {
      const [
        collegeName,
        state,
        acronym,
        edDueDate,
        ed2DueDate,
        eaDueDate,
        ea2DueDate,
        rdDueDate,
        rollingAdmission,
        required,
        essay1,
        essay1Category,
        essay1WC,
        essay2,
        essay2Category,
        essay2WC,
        essay3,
        essay3Category,
        essay3WC,
        essay4,
        essay4Category,
        essay4WC,
        essay5,
        essay5Category,
        essay5WC,
        essay6,
        essay6Category,
        essay6WC,
        essay7,
        essay7Category,
        essay7WC,
        essay8,
        essay8Category,
        essay8WC,
        essay9,
        essay9Category,
        essay9WC,
        essay10,
        essay10Category,
        essay10WC,
        essay11,
        essay11Category,
        essay11WC,
      ] = row;

      return {
        collegeName: convertToText(collegeName, "College"),
        state: convertToText(state, "state"),
        acronym,
        ...optionalProperty("edDueDate", new Date(`${edDueDate} 12:00:00`)),
        ...optionalProperty("ed2DueDate", new Date(`${ed2DueDate} 12:00:00`)),
        ...optionalProperty("eaDueDate", new Date(`${eaDueDate} 12:00:00`)),
        ...optionalProperty("ea2DueDate", new Date(`${ea2DueDate} 12:00:00`)),
        ...optionalProperty("rdDueDate", new Date(`${rdDueDate} 12:00:00`)),
        ...optionalProperty(
          "rollingAdmission",
          new Date(`${rollingAdmission} 12:00:00`)
        ),
        required: convertToNumber(required),
        essay1,
        essay1Category,
        essay1WCMin: 1,
        essay1WCMax: convertToNumber(essay1WC),
        essay2,
        essay2Category,
        essay2WCMin: 1,
        essay2WCMax: convertToNumber(essay2WC),
        essay3,
        essay3Category,
        essay3WCMin: 1,
        essay3WCMax: convertToNumber(essay3WC),
        essay4,
        essay4Category,
        essay4WCMin: 1,
        essay4WCMax: convertToNumber(essay4WC),
        essay5,
        essay5Category,
        essay5WCMin: 1,
        essay5WCMax: convertToNumber(essay5WC),
        essay6,
        essay6Category,
        essay6WCMin: 1,
        essay6WCMax: convertToNumber(essay6WC),
        essay7,
        essay7Category,
        essay7WCMin: 1,
        essay7WCMax: convertToNumber(essay7WC),
        essay8,
        essay8Category,
        essay8WCMin: 1,
        essay8WCMax: convertToNumber(essay8WC),
        essay9,
        essay9Category,
        essay9WCMin: 1,
        essay9WCMax: convertToNumber(essay9WC),
        essay10,
        essay10Category,
        essay10WCMin: 1,
        essay10WCMax: convertToNumber(essay10WC),
        essay11,
        essay11Category,
        essay11WCMin: 1,
        essay11WCMax: convertToNumber(essay11WC),
      };
    });

    for (const row of data) {
      const {
        collegeName,
        state,
        acronym,
        edDueDate,
        ed2DueDate,
        eaDueDate,
        ea2DueDate,
        rdDueDate,
        rollingAdmission,
        required,
        essay1,
        essay1Category,
        essay1WCMin,
        essay1WCMax,
        essay2,
        essay2Category,
        essay2WCMin,
        essay2WCMax,
        essay3,
        essay3Category,
        essay3WCMin,
        essay3WCMax,
        essay4,
        essay4Category,
        essay4WCMin,
        essay4WCMax,
        essay5,
        essay5Category,
        essay5WCMin,
        essay5WCMax,
        essay6,
        essay6Category,
        essay6WCMin,
        essay6WCMax,
        essay7,
        essay7Category,
        essay7WCMin,
        essay7WCMax,
        essay8,
        essay8Category,
        essay8WCMin,
        essay8WCMax,
        essay9,
        essay9Category,
        essay9WCMin,
        essay9WCMax,
        essay10,
        essay10Category,
        essay10WCMin,
        essay10WCMax,
        essay11,
        essay11Category,
        essay11WCMin,
        essay11WCMax,
      } = row;

      const deadlineData = [
        { name: "Early_Decision", deadline: edDueDate },
        { name: "Early_Decision_2", deadline: ed2DueDate },
        { name: "Early_Action", deadline: eaDueDate },
        { name: "Early_Action_2", deadline: ea2DueDate },
        { name: "Regular_Decision", deadline: rdDueDate },
        { name: "Rolling_Admission", deadline: rollingAdmission },
      ].filter((deadline) => deadline.deadline);

      const essayData = [
        {
          text: essay1,
          categoryId: essay1Category,
          minWordLimit: essay1WCMin,
          maxWordLimit: essay1WCMax,
        },
        {
          text: essay2,
          categoryId: essay2Category,
          minWordLimit: essay2WCMin,
          maxWordLimit: essay2WCMax,
        },
        {
          text: essay3,
          categoryId: essay3Category,
          minWordLimit: essay3WCMin,
          maxWordLimit: essay3WCMax,
        },
        {
          text: essay4,
          categoryId: essay4Category,
          minWordLimit: essay4WCMin,
          maxWordLimit: essay4WCMax,
        },
        {
          text: essay5,
          categoryId: essay5Category,
          minWordLimit: essay5WCMin,
          maxWordLimit: essay5WCMax,
        },
        {
          text: essay6,
          categoryId: essay6Category,
          minWordLimit: essay6WCMin,
          maxWordLimit: essay6WCMax,
        },
        {
          text: essay7,
          categoryId: essay7Category,
          minWordLimit: essay7WCMin,
          maxWordLimit: essay7WCMax,
        },
        {
          text: essay8,
          categoryId: essay8Category,
          minWordLimit: essay8WCMin,
          maxWordLimit: essay8WCMax,
        },
        {
          text: essay9,
          categoryId: essay9Category,
          minWordLimit: essay9WCMin,
          maxWordLimit: essay9WCMax,
        },
        {
          text: essay10,
          categoryId: essay10Category,
          minWordLimit: essay10WCMin,
          maxWordLimit: essay10WCMax,
        },
        {
          text: essay11,
          categoryId: essay11Category,
          minWordLimit: essay11WCMin,
          maxWordLimit: essay11WCMax,
        },
      ].filter((essay) => essay.text);

      if (deadlineData.length) {
        const university = await prisma.university.create({
          data: {
            name: collegeName,
            state,
            acronym,
            numberOfRequiredEssays: +required,
            noEssayFound: !Boolean(essayData.length),
            isDefault,
            deadlines: {
              create: deadlineData,
            },
          },
        });

        for (const essay of essayData) {
          const { text, categoryId, minWordLimit, maxWordLimit } = essay;
          await prisma.essay.create({
            data: {
              text: text,
              minWordLimit: minWordLimit,
              maxWordLimit: maxWordLimit,
              university: {
                connect: {
                  id: university.id,
                },
              },
              category: {
                connect: {
                  id: +categoryId || 1,
                },
              },
            },
          });
        }
      }
    }

    sendResponse(res, 200, null, "Universities successfully uploaded.");
  } catch (error) {
    return next(error);
  }
};

const uploadAllEssayCategories = async (req, res, next) => {
  try {
    const inputFile = path.join(__dirname, "../files/EssayCategoriesList.xlsx");

    const workbook = XLSX.readFile(inputFile);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils
      .sheet_to_json(sheet, { header: 1, raw: false })
      .filter((row) => row.filter((cell) => cell).length > 0);

    const data = rows.map((row) => {
      const { text, numbers, letters } = categorizeElements(row);

      const [
        systemGuidanceV1,
        systemGuidanceV2,
        systemGuidanceV3,
        systemGuidanceFinal,
      ] = numbers;

      return {
        name: text,
        list: letters,
        systemGuidanceV1,
        systemGuidanceV2,
        systemGuidanceV3,
        systemGuidanceFinal,
      };
    });

    await prisma.essayCategory.createMany({
      data,
    });

    prisma.$disconnect();

    sendResponse(res, 200, null, "Essay categories successfully uploaded.");
  } catch (error) {
    return next(error);
  }
};

const uploadAllPromptQuestions = async (req, res, next) => {
  const inputFile = path.join(
    __dirname,
    "../files/PromptQuestionsWithEssayCategories.xlsx"
  );

  const workbook = XLSX.readFile(inputFile);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils
    .sheet_to_json(sheet, { header: 1, raw: false })
    .filter((row) => row.filter((cell) => cell).length > 0);

  try {
    const data = rows.map((row) => {
      const [
        interviewQuestionId,
        essayCategoryLetter,
        promptQuestionBefore,
        question,
        promptQuestionAfter,
      ] = row;

      return {
        interviewQuestionId: +interviewQuestionId || null,
        essayCategoryLetter,
        promptQuestionBefore,
        promptQuestionAfter,
      };
    });

    await prisma.interviewQuestionEssayCategory.createMany({
      data,
    });

    prisma.$disconnect();

    sendResponse(res, 200, null, "Prompt questions successfully uploaded.");
  } catch (error) {
    console.log("err", error);
    return next(error);
  }
};

const uploadAllSystemGuidance = async (req, res, next) => {
  const inputFile = path.join(__dirname, "../files/SystemGuidanceList.xlsx");

  const workbook = XLSX.readFile(inputFile);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils
    .sheet_to_json(sheet, { header: 1, raw: false })
    .filter((row) => row.filter((cell) => cell).length > 0);

  try {
    const data = rows.map((row) => {
      const [text] = row;
      return { text };
    });

    await prisma.systemGuidance.createMany({
      data,
    });

    sendResponse(res, 200, null, "System guidance successfully uploaded.");
  } catch (error) {
    return next(error);
  }

  sendResponse(res, 200);
};

const uploadAllStripePlans = async (req, res, next) => {
  const products = await stripe.products.list();

  for (let product of products.data) {
    const prices = await stripe.prices.list({ product: product.id });

    const activePrices = prices.data.filter((price) => price.active);

    const planData = {
      name: product.name,
      prices: activePrices,
      otherDetails: {
        description: product.description,
      },
    };

    await prisma.plan.create({
      data: planData,
    });
  }

  sendResponse(res, 200, null, "Stripe Plan uploaded successfully");
};

module.exports = {
  uploadAllUniversities,
  uploadAllEssayCategories,
  uploadAllPromptQuestions,
  uploadAllSystemGuidance,
  uploadAllStripePlans,
};

[
  {
    id: "price_1Nwyw9CdFicGkZNXv1KQSOMk",
    type: "recurring",
    active: true,
    object: "price",
    created: 1696302377,
    product: "prod_OjbCmp40EWhryG",
    currency: "usd",
    livemode: true,
    metadata: {},
    nickname: null,
    recurring: {
      interval: "month",
      usage_type: "licensed",
      interval_count: 6,
      aggregate_usage: null,
      trial_period_days: null,
    },
    lookup_key: null,
    tiers_mode: null,
    unit_amount: 12999,
    tax_behavior: "exclusive",
    billing_scheme: "per_unit",
    custom_unit_amount: null,
    transform_quantity: null,
    unit_amount_decimal: "12999",
  },
  {
    id: "price_1NwyvmCdFicGkZNXAaCt1Pze",
    type: "recurring",
    active: true,
    object: "price",
    created: 1696302354,
    product: "prod_OjbCmp40EWhryG",
    currency: "usd",
    livemode: true,
    metadata: {},
    nickname: null,
    recurring: {
      interval: "month",
      usage_type: "licensed",
      interval_count: 3,
      aggregate_usage: null,
      trial_period_days: null,
    },
    lookup_key: null,
    tiers_mode: null,
    unit_amount: 7499,
    tax_behavior: "exclusive",
    billing_scheme: "per_unit",
    custom_unit_amount: null,
    transform_quantity: null,
    unit_amount_decimal: "7499",
  },
  {
    id: "price_1NwyvOCdFicGkZNXZZgftWi6",
    type: "recurring",
    active: true,
    object: "price",
    created: 1696302330,
    product: "prod_OjbCmp40EWhryG",
    currency: "usd",
    livemode: true,
    metadata: {},
    nickname: null,
    recurring: {
      interval: "month",
      usage_type: "licensed",
      interval_count: 1,
      aggregate_usage: null,
      trial_period_days: null,
    },
    lookup_key: null,
    tiers_mode: null,
    unit_amount: 2999,
    tax_behavior: "exclusive",
    billing_scheme: "per_unit",
    custom_unit_amount: null,
    transform_quantity: null,
    unit_amount_decimal: "2999",
  },
];
