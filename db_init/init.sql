-- init.sql
-- =====================
-- ENUM
-- =====================
create type tenant_status as ENUM ('active', 'inactive');


create table if not exists admins(
    admin_id serial primary key,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    username varchar(50) unique not null ,
    password_hash varchar(255) not null,
    create_at timestamp default current_timestamp,
    updated_at timestamp
);

create table if not exists tenants(
    tenant_id bigserial primary key,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    phone_number varchar(15) not null,
    email varchar(100) unique not null,
    status tenant_status DEFAULT 'active',
    password_hash varchar(255) not null,
    create_at timestamp default current_timestamp,
    updated_at timestamp
);
