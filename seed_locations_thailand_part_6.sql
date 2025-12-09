-- Thailand Locations Seed Script (Part 6)
-- Generated from kongvut/thai-province-data

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Amnat Charoen
    SELECT id INTO p_id FROM provinces WHERE name_th = 'อำนาจเจริญ';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('อำนาจเจริญ', 'Amnat Charoen') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Amnat Charoen
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองอำนาจเจริญ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองอำนาจเจริญ', 'Mueang Amnat Charoen') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บุ่ง', 'Bung', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บุ่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไก่คำ', 'Kai Kham', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไก่คำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาจิก', 'Na Chik', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาจิก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปลาค้าว', 'Pla Khao', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปลาค้าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เหล่าพรวน', 'Lao Pruan', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เหล่าพรวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สร้างนกทา', 'Sang Nok Tha', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สร้างนกทา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คึมใหญ่', 'Khuem Yai', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คึมใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาผือ', 'Na Phue', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาผือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำปลีก', 'Nam Plik', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำปลีก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาวัง', 'Na Wang', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาวัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหมอม้า', 'Na Mo Ma', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหมอม้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนโพธิ์', 'Non Pho', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนโพธิ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนหนามแท่ง', 'Non Nam Thaeng', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนหนามแท่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยไร่', 'Huai Rai', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยไร่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองมะแซว', 'Nong Masaeo', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองมะแซว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดปลาดุก', 'Kut Pla Duk', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดปลาดุก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนเมย', 'Don Moei', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนเมย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นายม', 'Na Yom', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นายม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแต้', 'Na Tae', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแต้');

    -- District: Chanuman
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ชานุมาน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ชานุมาน', 'Chanuman') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชานุมาน', 'Chanuman', '37210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชานุมาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสาร', 'Khok San', '37210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสาร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำเขื่อนแก้ว', 'Kham Khuean Kaeo', '37210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำเขื่อนแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกก่ง', 'Khok Kong', '37210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกก่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าก่อ', 'Pa Ko', '37210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าก่อ');

    -- District: Pathum Ratchawongsa
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปทุมราชวงศา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปทุมราชวงศา', 'Pathum Ratchawongsa') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองข่า', 'Nong Kha', '37110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองข่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำโพน', 'Kham Phon', '37110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำโพน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหว้า', 'Na Wa', '37110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหว้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลือ', 'Lue', '37110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วย', 'Huai', '37110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนงาม', 'Non Ngam', '37110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนงาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาป่าแซง', 'Na Pa Saeng', '37110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาป่าแซง');

    -- District: Phana
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พนา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พนา', 'Phana') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พนา', 'Phana', '37180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จานลาน', 'Chan Lan', '37180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จานลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไม้กลอน', 'Mai Klon', '37180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไม้กลอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระเหลา', 'Phra Lao', '37180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระเหลา');

    -- District: Senangkhanikhom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เสนางคนิคม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เสนางคนิคม', 'Senangkhanikhom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เสนางคนิคม', 'Senangkhanikhom', '37290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เสนางคนิคม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนทอง', 'Phon Thong', '37290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไร่สีสุก', 'Rai Si Suk', '37290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไร่สีสุก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเวียง', 'Na Wiang', '37290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเวียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไฮ', 'Nong Hai', '37290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไฮ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสามสี', 'Nong Sam Si', '37290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสามสี');

    -- District: Hua Taphan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หัวตะพาน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หัวตะพาน', 'Hua Taphan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวตะพาน', 'Hua Taphan', '37240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวตะพาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำพระ', 'Kham Phra', '37240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำพระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เค็งใหญ่', 'Kheng Yai', '37240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เค็งใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแก้ว', 'Nong Kaeo', '37240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนเมืองน้อย', 'Phon Mueang Noi', '37240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนเมืองน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สร้างถ่อน้อย', 'Sang Tho Noi', '37240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สร้างถ่อน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จิกดู่', 'Chik Du', '37240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จิกดู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'รัตนวารี', 'Rattanawari', '37240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'รัตนวารี');

    -- District: Lue Amnat
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ลืออำนาจ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ลืออำนาจ', 'Lue Amnat') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อำนาจ', 'Amnat', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อำนาจ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงมะยาง', 'Dong Mayang', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงมะยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เปือย', 'Pueai', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เปือย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงบัง', 'Dong Bang', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงบัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไร่ขี', 'Rai Khi', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไร่ขี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แมด', 'Maet', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แมด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกกลาง', 'Khok Klang', '37000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกกลาง');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Nong Bua Lam Phu
    SELECT id INTO p_id FROM provinces WHERE name_th = 'หนองบัวลำภู';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('หนองบัวลำภู', 'Nong Bua Lam Phu') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Nong Bua Lam Phu
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองหนองบัวลำภู';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองหนองบัวลำภู', 'Mueang Nong Bua Lam Phu') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัว', 'Nong Bua', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองภัยศูนย์', 'Nong Phai Sun', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองภัยศูนย์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพธิ์ชัย', 'Pho Chai', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพธิ์ชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสวรรค์', 'Nong Sawan', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสวรรค์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวนา', 'Hua Na', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านขาม', 'Ban Kham', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านขาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นามะเฟือง', 'Na Mafueang', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นามะเฟือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านพร้าว', 'Ban Phrao', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านพร้าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนขมิ้น', 'Non Khamin', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนขมิ้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำภู', 'Lam Phu', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำภู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดจิก', 'Kut Chik', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดจิก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนทัน', 'Non Than', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนทัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาคำไฮ', 'Na Kham Hai', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาคำไฮ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าไม้งาม', 'Pa Mai Ngam', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าไม้งาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหว้า', 'Nong Wa', '39000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหว้า');

    -- District: Na Klang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นากลาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นากลาง', 'Na Klang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นากลาง', 'Na Klang', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นากลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ด่านช้าง', 'Dan Chang', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ด่านช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดดินจี่', 'Kut Din Chi', '39350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดดินจี่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฝั่งแดง', 'Fang Daeng', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฝั่งแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เก่ากลอย', 'Kao Kloi', '39350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เก่ากลอย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนเมือง', 'Non Mueang', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อุทัยสวรรค์', 'Uthai Sawan', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อุทัยสวรรค์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงสวรรค์', 'Dong Sawan', '39350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงสวรรค์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดแห่', 'Kut Hae', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดแห่');

    -- District: Non Sang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'โนนสัง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'โนนสัง', 'Non Sang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนสัง', 'Non Sang', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนสัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านถิ่น', 'Ban Thin', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านถิ่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเรือ', 'Nong Ruea', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเรือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดดู่', 'Kut Du', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดดู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านค้อ', 'Ban Kho', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านค้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนเมือง', 'Non Mueang', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกใหญ่', 'Khok Yai', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกม่วง', 'Khok Muang', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกม่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นิคมพัฒนา', 'Nikhom Phatthana', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นิคมพัฒนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปางกู่', 'Pang Ku', '39140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปางกู่');

    -- District: Si Bun Rueang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ศรีบุญเรือง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ศรีบุญเรือง', 'Si Bun Rueang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองใหม่', 'Mueang Mai', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีบุญเรือง', 'Si Bun Rueang', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีบุญเรือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัวใต้', 'Nong Bua Tai', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัวใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดสะเทียน', 'Kut Sathian', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดสะเทียน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นากอก', 'Na Kok', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นากอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนสะอาด', 'Non Sa-at', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนสะอาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยางหล่อ', 'Yang Lo', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยางหล่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนม่วง', 'Non Muang', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนม่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกุงแก้ว', 'Nong Kung Kaeo', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกุงแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแก', 'Nong Kae', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรายทอง', 'Sai Thong', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรายทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หันนางาม', 'Han Na Ngam', '39180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หันนางาม');

    -- District: Suwannakhuha
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สุวรรณคูหา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สุวรรณคูหา', 'Suwannakhuha') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาสี', 'Nasi', '39270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาสี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโคก', 'Ban Khok', '39270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโคก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาดี', 'Na Di', '39270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาดี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาด่าน', 'Na Dan', '39270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาด่าน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงมะไฟ', 'Dong Mafai', '39270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงมะไฟ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สุวรรณคูหา', 'Suwannakhuha', '39270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สุวรรณคูหา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บุญทัน', 'Bun Than', '39270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บุญทัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดผึ้ง', 'Kut Phueng', '39270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดผึ้ง');

    -- District: Na Wang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นาวัง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นาวัง', 'Na Wang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเหล่า', 'Na Lao', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเหล่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแก', 'Na Kae', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังทอง', 'Wang Thong', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังปลาป้อม', 'Wang Pla Pom', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังปลาป้อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เทพคีรี', 'Thep Khiri', '39170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เทพคีรี');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Khon Kaen
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ขอนแก่น';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ขอนแก่น', 'Khon Kaen') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Khon Kaen
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองขอนแก่น';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองขอนแก่น', 'Mueang Khon Kaen') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในเมือง', 'Nai Mueang', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สำราญ', 'Samran', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สำราญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสี', 'Khok Si', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าพระ', 'Tha Phra', '40260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าพระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านทุ่ม', 'Ban Thum', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านทุ่ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองเก่า', 'Mueang Kao', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองเก่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระลับ', 'Phra Lap', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระลับ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สาวะถี', 'Sawathi', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สาวะถี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านหว้า', 'Ban Wa', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านหว้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านค้อ', 'Ban Kho', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านค้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แดงใหญ่', 'Daeng Yai', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แดงใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนช้าง', 'Don Chang', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนหัน', 'Don Han', '40260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนหัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศิลา', 'Sila', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศิลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเป็ด', 'Ban Pet', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเป็ด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองตูม', 'Nong Tum', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองตูม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บึงเนียม', 'Bueng Niam', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บึงเนียม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนท่อน', 'Non Thon', '40000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนท่อน');

    -- District: Ban Fang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านฝาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านฝาง', 'Ban Fang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัว', 'Nong Bua', '40270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าหวายนั่ง', 'Pa Wai Nang', '40270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าหวายนั่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนฆ้อง', 'Non Khong', '40270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนฆ้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเหล่า', 'Ban Lao', '40270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเหล่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่ามะนาว', 'Pa Manao', '40270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่ามะนาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านฝาง', 'Ban Fang', '40270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านฝาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกงาม', 'Khok Ngam', '40270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกงาม');

    -- District: Phra Yuen
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พระยืน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พระยืน', 'Phra Yuen') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระยืน', 'Phra Yuen', '40320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระยืน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระบุ', 'Phra Bu', '40320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระบุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโต้น', 'Ban Ton', '40320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโต้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแวง', 'Nong Waeng', '40320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขามป้อม', 'Kham Pom', '40320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขามป้อม');

    -- District: Nong Ruea
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองเรือ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองเรือ', 'Nong Ruea') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเรือ', 'Nong Ruea', '40210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเรือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเม็ง', 'Ban Meng', '40210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเม็ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านกง', 'Ban Kong', '40240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านกง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยางคำ', 'Yang Kham', '40240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยางคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จระเข้', 'Chorakhe', '40240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จระเข้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนทอง', 'Non Thong', '40210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดกว้าง', 'Kut Kwang', '40210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดกว้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนทัน', 'Non Than', '40210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนทัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนสะอาด', 'Non Sa-at', '40210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนสะอาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านผือ', 'Ban Phue', '40240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านผือ');

    -- District: Chum Phae
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ชุมแพ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ชุมแพ', 'Chum Phae') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชุมแพ', 'Chum Phae', '40130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชุมแพ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนหัน', 'Non Han', '40290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนหัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหนองทุ่ม', 'Na Nong Thum', '40290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหนองทุ่ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนอุดม', 'Non Udom', '40130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนอุดม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขัวเรียง', 'Khua Riang', '40130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขัวเรียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไผ่', 'Nong Phai', '40130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไผ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไชยสอ', 'Chai So', '40130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไชยสอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังหินลาด', 'Wang Hin Lat', '40130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังหินลาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเพียง', 'Na Phiang', '40130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเพียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเขียด', 'Nong Khiat', '40290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเขียด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเสาเล้า', 'Nong Sao Lao', '40130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเสาเล้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนสะอาด', 'Non Sa-at', '40290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนสะอาด');

    -- District: Si Chomphu
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สีชมพู';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สีชมพู', 'Si Chomphu') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สีชมพู', 'Si Chomphu', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สีชมพู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีสุข', 'Si Suk', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีสุข');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาจาน', 'Na Chan', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาจาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังเพิ่ม', 'Wang Phoem', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังเพิ่ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ซำยาง', 'Sam Yang', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ซำยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแดง', 'Nong Daeng', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงลาน', 'Dong Lan', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บริบูรณ์', 'Boribun', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บริบูรณ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านใหม่', 'Ban Mai', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ภูห่าน', 'Phu Han', '40220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ภูห่าน');

    -- District: Nam Phong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'น้ำพอง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'น้ำพอง', 'Nam Phong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำพอง', 'Nam Phong', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำพอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังชัย', 'Wang Chai', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกุง', 'Nong Kung', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บัวใหญ่', 'Bua Yai', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บัวใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะอาด', 'Sa-at', '40310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะอาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ม่วงหวาน', 'Muang Wan', '40310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ม่วงหวาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านขาม', 'Ban Kham', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านขาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บัวเงิน', 'Bua Ngoen', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บัวเงิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรายมูล', 'Sai Mun', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรายมูล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่ากระเสริม', 'Tha Krasoem', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่ากระเสริม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พังทุย', 'Phang Thui', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พังทุย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดน้ำใส', 'Kut Nam Sai', '40140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดน้ำใส');

    -- District: Ubolratana
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'อุบลรัตน์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'อุบลรัตน์', 'Ubolratana') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสูง', 'Khok Sung', '40250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านดง', 'Ban Dong', '40250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขื่อนอุบลรัตน์', 'Khuean Ubolratana', '40250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขื่อนอุบลรัตน์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาคำ', 'Na Kham', '40250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีสุขสำราญ', 'Si Suk Samran', '40250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีสุขสำราญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งโป่ง', 'Thung Pong', '40250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งโป่ง');

    -- District: Kranuan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กระนวน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กระนวน', 'Kranuan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองโก', 'Nong Ko', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองโก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกุงใหญ่', 'Nong Kung Yai', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกุงใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยโจด', 'Huai Chot', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยโจด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยยาง', 'Huai Yang', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านฝาง', 'Ban Fang', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านฝาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดูนสาด', 'Dun Sat', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดูนสาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองโน', 'Nong No', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองโน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำอ้อม', 'Nam Om', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำอ้อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวนาคำ', 'Hua Na Kham', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวนาคำ');

    -- District: Ban Phai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านไผ่';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านไผ่', 'Ban Phai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านไผ่', 'Ban Phai', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านไผ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในเมือง', 'Nai Mueang', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองเพีย', 'Mueang Phia', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองเพีย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านลาน', 'Ban Lan', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แคนเหนือ', 'Khaen Nuea', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แคนเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ภูเหล็ก', 'Phu Lek', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ภูเหล็ก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าปอ', 'Pa Po', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าปอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หินตั้ง', 'Hin Tang', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หินตั้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองน้ำใส', 'Nong Nam Sai', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองน้ำใส');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวหนอง', 'Hua Nong', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวหนอง');

    -- District: Pueai Noi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เปือยน้อย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เปือยน้อย', 'Pueai Noi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เปือยน้อย', 'Pueai Noi', '40340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เปือยน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังม่วง', 'Wang Muang', '40340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังม่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขามป้อม', 'Kham Pom', '40340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขามป้อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สระแก้ว', 'Sa Kaeo', '40340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สระแก้ว');

    -- District: Phon
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พล';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พล', 'Phon') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองพล', 'Mueang Phon', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองพล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โจดหนองแก', 'Chot Nong Kae', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โจดหนองแก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เก่างิ้ว', 'Kao Ngio', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เก่างิ้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองมะเขือ', 'Nong Makhuea', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองมะเขือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแวงโสกพระ', 'Nong Waeng Sok Phra', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแวงโสกพระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เพ็กใหญ่', 'Phek Yai', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เพ็กใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสง่า', 'Khok Sa-nga', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสง่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแวงนางเบ้า', 'Nong Waeng Nang Bao', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแวงนางเบ้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลอมคอม', 'Lom Khom', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลอมคอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนข่า', 'Non Kha', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนข่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โสกนกเต็น', 'Sok Nok Ten', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โสกนกเต็น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวทุ่ง', 'Hua Thung', '40120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวทุ่ง');

    -- District: Waeng Yai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แวงใหญ่';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แวงใหญ่', 'Waeng Yai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คอนฉิม', 'Khon Chim', '40330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คอนฉิม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ใหม่นาเพียง', 'Mai Na Phiang', '40330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ใหม่นาเพียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนทอง', 'Non Thong', '40330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แวงใหญ่', 'Waeng Yai', '40330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แวงใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนสะอาด', 'Non Sa-at', '40330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนสะอาด');

    -- District: Waeng Noi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แวงน้อย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แวงน้อย', 'Waeng Noi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แวงน้อย', 'Waeng Noi', '40230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แวงน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ก้านเหลือง', 'Kan Lueang', '40230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ก้านเหลือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่านางแนว', 'Tha Nang Naeo', '40230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่านางแนว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ละหานนา', 'Lahan Na', '40230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ละหานนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าวัด', 'Tha Wat', '40230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าวัด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทางขวาง', 'Thang Khwang', '40230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทางขวาง');

    -- District: Nong Song Hong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองสองห้อง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองสองห้อง', 'Nong Song Hong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสองห้อง', 'Nong Song Hong', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสองห้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คึมชาด', 'Khuemchat', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คึมชาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนธาตุ', 'Non That', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนธาตุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะกั่วป่า', 'Takua Pa', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะกั่วป่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สำโรง', 'Samrong', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สำโรง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเม็ก', 'Nong Mek', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเม็ก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนดู่', 'Don Du', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนดู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงเค็ง', 'Dong Kheng', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงเค็ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หันโจด', 'Han Chot', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หันโจด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนดั่ง', 'Don Dang', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนดั่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังหิน', 'Wang Hin', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังหิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไผ่ล้อม', 'Nong Phai Lom', '40190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไผ่ล้อม');

    -- District: Phu Wiang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ภูเวียง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ภูเวียง', 'Phu Wiang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเรือ', 'Ban Ruea', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเรือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หว้าทอง', 'Wa Thong', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หว้าทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดขอนแก่น', 'Kut Khon Kaen', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดขอนแก่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาชุมแสง', 'Na Chum Saeng', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาชุมแสง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหว้า', 'Na Wa', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหว้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกุงธนสาร', 'Nong Kung Thanasan', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกุงธนสาร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกุงเซิน', 'Nong Kung Soen', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกุงเซิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สงเปือย', 'Song Pueai', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สงเปือย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งชมพู', 'Thung Chomphu', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งชมพู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดินดำ', 'Din Dam', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดินดำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ภูเวียง', 'Phu Wiang', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ภูเวียง');

    -- District: Mancha Khiri
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'มัญจาคีรี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'มัญจาคีรี', 'Mancha Khiri') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดเค้า', 'Kut Khao', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดเค้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สวนหม่อน', 'Suan Mon', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สวนหม่อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแปน', 'Nong Paen', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแปน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนเพ็ก', 'Phon Phek', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนเพ็ก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำแคน', 'Kham Khaen', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำแคน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาข่า', 'Na Kha', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาข่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นางาม', 'Na Ngam', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นางาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าศาลา', 'Tha Sala', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าศาลา');

    -- District: Chonnabot
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ชนบท';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ชนบท', 'Chonnabot') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชนบท', 'Chonnabot', '40180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชนบท');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดเพียขอม', 'Kut Phia Khom', '40180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดเพียขอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังแสง', 'Wang Saeng', '40180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังแสง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยแก', 'Huai Kae', '40180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยแก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแท่น', 'Ban Thaen', '40180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแท่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีบุญเรือง', 'Si Bun Rueang', '40180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีบุญเรือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนพะยอม', 'Non Phayom', '40180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนพะยอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปอแดง', 'Po Daeng', '40180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปอแดง');

    -- District: Khao Suan Kwang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เขาสวนกวาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เขาสวนกวาง', 'Khao Suan Kwang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาสวนกวาง', 'Khao Suan Kwang', '40280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาสวนกวาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงเมืองแอม', 'Dong Mueang Aem', '40280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงเมืองแอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นางิ้ว', 'Na Ngio', '40280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นางิ้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนสมบูรณ์', 'Non Sombun', '40280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนสมบูรณ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำม่วง', 'Kham Muang', '40280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำม่วง');

    -- District: Phu Pha Man
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ภูผาม่าน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ภูผาม่าน', 'Phu Pha Man') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนคอม', 'Non Khom', '40350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนคอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาฝาย', 'Na Fai', '40350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาฝาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ภูผาม่าน', 'Phu Pha Man', '40350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ภูผาม่าน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังสวาบ', 'Wang Sawap', '40350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังสวาบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยม่วง', 'Huai Muang', '40350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยม่วง');

    -- District: Sam Sung
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ซำสูง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ซำสูง', 'Sam Sung') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กระนวน', 'Kranuan', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กระนวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำแมด', 'Kham Maet', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำแมด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโนน', 'Ban Non', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโนน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คูคำ', 'Khu Kham', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คูคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยเตย', 'Huai Toei', '40170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยเตย');

    -- District: Khok Pho Chai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'โคกโพธิ์ไชย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'โคกโพธิ์ไชย', 'Khok Pho Chai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโคก', 'Ban Khok', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโคก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพธิ์ไชย', 'Pho Chai', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพธิ์ไชย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ซับสมบูรณ์', 'Sap Sombun', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ซับสมบูรณ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแพง', 'Na Phaeng', '40160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแพง');

    -- District: Nong Na Kham
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองนาคำ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองนาคำ', 'Nong Na Kham') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดธาตุ', 'Kut That', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดธาตุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโคก', 'Ban Khok', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโคก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขนวน', 'Khanuan', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขนวน');

    -- District: Ban Haet
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านแฮด';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านแฮด', 'Ban Haet') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแฮด', 'Ban Haet', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแฮด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสำราญ', 'Khok Samran', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสำราญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนสมบูรณ์', 'Non Sombun', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนสมบูรณ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแซง', 'Nong Saeng', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแซง');

    -- District: Non Sila
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'โนนศิลา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'โนนศิลา', 'Non Sila') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนศิลา', 'Non Sila', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนศิลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองปลาหมอ', 'Nong Pla Mo', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองปลาหมอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านหัน', 'Ban Han', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านหัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เปือยใหญ่', 'Pueai Yai', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เปือยใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนแดง', 'Non Daeng', '40110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนแดง');

    -- District: Wiang Kao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เวียงเก่า';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เวียงเก่า', 'Wiang Kao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในเมือง', 'Nai Mueang', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองเก่าพัฒนา', 'Mueang Kao Phatthana', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองเก่าพัฒนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาน้อย', 'Khao Noi', '40150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาน้อย');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Udon Thani
    SELECT id INTO p_id FROM provinces WHERE name_th = 'อุดรธานี';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('อุดรธานี', 'Udon Thani') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Udon Thani
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองอุดรธานี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองอุดรธานี', 'Mueang Udon Thani') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หมากแข้ง', 'Mak Khaeng', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หมากแข้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นิคมสงเคราะห์', 'Nikhom Songkhro', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นิคมสงเคราะห์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านขาว', 'Ban Khao', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัว', 'Nong Bua', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านตาด', 'Ban Tat', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านตาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนสูง', 'Non Sung', '41330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนสูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หมูม่น', 'Mu Mon', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หมูม่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงยืน', 'Chiang Yuen', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงยืน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองนาคำ', 'Nong Na Kham', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองนาคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดสระ', 'Kut Sa', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดสระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาดี', 'Na Di', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาดี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเลื่อม', 'Ban Lueam', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเลื่อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงพิณ', 'Chiang Phin', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงพิณ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สามพร้าว', 'Sam Phrao', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สามพร้าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไฮ', 'Nong Hai', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไฮ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาข่า', 'Na Kha', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาข่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านจั่น', 'Ban Chan', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านจั่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองขอนกว้าง', 'Nong Khon Kwang', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองขอนกว้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสะอาด', 'Khok Sa-at', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสะอาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นากว้าง', 'Na Kwang', '41000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นากว้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไผ่', 'Nong Phai', '41330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไผ่');

    -- District: Kut Chap
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กุดจับ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กุดจับ', 'Kut Chap') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดจับ', 'Kut Chap', '41250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดจับ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปะโค', 'Pakho', '41250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปะโค');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขอนยูง', 'Khon Yung', '41250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขอนยูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงเพ็ง', 'Chiang Pheng', '41250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงเพ็ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สร้างก่อ', 'Sang Ko', '41250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สร้างก่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองเพีย', 'Mueang Phia', '41250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองเพีย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาลเลียน', 'Tan Lian', '41250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาลเลียน');

    -- District: Nong Wua So
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองวัวซอ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองวัวซอ', 'Nong Wua So') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หมากหญ้า', 'Mak Ya', '41360' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หมากหญ้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองอ้อ', 'Nong O', '41220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองอ้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อูบมุง', 'Up Mung', '41220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อูบมุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดหมากไฟ', 'Kut Mak Fai', '41220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดหมากไฟ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำพ่น', 'Nam Phon', '41360' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำพ่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัวบาน', 'Nong Bua Ban', '41360' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัวบาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนหวาย', 'Non Wai', '41220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนหวาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองวัวซอ', 'Nong Wua So', '41360' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองวัวซอ');

    -- District: Kumphawapi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กุมภวาปี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กุมภวาปี', 'Kumphawapi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตูมใต้', 'Tum Tai', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตูมใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พันดอน', 'Phan Don', '41370' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พันดอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียงคำ', 'Wiang Kham', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียงคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แชแล', 'Chaelae', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แชแล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงแหว', 'Chiang Wae', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงแหว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยเกิ้ง', 'Huai Koeng', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยเกิ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เสอเพลอ', 'Soephloe', '41370' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เสอเพลอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สีออ', 'Si O', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สีออ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปะโค', 'Pa Kho', '41370' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปะโค');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผาสุก', 'Phasuk', '41370' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผาสุก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าลี่', 'Tha Li', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าลี่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุมภวาปี', 'Kumphawapi', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุมภวาปี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหว้า', 'Nong Wa', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหว้า');

    -- District: Non Sa-at
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'โนนสะอาด';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'โนนสะอาด', 'Non Sa-at') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนสะอาด', 'Non Sa-at', '41240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนสะอาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บุ่งแก้ว', 'Bung Kaeo', '41240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บุ่งแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพธิ์ศรีสำราญ', 'Pho Si Samran', '41240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพธิ์ศรีสำราญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทมนางาม', 'Thom Na Ngam', '41240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทมนางาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกุงศรี', 'Nong Kung Si', '41240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกุงศรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกกลาง', 'Khok Klang', '41240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกกลาง');

    -- District: Nong Han
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองหาน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองหาน', 'Nong Han') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหาน', 'Nong Han', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเม็ก', 'Nong Mek', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเม็ก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พังงู', 'Phang Ngu', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พังงู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะแบง', 'Sabaeng', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะแบง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สร้อยพร้าว', 'Soi Phrao', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สร้อยพร้าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเชียง', 'Ban Chiang', '41320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเชียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านยา', 'Ban Ya', '41320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านยา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนงาม', 'Phon Ngam', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนงาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผักตบ', 'Phak Top', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผักตบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไผ่', 'Nong Phai', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไผ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนหายโศก', 'Don Hai Sok', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนหายโศก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสระปลา', 'Nong Sa Pla', '41320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสระปลา');

    -- District: Thung Fon
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ทุ่งฝน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ทุ่งฝน', 'Thung Fon') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งฝน', 'Thung Fon', '41310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งฝน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งใหญ่', 'Thung Yai', '41310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาชุมแสง', 'Na Chum Saeng', '41310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาชุมแสง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาทม', 'Na Thom', '41310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาทม');

    -- District: Chai Wan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ไชยวาน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ไชยวาน', 'Chai Wan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไชยวาน', 'Chai Wan', '41290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไชยวาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหลัก', 'Nong Lak', '41290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหลัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำเลาะ', 'Kham Lo', '41290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำเลาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนสูง', 'Phon Sung', '41290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนสูง');

    -- District: Si That
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ศรีธาตุ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ศรีธาตุ', 'Si That') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีธาตุ', 'Si That', '41230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีธาตุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จำปี', 'Champi', '41230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จำปี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโปร่ง', 'Ban Prong', '41230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโปร่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวนาคำ', 'Hua Na Kham', '41230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวนาคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองนกเขียน', 'Nong Nok Khian', '41230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองนกเขียน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นายูง', 'Na Yung', '41230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นายูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาดทอง', 'Tat Thong', '41230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาดทอง');

    -- District: Wang Sam Mo
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'วังสามหมอ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'วังสามหมอ', 'Wang Sam Mo') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกุงทับม้า', 'Nong Kung Thap Ma', '41280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกุงทับม้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหญ้าไซ', 'Nong Ya Sai', '41280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหญ้าไซ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บะยาว', 'Ba Yao', '41280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บะยาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผาสุก', 'Phasuk', '41280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผาสุก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำโคกสูง', 'Kham Khok Sung', '41280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำโคกสูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังสามหมอ', 'Wang Sam Mo', '41280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังสามหมอ');

    -- District: Ban Dung
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านดุง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านดุง', 'Ban Dung') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีสุทโธ', 'Si Suttho', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีสุทโธ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านดุง', 'Ban Dung', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านดุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงเย็น', 'Dong Yen', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงเย็น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนสูง', 'Phon Sung', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนสูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อ้อมกอ', 'Om Ko', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อ้อมกอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านจันทน์', 'Ban Chan', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านจันทน์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านชัย', 'Ban Chai', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาไหม', 'Na Mai', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาไหม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ถ่อนนาลับ', 'Thon Na Lap', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ถ่อนนาลับ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังทอง', 'Wang Thong', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านม่วง', 'Ban Muang', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านม่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านตาด', 'Ban Tat', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านตาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาคำ', 'Na Kham', '41190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาคำ');

    -- District: Ban Phue
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านผือ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านผือ', 'Ban Phue') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านผือ', 'Ban Phue', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านผือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หายโศก', 'Hai Sok', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หายโศก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขือน้ำ', 'Khuea Nam', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขือน้ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำบง', 'Kham Bong', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำบง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนทอง', 'Non Thong', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ข้าวสาร', 'Khao San', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ข้าวสาร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จำปาโมง', 'Champa Mong', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จำปาโมง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กลางใหญ่', 'Klang Yai', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กลางใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองพาน', 'Mueang Phan', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองพาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คำด้วง', 'Kham Duang', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คำด้วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหัวคู', 'Nong Hua Khu', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหัวคู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านค้อ', 'Ban Kho', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านค้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแวง', 'Nong Waeng', '41160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแวง');

    -- District: Nam Som
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'น้ำโสม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'น้ำโสม', 'Nam Som') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นางัว', 'Na Ngua', '41210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นางัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำโสม', 'Nam Som', '41210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำโสม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแวง', 'Nong Waeng', '41210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านหยวก', 'Ban Yuak', '41210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านหยวก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โสมเยี่ยม', 'Som Yiam', '41210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โสมเยี่ยม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีสำราญ', 'Si Samran', '41210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีสำราญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สามัคคี', 'Samakkhi', '41210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สามัคคี');

    -- District: Phen
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เพ็ญ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เพ็ญ', 'Phen') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เพ็ญ', 'Phen', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เพ็ญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านธาตุ', 'Ban That', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านธาตุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาพู่', 'Na Phu', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาพู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงหวาง', 'Chiang Wang', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงหวาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สุมเส้า', 'Sum Sao', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สุมเส้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาบัว', 'Na Bua', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาบัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเหล่า', 'Ban Lao', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเหล่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จอมศรี', 'Chom Si', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จอมศรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เตาไห', 'Tao Hai', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เตาไห');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกกลาง', 'Khok Klang', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกกลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สร้างแป้น', 'Sang Paen', '41150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สร้างแป้น');

    -- District: Sang Khom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สร้างคอม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สร้างคอม', 'Sang Khom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สร้างคอม', 'Sang Khom', '41260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สร้างคอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงดา', 'Chiang Da', '41260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงดา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านยวด', 'Ban Yuat', '41260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านยวด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโคก', 'Ban Khok', '41260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโคก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาสะอาด', 'Na Sa-at', '41260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาสะอาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านหินโงม', 'Ban Hin Ngom', '41260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านหินโงม');

    -- District: Nong Saeng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองแสง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองแสง', 'Nong Saeng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแสง', 'Nong Saeng', '41340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแสง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แสงสว่าง', 'Saeng Sawang', '41340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แสงสว่าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาดี', 'Na Di', '41340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาดี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทับกุง', 'Thap Kung', '41340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทับกุง');

    -- District: Na Yung
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นายูง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นายูง', 'Na Yung') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นายูง', 'Na Yung', '41380' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นายูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านก้อง', 'Ban Kong', '41380' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านก้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแค', 'Na Khae', '41380' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแค');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนทอง', 'Non Thong', '41380' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนทอง');

    -- District: Phibun Rak
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พิบูลย์รักษ์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พิบูลย์รักษ์', 'Phibun Rak') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแดง', 'Ban Daeng', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาทราย', 'Na Sai', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนกลอย', 'Don Kloi', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนกลอย');

    -- District: Ku Kaeo
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กู่แก้ว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กู่แก้ว', 'Ku Kaeo') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านจีต', 'Ban Chit', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านจีต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนทองอินทร์', 'Non Thong In', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนทองอินทร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ค้อใหญ่', 'Kho Yai', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ค้อใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คอนสาย', 'Khon Sai', '41130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คอนสาย');

    -- District: rachak-sinlapakhom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ประจักษ์ศิลปาคม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ประจักษ์ศิลปาคม', 'rachak-sinlapakhom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาม่วง', 'Na Muang', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาม่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยสามพาด', 'Huai Sam Phat', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยสามพาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อุ่มจาน', 'Um Chan', '41110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อุ่มจาน');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Loei
    SELECT id INTO p_id FROM provinces WHERE name_th = 'เลย';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('เลย', 'Loei') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Loei
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองเลย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองเลย', 'Mueang Loei') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กุดป่อง', 'Kut Pong', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กุดป่อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมือง', 'Mueang', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาอ้อ', 'Na O', '42100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาอ้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กกดู่', 'Kok Du', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กกดู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำหมาน', 'Nam Man', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำหมาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เสี้ยว', 'Siao', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เสี้ยว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาอาน', 'Na An', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาอาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาโป่ง', 'Na Pong', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาโป่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาดินดำ', 'Na Din Dam', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาดินดำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำสวย', 'Nam Suai', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำสวย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชัยพฤกษ์', 'Chaiyaphruek', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชัยพฤกษ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแขม', 'Na Khaem', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแขม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีสองรัก', 'Si Song Rak', '42100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีสองรัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กกทอง', 'Kok Thong', '42000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กกทอง');

    -- District: Na Duang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นาด้วง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นาด้วง', 'Na Duang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาด้วง', 'Na Duang', '42210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาด้วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาดอกคำ', 'Na Dok Kham', '42210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาดอกคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าสะอาด', 'Tha Sa-at', '42210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าสะอาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าสวรรค์', 'Tha Sawan', '42210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าสวรรค์');

    -- District: Chiang Khan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เชียงคาน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เชียงคาน', 'Chiang Khan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงคาน', 'Chiang Khan', '42110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงคาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ธาตุ', 'That', '42110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ธาตุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาซ่าว', 'Na Sao', '42110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาซ่าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาแก้ว', 'Khao Kaeo', '42110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากตม', 'Pak Tom', '42110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากตม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บุฮม', 'Bu Hom', '42110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บุฮม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จอมศรี', 'Chom Si', '42110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จอมศรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดทรายขาว', 'Hat Sai Khao', '42110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดทรายขาว');

    -- District: Pak Chom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปากชม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปากชม', 'Pak Chom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากชม', 'Pak Chom', '42150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากชม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงกลม', 'Chiang Klom', '42150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงกลม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดคัมภีร์', 'Hat Khamphi', '42150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดคัมภีร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยบ่อซืน', 'Huai Bo Suen', '42150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยบ่อซืน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยพิชัย', 'Huai Phichai', '42150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยพิชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชมเจริญ', 'Chom Charoen', '42150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชมเจริญ');

    -- District: Dan Sai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ด่านซ้าย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ด่านซ้าย', 'Dan Sai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ด่านซ้าย', 'Dan Sai', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ด่านซ้าย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากหมัน', 'Pak Man', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากหมัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาดี', 'Na Di', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาดี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกงาม', 'Khok Ngam', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกงาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพนสูง', 'Phon Sung', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพนสูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อิปุ่ม', 'Ipum', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อิปุ่ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กกสะทอน', 'Kok Sathon', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กกสะทอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โป่ง', 'Pong', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โป่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังยาว', 'Wang Yao', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังยาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหอ', 'Na Ho', '42120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหอ');

    -- District: Na Haeo
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นาแห้ว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นาแห้ว', 'Na Haeo') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาแห้ว', 'Na Haeo', '42170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาแห้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แสงภา', 'Saeng Pha', '42170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แสงภา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาพึง', 'Na Phueng', '42170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาพึง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นามาลา', 'Na Ma La', '42170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นามาลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เหล่ากอหก', 'Lao Ko Hok', '42170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เหล่ากอหก');

    -- District: Phu Ruea
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ภูเรือ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ภูเรือ', 'Phu Ruea') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัว', 'Nong Bua', '42160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าศาลา', 'Tha Sala', '42160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าศาลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ร่องจิก', 'Rong Chik', '42160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ร่องจิก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปลาบ่า', 'Pla Ba', '42160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปลาบ่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลาดค่าง', 'Lat Khang', '42160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลาดค่าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สานตม', 'San Tom', '42160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สานตม');

    -- District: Tha Li
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ท่าลี่';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ท่าลี่', 'Tha Li') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าลี่', 'Tha Li', '42140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าลี่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองผือ', 'Nong Phue', '42140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองผือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อาฮี', 'A Hi', '42140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อาฮี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำแคม', 'Nam Khaem', '42140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำแคม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกใหญ่', 'Khok Yai', '42140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำทูน', 'Nam Thun', '42140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำทูน');

    -- District: Wang Saphung
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'วังสะพุง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'วังสะพุง', 'Wang Saphung') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังสะพุง', 'Wang Saphung', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังสะพุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรายขาว', 'Sai Khao', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรายขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหญ้าปล้อง', 'Nong Ya Plong', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหญ้าปล้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองงิ้ว', 'Nong Ngio', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองงิ้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากปวน', 'Pak Puan', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากปวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผาน้อย', 'Pha Noi', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผาน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผาบิ้ง', 'Pha Bing', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผาบิ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาหลวง', 'Khao Luang', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกขมิ้น', 'Khok Khamin', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกขมิ้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีสงคราม', 'Si Songkhram', '42130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีสงคราม');

    -- District: Phu Kradueng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ภูกระดึง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ภูกระดึง', 'Phu Kradueng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีฐาน', 'Si Than', '42180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีฐาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผานกเค้า', 'Pha Nok Khao', '42180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผานกเค้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ภูกระดึง', 'Phu Kradueng', '42180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ภูกระดึง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยส้ม', 'Huai Som', '42180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยส้ม');

    -- District: Phu Luang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ภูหลวง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ภูหลวง', 'Phu Luang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ภูหอ', 'Phu Ho', '42230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ภูหอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองคัน', 'Nong Khan', '42230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองคัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยสีเสียด', 'Huai Sisiat', '42230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยสีเสียด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เลยวังไสย์', 'Loei Wang Sai', '42230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เลยวังไสย์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แก่งศรีภูมิ', 'Kaeng Si Phum', '42230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แก่งศรีภูมิ');

    -- District: Pha Khao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ผาขาว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ผาขาว', 'Pha Khao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผาขาว', 'Pha Khao', '42240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผาขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าช้างคล้อง', 'Tha Chang Khlong', '42240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าช้างคล้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนปอแดง', 'Non Po Daeng', '42240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนปอแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนป่าซาง', 'Non Pa Sang', '42240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนป่าซาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเพิ่ม', 'Ban Phoem', '42240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเพิ่ม');

    -- District: Erawan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เอราวัณ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เอราวัณ', 'Erawan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เอราวัณ', 'Erawan', '42220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เอราวัณ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผาอินทร์แปลง', 'Pha In Plaeng', '42220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผาอินทร์แปลง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผาสามยอด', 'Pha Sam Yot', '42220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผาสามยอด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรัพย์ไพวัลย์', 'Sap Phaiwan', '42220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรัพย์ไพวัลย์');

    -- District: Nong Hin
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองหิน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองหิน', 'Nong Hin') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหิน', 'Nong Hin', '42190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาดข่า', 'Tat Kha', '42190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาดข่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปวนพุ', 'Puan Phu', '42190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปวนพุ');

END $$;

