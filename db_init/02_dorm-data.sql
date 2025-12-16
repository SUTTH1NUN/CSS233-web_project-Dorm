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
('Somchai', 'Jaidee', 'admin', '$2b$10$SVxIRRo42y7A5ADPTjOwhe2xsuyosR0qQivgZaI1tGASxLyxuTLXi');

-- 4.4 ข้อมูลห้องพัก (Rooms) - เพิ่มตึก B
INSERT INTO rooms (building, floor, room_number, room_status, room_type) VALUES
-- === Building A ===
('A', 1, 'A101', 'available', 'Family Suite'),
('A', 1, 'A102', 'available', 'Family Suite'),
('A', 2, 'A201', 'available', '1 Bedroom Suite'),
('A', 2, 'A202', 'available', '1 Bedroom Suite'),
('A', 2, 'A203', 'available', '1 Bedroom Suite'),
('A', 3, 'A301', 'available', 'Studio Suite'),
('A', 3, 'A302', 'available', 'Studio Suite'),
('A', 3,  'A303', 'available', 'Studio Suite'),

-- === Building B (เพิ่มใหม่) ===
-- ชั้น 1: Family Suite
('B', 1, 'B101', 'available', 'Family Suite'),
('B', 1, 'B102', 'available', 'Family Suite'),
-- ชั้น 2: 1 Bedroom Suite
('B', 2, 'B201', 'available', '1 Bedroom Suite'),
('B', 2, 'B202', 'available', '1 Bedroom Suite'),
-- ชั้น 3: Studio Suite
('B', 3, 'B301', 'available', 'Studio Suite'),
('B', 3, 'B302', 'available', 'Studio Suite');