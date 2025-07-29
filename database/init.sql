CREATE TYPE "public"."device_status_enum" AS ENUM('installé', 'maintenance', 'stock');--> statement-breakpoint
CREATE TABLE "device_model" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "device_model_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"type_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "device_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"model_id" integer NOT NULL,
	"mac" varchar(17) NOT NULL,
	"status" "device_status_enum" DEFAULT 'stock',
	CONSTRAINT "device_mac_unique" UNIQUE("mac")
);
--> statement-breakpoint
CREATE TABLE "device_type" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "device_type_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "device_model" ADD CONSTRAINT "device_model_type_id_device_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."device_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device" ADD CONSTRAINT "device_model_id_device_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."device_model"("id") ON DELETE no action ON UPDATE no action;


--------------------------------------------------------------


insert into device_type (name) values 
('Box'), 
('Radiateur'), 
('Chaudière');

insert into device_model (name, type_id) values 
('Box OCP',                 (select id from device_type where name = 'Box')), 
('Radiateur 1700X',         (select id from device_type where name = 'Radiateur')), 
('Chaudière OCP Leopard',   (select id from device_type where name = 'Chaudière')),
('Chaudière OCP Capri',     (select id from device_type where name = 'Chaudière')),
('Radiateur 2700',          (select id from device_type where name = 'Radiateur'));