CREATE TABLE "device" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "device_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"model_id" integer NOT NULL,
	"mac" varchar(17) NOT NULL,
	"status" varchar(20),
	CONSTRAINT "device_mac_unique" UNIQUE("mac")
);
