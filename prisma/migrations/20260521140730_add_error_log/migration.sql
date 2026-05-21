-- CreateTable
CREATE TABLE "error_logs" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "stack_trace" TEXT,
    "exception_type" VARCHAR(255),
    "user_id" INTEGER,
    "path" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);
