-- 1. Insert ข้อมูลประเภทห้อง (room_info)
INSERT INTO room_info (room_type, room_size, room_price, room_furniture) VALUES
(
    'Studio', 
    28.00, 
    10000.00, 
    'Queen Bed (5ft), Wardrobe, Work Desk & Chair, Sofa, Kitchenette, Refrigerator, Microwave, 1 Air Conditioner, TV Stand'
),
(
    '1 Bedroom', 
    32.00, 
    15000.00, 
    'Queen Bed (5ft), Built-in Wardrobe, Dining Table (2 seats), Sofa, Kitchenette, Electric Stove & Hood, Refrigerator, Microwave, 2 Air Conditioners, TV Stand'
),
(
    '2 Bedroom', 
    55.00, 
    20000.00, 
    'King Bed (6ft), Single Bed (3.5ft), Wardrobe, Dining Table (4 seats), Large Sofa, Full Kitchen, Electric Stove & Hood, Large Refrigerator, Microwave, 3 Air Conditioners, TV Stand'
),
(
    'Penthouse', 
    180.00, 
    30000.00, 
    'King Size Bed, Walk-in Closet, L-shape Sofa Set, Dining Table (6 seats), Large Kitchen + Oven, Side-by-side Refrigerator, Microwave, Multiple Air Conditioners, Display Cabinet, Washing Machine, Work Desk'
);

-- 2. Insert ข้อมูลห้องพัก (rooms)
-- ใช้ generate_series สร้างข้อมูล 2 ตึก x 4 ชั้น x 10 ห้อง

-- ตึก A (ชั้น 1-2: Studio, ชั้น 3-4: 1 Bedroom)
INSERT INTO rooms (building, floor, room_number, room_type, room_status)
SELECT 
    'A',                         -- ชื่อตึก
    f,                           -- ชั้น (จาก loop generate_series)
    'A' || f || LPAD(r::text, 2, '0'), -- สร้างเลขห้อง เช่น A101, A102
    CASE 
        WHEN f <= 2 THEN 'Studio' 
        ELSE '1 Bedroom' 
    END,                         -- เงื่อนไขเลือกประเภทห้อง
    'available'
FROM generate_series(1, 4) f,    -- วนลูปชั้น 1-4
     generate_series(1, 10) r;   -- วนลูปห้อง 1-10

-- ตึก B (ชั้น 1-2: 2 Bedroom, ชั้น 3-4: Penthouse)
INSERT INTO rooms (building, floor, room_number, room_type, room_status)
SELECT 
    'B', 
    f, 
    'B' || f || LPAD(r::text, 2, '0'), -- สร้างเลขห้อง เช่น B101, B102
    CASE 
        WHEN f <= 2 THEN '2 Bedroom' 
        ELSE 'Penthouse' 
    END,
    'available'
FROM generate_series(1, 4) f, 
     generate_series(1, 10) r;