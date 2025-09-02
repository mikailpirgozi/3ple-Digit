-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "currentValue" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "acquiredPrice" REAL,
    "salePrice" REAL,
    "saleDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_assets" ("createdAt", "currentValue", "description", "id", "name", "type", "updatedAt") SELECT "createdAt", "currentValue", "description", "id", "name", "type", "updatedAt" FROM "assets";
DROP TABLE "assets";
ALTER TABLE "new_assets" RENAME TO "assets";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
