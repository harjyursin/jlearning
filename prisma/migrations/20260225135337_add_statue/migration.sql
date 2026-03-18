-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "photo" TEXT,
    "pseudo" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mdp" TEXT NOT NULL,
    "contact" TEXT,
    "adresse" TEXT,
    "actif" TEXT NOT NULL DEFAULT 'non',
    "role" TEXT NOT NULL DEFAULT 'user',
    "statue" TEXT NOT NULL DEFAULT 'En_attente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("actif", "adresse", "contact", "createdAt", "email", "id", "mdp", "nom", "photo", "pseudo", "role", "statue", "updatedAt") SELECT "actif", "adresse", "contact", "createdAt", "email", "id", "mdp", "nom", "photo", "pseudo", "role", "statue", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_pseudo_key" ON "User"("pseudo");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
