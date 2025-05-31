---------------------------------------------------------------------------------------------------------------
-- Park Xpress Database Creation Script
-- This script creates the database and the necessary tables for the Park Xpress system.
----------------------------------------------------------------------------------------------------------------
-- Sequence Creation
-- This script creates the necessary sequences for the Park Xpress system,
----------------------------------------------------------------------------------------------------------------
-- Users Sequence
CREATE SEQUENCE eparking.ep_users_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Roles Sequence
CREATE SEQUENCE eparking.ep_roles_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Clients Sequence
CREATE Sequence eparking.ep_clients_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Packages Sequence
CREATE SEQUENCE eparking.ep_packages_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE SEQUENCE eparking.ep_clients_packages_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Information Sequence
CREATE SEQUENCE eparking.ep_information_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Cashier Session Sequence
CREATE SEQUENCE eparking.ep_cashier_session_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Cashier Transaction Sequence
CREATE SEQUENCE eparking.ep_cashier_transaction_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Vehicles Sequence
CREATE SEQUENCE eparking.ep_vehicles_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--Notes Sequence
CREATE SEQUENCE eparking.ep_notes_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--Tax Sequence 
CREATE SEQUENCE eparking.ep_tax_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Server Sequence
CREATE SEQUENCE eparking.ep_server_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Sequence for Audit Table
CREATE SEQUENCE eparking.ep_cashier_audit_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE SEQUENCE eparking.ep_clients_packages_seq START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE SEQUENCE eparking.ep_reminder_emails_seq INCREMENT BY 1 START
WITH
    1 NO MINVALUE NO MAXVALUE CACHE 1;

----------------------------------------------------------------------------------------------------------------
-- Enums for New Cashier System
----------------------------------------------------------------------------------------------------------------
CREATE TYPE eparking.transaction_type AS ENUM ('ingreso', 'egreso');

CREATE TYPE eparking.payment_method AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'otros');

----------------------------------------------------------------------------------------------------------------
-- Table Creation
-- This script creates the necessary tables for the Park Xpress system, 
-- including users, roles, clients, packages, and more information needed 
-- for the system.
----------------------------------------------------------------------------------------------------------------
-- Users table
-- This table stores the users of the system, including their personal information and credentials.
CREATE TABLE
    eparking.ep_users (
        users_id int NOT NULL DEFAULT nextval ('eparking.ep_users_seq') PRIMARY KEY,
        users_name varchar(100) NOT NULL,
        users_lastname varchar(100) NOT NULL,
        users_id_card varchar(30) NOT NULL,
        users_email varchar(200) NOT NULL,
        users_username varchar(30) NOT NULL,
        users_password varchar(200) NOT NULL,
        users_version int NOT NULL DEFAULT 1,
        session_id varchar(36),
        session_last_activity timestamp
    );

----------------------------------------------------------------------------------------------------------------
-- Roles table
-- This table stores the roles that can be assigned to users, such as admin, manager, etc.
create table
    eparking.ep_roles (
        rol_id int not null DEFAULT nextval ('eparking.ep_roles_seq') PRIMARY KEY,
        rol_name varchar(50) not null,
        rol_version int not null default 1
    );

----------------------------------------------------------------------------------------------------------------
-- User Roles table
-- This table establishes a many-to-many 
--relationship between users and roles, allowing a user to have multiple roles.
create table
    eparking.ep_user_roles (
        rol_user_users_id int not null,
        rol_user_rol_id int not null
    );

----------------------------------------------------------------------------------------------------------------
-- Clients table
-- This table stores the clients of the system, including their personal information.
create table
    eparking.ep_clients (
        client_id int not null DEFAULT nextval ('eparking.ep_clients_seq') PRIMARY KEY,
        client_name varchar(100) not null,
        client_lastname varchar(100) not null,
        client_id_card varchar(30) not null,
        client_email varchar(200) not null,
        client_phone varchar(30) not null,
        client_address varchar(200) not null,
        client_vehicle_plate varchar(20) not null,
        client_version int not null default 1
    );

----------------------------------------------------------------------------------------------------------------
-- Packages table
-- This table stores the different parking packages available in the system, including their details and prices.
create table
    eparking.ep_packages (
        pack_id int not null DEFAULT nextval ('eparking.ep_packages_seq') PRIMARY KEY,
        pack_name varchar(100) not null,
        pack_price int not null,
        pack_version int not null default 1
    );

----------------------------------------------------------------------------------------------------------------
-- Client Packages table
-- This table establishes a many-to-many relationship between clients and packages,
-- allowing a client to have multiple packages and a package to be assigned to multiple clients.
-- It also includes the start and end dates for each package assigned to a client.
-- Start and finish dates are managed in backend
CREATE TABLE
    eparking.ep_clients_packages (
        client_pack_id INT NOT NULL DEFAULT nextval ('eparking.ep_clients_packages_seq') PRIMARY KEY,
        client_pack_client_id INT NOT NULL,
        client_pack_pack_id INT NOT NULL,
        client_pack_start_date DATE NOT NULL,
        client_pack_end_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'pendiente'
    );

----------------------------------------------------------------------------------------------------------------
-- Information table
-- This table stores information about the parking lots, including their details and images.
create table
    eparking.ep_information (
        info_id int not null DEFAULT nextval ('eparking.ep_information_seq') PRIMARY KEY,
        info_name varchar(100) not null,
        info_owner varchar(100) not null,
        info_owner_id_card varchar(50) not null,
        info_owner_phone varchar(100) not null,
        info_location varchar(200) not null,
        info_spaces int not null,
        info_image bytea not null,
        info_schedule varchar(200) not null,
        info_version int not null default 1
    );

----------------------------------------------------------------------------------------------------------------
-- New Cashier Session Table
----------------------------------------------------------------------------------------------------------------
CREATE TABLE
    eparking.ep_cashier_session (
        session_id INT NOT NULL DEFAULT nextval ('eparking.ep_cashier_session_seq') PRIMARY KEY,
        session_user_id INT NOT NULL,
        session_open_amount NUMERIC(10, 2) NOT NULL,
        session_open_time TIMESTAMP NOT NULL,
        session_close_amount NUMERIC(10, 2),
        session_close_time TIMESTAMP,
        session_is_closed BOOLEAN NOT NULL DEFAULT FALSE,
        session_cash_type VARCHAR(50) NOT NULL,
        session_version INT NOT NULL DEFAULT 1
    );

----------------------------------------------------------------------------------------------------------------
-- New Cashier Transaction Table
----------------------------------------------------------------------------------------------------------------
CREATE TABLE
    eparking.ep_cashier_transaction (
        transaction_id INT NOT NULL DEFAULT nextval ('eparking.ep_cashier_transaction_seq') PRIMARY KEY,
        transaction_session_id INT NOT NULL,
        transaction_amount NUMERIC(10, 2) NOT NULL,
        transaction_type eparking.transaction_type NOT NULL,
        transaction_pay_method eparking.payment_method NOT NULL,
        transaction_description VARCHAR(255),
        transaction_created_at TIMESTAMP NOT NULL DEFAULT NOW ()
    );

-- Table Creation
CREATE TABLE
    eparking.ep_cashier_audit (
        audit_id INT NOT NULL DEFAULT nextval ('eparking.ep_cashier_audit_seq') PRIMARY KEY,
        audit_session_id INT NOT NULL,
        audit_user_id INT NOT NULL,
        audit_cash_type VARCHAR(100) NOT NULL,
        audit_expected_amount NUMERIC(12, 2) NOT NULL,
        audit_real_amount NUMERIC(12, 2) NOT NULL,
        audit_difference NUMERIC(12, 2) NOT NULL,
        audit_reason TEXT NOT NULL,
        audit_created_at TIMESTAMP NOT NULL DEFAULT NOW (),
        -- 💰 Nuevos campos de desglose
        audit_cash_coins NUMERIC(12, 2) NOT NULL DEFAULT 0,
        audit_cash_bills NUMERIC(12, 2) NOT NULL DEFAULT 0,
        audit_cash_sinpe NUMERIC(12, 2) NOT NULL DEFAULT 0,
        audit_cash_transfer NUMERIC(12, 2) NOT NULL DEFAULT 0
    );

----------------------------------------------------------------------------------------------------------------
-- Vehicles Table
-- This table stores all the information about the vehicles parked at the parking lot.
create table
    eparking.ep_vehicles (
        veh_id int not null DEFAULT nextval ('eparking.ep_vehicles_seq') PRIMARY KEY,
        veh_reference varchar(100) not null,
        veh_plate varchar(10) not null,
        veh_owner varchar(100) not null,
        veh_color varchar(30),
        veh_ingress_date TIMESTAMP(6) not null,
        veh_egress_date TIMESTAMP(6),
        veh_status varchar(1) NOT NULL CHECK (veh_status IN ('P', 'E')),
        veh_tax varchar(10) not null,
        veh_version int not null DEFAULT 1
    );

----------------------------------------------------------------------------------------------------------------
-- Notes Table
-- This table stores all the notes send by the telegram bot and important updates in the parking lot
create table
    eparking.ep_notes (
        notes_id int not null DEFAULT nextval ('eparking.ep_notes_seq') PRIMARY KEY,
        notes_user_id int not null,
        notes_content text not null,
        notes_date date not null,
        notes_expiry date,
        notes_status varchar(20) not null DEFAULT "nuevo"
    );

----------------------------------------------------------------------------------------------------------------
-- Tax Table
-- This table store the regular price for all vehicles unless it has a package, this is been managed in backend
create table
    eparking.ep_tax (
        tax_id int not null DEFAULT nextval ('eparking.ep_tax_seq') PRIMARY KEY,
        tax_price int not null,
        tax_version int not null DEFAULT 1
    );

----------------------------------------------------------------------------------------------------------------
-- Server Table
-- This table stores sensitive data about server used to send some emails, to users and clients
create table
    eparking.ep_server (
        server_id int not null DEFAULT nextval ('eparking.ep_server_seq') PRIMARY KEY,
        server_type varchar(30) not null,
        server_port varchar(100) not null,
        server_protocol varchar(100) not null,
        server_mail varchar(100) not null,
        server_password varchar(200) not null,
        server_timeout int not null,
        server_version int not null DEFAULT 1
    );

CREATE TABLE
    eparking.ep_reminder_emails (
        reminder_email_id INT PRIMARY KEY DEFAULT nextval ('eparking.ep_reminder_emails_seq'),
        client_pack_id INT NOT NULL,
        email_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    );

----------------------------------------------------------------------------------------------------------------
--Foreign Key section 
-- Here are store all the relations that the database need to work and communicate with tables
----------------------------------------------------------------------------------------------------------------
-- Links each user-role assignment to a specific user
ALTER TABLE eparking.ep_user_roles ADD CONSTRAINT fk_user_roles_users FOREIGN KEY (rol_user_users_id) REFERENCES eparking.ep_users (users_id);

-- A user can have one or more roles
-- Links each user-role assignment to a specific role
ALTER TABLE eparking.ep_user_roles ADD CONSTRAINT fk_user_roles_roles FOREIGN KEY (rol_user_rol_id) REFERENCES eparking.ep_roles (rol_id);

-- A role can be assigned to multiple users
-- Associates each client-package record with a specific client
ALTER TABLE eparking.ep_clients_packages ADD CONSTRAINT fk_clients_packages_clients FOREIGN KEY (client_pack_client_id) REFERENCES eparking.ep_clients (client_id);

-- A client can be assigned multiple packages
-- Associates each client-package record with a specific package
ALTER TABLE eparking.ep_clients_packages ADD CONSTRAINT fk_clients_packages_packages FOREIGN KEY (client_pack_pack_id) REFERENCES eparking.ep_packages (pack_id);

ALTER TABLE eparking.ep_cashier_session ADD CONSTRAINT fk_cashier_session_user FOREIGN KEY (session_user_id) REFERENCES eparking.ep_users (users_id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE eparking.ep_cashier_transaction ADD CONSTRAINT fk_transaction_session FOREIGN KEY (transaction_session_id) REFERENCES eparking.ep_cashier_session (session_id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Each transaction must be recorded under one cashier
-- Links each note to the user who created it (via Telegram or system)
ALTER TABLE eparking.ep_notes ADD CONSTRAINT fk_notes_users FOREIGN KEY (notes_user_id) REFERENCES eparking.ep_users (users_id);

ALTER TABLE eparking.ep_cashier_audit ADD CONSTRAINT fk_audit_session FOREIGN KEY (audit_session_id) REFERENCES eparking.ep_cashier_session (session_id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE eparking.ep_cashier_audit ADD CONSTRAINT fk_audit_user FOREIGN KEY (audit_user_id) REFERENCES eparking.ep_users (users_id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE eparking.ep_reminder_emails ADD CONSTRAINT fk_ep_reminder_emails_client_pack FOREIGN KEY (client_pack_id) REFERENCES eparking.ep_clients_packages (client_pack_id);

-- Each note is registered by a specific user
----------------------------------------------------------------------------------------------------------------
--Default values inserted
INSERT INTO
    eparking.ep_roles (rol_id, rol_name, rol_version)
VALUES
    (
        nextval ('eparking.ep_roles_seq'),
        'Administrador',
        1
    ),
    (
        nextval ('eparking.ep_roles_seq'),
        'Desarrollador',
        1
    ),
    (nextval ('eparking.ep_roles_seq'), 'Asistente', 1),
    (nextval ('eparking.ep_roles_seq'), 'Cajero/a', 1),
    (nextval ('eparking.ep_roles_seq'), 'Tester', 1);

-- Insert users and retrieve their generated IDs
WITH
    inserted_users AS (
        INSERT INTO
            eparking.ep_users (
                users_id,
                users_name,
                users_lastname,
                users_id_card,
                users_email,
                users_username,
                users_password,
                users_version
            )
        VALUES
            (
                nextval ('eparking.ep_users_seq'),
                'Genesis',
                'Brenes Calvo',
                '1-1581-0605',
                'gjbc0694@gmail.com',
                'Genesis Brenes',
                'Genesis1994',
                1
            ),
            (
                nextval ('eparking.ep_users_seq'),
                'Manuel',
                'Brenes Bonilla',
                '3-0273-0545',
                'Mabbo1965@gmail.com',
                'Manuel Brenes',
                'Manuel1965',
                1
            ),
            (
                nextval ('eparking.ep_users_seq'),
                'Arlinee',
                'Brenes Calvo',
                '3-0556-0247',
                'Arlineebrenescalvo16@gmail.com',
                'Arlinee Brenes',
                'Arlinee2004',
                1
            ),
            (
                nextval ('eparking.ep_users_seq'),
                'Alejandro',
                'Leon Marin',
                '1-1906-0738',
                'aleleonmarin01@gmail.com',
                'aleon',
                'aleon01',
                1
            ),
            (
                nextval ('eparking.ep_users_seq'),
                'Kendall',
                'Fonseca Hidalgo',
                '1-1920-0599',
                'kripperomghd@gmail.com',
                'ken',
                'ken',
                1
            ) RETURNING users_id,
            users_username
    )
    -- Assign roles by matching usernames to user_ids
INSERT INTO
    eparking.ep_user_roles (rol_user_users_id, rol_user_rol_id)
SELECT
    users_id,
    CASE users_username
        WHEN 'Genesis Brenes' THEN 1 -- Administrador
        WHEN 'Manuel Brenes' THEN 3 -- Asistente
        WHEN 'Arlinee Brenes' THEN 4 -- Cajero/a
        WHEN 'aleon' THEN 2 -- Desarrollador
        WHEN 'ken' THEN 2 -- Desarrollador
    END
FROM
    inserted_users;

----------------------------------------------------------------------------------------------------------------
-- © 2025 Park Xpress System. All rights reserved.
-- This script and its contents are proprietary to the Park Xpress System.
-- Unauthorized use, reproduction, or distribution is strictly prohibited without explicit written permission.
-- Developed for internal use only.
-- -------------------------------------------------------------------------------------------------------------