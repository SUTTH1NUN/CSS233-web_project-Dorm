INSERT INTO admins (first_name, last_name, username, password_hash, created_at) VALUES 
('สมชาย', 'ใจดี', 'admin01', '$2a$12$R9h/cIPz0gi.URNNXRFXjO.p/u/8/1y..placeholder_hash..', NOW()),
('กานดา', 'มีสุข', 'admin02', '$2a$12$R9h/cIPz0gi.URNNXRFXjO.p/u/8/1y..placeholder_hash..', NOW());


INSERT INTO tenants (first_name, last_name, phone_number, email, tenant_status, password_hash, created_at) VALUES 
('นิพนธ์', 'รักเรียน', '081-234-5678', 'niphon.r@email.com', 'active', 'hash1234', NOW()), -- อยู่ A101
('วิภา', 'สวยงาม', '089-876-5432', 'wipa.s@email.com', 'active', 'hash1234', NOW()),    -- อยู่ A201
('John', 'Smith', '090-111-2222', 'john.smith@email.com', 'active', 'hash1234', NOW()),  -- อยู่ A301
('สมศรี', 'ขยันยิ่ง', '086-555-4444', 'somsri.k@email.com', 'inactive', 'hash1234', NOW()), -- ย้ายออก
('ก้องภพ', 'ใจสู้', '091-888-7777', 'kongphop@email.com', 'active', 'hash1234', NOW()),    -- อยู่ B101
('Alice', 'Wonder', '095-444-3333', 'alice@email.com', 'active', 'hash1234', NOW());       -- อยู่ B401


INSERT INTO room_info (room_type, room_size, room_price, room_furniture) VALUES 
('Studio', 26.00, 4500.00, 'เตียง 5 ฟุต, ตู้เสื้อผ้า, โต๊ะเครื่องแป้ง, แอร์'),
('1 Bedroom', 35.00, 6500.00, 'เตียง 6 ฟุต, ตู้เสื้อผ้า, โซฟา, ทีวี, ตู้เย็น, ไมโครเวฟ, แอร์ 2 ตัว'),
('2 Bedroom', 55.00, 12000.00, 'เตียง 6 ฟุต, เตียง 3.5 ฟุต, โซฟาชุดใหญ่, โต๊ะทานข้าว, ครัวบิ้วอิน, เครื่องซักผ้า');


INSERT INTO rooms (building, floor, room_number, room_status, room_type) VALUES 
-- --- ตึก A (Building A) ---
-- ชั้น 1
('A', 1, 'A101', 'occupied', 'Studio'),
('A', 1, 'A102', 'occupied', 'Studio'),
('A', 1, 'A103', 'under_maintenance', 'Studio'), -- ห้องซ่อม
-- ชั้น 2
('A', 2, 'A201', 'occupied', '1 Bedroom'),
('A', 2, 'A202', 'available', '1 Bedroom'),
-- ชั้น 3
('A', 3, 'A301', 'occupied', '2 Bedroom'),
('A', 3, 'A302', 'available', '1 Bedroom'),
-- ชั้น 4 (ใหม่)
('A', 4, 'A401', 'available', 'Studio'),
('A', 4, 'A402', 'available', 'Studio'),

-- --- ตึก B (Building B) ---
-- ชั้น 1
('B', 1, 'B101', 'occupied', 'Studio'),
('B', 1, 'B102', 'booked', 'Studio'), -- มีคนจอง
-- ชั้น 2
('B', 2, 'B201', 'occupied', '1 Bedroom'),
('B', 2, 'B202', 'available', '1 Bedroom'),
-- ชั้น 3
('B', 3, 'B301', 'available', '2 Bedroom'),
-- ชั้น 4 (ใหม่)
('B', 4, 'B401', 'occupied', '2 Bedroom'),
('B', 4, 'B402', 'available', '1 Bedroom');


INSERT INTO lease_contract (tenant_id, room_id, start_date, end_date, contract_status, deposit_amount) VALUES 
-- นิพนธ์ อยู่ A101 (room_id ประมาณ 1)
(1, 1, '2023-01-15', '2024-01-15', 'active', 9000.00),
-- วิภา อยู่ A201 (room_id ประมาณ 4)
(2, 4, '2023-06-01', '2024-06-01', 'active', 13000.00),
-- John อยู่ A301 (room_id ประมาณ 6)
(3, 6, '2023-09-01', '2024-02-28', 'active', 24000.00),
-- ก้องภพ อยู่ B101 (room_id ประมาณ 10 - ตึก B ชั้น 1)
(5, 10, '2023-11-01', '2024-11-01', 'active', 9000.00),
-- Alice อยู่ B401 (room_id ประมาณ 15 - ตึก B ชั้น 4)
(6, 15, '2023-05-20', '2024-05-20', 'active', 24000.00);


INSERT INTO payments (contract_id, water_meter_current, water_meter_last, water_fee, electricity_meter_current, electricity_meter_last, electricity_fee, room_fee, total_amount, payment_status, billing_date, due_date, payment_date) VALUES 
-- บิลห้อง นิพนธ์ (A101) - จ่ายแล้ว
(1, 125.00, 120.00, 90.00, 1500.00, 1350.00, 1050.00, 4500.00, 5640.00, 'paid', '2023-10-25', '2023-11-05', '2023-10-28 18:20:00'),

-- บิลห้อง วิภา (A201) - ยังไม่จ่าย (Pending)
(2, 88.00, 80.00, 144.00, 950.00, 800.00, 1050.00, 6500.00, 7694.00, 'pending', '2023-10-25', '2023-11-05', NULL),

-- บิลห้อง John (A301) - จ่ายช้า (Overdue - สมมติของเดือนก่อน)
(3, 45.00, 35.00, 180.00, 2200.00, 1900.00, 2100.00, 12000.00, 14280.00, 'overdue', '2023-09-25', '2023-10-05', NULL),

(5, 200.00, 190.00, 180.00, 3500.00, 3200.00, 2100.00, 12000.00, 14280.00, 'pending', '2023-11-05');


INSERT INTO repairs (tenant_id, room_id, issue_title, issue_description, phone_number, request_date, repair_status, resolved_date, img_path) VALUES 
-- เคส 1: ห้องน้ำตัน (กำลังดำเนินการ)
(1, 1, 'ท่อน้ำตัน', 'น้ำในห้องน้ำระบายช้ามาก รบกวนตรวจสอบครับ', '081-234-5678', '2023-10-26', 'in_progress', NULL, '/uploads/repairs/a101_drain.jpg'),

-- เคส 2: แอร์ไม่เย็น (เสร็จแล้ว)
(2, 4, 'แอร์ไม่เย็น', 'เปิดแอร์แล้วมีแต่ลม ไม่มีไอเย็นเลย', '089-876-5432', '2023-10-10', 'completed', '2023-10-12', '/uploads/repairs/a201_ac.jpg'),

-- เคส 3: ไฟทางเดิน (แจ้งใหม่)
(3, 6, 'หลอดไฟขาด', 'ไฟระเบียงห้องกระพริบแล้วดับไป', '090-111-2222', '2023-10-28', 'pending', NULL, NULL),

(6, 15, 'ไฟระเบียงดับ', 'หลอดไฟระเบียงห้อง B401 ขาด', '2023-10-28', 'pending');


INSERT INTO announcements (admin_id, title, content, announcements_status, created_at, visible_until) VALUES 
(1, 'แจ้งหยุดจ่ายน้ำประปาชั่วคราว', 'เนื่องจากการประปาจะทำการซ่อมท่อเมน จะทำให้น้ำไม่ไหลในวันที่ 30 ต.ค. เวลา 10.00-15.00 น. ขออภัยในความไม่สะดวก', 'active', NOW(), '2023-10-31'),
(1, 'ระเบียบการรับพัสดุ', 'กรุณามารับพัสดุที่สำนักงานภายใน 3 วันหลังจากของมาถึง มิเช่นนั้นทางหอพักจะไม่รับผิดชอบหากสูญหาย', 'active', '2023-01-01 00:00:00', NULL),
(2, 'Test Announcement', 'ทดสอบระบบประกาศ (ซ่อน)', 'inactive', NOW(), NULL);