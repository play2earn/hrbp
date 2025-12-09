-- Thailand Locations Seed Script (Part 8)
-- Generated from kongvut/thai-province-data

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Nakhon Phanom
    SELECT id INTO p_id FROM provinces WHERE name_th = 'นครพนม';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('นครพนม', 'Nakhon Phanom') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Nakhon Phanom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองนครพนม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองนครพนม', 'Mueang Nakhon Phanom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในเมือง', 'Nai Mueang', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแสง', 'Nong Saeng', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแสง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาทราย', 'Na Sai', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาราชควาย', 'Na Rat Khwai', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาราชควาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุรุคุ', 'Kurukhu', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุรุคุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านผึ้ง', 'Ban Phueng', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านผึ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อาจสามารถ', 'At Samat', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อาจสามารถ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขามเฒ่า', 'Kham Thao', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขามเฒ่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านกลาง', 'Ban Klang', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านกลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าค้อ', 'Tha Kho', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าค้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำเตย', 'Kham Toei', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำเตย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองญาติ', 'Nong Yat', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองญาติ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงขวาง', 'Dong Khwang', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงขวาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังตามัว', 'Wang Ta Mua', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังตามัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพธิ์ตาก', 'Pho Tak', '48000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพธิ์ตาก');

    -- District: Pla Pak
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปลาปาก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปลาปาก', 'Pla Pak') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปลาปาก', 'Pla Pak', '48160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปลาปาก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองฮี', 'Nong Hi', '48160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองฮี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุตาไก้', 'Kutakai', '48160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุตาไก้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสว่าง', 'Khok Sawan', '48160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสว่าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสูง', 'Khok Sung', '48160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มหาชัย', 'Maha Chai', '48160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มหาชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นามะเขือ', 'Na Makhuea', '48160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นามะเขือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเทาใหญ่', 'Nong Thao Yai', '48160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเทาใหญ่');

    -- District: Tha Uthen
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ท่าอุเทน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ท่าอุเทน', 'Tha Uthen') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าอุเทน', 'Tha Uthen', '48120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าอุเทน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนตาล', 'Non Tan', '48120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนตาล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าจำปา', 'Tha Champa', '48120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าจำปา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไชยบุรี', 'Chai Buri', '48120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไชยบุรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พนอม', 'Phanom', '48120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พนอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พะทาย', 'Phathai', '48120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พะทาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวินพระบาท', 'Woen Phra Bat', '48120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวินพระบาท');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'รามราช', 'Ram Rat', '48120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'รามราช');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเทา', 'Nong Thao', '48120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเทา');

    -- District: Ban Phaeng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านแพง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านแพง', 'Ban Phaeng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแพง', 'Ban Phaeng', '48140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแพง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไผ่ล้อม', 'Phai Lom', '48140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไผ่ล้อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนทอง', 'Phon Thong', '48140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแวง', 'Nong Waeng', '48140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นางัว', 'Na Ngua', '48140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นางัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเข', 'Na Khe', '48140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเข');

    -- District: That Phanom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ธาตุพนม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ธาตุพนม', 'That Phanom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ธาตุพนม', 'That Phanom', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ธาตุพนม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฝั่งแดง', 'Fang Daeng', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฝั่งแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนแพง', 'Phon Phaeng', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนแพง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระกลางทุ่ง', 'Phra Klang Thung', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระกลางทุ่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาถ่อน', 'Na Thon', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาถ่อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แสนพัน', 'Saen Phan', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แสนพัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนนางหงส์', 'Don Nang Hong', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนนางหงส์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำก่ำ', 'Nam Kam', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำก่ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อุ่มเหม้า', 'Um Mao', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อุ่มเหม้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหนาด', 'Na Nat', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหนาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดฉิม', 'Kut Chim', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดฉิม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ธาตุพนมเหนือ', 'That Phanom Nuea', '48110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ธาตุพนมเหนือ');

    -- District: Renu Nakhon
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เรณูนคร';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เรณูนคร', 'Renu Nakhon') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เรณู', 'Renu', '48170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เรณู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนทอง', 'Phon Thong', '48170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าลาด', 'Tha Lat', '48170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าลาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นางาม', 'Na Ngam', '48170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นางาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกหินแฮ่', 'Khok Hin Hae', '48170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกหินแฮ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองย่างชิ้น', 'Nong Yang Chin', '48170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองย่างชิ้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เรณูใต้', 'Renu Tai', '48170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เรณูใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาขาม', 'Na Kham', '48170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาขาม');

    -- District: Na Kae
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นาแก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นาแก', 'Na Kae') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแก', 'Na Kae', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระซอง', 'Phra Song', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระซอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสังข์', 'Nong Sang', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสังข์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาคู่', 'Na Khu', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาคู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พิมาน', 'Phiman', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พิมาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พุ่มแก', 'Phum Kae', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พุ่มแก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ก้านเหลือง', 'Kan Lueang', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ก้านเหลือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบ่อ', 'Nong Bo', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบ่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเลียง', 'Na Liang', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเลียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแก้ง', 'Ban Kaeng', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแก้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำพี้', 'Kham Phi', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำพี้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สีชมพู', 'Si Chomphu', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สีชมพู');

    -- District: Si Songkhram
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ศรีสงคราม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ศรีสงคราม', 'Si Songkhram') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีสงคราม', 'Si Songkhram', '48150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีสงคราม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเดื่อ', 'Na Duea', '48150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเดื่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเอื้อง', 'Ban Ueang', '48150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเอื้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สามผง', 'Sam Phong', '48150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สามผง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าบ่อสงคราม', 'Tha Bo Songkhram', '48150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าบ่อสงคราม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านข่า', 'Ban Kha', '48150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านข่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาคำ', 'Na Kham', '48150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนสว่าง', 'Phon Sawang', '48150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนสว่าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดแพง', 'Hat Phaeng', '48150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดแพง');

    -- District: Na Wa
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นาหว้า';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นาหว้า', 'Na Wa') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหว้า', 'Na Wa', '48180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหว้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นางัว', 'Na Ngua', '48180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นางัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเสียว', 'Ban Siao', '48180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเสียว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาคูณใหญ่', 'Na Khun Yai', '48180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาคูณใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เหล่าพัฒนา', 'Lao Phatthana', '48180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เหล่าพัฒนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าเรือ', 'Tha Ruea', '48180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าเรือ');

    -- District: Phon Sawan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'โพนสวรรค์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'โพนสวรรค์', 'Phon Sawan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนสวรรค์', 'Phon Sawan', '48190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนสวรรค์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหัวบ่อ', 'Na Hua Bo', '48190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหัวบ่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาขมิ้น', 'Na Khamin', '48190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาขมิ้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนบก', 'Phon Bok', '48190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนบก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านค้อ', 'Ban Kho', '48190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านค้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนจาน', 'Phon Chan', '48190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนจาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาใน', 'Na Nai', '48190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาใน');

    -- District: Na Thom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นาทม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นาทม', 'Na Thom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาทม', 'Na Thom', '48140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาทม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองซน', 'Nong Son', '48140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองซน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนเตย', 'Don Toei', '48140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนเตย');

    -- District: Wang Yang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'วังยาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'วังยาง', 'Wang Yang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังยาง', 'Wang Yang', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสี', 'Khok Si', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยอดชาด', 'Yot Chat', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยอดชาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองโพธิ์', 'Nong Pho', '48130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองโพธิ์');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Mukdahan
    SELECT id INTO p_id FROM provinces WHERE name_th = 'มุกดาหาร';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('มุกดาหาร', 'Mukdahan') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Mukdahan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองมุกดาหาร';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองมุกดาหาร', 'Mueang Mukdahan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มุกดาหาร', 'Mukdahan', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มุกดาหาร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีบุญเรือง', 'Si Bun Rueang', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีบุญเรือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโคก', 'Ban Khok', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโคก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางทรายใหญ่', 'Bang Sai Yai', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางทรายใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนทราย', 'Phon Sai', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผึ่งแดด', 'Phueng Daet', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผึ่งแดด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาโสก', 'Na Sok', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาโสก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาสีนวน', 'Na Si Nuan', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาสีนวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำป่าหลาย', 'Kham Pa Lai', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำป่าหลาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำอาฮวน', 'Kham Ahuan', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำอาฮวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงเย็น', 'Dong Yen', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงเย็น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงมอน', 'Dong Mon', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงมอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดแข้', 'Kut Khae', '49000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดแข้');

    -- District: Nikhom Kham Soi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นิคมคำสร้อย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นิคมคำสร้อย', 'Nikhom Kham Soi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นิคมคำสร้อย', 'Nikhom Kham Soi', '49130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นิคมคำสร้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นากอก', 'Na Kok', '49130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นากอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแวง', 'Nong Waeng', '49130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กกแดง', 'Kok Daeng', '49130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กกแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาอุดม', 'Na Udom', '49130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาอุดม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โชคชัย', 'Chok Chai', '49130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โชคชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ร่มเกล้า', 'Rom Klao', '49130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ร่มเกล้า');

    -- District: Don Tan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ดอนตาล';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ดอนตาล', 'Don Tan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนตาล', 'Don Tan', '49120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนตาล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพธิ์ไทร', 'Pho Sai', '49120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพธิ์ไทร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าไร่', 'Pa Rai', '49120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าไร่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เหล่าหมี', 'Lao Mi', '49120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เหล่าหมี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านบาก', 'Ban Bak', '49120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านบาก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาสะเม็ง', 'Na Sameng', '49120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาสะเม็ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแก้ง', 'Ban Kaeng', '49120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแก้ง');

    -- District: Dong Luang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ดงหลวง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ดงหลวง', 'Dong Luang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงหลวง', 'Dong Luang', '49140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัว', 'Nong Bua', '49140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กกตูม', 'Kok Tum', '49140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กกตูม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแคน', 'Nong Khaen', '49140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแคน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชะโนดน้อย', 'Chanot Noi', '49140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชะโนดน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พังแดง', 'Phang Daeng', '49140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พังแดง');

    -- District: Khamcha-i
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'คำชะอี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'คำชะอี', 'Khamcha-i') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านซ่ง', 'Ban Song', '49110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านซ่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำชะอี', 'Khamcha-i', '49110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำชะอี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเอี่ยน', '(Nong Ian', '49110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเอี่ยน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านค้อ', 'Ban Kho', '49110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านค้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเหล่า', 'Ban Lao', '49110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเหล่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนงาม', 'Phon Ngam', '49110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนงาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เหล่าสร้างถ่อ', 'Lao Sang Tho', '49110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เหล่าสร้างถ่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำบก', 'Kham Bok', '49110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำบก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำเที่ยง', 'Nam Thiang', '49110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำเที่ยง');

    -- District: Wan Yai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หว้านใหญ่';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หว้านใหญ่', 'Wan Yai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หว้านใหญ่', 'Wan Yai', '49150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หว้านใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่งขาม', 'Pong Kham', '49150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่งขาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางทรายน้อย', 'Bang Sai Noi', '49150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางทรายน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชะโนด', 'Chanot', '49150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชะโนด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงหมู', 'Dong Mu', '49150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงหมู');

    -- District: Nong Sung
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองสูง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองสูง', 'Nong Sung') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสูง', 'Nong Sung', '49160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนยาง', 'Non Yang', '49160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ภูวง', 'Phu Wong', '49160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ภูวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเป้า', 'Ban Pao', '49160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเป้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสูงใต้', 'Nong Sung Tai', '49160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสูงใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสูงเหนือ', 'Nong Sung Nuea', '49160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสูงเหนือ');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Chiang Mai
    SELECT id INTO p_id FROM provinces WHERE name_th = 'เชียงใหม่';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('เชียงใหม่', 'Chiang Mai') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Chiang Mai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองเชียงใหม่';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองเชียงใหม่', 'Mueang Chiang Mai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีภูมิ', 'Si Phum', '50200' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีภูมิ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระสิงห์', 'Phra Sing', '50200' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระสิงห์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หายยา', 'Haiya', '50100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หายยา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช้างม่อย', 'Chang Moi', '50300' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช้างม่อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช้างคลาน', 'Chang Khlan', '50100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช้างคลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วัดเกต', 'Wat Ket', '50000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วัดเกต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช้างเผือก', 'Chang Phueak', '50300' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช้างเผือก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สุเทพ', 'Suthep', '50200' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สุเทพ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่เหียะ', 'Mae Hia', '50100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่เหียะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าแดด', 'Pa Daet', '50100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าแดด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหอย', 'Nong Hoi', '50000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหอย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าศาลา', 'Tha Sala', '50000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าศาลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองป่าครั่ง', 'Nong Pa Khrang', '50000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองป่าครั่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฟ้าฮ่าม', 'Fa Ham', '50000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฟ้าฮ่าม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าตัน', 'Pa Tan', '50300' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าตัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันผีเสื้อ', 'San Phi Suea', '50300' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันผีเสื้อ');

    -- District: Chom Thong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'จอมทอง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'จอมทอง', 'Chom Thong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านหลวง', 'Ban Luang', '50160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ข่วงเปา', 'Khuang Pao', '50160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ข่วงเปา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สบเตี๊ยะ', 'Sop Tia', '50160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สบเตี๊ยะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแปะ', 'Ban Pae', '50240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแปะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอยแก้ว', 'Doi Kaeo', '50160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอยแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สอย', 'Mae Soi', '50240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สอย');

    -- District: Mae Chaem
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่แจ่ม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่แจ่ม', 'Mae Chaem') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช่างเคิ่ง', 'Chang Khoeng', '50270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช่างเคิ่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าผา', 'Tha Pha', '50270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าผา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านทับ', 'Ban Thap', '50270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านทับ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ศึก', 'Mae Suek', '50270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ศึก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่นาจร', 'Mae Na Chon', '50270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่นาจร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปางหินฝน', 'Pang Hin Fon', '50270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปางหินฝน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กองแขก', 'Kong Khaek', '50270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กองแขก');

    -- District: Chiang Dao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เชียงดาว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เชียงดาว', 'Chiang Dao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงดาว', 'Chiang Dao', '50170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงดาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองนะ', 'Mueang Na', '50170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองนะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองงาย', 'Mueang Ngai', '50170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองงาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่นะ', 'Mae Na', '50170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่นะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองคอง', 'Mueang Khong', '50170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองคอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปิงโค้ง', 'Ping Khong', '50170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปิงโค้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งข้าวพวง', 'Thung Khao Phuang', '50170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งข้าวพวง');

    -- District: Doi Saket
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ดอยสะเก็ด';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ดอยสะเก็ด', 'Doi Saket') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชิงดอย', 'Choeng Doi', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชิงดอย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันปูเลย', 'San Pu Loei', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันปูเลย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลวงเหนือ', 'Luang Nuea', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลวงเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าป้อง', 'Pa Pong', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าป้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สง่าบ้าน', 'Sa-nga Ban', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สง่าบ้าน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าลาน', 'Pa Lan', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลาดขวัญ', 'Talat Khwan', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลาดขวัญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สำราญราษฎร์', 'Samran Rat', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สำราญราษฎร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่คือ', 'Mae Khue', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่คือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลาดใหญ่', 'Talat Yai', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลาดใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ฮ้อยเงิน', 'Mae Hoi Ngoen', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ฮ้อยเงิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่โป่ง', 'Mae Pong', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่โป่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าเมี่ยง', 'Pa Miang', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าเมี่ยง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เทพเสด็จ', 'Thep Sadet', '50220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เทพเสด็จ');

    -- District: Mae Taeng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่แตง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่แตง', 'Mae Taeng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันมหาพน', 'San Maha Phon', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันมหาพน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่แตง', 'Mae Taeng', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่แตง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขี้เหล็ก', 'Khilek', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขี้เหล็ก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช่อแล', 'Cho Lae', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช่อแล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่หอพระ', 'Mae Ho Phra', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่หอพระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สบเปิง', 'Sop Poeng', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สบเปิง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเป้า', 'Ban Pao', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเป้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันป่ายาง', 'San Pa Yang', '50330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันป่ายาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าแป๋', 'Pa Pae', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าแป๋');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองก๋าย', 'Mueang Kai', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองก๋าย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านช้าง', 'Ban Chang', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กื้ดช้าง', 'Kuet Chang', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กื้ดช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อินทขิล', 'Inthakhin', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อินทขิล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สมก๋าย', 'Som Kai', '50150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สมก๋าย');

    -- District: Mae Rim
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่ริม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่ริม', 'Mae Rim') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ริมใต้', 'Rim Tai', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ริมใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ริมเหนือ', 'Rim Nuea', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ริมเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันโป่ง', 'San Pong', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันโป่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขี้เหล็ก', 'Khilek', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขี้เหล็ก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะลวง', 'Saluang', '50330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยทราย', 'Huai Sai', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่แรม', 'Mae Raem', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่แรม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โป่งแยง', 'Pong Yaeng', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โป่งแยง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สา', 'Mae Sa', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนแก้ว', 'Don Kaeo', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เหมืองแก้ว', 'Mueang Kaeo', '50180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เหมืองแก้ว');

    -- District: Samoeng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สะเมิง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สะเมิง', 'Samoeng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะเมิงใต้', 'Samoeng Tai', '50250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะเมิงใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะเมิงเหนือ', 'Samoeng Nuea', '50250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะเมิงเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สาบ', 'Mae Sap', '50250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สาบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อแก้ว', 'Bo Kaeo', '50250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยั้งเมิน', 'Yang Moen', '50250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยั้งเมิน');

    -- District: Fang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ฝาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ฝาง', 'Fang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียง', 'Wiang', '50110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ม่อนปิ่น', 'Mon Pin', '50110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ม่อนปิ่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่งอน', 'Mae Ngon', '50320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่งอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สูน', 'Mae Sun', '50110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สูน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันทราย', 'San Sai', '50110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่คะ', 'Mae Kha', '50110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่คะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ข่า', 'Mae Kha', '50320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ข่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โป่งน้ำร้อน', 'Pong Nam Ron', '50110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โป่งน้ำร้อน');

    -- District: Mae Ai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่อาย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่อาย', 'Mae Ai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่อาย', 'Mae Ai', '50280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่อาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สาว', 'Mae Sao', '50280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันต้นหมื้อ', 'San Ton Mue', '50280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันต้นหมื้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่นาวาง', 'Mae Na Wang', '50280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่นาวาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าตอน', 'Tha Ton', '50280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าตอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านหลวง', 'Ban Luang', '50280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะลิกา', 'Malika', '50280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะลิกา');

    -- District: Phrao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พร้าว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พร้าว', 'Phrao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียง', 'Wiang', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งหลวง', 'Thung Luang', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าตุ้ม', 'Pa Tum', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าตุ้ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าไหน่', 'Pa Nai', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าไหน่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันทราย', 'San Sai', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโป่ง', 'Ban Pong', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโป่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำแพร่', 'Nam Phrae', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำแพร่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขื่อนผาก', 'Khuean Phak', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขื่อนผาก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่แวน', 'Mae Waen', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่แวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ปั๋ง', 'Mae Pang', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ปั๋ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โหล่งขอด', 'Long Khot', '50190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โหล่งขอด');

    -- District: San Pa Tong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สันป่าตอง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สันป่าตอง', 'San Pa Tong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยุหว่า', 'Yu Wa', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยุหว่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันกลาง', 'San Klang', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันกลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าวังพร้าว', 'Tha Wang Phrao', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าวังพร้าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะขามหลวง', 'Makham Luang', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะขามหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ก๊า', 'Mae Ka', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ก๊า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแม', 'Ban Mae', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านกลาง', 'Ban Klang', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านกลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งสะโตก', 'Thung Satok', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งสะโตก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งต้อม', 'Thung Tom', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งต้อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำบ่อหลวง', 'Nam Bo Luang', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำบ่อหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะขุนหวาน', 'Makhun Wan', '50120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะขุนหวาน');

    -- District: San Kamphaeng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สันกำแพง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สันกำแพง', 'San Kamphaeng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันกำแพง', 'San Kamphaeng', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันกำแพง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรายมูล', 'Sai Mun', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรายมูล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ร้องวัวแดง', 'Rong Wua Daeng', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ร้องวัวแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บวกค้าง', 'Buak Khang', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บวกค้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แช่ช้าง', 'Chae Chang', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แช่ช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ออนใต้', 'On Tai', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ออนใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ปูคา', 'Mae Pu Kha', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ปูคา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยทราย', 'Huai Sai', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ต้นเปา', 'Ton Pao', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ต้นเปา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันกลาง', 'San Klang', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันกลาง');

    -- District: San Sai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สันทราย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สันทราย', 'San Sai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันทรายหลวง', 'San Sai Luang', '50210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันทรายหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันทรายน้อย', 'San Sai Noi', '50210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันทรายน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันพระเนตร', 'San Phranet', '50210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันพระเนตร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันนาเม็ง', 'San Na Meng', '50210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันนาเม็ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันป่าเปา', 'San Pa Pao', '50210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันป่าเปา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแหย่ง', 'Nong Yaeng', '50210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแหย่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองจ๊อม', 'Nong Chom', '50210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองจ๊อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหาร', 'Nong Han', '50290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหาร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่แฝก', 'Mae Faek', '50290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่แฝก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่แฝกใหม่', 'Mae Faek Mai', '50290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่แฝกใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองเล็น', 'Mueang Len', '50210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองเล็น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าไผ่', 'Pa Phai', '50210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าไผ่');

    -- District: Hang Dong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หางดง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หางดง', 'Hang Dong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หางดง', 'Hang Dong', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หางดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแก๋ว', 'Nong Kaeo', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแก๋ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หารแก้ว', 'Han Kaeo', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หารแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองตอง', 'Nong Tong', '50340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองตอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขุนคง', 'Khun Khong', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขุนคง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สบแม่ข่า', 'Sop Mae Kha', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สบแม่ข่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแหวน', 'Ban Waen', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแหวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันผักหวาน', 'San Phak Wan', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันผักหวาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองควาย', 'Nong Khwai', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองควาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านปง', 'Ban Pong', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านปง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำแพร่', 'Nam Phrae', '50230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำแพร่');

    -- District: Hot
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ฮอด';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ฮอด', 'Hot') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หางดง', 'Hang Dong', '50240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หางดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฮอด', 'Hot', '50240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฮอด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านตาล', 'Ban Tan', '50240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านตาล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อหลวง', 'Bo Luang', '50240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อสลี', 'Bo Sali', '50240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อสลี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาคอเรือ', 'Na Kho Ruea', '50240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาคอเรือ');

    -- District: Doi Tao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ดอยเต่า';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ดอยเต่า', 'Doi Tao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอยเต่า', 'Doi Tao', '50260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอยเต่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าเดื่อ', 'Tha Duea', '50260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าเดื่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มืดกา', 'Muet Ka', '50260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มืดกา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแอ่น', 'Ban Aen', '50260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแอ่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บงตัน', 'Bong Tan', '50260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บงตัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โปงทุ่ง', 'Pong Thung', '50260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โปงทุ่ง');

    -- District: Omkoi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'อมก๋อย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'อมก๋อย', 'Omkoi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อมก๋อย', 'Omkoi', '50310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อมก๋อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยางเปียง', 'Yang Piang', '50310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยางเปียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ตื่น', 'Mae Tuen', '50310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ตื่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ม่อนจอง', 'Mon Chong', '50310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ม่อนจอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สบโขง', 'Sop Khong', '50310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สบโขง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเกียน', 'Na Kian', '50310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเกียน');

    -- District: Saraphi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สารภี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สารภี', 'Saraphi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยางเนิ้ง', 'Yang Noeng', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยางเนิ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สารภี', 'Saraphi', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สารภี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชมภู', 'Chom Phu', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชมภู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไชยสถาน', 'Chai Sathan', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไชยสถาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขัวมุง', 'Khua Mung', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขัวมุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแฝก', 'Nong Faek', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแฝก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองผึ้ง', 'Nong Phueng', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองผึ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่ากว้าง', 'Tha Kwang', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่ากว้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนแก้ว', 'Don Kaeo', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าวังตาล', 'Tha Wang Tan', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าวังตาล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันทราย', 'San Sai', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าบง', 'Pa Bong', '50140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าบง');

    -- District: Wiang Haeng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เวียงแหง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เวียงแหง', 'Wiang Haeng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองแหง', 'Mueang Haeng', '50350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองแหง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เปียงหลวง', 'Piang Luang', '50350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เปียงหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แสนไห', 'Saen Hai', '50350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แสนไห');

    -- District: Chai Prakan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ไชยปราการ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ไชยปราการ', 'Chai Prakan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปงตำ', 'Pong Tam', '50320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปงตำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีดงเย็น', 'Si Dong Yen', '50320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีดงเย็น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ทะลบ', 'Mae Thalop', '50320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ทะลบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัว', 'Nong Bua', '50320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัว');

    -- District: Mae Wang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่วาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่วาง', 'Mae Wang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านกาด', 'Ban Kat', '50360' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านกาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งปี้', 'Thung Pi', '50360' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งปี้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งรวงทอง', 'Thung Ruang Thong', '50360' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งรวงทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่วิน', 'Mae Win', '50360' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่วิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนเปา', 'Don Pao', '50360' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนเปา');

    -- District: Mae On
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่ออน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่ออน', 'Mae On') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ออนเหนือ', 'On Nuea', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ออนเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ออนกลาง', 'On Klang', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ออนกลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านสหกรณ์', 'Ban Sahakon', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านสหกรณ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยแก้ว', 'Huai Kaeo', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ทา', 'Mae Tha', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ทา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทาเหนือ', 'Tha Nuea', '50130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทาเหนือ');

    -- District: Doi Lo
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ดอยหล่อ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ดอยหล่อ', 'Doi Lo') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอยหล่อ', 'Doi Lo', '50160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอยหล่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สองแคว', 'Song Khwae', '50160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สองแคว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยางคราม', 'Yang Khram', '50160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยางคราม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันติสุข', 'Santi Suk', '50160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันติสุข');

    -- District: Galyani Vadhana
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กัลยาณิวัฒนา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กัลยาณิวัฒนา', 'Galyani Vadhana') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านจันทร์', 'Ban Chan', '58130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านจันทร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่แดด', 'Mae Daet', '50250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่แดด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แจ่มหลวง', 'Chaem Luang', '58130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แจ่มหลวง');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Lamphun
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ลำพูน';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ลำพูน', 'Lamphun') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Lamphun
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองลำพูน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองลำพูน', 'Mueang Lamphun') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในเมือง', 'Nai Mueang', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เหมืองง่า', 'Mueang Nga', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เหมืองง่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อุโมงค์', 'Umong', '51150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อุโมงค์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองช้างคืน', 'Nong Chang Khuen', '51150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองช้างคืน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ประตูป่า', 'Pratu Pa', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ประตูป่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ริมปิง', 'Rim Ping', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ริมปิง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ต้นธง', 'Ton Thong', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ต้นธง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแป้น', 'Ban Paen', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแป้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เหมืองจี้', 'Mueang Chi', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เหมืองจี้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าสัก', 'Pa Sak', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าสัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียงยอง', 'Wiang Yong', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียงยอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านกลาง', 'Ban Klang', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านกลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะเขือแจ้', 'Makhuea Chae', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะเขือแจ้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีบัวบาน', 'Si Bua Ban', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีบัวบาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหนาม', 'Nong Nam', '51000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหนาม');

    -- District: Mae Tha
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่ทา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่ทา', 'Mae Tha') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทาปลาดุก', 'Tha Pla Duk', '51140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทาปลาดุก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทาสบเส้า', 'Tha Sop Sao', '51140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทาสบเส้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทากาศ', 'Tha Kat', '51170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทากาศ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทาขุมเงิน', 'Tha Khum Ngoen', '51170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทาขุมเงิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทาทุ่งหลวง', 'Tha Thung Luang', '51170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทาทุ่งหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทาแม่ลอบ', 'Tha Mae Lop', '51170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทาแม่ลอบ');

    -- District: Ban Hong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านโฮ่ง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านโฮ่ง', 'Ban Hong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโฮ่ง', 'Ban Hong', '51130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโฮ่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าพลู', 'Pa Phlu', '51130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าพลู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เหล่ายาว', 'Lao Yao', '51130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เหล่ายาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีเตี้ย', 'Si Tia', '51130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีเตี้ย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองปลาสะวาย', 'Nong Pla Sawai', '51130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองปลาสะวาย');

    -- District: Li
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ลี้';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ลี้', 'Li') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลี้', 'Li', '51110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลี้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ตืน', 'Mae Tuen', '51110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ตืน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาทราย', 'Na Sai', '51110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงดำ', 'Dong Dam', '51110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงดำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ก้อ', 'Ko', '51110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ก้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ลาน', 'Mae Lan', '51110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าไผ่', 'Pa Phai', '51110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าไผ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีวิชัย', 'Si Wichai', '51110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีวิชัย');

    -- District: Thung Hua Chang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ทุ่งหัวช้าง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ทุ่งหัวช้าง', 'Thung Hua Chang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งหัวช้าง', 'Thung Hua Chang', '51160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งหัวช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านปวง', 'Ban Puang', '51160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านปวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะเคียนปม', 'Takhian Pom', '51160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะเคียนปม');

    -- District: Pa Sang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ป่าซาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ป่าซาง', 'Pa Sang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากบ่อง', 'Pak Bong', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากบ่อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าซาง', 'Pa Sang', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าซาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่แรง', 'Mae Raeng', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่แรง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ม่วงน้อย', 'Muang Noi', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ม่วงน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเรือน', 'Ban Ruean', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเรือน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะกอก', 'Makok', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะกอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าตุ้ม', 'Tha Tum', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าตุ้ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำดิบ', 'Nam Dip', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำดิบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นครเจดีย์', 'Nakhon Chedi', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นครเจดีย์');

    -- District: Ban Thi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านธิ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านธิ', 'Ban Thi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านธิ', 'Ban Thi', '51180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านธิ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยยาบ', 'Huai Yap', '51180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยยาบ');

    -- District: Wiang Nong Long
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เวียงหนองล่อง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เวียงหนองล่อง', 'Wiang Nong Long') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองล่อง', 'Nong Long', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองล่อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองยวง', 'Nong Yuang', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองยวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังผาง', 'Wang Phang', '51120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังผาง');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Lampang
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ลำปาง';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ลำปาง', 'Lampang') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Lampang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองลำปาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองลำปาง', 'Mueang Lampang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียงเหนือ', 'Wiang Nuea', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียงเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวเวียง', 'Hua Wiang', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวเวียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สวนดอก', 'Suan Dok', '52100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สวนดอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สบตุ๋ย', 'Sop Tui', '52100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สบตุ๋ย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระบาท', 'Phra Bat', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระบาท');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชมพู', 'Chomphu', '52100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชมพู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กล้วยแพะ', 'Kluai Phae', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กล้วยแพะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปงแสนทอง', 'Pong Saen Thong', '52100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปงแสนทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแลง', 'Ban Laeng', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแลง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเสด็จ', 'Ban Sadet', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเสด็จ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พิชัย', 'Phichai', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พิชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งฝาย', 'Thung Fai', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งฝาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเอื้อม', 'Ban Ueam', '52100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเอื้อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเป้า', 'Ban Pao', '52100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเป้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านค่า', 'Ban Kha', '52100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านค่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อแฮ้ว', 'Bo Haeo', '52100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อแฮ้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ต้นธงชัย', 'Ton Thong Chai', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ต้นธงชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นิคมพัฒนา', 'Nikhom Phatthana', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นิคมพัฒนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บุญนาคพัฒนา', 'Bunnak Phatthana', '52000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บุญนาคพัฒนา');

    -- District: Mae Mo
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่เมาะ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่เมาะ', 'Mae Mo') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านดง', 'Ban Dong', '52220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาสัก', 'Na Sak', '52220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาสัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จางเหนือ', 'Chang Nuea', '52220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จางเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่เมาะ', 'Mae Mo', '52220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่เมาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สบป้าด', 'Sop Pat', '52220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สบป้าด');

    -- District: Ko Kha
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เกาะคา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เกาะคา', 'Ko Kha') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำปางหลวง', 'Lampang Luang', '52130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำปางหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแก้ว', 'Na Kaeo', '52130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไหล่หิน', 'Lai Hin', '52130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไหล่หิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังพร้าว', 'Wang Phrao', '52130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังพร้าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศาลา', 'Sala', '52130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศาลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะคา', 'Ko Kha', '52130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะคา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแส่ง', 'Na Saeng', '52130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแส่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าผา', 'Tha Pha', '52130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าผา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ใหม่พัฒนา', 'Mai Phatthana', '52130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ใหม่พัฒนา');

    -- District: Soem Ngam
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เสริมงาม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เสริมงาม', 'Soem Ngam') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งงาม', 'Thung Ngam', '52210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งงาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เสริมขวา', 'Soem Khwa', '52210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เสริมขวา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เสริมซ้าย', 'Soem Sai', '52210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เสริมซ้าย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เสริมกลาง', 'Soem Klang', '52210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เสริมกลาง');

    -- District: Ngao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'งาว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'งาว', 'Ngao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หลวงเหนือ', 'Luang Nuea', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หลวงเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หลวงใต้', 'Luang Tai', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หลวงใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโป่ง', 'Ban Pong', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโป่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านร้อง', 'Ban Rong', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านร้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปงเตา', 'Pong Tao', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปงเตา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแก', 'Na Kae', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านอ้อน', 'Ban On', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านอ้อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแหง', 'Ban Haeng', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแหง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านหวด', 'Ban Huat', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านหวด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ตีบ', 'Mae Tip', '52110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ตีบ');

    -- District: Chae Hom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แจ้ห่ม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แจ้ห่ม', 'Chae Hom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แจ้ห่ม', 'Chae Hom', '52120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แจ้ห่ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านสา', 'Ban Sa', '52120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านสา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปงดอน', 'Pong Don', '52120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปงดอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สุก', 'Mae Suk', '52120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สุก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองมาย', 'Mueang Mai', '52120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองมาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งผึ้ง', 'Thung Phueng', '52120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งผึ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วิเชตนคร', 'Wichet Nakhon', '52120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วิเชตนคร');

    -- District: Wang Nuea
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'วังเหนือ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'วังเหนือ', 'Wang Nuea') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งฮั้ว', 'Thung Hua', '52140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งฮั้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังเหนือ', 'Wang Nuea', '52140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังใต้', 'Wang Tai', '52140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ร่องเคาะ', 'Rong Kho', '52140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ร่องเคาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังทอง', 'Wang Thong', '52140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังซ้าย', 'Wang Sai', '52140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังซ้าย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังแก้ว', 'Wang Kaeo', '52140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังทรายคำ', 'Wang Sai Kham', '52140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังทรายคำ');

    -- District: Thoen
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เถิน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เถิน', 'Thoen') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ล้อมแรด', 'Lom Raet', '52160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ล้อมแรด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่วะ', 'Mae Wa', '52230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่วะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ปะ', 'Mae Pa', '52160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ปะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่มอก', 'Mae Mok', '52160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่มอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียงมอก', 'Wiang Mok', '52160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียงมอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาโป่ง', 'Na Pong', '52160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาโป่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ถอด', 'Mae Thot', '52160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ถอด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เถินบุรี', 'Thoen Buri', '52160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เถินบุรี');

    -- District: Mae Phrik
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่พริก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่พริก', 'Mae Phrik') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่พริก', 'Mae Phrik', '52180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่พริก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผาปัง', 'Pha Pang', '52180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผาปัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ปุ', 'Mae Pu', '52180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ปุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระบาทวังตวง', 'Phra Bat Wang Tuang', '52180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระบาทวังตวง');

    -- District: Mae Tha
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่ทะ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่ทะ', 'Mae Tha') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ทะ', 'Mae Tha', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ทะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาครัว', 'Na Khrua', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาครัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าตัน', 'Pa Tan', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าตัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านกิ่ว', 'Ban Kio', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านกิ่ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านบอม', 'Ban Bom', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านบอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำโจ้', 'Nam Cho', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำโจ้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนไฟ', 'Don Fai', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนไฟ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวเสือ', 'Hua Suea', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวเสือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังเงิน', 'Wang Ngoen', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังเงิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันดอนแก้ว', 'San Don Kaeo', '52150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันดอนแก้ว');

    -- District: Sop Prap
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สบปราบ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สบปราบ', 'Sop Prap') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สบปราบ', 'Sop Prap', '52170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สบปราบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สมัย', 'Samai', '52170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สมัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่กัวะ', 'Mae Kua', '52170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่กัวะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นายาง', 'Na Yang', '52170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นายาง');

    -- District: Hang Chat
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ห้างฉัตร';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ห้างฉัตร', 'Hang Chat') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้างฉัตร', 'Hang Chat', '52190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้างฉัตร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหล่ม', 'Nong Lom', '52190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหล่ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองยาว', 'Mueang Yao', '52190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองยาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปงยางคก', 'Pong Yang Khok', '52190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปงยางคก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียงตาล', 'Wiang Tan', '52190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียงตาล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สัน', 'Mae San', '52190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วอแก้ว', 'Wo Kaeo', '52190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วอแก้ว');

    -- District: Mueang Pan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองปาน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองปาน', 'Mueang Pan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองปาน', 'Mueang Pan', '52240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองปาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านขอ', 'Ban Kho', '52240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านขอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งกว๋าว', 'Thung Kwao', '52240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งกว๋าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แจ้ซ้อน', 'Chae Son', '52240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แจ้ซ้อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวเมือง', 'Hua Mueang', '52240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวเมือง');

END $$;

