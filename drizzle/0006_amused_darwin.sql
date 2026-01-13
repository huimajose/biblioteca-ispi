CREATE TABLE "books_temp" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"author" varchar(255) NOT NULL,
	"genre" varchar(100) NOT NULL,
	"isbn" varchar(13) NOT NULL,
	"total_copies" integer DEFAULT 0 NOT NULL,
	"available_copies" integer DEFAULT 0 NOT NULL,
	"cover" varchar(255) NOT NULL,
	"fileUrl" varchar(255),
	"document_type" integer DEFAULT 1 NOT NULL,
	"is_digital" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "books_temp_isbn_unique" UNIQUE("isbn")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" varchar(500) NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "books" CASCADE;