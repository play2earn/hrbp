
-- Insert Provinces (Safe Insert without Unique Constraint)
INSERT INTO provinces (name_th, name_en)
SELECT 'ชลบุรี', 'Chonburi'
WHERE NOT EXISTS (SELECT 1 FROM provinces WHERE name_th = 'ชลบุรี');

INSERT INTO provinces (name_th, name_en)
SELECT 'ฉะเชิงเทรา', 'Chachoengsao'
WHERE NOT EXISTS (SELECT 1 FROM provinces WHERE name_th = 'ฉะเชิงเทรา');


DO $$
DECLARE
    chonburi_id INT;
    chachoengsao_id INT;
    dist_id INT;
BEGIN
    -- Get Province IDs
    SELECT id INTO chonburi_id FROM provinces WHERE name_th = 'ชลบุรี';
    SELECT id INTO chachoengsao_id FROM provinces WHERE name_th = 'ฉะเชิงเทรา';

    -- CHONBURI DISTRICTS
    
    -- Mueang Chon Buri
    SELECT id INTO dist_id FROM districts WHERE province_id = chonburi_id AND name_th = 'เมืองชลบุรี';
    IF dist_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (chonburi_id, 'เมืองชลบุรี', 'Mueang Chon Buri') RETURNING id INTO dist_id;
    END IF;

    -- Subdistricts for Mueang Chon Buri
    IF NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'บางปลาสร้อย') THEN
        INSERT INTO subdistricts (district_id, name_th, name_en, postcode) VALUES (dist_id, 'บางปลาสร้อย', 'Bang Pla Soi', '20000');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'มะขามหย่ง') THEN
        INSERT INTO subdistricts (district_id, name_th, name_en, postcode) VALUES (dist_id, 'มะขามหย่ง', 'Makham Yong', '20000');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'บ้านโขด') THEN
        INSERT INTO subdistricts (district_id, name_th, name_en, postcode) VALUES (dist_id, 'บ้านโขด', 'Ban Khod', '20000');
    END IF;

    -- Si Racha
    SELECT id INTO dist_id FROM districts WHERE province_id = chonburi_id AND name_th = 'ศรีราชา';
    IF dist_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (chonburi_id, 'ศรีราชา', 'Si Racha') RETURNING id INTO dist_id;
    END IF;
    
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'ศรีราชา', 'Si Racha', '20110' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'ศรีราชา');
    
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'สุรศักดิ์', 'Surasak', '20110' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'สุรศักดิ์');

    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'ทุ่งสุขลา', 'Thung Sukhla', '20230' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'ทุ่งสุขลา');


    -- Bang Lamung (Pattaya area)
    SELECT id INTO dist_id FROM districts WHERE province_id = chonburi_id AND name_th = 'บางละมุง';
    IF dist_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (chonburi_id, 'บางละมุง', 'Bang Lamung') RETURNING id INTO dist_id;
    END IF;

    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'บางละมุง', 'Bang Lamung', '20150' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'บางละมุง');
    
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'หนองปรือ', 'Nong Prue', '20150' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'หนองปรือ');
    
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'นาเกลือ', 'Na Kluea', '20150' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'นาเกลือ');


    -- CHACHOENGSAO DISTRICTS
    -- Mueang Chachoengsao
    SELECT id INTO dist_id FROM districts WHERE province_id = chachoengsao_id AND name_th = 'เมืองฉะเชิงเทรา';
    IF dist_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (chachoengsao_id, 'เมืองฉะเชิงเทรา', 'Mueang Chachoengsao') RETURNING id INTO dist_id;
    END IF;

    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'หน้าเมือง', 'Na Mueang', '24000' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'หน้าเมือง');
    
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'โสธร', 'Sothon', '24000' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'โสธร');
    
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'บางตีนเป็ด', 'Bang Tin Pet', '24000' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'บางตีนเป็ด');


    -- Bang Pakong
    SELECT id INTO dist_id FROM districts WHERE province_id = chachoengsao_id AND name_th = 'บางปะกง';
    IF dist_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (chachoengsao_id, 'บางปะกง', 'Bang Pakong') RETURNING id INTO dist_id;
    END IF;

    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'บางปะกง', 'Bang Pakong', '24130' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'บางปะกง');
    
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'ท่าสะอ้าน', 'Tha Sa-an', '24130' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'ท่าสะอ้าน');
    
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
    SELECT dist_id, 'บางสมัคร', 'Bang Samak', '24180' WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = dist_id AND name_th = 'บางสมัคร');
        
END $$;
