-- CreateTable
CREATE TABLE "LoadRun" (
    "id" STRING NOT NULL,
    "userEmail" STRING NOT NULL,
    "numSessions" INT4 NOT NULL,
    "numOrders" INT4 NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),

    CONSTRAINT "LoadRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadRunSummary" (
    "id" STRING NOT NULL,
    "runId" STRING NOT NULL,
    "username" STRING NOT NULL,
    "ordersCompleted" INT4 NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoadRunSummary_pkey" PRIMARY KEY ("id")
);
