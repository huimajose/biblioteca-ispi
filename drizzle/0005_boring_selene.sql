CREATE TABLE "user_digital_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookid" integer NOT NULL,
	"userid" varchar(255) NOT NULL,
	"addedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_scores" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"points" integer DEFAULT 100 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "fileUrl" varchar(255);--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "document_type" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "is_digital" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "user_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "score_applied" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(20);