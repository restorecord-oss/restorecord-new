-- AlterTable
ALTER TABLE `servers` ADD COLUMN `pullTimeout` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);
