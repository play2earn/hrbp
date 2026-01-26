-- Add missing subdistricts for postcode 20190 (อำเภอหนองใหญ่ จังหวัดชลบุรี)
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Find Province: Chonburi (ชลบุรี)
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ชลบุรี';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ชลบุรี', 'Chon Buri') RETURNING id INTO p_id;
    END IF;

    -- Find/Create District: Nong Yai (หนองใหญ่)
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองใหญ่';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองใหญ่', 'Nong Yai') RETURNING id INTO d_id;
    END IF;

    -- Insert 5 subdistricts for 20190
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองใหญ่', 'Nong Yai', '20190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองใหญ่');

    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองพลู', 'Khlong Phlu', '20190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองพลู');

    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเสือช้าง', 'Nong Suea Chang', '20190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเสือช้าง');

    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้างสูง', 'Hang Sung', '20190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้างสูง');

    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาซก', 'Khao Sok', '20190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาซก');

    RAISE NOTICE 'Successfully added/verified subdistricts for 20190';
END $$;

-- Verify results
SELECT s.*, d.name_th as district_name, p.name_th as province_name
FROM subdistricts s
JOIN districts d ON s.district_id = d.id
JOIN provinces p ON d.province_id = p.id
WHERE s.postcode = '20190';
