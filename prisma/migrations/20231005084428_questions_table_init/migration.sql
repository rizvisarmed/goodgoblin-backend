-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL DEFAULT 'John',
    `lastName` VARCHAR(191) NOT NULL DEFAULT 'Doe',
    `email` VARCHAR(191) NOT NULL,
    `imgUrl` VARCHAR(191) NULL,
    `imgKey` VARCHAR(191) NULL,
    `isOrientationCompleted` BOOLEAN NOT NULL DEFAULT false,
    `isPrepAiCompleted` BOOLEAN NOT NULL DEFAULT false,
    `password` VARCHAR(191) NULL,
    `role` ENUM('admin', 'student') NOT NULL,
    `noOfAiChecks` VARCHAR(191) NOT NULL DEFAULT '1',
    `noOfEssaysToGenerate` VARCHAR(191) NOT NULL DEFAULT '1',
    `planId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_planId_fkey`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `prices` JSON NULL,
    `otherDetails` JSON NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `subscriptions` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `Transaction_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    INDEX `PasswordResetToken_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `University` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `acronym` VARCHAR(191) NULL,
    `numberOfRequiredEssays` INTEGER NOT NULL,
    `noEssayFound` BOOLEAN NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deadline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` ENUM('Early_Decision', 'Early_Decision_2', 'Early_Action', 'Early_Action_2', 'Regular_Decision', 'Rolling_Admission') NOT NULL DEFAULT 'Early_Decision',
    `deadline` DATETIME(3) NOT NULL,
    `universityId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `Deadline_universityId_fkey`(`universityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemGuidance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EssayCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `list` JSON NOT NULL,
    `systemGuidanceV1` INTEGER NOT NULL,
    `systemGuidanceV2` INTEGER NOT NULL,
    `systemGuidanceV3` INTEGER NOT NULL,
    `systemGuidanceFinal` INTEGER NOT NULL,
    `systemGuidanceFinalInterim` INTEGER NOT NULL DEFAULT 51,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Essay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `universityId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `text` LONGTEXT NOT NULL,
    `minWordLimit` INTEGER NOT NULL,
    `maxWordLimit` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `Essay_categoryId_fkey`(`categoryId`),
    INDEX `Essay_universityId_fkey`(`universityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EssaySubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `collegeApplicationId` INTEGER NOT NULL,
    `essayPromptId` INTEGER NOT NULL,
    `prompt` LONGTEXT NULL,
    `systemGuidance` JSON NULL,
    `v1` LONGTEXT NULL,
    `v2` LONGTEXT NULL,
    `v3` LONGTEXT NULL,
    `final` LONGTEXT NULL,
    `personalizeText` LONGTEXT NULL,
    `submission` LONGTEXT NULL,
    `isGenerating` BOOLEAN NOT NULL DEFAULT false,
    `aiFlag` VARCHAR(191) NULL,
    `favrouiteVersion` VARCHAR(191) NULL,
    `finalInput` LONGTEXT NULL,
    `initialRequestedOn` DATETIME(3) NULL,
    `generatedOn` DATETIME(3) NULL,
    `noOfAiScans` VARCHAR(191) NOT NULL DEFAULT '0',
    `noOfRegenerations` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `EssaySubmission_collegeApplicationId_fkey`(`collegeApplicationId`),
    INDEX `EssaySubmission_essayPromptId_fkey`(`essayPromptId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserUniversityDeadline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `universityId` INTEGER NOT NULL,
    `deadlineId` INTEGER NOT NULL,
    `type` ENUM('reach', 'target', 'safety') NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `UserUniversityDeadline_deadlineId_fkey`(`deadlineId`),
    INDEX `UserUniversityDeadline_universityId_fkey`(`universityId`),
    INDEX `UserUniversityDeadline_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionName` LONGTEXT NOT NULL,
    `sectionSubTitle` VARCHAR(191) NOT NULL,
    `isRequired` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionId` INTEGER NOT NULL,
    `studentId` INTEGER NULL,
    `sampleAnswersId` INTEGER NULL,
    `questionText` LONGTEXT NOT NULL,
    `customData` JSON NULL,
    `inputType` VARCHAR(191) NOT NULL,
    `isRequired` BOOLEAN NOT NULL,
    `minWordLimit` INTEGER NOT NULL,
    `maxWordLimit` INTEGER NOT NULL,
    `dependentOnQuestionId` INTEGER NULL,
    `answerType` ENUM('Array', 'String', 'Boolean') NOT NULL DEFAULT 'String',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `InterviewQuestion_sectionId_fkey`(`sectionId`),
    INDEX `InterviewQuestion_studentId_fkey`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewQuestionSampleAnswers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `texts` JSON NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewQuestionEssayCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `interviewQuestionId` INTEGER NULL,
    `promptQuestionBefore` LONGTEXT NULL,
    `promptQuestionAfter` LONGTEXT NULL,
    `essayCategoryLetter` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `InterviewQuestionEssayCategory_interviewQuestionId_fkey`(`interviewQuestionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `interviewQuestionId` INTEGER NOT NULL,
    `answerText` LONGTEXT NULL,
    `customAnswer` JSON NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `InterviewAnswer_interviewQuestionId_fkey`(`interviewQuestionId`),
    INDEX `InterviewAnswer_studentId_fkey`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportedIssue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `universityDeadlineId` INTEGER NOT NULL,
    `type` ENUM('university', 'essay') NOT NULL,
    `otherDetails` JSON NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `essaySubmissionId` INTEGER NULL,

    INDEX `ReportedIssue_essaySubmissionId_fkey`(`essaySubmissionId`),
    INDEX `ReportedIssue_studentId_fkey`(`studentId`),
    INDEX `ReportedIssue_universityDeadlineId_fkey`(`universityDeadlineId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deadline` ADD CONSTRAINT `Deadline_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Essay` ADD CONSTRAINT `Essay_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `EssayCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Essay` ADD CONSTRAINT `Essay_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EssaySubmission` ADD CONSTRAINT `EssaySubmission_collegeApplicationId_fkey` FOREIGN KEY (`collegeApplicationId`) REFERENCES `UserUniversityDeadline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EssaySubmission` ADD CONSTRAINT `EssaySubmission_essayPromptId_fkey` FOREIGN KEY (`essayPromptId`) REFERENCES `Essay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserUniversityDeadline` ADD CONSTRAINT `UserUniversityDeadline_deadlineId_fkey` FOREIGN KEY (`deadlineId`) REFERENCES `Deadline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserUniversityDeadline` ADD CONSTRAINT `UserUniversityDeadline_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserUniversityDeadline` ADD CONSTRAINT `UserUniversityDeadline_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewQuestion` ADD CONSTRAINT `InterviewQuestion_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `InterviewSection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewQuestion` ADD CONSTRAINT `InterviewQuestion_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewQuestion` ADD CONSTRAINT `InterviewQuestion_sampleAnswersId_fkey` FOREIGN KEY (`sampleAnswersId`) REFERENCES `InterviewQuestionSampleAnswers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewQuestionEssayCategory` ADD CONSTRAINT `InterviewQuestionEssayCategory_interviewQuestionId_fkey` FOREIGN KEY (`interviewQuestionId`) REFERENCES `InterviewQuestion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewAnswer` ADD CONSTRAINT `InterviewAnswer_interviewQuestionId_fkey` FOREIGN KEY (`interviewQuestionId`) REFERENCES `InterviewQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewAnswer` ADD CONSTRAINT `InterviewAnswer_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportedIssue` ADD CONSTRAINT `ReportedIssue_essaySubmissionId_fkey` FOREIGN KEY (`essaySubmissionId`) REFERENCES `EssaySubmission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportedIssue` ADD CONSTRAINT `ReportedIssue_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportedIssue` ADD CONSTRAINT `ReportedIssue_universityDeadlineId_fkey` FOREIGN KEY (`universityDeadlineId`) REFERENCES `UserUniversityDeadline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
