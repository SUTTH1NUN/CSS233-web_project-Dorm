/* =========================================
   SECTION 4: MOCK DATA INSERTION (UPDATED)
   เพิ่มข้อมูลตัวอย่าง (ตึก A และ ตึก B)
   ========================================= */

-- 4.1 ข้อมูลประเภทห้องพัก (Master Data)
INSERT INTO room_info (room_type, room_size, room_price, room_furniture) VALUES
('Studio Suite', 26.00, 5500.00, 'Air conditioner, Smart TV, Refrigerator, Free Wi-Fi, Work Desk, 1 King Bed'),
('1 Bedroom Suite', 45.00, 8500.00, 'AC, TV, Fridge, Microwave, Balcony, 1 King Bed + Living Area'),
('Family Suite', 75.00, 15000.00, '2 AC, 2 TV, Large Fridge, Full Kitchen, Bathtub, Living Room, 2 King Beds');

-- 4.2 ข้อมูลผู้ดูแลระบบ (Admins)
INSERT INTO admins (first_name, last_name, username, password_hash) VALUES
('Somchai', 'Jaidee', 'admin', '$2b$10$SVxIRRo42y7A5ADPTjOwhe2xsuyosR0qQivgZaI1tGASxLyxuTLXi'),
('Somsri', 'Ruxsa', 'admin2', '$2b$10$SVxIRRo42y7A5ADPTjOwhe2xsuyosR0qQivgZaI1tGASxLyxuTLXi');

-- 4.3 ข้อมูลผู้เช่า (Tenants)
-- เพิ่มผู้เช่าคนที่ 5 (Robert) สำหรับตึก B
INSERT INTO tenants (first_name, last_name, phone_number, email, password_hash, tenant_status) VALUES
('John', 'Doe', '0812345678', 'john.doe@email.com', 'hash_john_123', 'active'),    -- ID: 1
('Jane', 'Smith', '0898765432', 'jane.smith@email.com', 'hash_jane_456', 'active'),  -- ID: 2
('Mana', 'Dee', '0855555555', 'mana.dee@email.com', 'hash_mana_789', 'active'),      -- ID: 3
('Alice', 'Wonder', '0911112222', 'alice.w@email.com', 'hash_alice_000', 'inactive'), -- ID: 4
('Robert', 'Brown', '0877778888', 'robert.b@email.com', 'hash_robert_999', 'active'); -- ID: 5 (New)

-- 4.4 ข้อมูลห้องพัก (Rooms) - เพิ่มตึก B
INSERT INTO rooms (building, floor, room_number, room_status, room_type) VALUES
-- === Building A ===
('A', 1, 'A101', 'occupied', 'Family Suite'),
('A', 1, 'A102', 'available', 'Family Suite'),
('A', 2, 'A201', 'occupied', '1 Bedroom Suite'),
('A', 2, 'A202', 'under_maintenance', '1 Bedroom Suite'),
('A', 2, 'A203', 'available', '1 Bedroom Suite'),
('A', 3, 'A301', 'occupied', 'Studio Suite'),
('A', 3, 'A302', 'available', 'Studio Suite'),
('A', 3, 'A303', 'available', 'Studio Suite'),

-- === Building B (เพิ่มใหม่) ===
-- ชั้น 1: Family Suite
('B', 1, 'B101', 'available', 'Family Suite'),
('B', 1, 'B102', 'occupied', 'Family Suite'), -- Robert อยู่ห้องนี้
-- ชั้น 2: 1 Bedroom Suite
('B', 2, 'B201', 'available', '1 Bedroom Suite'),
('B', 2, 'B202', 'available', '1 Bedroom Suite'),
-- ชั้น 3: Studio Suite
('B', 3, 'B301', 'available', 'Studio Suite'),
('B', 3, 'B302', 'available', 'Studio Suite');

-- 4.5 สัญญาเช่า (Lease Contracts)
INSERT INTO lease_contract (tenant_id, room_id, start_date, end_date, contract_status, deposit_amount) VALUES
-- สัญญาเดิมของตึก A
(1, 1, '2024-01-01', '2024-12-31', 'active', 30000.00), -- John (A101)
(2, 3, '2024-02-15', '2025-02-14', 'active', 17000.00), -- Jane (A201)
(3, 6, '2024-03-01', '2025-02-28', 'active', 11000.00), -- Mana (A301) *แก้ room_id ให้ตรงกับลำดับ insert*
(4, 7, '2023-01-01', '2023-12-31', 'ended', 11000.00),  -- Alice (A302 - เก่า)

-- สัญญาใหม่ของตึก B
(5, 10, '2024-04-01', '2025-03-31', 'active', 30000.00); -- Robert (B102 - Family)

-- 4.6 การชำระเงิน/บิล (Payments)
INSERT INTO payments (
    contract_id, 
    water_meter_last, water_meter_current, water_fee, 
    electricity_meter_last, electricity_meter_current, electricity_fee, 
    room_fee, total_amount, 
    payment_status, billing_date, due_date
) VALUES
-- บิลตึก A (เหมือนเดิม)
(1, 100.00, 110.00, 200.00, 500.00, 650.00, 1200.00, 15000.00, 16400.00, 'paid', '2024-03-25', '2024-04-05'),
(2, 50.00, 55.00, 100.00, 200.00, 280.00, 640.00, 8500.00, 9240.00, 'overdue', '2024-03-25', '2024-04-05'),
(3, 20.00, 25.00, 100.00, 100.00, 140.00, 320.00, 5500.00, 5920.00, 'pending', '2024-04-25', '2024-05-05'),

-- บิลตึก B (ของ Robert)
(5, 0.00, 5.00, 100.00, 0.00, 50.00, 400.00, 15000.00, 15500.00, 'paid', '2024-04-25', '2024-05-05');

-- 4.7 การแจ้งซ่อม (Repairs)
INSERT INTO repairs (tenant_id, room_id, issue_title, issue_description, request_date, repair_status, admin_note) VALUES
(1, 1, 'Air Conditioner Leaking', 'น้ำแอร์หยดลงบนเตียงครับ', '2024-04-10', 'pending', NULL),
(2, 3, 'Broken Faucet', 'ก๊อกน้ำอ่างล้างหน้าหัก', '2024-03-15', 'completed', 'เปลี่ยนก๊อกใหม่ให้แล้วครับ'),
-- แจ้งซ่อมของตึก B
(5, 10, 'Internet Slow', 'Wifi สัญญาณอ่อนมากครับห้องนี้', '2024-04-02', 'in_progress', 'แจ้งช่างเทคนิคแล้ว');

-- 4.8 ประกาศข่าวสาร (Announcements)
INSERT INTO announcements (admin_id, title, content, announcements_status, visible_until) VALUES
(1, 'แจ้งปิดปรับปรุงระบบน้ำ', 'จะมีการปิดน้ำเพื่อซ่อมท่อเมน วันที่ 20 เม.ย. เวลา 10:00 - 15:00 น.', 'active', '2024-04-21'),
(2, 'เตือนชำระค่าเช่า', 'กรุณาชำระค่าเช่าภายในวันที่ 5 ของทุกเดือนเพื่อหลีกเลี่ยงค่าปรับ', 'active', '2024-12-31');