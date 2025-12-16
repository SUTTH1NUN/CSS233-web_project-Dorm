/* =========================================
   SECTION 1: CLEANUP (RESET DATABASE)
   ลบตารางและ Type เก่าทิ้งก่อน เพื่อเริ่มใหม่
   ========================================= */

-- Drop Tables (เรียงลำดับจากตารางลูกไปตารางแม่ เพื่อเลี่ยง FK Error)
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS repairs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS lease_contract;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS room_info;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS admins;

-- Drop Enums
DROP TYPE IF EXISTS tenant_status_enum CASCADE;
DROP TYPE IF EXISTS room_status_enum CASCADE;
DROP TYPE IF EXISTS contract_status_enum CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS repair_status_enum CASCADE;
DROP TYPE IF EXISTS announcements_status_enum CASCADE;

/* =========================================
   SECTION 2: ENUM TYPES DEFINITION
   กำหนดค่าคงที่สำหรับสถานะต่างๆ
   ========================================= */

CREATE TYPE tenant_status_enum AS ENUM ('active', 'inactive');
CREATE TYPE room_status_enum AS ENUM ('available', 'booked', 'occupied', 'under_maintenance');
CREATE TYPE contract_status_enum AS ENUM ('active', 'ended');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE repair_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE announcements_status_enum AS ENUM ('active', 'inactive');

/* =========================================
   SECTION 3: TABLE DEFINITIONS
   สร้างตารางเก็บข้อมูล
   ========================================= */

-- 3.1 ตารางผู้ดูแลระบบ
CREATE TABLE IF NOT EXISTS admins (
    admin_id        SERIAL PRIMARY KEY,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

-- 3.2 ตารางผู้เช่า
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id       SERIAL PRIMARY KEY,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    phone_number    VARCHAR(15) NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    tenant_status   tenant_status_enum DEFAULT 'active',
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

-- 3.3 ข้อมูลประเภทห้องพัก (Master Data)
CREATE TABLE IF NOT EXISTS room_info (
    room_type       VARCHAR(50) PRIMARY KEY,
    room_size       DECIMAL(5,2),
    room_price      DECIMAL(10,2),
    room_furniture  TEXT
);

-- 3.4 ตารางห้องพัก
CREATE TABLE IF NOT EXISTS rooms (
    room_id     SERIAL PRIMARY KEY,
    building    VARCHAR(10) NOT NULL,
    floor       INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    room_status room_status_enum DEFAULT 'available',
    room_type   VARCHAR(50) NOT NULL REFERENCES room_info(room_type) ON UPDATE CASCADE,
    UNIQUE (building, room_number)
);

-- 3.5 สัญญาเช่า
CREATE TABLE IF NOT EXISTS lease_contract (
    contract_id     SERIAL PRIMARY KEY,
    tenant_id       INT NOT NULL REFERENCES tenants(tenant_id),
    room_id         INT NOT NULL REFERENCES rooms(room_id),
    start_date      DATE NOT NULL,
    end_date        DATE,
    contract_status contract_status_enum DEFAULT 'active',
    deposit_amount  DECIMAL(10,2) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.6 การชำระเงิน (บิล)
CREATE TABLE IF NOT EXISTS payments (
    payment_id              SERIAL PRIMARY KEY,
    contract_id             INT NOT NULL REFERENCES lease_contract(contract_id),
    
    -- มิเตอร์น้ำ
    water_meter_current     DECIMAL(10,2) NOT NULL,
    water_meter_last        DECIMAL(10,2) NOT NULL,
    water_fee               DECIMAL(10,2) NOT NULL,
    
    -- มิเตอร์ไฟ
    electricity_meter_current DECIMAL(10,2) NOT NULL,
    electricity_meter_last    DECIMAL(10,2) NOT NULL,
    electricity_fee           DECIMAL(10,2) NOT NULL,
    
    -- ยอดรวม
    room_fee                DECIMAL(10,2) NOT NULL,
    total_amount            DECIMAL(10,2) NOT NULL,
    
    payment_status          payment_status_enum DEFAULT 'pending',
    billing_date            DATE DEFAULT CURRENT_DATE,
    due_date                DATE,
    payment_date            TIMESTAMP
);

-- 3.7 การแจ้งซ่อม
CREATE TABLE IF NOT EXISTS repairs (
    repair_id           SERIAL PRIMARY KEY,
    tenant_id           INT NOT NULL REFERENCES tenants(tenant_id),
    room_id             INT NOT NULL REFERENCES rooms(room_id),
    issue_title         VARCHAR(50) NOT NULL,
    issue_description   TEXT NOT NULL,
    phone_number        VARCHAR(15),
    request_date        DATE DEFAULT CURRENT_DATE,
    repair_status       repair_status_enum DEFAULT 'pending',
    resolved_date       DATE,
    img_path            VARCHAR(255),
    admin_note          TEXT
);

-- 3.8 ประกาศข่าวสาร
CREATE TABLE IF NOT EXISTS announcements (
    announcement_id         SERIAL PRIMARY KEY,
    admin_id                INT NOT NULL REFERENCES admins(admin_id),
    title                   VARCHAR(100) NOT NULL,
    content                 TEXT NOT NULL,
    announcements_status    announcements_status_enum DEFAULT 'active',
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visible_until           DATE
);