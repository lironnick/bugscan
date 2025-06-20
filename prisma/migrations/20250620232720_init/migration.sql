-- CreateTable
CREATE TABLE "scan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "values" TEXT NOT NULL,
    "gross_values" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
