CREATE TYPE "WalletTransactionType" AS ENUM (
    'OPENING_BALANCE',
    'OPENING_COMMITMENT',
    'DEPOSIT',
    'BID_COMMITTED',
    'BID_RELEASED',
    'AUCTION_DEBIT',
    'AUCTION_CREDIT'
);

CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletUserId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "lotId" TEXT,
    "lotTitle" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WalletTransaction_walletUserId_createdAt_idx"
    ON "WalletTransaction"("walletUserId", "createdAt");

ALTER TABLE "WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_walletUserId_fkey"
    FOREIGN KEY ("walletUserId") REFERENCES "Wallet"("userId")
    ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "WalletTransaction" ("id", "walletUserId", "type", "amount", "description", "createdAt")
SELECT gen_random_uuid()::text, "userId", 'OPENING_BALANCE', "balance",
       'Saldo disponível no início do extrato', CURRENT_TIMESTAMP
FROM "Wallet"
WHERE "balance" > 0;

INSERT INTO "WalletTransaction" ("id", "walletUserId", "type", "amount", "description", "createdAt")
SELECT gen_random_uuid()::text, "userId", 'OPENING_COMMITMENT', "committed",
       'Lances ativos no início do extrato', CURRENT_TIMESTAMP
FROM "Wallet"
WHERE "committed" > 0;
