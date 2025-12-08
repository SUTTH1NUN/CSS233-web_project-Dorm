-- init.sql

CREATE TABLE IF NOT EXISTS admins(
    admin_id bigserial primary key,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    username varchar(255) not null,
    password_hash varchar(255) not null,
    create_at timestamp default current_timestamp
)