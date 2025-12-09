-- Thailand Locations Seed Script (Part 15)
-- Generated from kongvut/thai-province-data

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Satun
    SELECT id INTO p_id FROM provinces WHERE name_th = 'สตูล';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('สตูล', 'Satun') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Satun
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองสตูล';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองสตูล', 'Mueang Satun') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พิมาน', 'Phiman', '91000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พิมาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองขุด', 'Khlong Khut', '91000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองขุด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนขัน', 'Khuan Khan', '91000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนขัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านควน', 'Ban Khuan', '91140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านควน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฉลุง', 'Chalung', '91140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฉลุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะสาหร่าย', 'Ko Sarai', '91000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะสาหร่าย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตันหยงโป', 'Tanyong Po', '91000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตันหยงโป');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เจ๊ะบิลัง', 'Che Bilang', '91000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เจ๊ะบิลัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตำมะลัง', 'Tam Malang', '91000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตำมะลัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปูยู', 'Puyu', '91000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปูยู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนโพธิ์', 'Khuan Pho', '91140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนโพธิ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกตรี', 'Ketri', '91140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกตรี');

    -- District: Khuan Don
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ควนโดน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ควนโดน', 'Khuan Don') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนโดน', 'Khuan Don', '91160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนโดน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนสตอ', 'Khuan Sato', '91160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนสตอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ย่านซื่อ', 'Yan Sue', '91160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ย่านซื่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังประจัน', 'Wang Prachan', '91160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังประจัน');

    -- District: Khuan Kalong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ควนกาหลง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ควนกาหลง', 'Khuan Kalong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งนุ้ย', 'Thung Nui', '91130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งนุ้ย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนกาหลง', 'Khuan Kalong', '91130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนกาหลง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อุใดเจริญ', 'Udai Charoen', '91130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อุใดเจริญ');

    -- District: Tha Phae
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ท่าแพ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ท่าแพ', 'Tha Phae') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าแพ', 'Tha Phae', '91150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าแพ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แป-ระ', 'Paera', '91150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แป-ระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สาคร', 'Sakhon', '91150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สาคร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าเรือ', 'Tha Rua', '91150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าเรือ');

    -- District: La-ngu
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ละงู';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ละงู', 'La-ngu') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กำแพง', 'Kamphaeng', '91110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กำแพง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ละงู', 'La-ngu', '91110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ละงู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาขาว', 'Khao Khao', '91110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากน้ำ', 'Pak Nam', '91110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากน้ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำผุด', 'Nam Phut', '91110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำผุด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แหลมสน', 'Laem Son', '91110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แหลมสน');

    -- District: Thung Wa
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ทุ่งหว้า';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ทุ่งหว้า', 'Thung Wa') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งหว้า', 'Thung Wa', '91120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งหว้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาทอน', 'Na Thon', '91120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาทอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขอนคลาน', 'Khon Khlan', '91120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขอนคลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งบุหลัง', 'Thung Bulang', '91120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งบุหลัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าแก่บ่อหิน', 'Pa Kae Bo Hin', '91120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าแก่บ่อหิน');

    -- District: Manang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'มะนัง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'มะนัง', 'Manang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปาล์มพัฒนา', 'Palm Phatthana', '91130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปาล์มพัฒนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นิคมพัฒนา', 'Nikhom Phatthana', '91130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นิคมพัฒนา');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Trang
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ตรัง';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ตรัง', 'Trang') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Trang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองตรัง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองตรัง', 'Mueang Trang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทับเที่ยง', 'Thap Thiang', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทับเที่ยง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาพละ', 'Na Phala', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาพละ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านควน', 'Ban Khuan', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านควน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาบินหลา', 'Na Bin La', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาบินหลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนปริง', 'Khuan Pring', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนปริง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาโยงใต้', 'Na Yong Tai', '92170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาโยงใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางรัก', 'Bang Rak', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางรัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกหล่อ', 'Khok Lo', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกหล่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาโต๊ะหมิง', 'Na To Ming', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาโต๊ะหมิง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองตรุด', 'Nong Trut', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองตรุด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำผุด', 'Nam Phut', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำผุด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาตาล่วง', 'Na Ta Luang', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาตาล่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโพธิ์', 'Ban Pho', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโพธิ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาท่ามเหนือ', 'Na Tham Nuea', '92190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาท่ามเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาท่ามใต้', 'Na Tham Tai', '92190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาท่ามใต้');

    -- District: Kantang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กันตัง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กันตัง', 'Kantang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กันตัง', 'Kantang', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กันตัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนธานี', 'Khuan Thani', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนธานี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางหมาก', 'Bang Mak', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางหมาก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางเป้า', 'Bang Pao', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางเป้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังวน', 'Wang Won', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กันตังใต้', 'Kantang Tai', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กันตังใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกยาง', 'Khok Yang', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองลุ', 'Khlong Lu', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองลุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ย่านซื่อ', 'Yan Sue', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ย่านซื่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อน้ำร้อน', 'Bo Nam Ron', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อน้ำร้อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางสัก', 'Bang Sak', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางสัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเกลือ', 'Na Kluea', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเกลือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะลิบง', 'Ko Libong', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะลิบง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองชีล้อม', 'Khlong Chi Lom', '92110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองชีล้อม');

    -- District: Yan Ta Khao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ย่านตาขาว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ย่านตาขาว', 'Yan Ta Khao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ย่านตาขาว', 'Yan Ta Khao', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ย่านตาขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบ่อ', 'Nong Bo', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบ่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาชุมเห็ด', 'Na Chum Het', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาชุมเห็ด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในควน', 'Nai Khuan', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในควน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพรงจระเข้', 'Phrong Chorakhe', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพรงจระเข้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งกระบือ', 'Thung Krabue', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งกระบือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งค่าย', 'Thung Khai', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งค่าย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะเปียะ', 'Ko Pia', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะเปียะ');

    -- District: Palian
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปะเหลียน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปะเหลียน', 'Palian') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าข้าม', 'Tha Kham', '92120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าข้าม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งยาว', 'Thung Yao', '92180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งยาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปะเหลียน', 'Palian', '92180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปะเหลียน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางด้วน', 'Bang Duan', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางด้วน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านนา', 'Ban Na', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สุโสะ', 'Suso', '92120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สุโสะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลิพัง', 'Liphang', '92180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลิพัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะสุกร', 'Ko Sukon', '92120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะสุกร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าพญา', 'Tha Phaya', '92140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าพญา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แหลมสอม', 'Laem Som', '92180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แหลมสอม');

    -- District: Sikao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สิเกา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สิเกา', 'Sikao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อหิน', 'Bo Hin', '92150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อหิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาไม้แก้ว', 'Khao Mai Kaeo', '92150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาไม้แก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กะลาเส', 'Kalase', '92150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กะลาเส');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไม้ฝาด', 'Mai Fat', '92150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไม้ฝาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเมืองเพชร', 'Na Mueang Phet', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเมืองเพชร');

    -- District: Huai Yot
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ห้วยยอด';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ห้วยยอด', 'Huai Yot') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยยอด', 'Huai Yot', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยยอด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองช้างแล่น', 'Nong Chang Laen', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองช้างแล่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางดี', 'Bang Di', '92210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางดี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางกุ้ง', 'Bang Kung', '92210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางกุ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขากอบ', 'Khao Kop', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขากอบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาขาว', 'Khao Khao', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาปูน', 'Khao Pun', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาปูน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากแจ่ม', 'Pak Chaem', '92190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากแจ่ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากคม', 'Pak Khom', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากคม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่างิ้ว', 'Tha Ngio', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่างิ้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำภูรา', 'Lamphu Ra', '92190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำภูรา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาวง', 'Na Wong', '92210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยนาง', 'Huai Nang', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยนาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในเตา', 'Nai Tao', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในเตา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งต่อ', 'Thung To', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งต่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังคีรี', 'Wang Khiri', '92210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังคีรี');

    -- District: Wang Wiset
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'วังวิเศษ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'วังวิเศษ', 'Wang Wiset') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาวิเศษ', 'Khao Wiset', '92220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาวิเศษ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังมะปราง', 'Wang Maprang', '92220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังมะปราง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อ่าวตง', 'Ao Tong', '92220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อ่าวตง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าสะบ้า', 'Tha Saba', '92000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าสะบ้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังมะปรางเหนือ', 'Wang Maprang Nuea', '92220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังมะปรางเหนือ');

    -- District: Na Yong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นาโยง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นาโยง', 'Na Yong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาโยงเหนือ', 'Na Yong Nuea', '92170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาโยงเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช่อง', 'Chong', '92170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช่อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ละมอ', 'Lamo', '92170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ละมอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสะบ้า', 'Khok Saba', '92170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสะบ้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหมื่นศรี', 'Na Muen Si', '92170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหมื่นศรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาข้าวเสีย', 'Na Khao Sia', '92170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาข้าวเสีย');

    -- District: Ratsada
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'รัษฎา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'รัษฎา', 'Ratsada') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนเมา', 'Khuan Mao', '92160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนเมา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองปาง', 'Khlong Pang', '92160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองปาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัว', 'Nong Bua', '92160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองปรือ', 'Nong Prue', '92130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองปรือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาไพร', 'Khao Phrai', '92160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาไพร');

    -- District: Hat Samran
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หาดสำราญ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หาดสำราญ', 'Hat Samran') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดสำราญ', 'Hat Samran', '92120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดสำราญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้าหวี', 'Ba Wi', '92120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้าหวี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะเสะ', 'Ta Se', '92120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะเสะ');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Phatthalung
    SELECT id INTO p_id FROM provinces WHERE name_th = 'พัทลุง';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('พัทลุง', 'Phatthalung') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Phatthalung
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองพัทลุง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองพัทลุง', 'Mueang Phatthalung') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คูหาสวรรค์', 'Khuha Sawan', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คูหาสวรรค์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาเจียก', 'Khao Chiak', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาเจียก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่ามิหรำ', 'Tha Miram', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่ามิหรำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกชะงาย', 'Khok Cha-ngai', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกชะงาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาท่อม', 'Na Thom', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาท่อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปรางหมู่', 'Prang Mu', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปรางหมู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าแค', 'Tha Khae', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าแค');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำปำ', 'Lampam', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำปำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตำนาน', 'Tamnan', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตำนาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนมะพร้าว', 'Khuan Maphrao', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนมะพร้าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ร่มเมือง', 'Rom Mueang', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ร่มเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชัยบุรี', 'Chai Buri', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชัยบุรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาโหนด', 'Na Not', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาโหนด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พญาขัน', 'Phaya Khan', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พญาขัน');

    -- District: Kong Ra
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กงหรา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กงหรา', 'Kong Ra') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กงหรา', 'Kong Ra', '93180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กงหรา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชะรัด', 'Charat', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชะรัด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองเฉลิม', 'Khlong Chaloem', '93180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองเฉลิม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองทรายขาว', 'Khlong Sai Khao', '93180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองทรายขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สมหวัง', 'Som Wang', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สมหวัง');

    -- District: Khao Chaison
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เขาชัยสน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เขาชัยสน', 'Khao Chaison') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาชัยสน', 'Khao Chaison', '93130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาชัยสน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนขนุน', 'Khuan Khanun', '93130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนขนุน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จองถนน', 'Chong Thanon', '93130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จองถนน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หานโพธิ์', 'Han Pho', '93130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หานโพธิ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกม่วง', 'Khok Muang', '93130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกม่วง');

    -- District: Tamot
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ตะโหมด';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ตะโหมด', 'Tamot') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ขรี', 'Mae Khari', '93160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ขรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะโหมด', 'Tamod', '93160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะโหมด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองใหญ่', 'Khlong Yai', '93160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองใหญ่');

    -- District: Khuan Khanun
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ควนขนุน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ควนขนุน', 'Khuan Khanun') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนขนุน', 'Khuan Khanun', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนขนุน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทะเลน้อย', 'Thale Noi', '93150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทะเลน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาขยาด', 'Na Khayat', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาขยาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พนมวังก์', 'Phanom Wang', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พนมวังก์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แหลมโตนด', 'Laem Tanot', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แหลมโตนด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปันแต', 'Pan Tae', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปันแต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โตนดด้วน', 'Tanot Duan', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โตนดด้วน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนทราย', 'Don Sai', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะกอกเหนือ', 'Makok Nuea', '93150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะกอกเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พนางตุง', 'Phanang Tung', '93150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พนางตุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชะมวง', 'Chamuang', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชะมวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แพรกหา', 'Phraek Ha', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แพรกหา');

    -- District: Pak Phayun
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปากพะยูน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปากพะยูน', 'Pak Phayun') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากพะยูน', 'Pak Phayun', '93120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากพะยูน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนประดู่', 'Don Pradu', '93120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนประดู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะนางคำ', 'Ko Nang Kham', '93120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะนางคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะหมาก', 'Ko Mak', '93120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะหมาก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฝาละมี', 'Falami', '93120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฝาละมี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หารเทา', 'Han Thao', '93120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หารเทา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนทราย', 'Don Sai', '93120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนทราย');

    -- District: Si Banphot
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ศรีบรรพต';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ศรีบรรพต', 'Si Banphot') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาย่า', 'Khao Ya', '93190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาย่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาปู่', 'Khao Pu', '93190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาปู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะแพน', 'Taphaen', '93190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะแพน');

    -- District: Pa Bon
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ป่าบอน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ป่าบอน', 'Pa Bon') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าบอน', 'Pa Bon', '93170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าบอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกทราย', 'Khok Sai', '93170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองธง', 'Nong Thong', '93170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองธง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งนารี', 'Thung Nari', '93170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งนารี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังใหม่', 'Wang Mai', '93170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังใหม่');

    -- District: Bang Kaeo
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บางแก้ว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บางแก้ว', 'Bang Kaeo') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่ามะเดื่อ', 'Tha Maduea', '93140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่ามะเดื่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาปะขอ', 'Na Pakho', '93140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาปะขอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกสัก', 'Khok Sak', '93140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกสัก');

    -- District: Pa Phayom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ป่าพะยอม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ป่าพะยอม', 'Pa Phayom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าพะยอม', 'Pa Phayom', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าพะยอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลานข่อย', 'Lan Khoi', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลานข่อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะเต่า', 'Ko Tao', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะเต่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านพร้าว', 'Ban Phrao', '93110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านพร้าว');

    -- District: Srinagarindra
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ศรีนครินทร์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ศรีนครินทร์', 'Srinagarindra') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชุมพล', 'Chumphon', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชุมพล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านนา', 'Ban Na', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อ่างทอง', 'Ang Thong', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อ่างทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำสินธุ์', 'Lam Sin', '93000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำสินธุ์');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Pattani
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ปัตตานี';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ปัตตานี', 'Pattani') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Pattani
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองปัตตานี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองปัตตานี', 'Mueang Pattani') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะบารัง', 'Sabarang', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะบารัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อาเนาะรู', 'Ano Ru', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อาเนาะรู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จะบังติกอ', 'Chabang Tiko', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จะบังติกอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บานา', 'Bana', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บานา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตันหยงลุโละ', 'Tanyong Lulo', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตันหยงลุโละ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองมานิง', 'Khlong Maning', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองมานิง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กะมิยอ', 'Kamiyo', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กะมิยอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาราโหม', 'Barahom', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาราโหม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปะกาฮะรัง', 'Paka Harang', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปะกาฮะรัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'รูสะมิแล', 'Ru Samilae', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'รูสะมิแล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะลุโบะ', 'Talubo', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะลุโบะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาราเฮาะ', 'Baraho', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาราเฮาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปุยุด', 'Puyut', '94000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปุยุด');

    -- District: Khok Pho
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'โคกโพธิ์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'โคกโพธิ์', 'Khok Pho') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกโพธิ์', 'Khok Pho', '94120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกโพธิ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะกรูด', 'Makrut', '94120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะกรูด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางโกระ', 'Bang Kro', '94120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางโกระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าบอน', 'Pa Bon', '94120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าบอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรายขาว', 'Sai Khao', '94120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรายขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาประดู่', 'Na Pradu', '94180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาประดู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากล่อ', 'Pak Lo', '94180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากล่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งพลา', 'Thung Phala', '94180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งพลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าเรือ', 'Tha Ruea', '94120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าเรือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาเกตุ', 'Na Ket', '94120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาเกตุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนโนรี', 'Khuan Nori', '94180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนโนรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช้างให้ตก', 'Chang Hai Tok', '94120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช้างให้ตก');

    -- District: Nong Chik
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองจิก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองจิก', 'Nong Chik') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะเปาะ', 'Ko Po', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะเปาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คอลอตันหยง', 'Kholo Tanyong', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คอลอตันหยง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนรัก', 'Don Rak', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนรัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดาโต๊ะ', 'Dato', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดาโต๊ะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตุยง', 'Tuyong', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตุยง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่ากำชำ', 'Tha Kamcham', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่ากำชำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อทอง', 'Bo Thong', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางเขา', 'Bang Khao', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางเขา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางตาวา', 'Bang Tawa', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางตาวา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปุโละปุโย', 'Pulo Puyo', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปุโละปุโย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยาบี', 'Yabi', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยาบี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลิปะสะโง', 'Lipa Sa-ngo', '94170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลิปะสะโง');

    -- District: Panare
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปะนาเระ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปะนาเระ', 'Panare') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปะนาเระ', 'Panare', '94130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปะนาเระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าข้าม', 'Tha Kham', '94130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าข้าม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านนอก', 'Ban Nok', '94130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านนอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอน', 'Don', '94130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควน', 'Khuan', '94190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าน้ำ', 'Tha Nam', '94130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าน้ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คอกกระบือ', 'Khok Krabue', '94130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คอกกระบือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พ่อมิ่ง', 'Pho Ming', '94130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พ่อมิ่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านกลาง', 'Ban Klang', '94130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านกลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านน้ำบ่อ', 'Ban Nam Bo', '94130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านน้ำบ่อ');

    -- District: Mayo
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'มายอ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'มายอ', 'Mayo') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มายอ', 'Mayo', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มายอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ถนน', 'Thanon', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ถนน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตรัง', 'Trang', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตรัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กระหวะ', 'Krawa', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กระหวะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลุโบะยิไร', 'Lubo Yirai', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลุโบะยิไร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลางา', 'La-nga', '94190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลางา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กระเสาะ', 'Kra So', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กระเสาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะจัน', 'Ko Chan', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะจัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปะโด', 'Pado', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปะโด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สาคอบน', 'Sakho Bon', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สาคอบน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สาคอใต้', 'Sakho Tai', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สาคอใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะกำ', 'Sakam', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะกำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปานัน', 'Panan', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปานัน');

    -- District: Thung Yang Daeng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ทุ่งยางแดง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ทุ่งยางแดง', 'Thung Yang Daeng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะโละแมะนา', 'Talo Mae Na', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะโละแมะนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พิเทน', 'Phithen', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พิเทน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำดำ', 'Nam Dam', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำดำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากู', 'Paku', '94140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากู');

    -- District: Sai Buri
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สายบุรี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สายบุรี', 'Sai Buri') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะลุบัน', 'Taluban', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะลุบัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะบิ้ง', 'Tabing', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะบิ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปะเสยะวอ', 'Pase Yawo', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปะเสยะวอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางเก่า', 'Bang Kao', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางเก่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บือเระ', 'Bue Re', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บือเระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เตราะบอน', 'Tro Bon', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เตราะบอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กะดุนง', 'Kadunong', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กะดุนง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ละหาร', 'Lahan', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ละหาร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะนังดาลำ', 'Manang Dalam', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะนังดาลำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แป้น', 'Paen', '94110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แป้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งคล้า', 'Thung Khla', '94190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งคล้า');

    -- District: Mai Kaen
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ไม้แก่น';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ไม้แก่น', 'Mai Kaen') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไทรทอง', 'Sai Thong', '94220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไทรทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไม้แก่น', 'Mai Kaen', '94220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไม้แก่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะโละไกรทอง', 'Talo Krai Thong', '94220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะโละไกรทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนทราย', 'Don Sai', '94220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนทราย');

    -- District: Yaring
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ยะหริ่ง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ยะหริ่ง', 'Yaring') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะโละ', 'Talo', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะโละ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะโละกาโปร์', 'Talo Kapo', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะโละกาโปร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตันหยงดาลอ', 'Tanyong Dalo', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตันหยงดาลอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตันหยงจึงงา', 'Tanyong Chueng-nga', '94190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตันหยงจึงงา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตอหลัง', 'Tolang', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตอหลัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาแกะ', 'Ta Kae', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาแกะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาลีอายร์', 'Tali-ai', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาลีอายร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยามู', 'Yamu', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยามู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางปู', 'Bang Pu', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางปู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแรต', 'Nong Raet', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแรต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปิยามุมัง', 'Piya Mumang', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปิยามุมัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปุลากง', 'Pula Kong', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปุลากง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาโลย', 'Baloi', '94190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาโลย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สาบัน', 'Saban', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สาบัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะนังยง', 'Manang Yong', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะนังยง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ราตาปันยัง', 'Rata Panyang', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ราตาปันยัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จะรัง', 'Charang', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จะรัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แหลมโพธิ์', 'Laem Pho', '94150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แหลมโพธิ์');

    -- District: Yarang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ยะรัง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ยะรัง', 'Yarang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยะรัง', 'Yarang', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยะรัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะดาวา', 'Sadawa', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะดาวา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ประจัน', 'Prachan', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ประจัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะนอ', 'Sano', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะนอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ระแว้ง', 'Rawaeng', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ระแว้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปิตูมุดี', 'Pitu Mudi', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปิตูมุดี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วัด', 'Wat', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วัด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กระโด', 'Krado', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กระโด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองใหม่', 'Khlong Mai', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมาะมาวี', 'Mo Mawi', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมาะมาวี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กอลำ', 'Kolam', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กอลำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาตูม', 'Khao Tum', '94160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาตูม');

    -- District: Kapho
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กะพ้อ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กะพ้อ', 'Kapho') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กะรุบี', 'Karubi', '94230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กะรุบี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะโละดือรามัน', 'Talo Due Raman', '94230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะโละดือรามัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปล่องหอย', 'Plong Hoi', '94230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปล่องหอย');

    -- District: Mae Lan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่ลาน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่ลาน', 'Mae Lan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ลาน', 'Mae Lan', '94180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ม่วงเตี้ย', 'Muang Tia', '94180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ม่วงเตี้ย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าไร่', 'Pa Rai', '94180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าไร่');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Yala
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ยะลา';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ยะลา', 'Yala') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Yala
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองยะลา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองยะลา', 'Mueang Yala') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะเตง', 'Sateng', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะเตง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บุดี', 'Budi', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บุดี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยุโป', 'Yopo', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยุโป');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลิดล', 'Lidon', '95160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลิดล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยะลา', 'Yala', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยะลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าสาป', 'Tha Sap', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าสาป');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำใหม่', 'Lam Mai', '95160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หน้าถ้ำ', 'Na Tham', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หน้าถ้ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำพะยา', 'Lam Phaya', '95160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำพะยา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เปาะเส้ง', 'Po Seng', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เปาะเส้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พร่อน', 'Phron', '95160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พร่อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บันนังสาเรง', 'Bannang Sareng', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บันนังสาเรง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะเตงนอก', 'Sateng Nok', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะเตงนอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาเซะ', 'Ta Se', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาเซะ');

    -- District: Betong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เบตง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เบตง', 'Betong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เบตง', 'Betong', '95110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เบตง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยะรม', 'Yarom', '95110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยะรม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาเนาะแมเราะ', 'Tano Maero', '95110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาเนาะแมเราะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อัยเยอร์เวง', 'Aiyoe Weng', '95110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อัยเยอร์เวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ธารน้ำทิพย์', 'Than Nam Thip', '95110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ธารน้ำทิพย์');

    -- District: Bannang Sata
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บันนังสตา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บันนังสตา', 'Bannang Sata') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บันนังสตา', 'Bannang Sata', '95130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บันนังสตา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาเจาะ', 'Bacho', '95130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาเจาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาเนาะปูเต๊ะ', 'Tano Pute', '95130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาเนาะปูเต๊ะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ถ้ำทะลุ', 'Tham Thalu', '95130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ถ้ำทะลุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลิ่งชัน', 'Taling Chan', '95130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลิ่งชัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขื่อนบางลาง', 'Khuean Bang Lang', '95130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขื่อนบางลาง');

    -- District: Than To
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ธารโต';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ธารโต', 'Than To') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ธารโต', 'Than To', '95150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ธารโต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแหร', 'Ban Rae', '95150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแหร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่หวาด', 'Mae Wat', '95170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่หวาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คีรีเขต', 'Khiri Khet', '95150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คีรีเขต');

    -- District: Yaha
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ยะหา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ยะหา', 'Yaha') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยะหา', 'Yaha', '95120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยะหา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ละแอ', 'La-ae', '95120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ละแอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปะแต', 'Patae', '95120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปะแต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาโร๊ะ', 'Baro', '95120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาโร๊ะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาชี', 'Ta Chi', '95120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาชี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาโงยซิแน', 'Ba-ngoi Sinae', '95120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาโงยซิแน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กาตอง', 'Ka Tong', '95120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กาตอง');

    -- District: Raman
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'รามัน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'รามัน', 'Raman') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กายูบอเกาะ', 'Kayu Boko', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กายูบอเกาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กาลูปัง', 'Kalupang', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กาลูปัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กาลอ', 'Kalo', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กาลอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กอตอตือร๊ะ', 'Koto Tuera', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กอตอตือร๊ะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โกตาบารู', 'Kota Baru', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โกตาบารู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกะรอ', 'Kero', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกะรอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จะกว๊ะ', 'Cha-kwa', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จะกว๊ะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าธง', 'Tha Thong', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าธง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เนินงาม', 'Noen Ngam', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เนินงาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาลอ', 'Balo', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาลอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาโงย', 'Ba-ngoi', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาโงย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บือมัง', 'Buemang', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บือมัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยะต๊ะ', 'Yata', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยะต๊ะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังพญา', 'Wang Phaya', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังพญา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อาซ่อง', 'Asong', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อาซ่อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะโล๊ะหะลอ', 'Talo Halo', '95140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะโล๊ะหะลอ');

    -- District: Kabang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กาบัง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กาบัง', 'Kabang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กาบัง', 'Kabang', '95120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กาบัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาละ', 'Bala', '95120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาละ');

    -- District: Krong Pinang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กรงปินัง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กรงปินัง', 'Krong Pinang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กรงปินัง', 'Krong Pinang', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กรงปินัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะเอะ', 'Sa-e', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะเอะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยกระทิง', 'Huai Krathing', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยกระทิง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปุโรง', 'Purong', '95000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปุโรง');

END $$;

