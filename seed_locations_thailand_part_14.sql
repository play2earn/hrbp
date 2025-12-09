-- Thailand Locations Seed Script (Part 14)
-- Generated from kongvut/thai-province-data

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Phuket
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ภูเก็ต';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ภูเก็ต', 'Phuket') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Phuket
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองภูเก็ต';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองภูเก็ต', 'Mueang Phuket') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลาดใหญ่', 'Talat Yai', '83000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลาดใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลาดเหนือ', 'Talat Nuea', '83000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลาดเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะแก้ว', 'Ko Kaeo', '83000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'รัษฎา', 'Ratsada', '83000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'รัษฎา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วิชิต', 'Wichit', '83000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วิชิต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฉลอง', 'Chalong', '83130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฉลอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ราไวย์', 'Rawai', '83130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ราไวย์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กะรน', 'Karon', '83100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กะรน');

    -- District: Kathu
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กะทู้';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กะทู้', 'Kathu') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กะทู้', 'Kathu', '83120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กะทู้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าตอง', 'Pa Tong', '83150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าตอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กมลา', 'Kamala', '83150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กมลา');

    -- District: Thalang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ถลาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ถลาง', 'Thalang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เทพกระษัตรี', 'Thep Krasattri', '83110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เทพกระษัตรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีสุนทร', 'Si Sunthon', '83110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีสุนทร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชิงทะเล', 'Choeng Thale', '83110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชิงทะเล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าคลอก', 'Pa Khlok', '83110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าคลอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไม้ขาว', 'Mai Khao', '83110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไม้ขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สาคู', 'Sakhu', '83110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สาคู');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Surat Thani
    SELECT id INTO p_id FROM provinces WHERE name_th = 'สุราษฎร์ธานี';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('สุราษฎร์ธานี', 'Surat Thani') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Surat Thani
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองสุราษฎร์ธานี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองสุราษฎร์ธานี', 'Mueang Surat Thani') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลาด', 'Talat', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะขามเตี้ย', 'Makham Tia', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะขามเตี้ย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วัดประดู่', 'Wat Pradu', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วัดประดู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขุนทะเล', 'Khun Thale', '84100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขุนทะเล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางใบไม้', 'Bang Bai Mai', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางใบไม้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางชนะ', 'Bang Chana', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางชนะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองน้อย', 'Khlong Noi', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางไทร', 'Bang Sai', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางไทร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางโพธิ์', 'Bang Pho', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางโพธิ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางกุ้ง', 'Bang Kung', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางกุ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองฉนาก', 'Khlong Chanak', '84000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองฉนาก');

    -- District: Kanchanadit
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กาญจนดิษฐ์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กาญจนดิษฐ์', 'Kanchanadit') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าทองใหม่', 'Tha Thong', '84290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าทองใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าทอง', 'Tha Thong Mai', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กะแดะ', 'Kadae', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กะแดะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งกง', 'Thung Kong', '84290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งกง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กรูด', 'Krut', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กรูด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช้างซ้าย', 'Chang Sai', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช้างซ้าย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พลายวาส', 'Phlai Wat', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พลายวาส');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าร่อน', 'Pa Ron', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าร่อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะเคียนทอง', 'Takhian Thong', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะเคียนทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช้างขวา', 'Chang Khwa', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช้างขวา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าอุแท', 'Tha Uthae', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าอุแท');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งรัง', 'Thung Rung', '84290' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งรัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองสระ', 'Khlong Sa', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองสระ');

    -- District: Don Sak
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ดอนสัก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ดอนสัก', 'Don Sak') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนสัก', 'Don Sak', '84220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนสัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชลคราม', 'Chonlakhram', '84160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชลคราม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไชยคราม', 'Chaiyakhram', '84220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไชยคราม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากแพรก', 'Pak Phraek', '84340' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากแพรก');

    -- District: Ko Samui
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เกาะสมุย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เกาะสมุย', 'Ko Samui') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อ่างทอง', 'Ang Thong', '84140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อ่างทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลิปะน้อย', 'Lipa Noi', '84140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลิปะน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลิ่งงาม', 'Taling Ngam', '84140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลิ่งงาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หน้าเมือง', 'Na Mueang', '84140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หน้าเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะเร็ต', 'Maret', '84310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะเร็ต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อผุด', 'Bo Phut', '84320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อผุด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่น้ำ', 'Mae Nam', '84330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่น้ำ');

    -- District: Ko Pha-ngan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เกาะพะงัน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เกาะพะงัน', 'Ko Pha-ngan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะพะงัน', 'Ko Pha-ngan', '84280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะพะงัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านใต้', 'Ban Tai', '84280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะเต่า', 'Koh Tao', '84280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะเต่า');

    -- District: Chaiya
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ไชยา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ไชยา', 'Chaiya') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลาดไชยา', 'Talat Chaiya', '84110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลาดไชยา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พุมเรียง', 'Phumriang', '84110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พุมเรียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เลม็ด', 'Lamet', '84110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เลม็ด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียง', 'Wiang', '84110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่ง', 'Thung', '84110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าเว', 'Pa We', '84110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าเว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะกรบ', 'Takrop', '84110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะกรบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โมถ่าย', 'Mo Thai', '84110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โมถ่าย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากหมาก', 'Pak Mak', '84110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากหมาก');

    -- District: Tha Chana
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ท่าชนะ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ท่าชนะ', 'Tha Chana') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าชนะ', 'Tha Chana', '84170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าชนะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สมอทอง', 'Samo Thong', '84170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สมอทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ประสงค์', 'Prasong', '84170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ประสงค์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คันธุลี', 'Khan Thuli', '84170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คันธุลี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วัง', 'Wang', '84170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองพา', 'Khlong Pha', '84170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองพา');

    -- District: Khiri Rat Nikhom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'คีรีรัฐนิคม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'คีรีรัฐนิคม', 'Khiri Rat Nikhom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าขนอน', 'Tha Khanon', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าขนอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านยาง', 'Ban Yang', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำหัก', 'Nam Hak', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำหัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กะเปา', 'Kapao', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กะเปา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่ากระดาน', 'Tha Kradan', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่ากระดาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ย่านยาว', 'Yan Yao', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ย่านยาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ถ้ำสิงขร', 'Tham Singkhon', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ถ้ำสิงขร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านทำเนียบ', 'Ban Thamniap', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านทำเนียบ');

    -- District: Ban Ta Khun
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านตาขุน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านตาขุน', 'Ban Ta Khun') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาวง', 'Khao Wong', '84230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระแสง', 'Phasaeng', '84230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระแสง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พรุไทย', 'Phru Thai', '84230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พรุไทย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาพัง', 'Khao Phang', '84230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาพัง');

    -- District: Phanom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พนม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พนม', 'Phanom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พนม', 'Phanom', '84250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พนม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ต้นยวน', 'Ton Yuan', '84250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ต้นยวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองศก', 'Khlong Sok', '84250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองศก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พลูเถื่อน', 'Phlu Thuean', '84250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พลูเถื่อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พังกาญจน์', 'Phang Kan', '84250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พังกาญจน์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองชะอุ่น', 'Khlong Cha-un', '84250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองชะอุ่น');

    -- District: Tha Chang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ท่าฉาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ท่าฉาง', 'Tha Chang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าฉาง', 'Tha Chang', '84150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าฉาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าเคย', 'Tha Khoei', '84150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าเคย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองไทร', 'Khlong Sai', '84150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองไทร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาถ่าน', 'Khao Than', '84150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาถ่าน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เสวียด', 'Sawiat', '84150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เสวียด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากฉลุย', 'Pak Chalui', '84150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากฉลุย');

    -- District: Ban Na San
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านนาสาร';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านนาสาร', 'Ban Na San') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาสาร', 'Na San', '84120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาสาร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พรุพี', 'Phru Phi', '84270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พรุพี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งเตา', 'Thung Tao', '84120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งเตา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำพูน', 'Lamphun', '84120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำพูน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าชี', 'Tha Chi', '84120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าชี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนศรี', 'Khuan Si', '84270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนศรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนสุบรรณ', 'Khuan Suban', '84120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนสุบรรณ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองปราบ', 'Khlong Prap', '84120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองปราบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำพุ', 'Nam Phu', '84120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำพุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งเตาใหม่', 'Thung Tao Mai', '84120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งเตาใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เพิ่มพูนทรัพย์', 'Phoem Phun Sap', '84120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เพิ่มพูนทรัพย์');

    -- District: Ban Na Doem
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านนาเดิม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านนาเดิม', 'Ban Na Doem') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านนา', 'Ban Na', '84240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าเรือ', 'Tha Ruea', '84240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าเรือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรัพย์ทวี', 'Sap Thawi', '84240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรัพย์ทวี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาใต้', 'Na Tai', '84240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาใต้');

    -- District: Khian Sa
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เคียนซา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เคียนซา', 'Khian Sa') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เคียนซา', 'Khian Sa', '84260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เคียนซา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พ่วงพรมคร', 'Phuang Phromkhon', '84210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พ่วงพรมคร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาตอก', 'Khao Tok', '84260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาตอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อรัญคามวารี', 'Aranyakham Wari', '84260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อรัญคามวารี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเสด็จ', 'Ban Sadet', '84260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเสด็จ');

    -- District: Wiang Sa
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เวียงสระ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เวียงสระ', 'Wiang Sa') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียงสระ', 'Wiang Sa', '84190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียงสระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านส้อง', 'Ban Song', '84190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านส้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองฉนวน', 'Khlong Chanuan', '84190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองฉนวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งหลวง', 'Thung Luang', '84190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขานิพันธ์', '*Khao Niphan', '84190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขานิพันธ์');

    -- District: Phrasaeng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พระแสง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พระแสง', 'Phrasaeng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อิปัน', 'Ipan', '84210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อิปัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สินปุน', 'Sin Pun', '84210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สินปุน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางสวรรค์', 'Bang Sawan', '84210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางสวรรค์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไทรขึง', 'Sai Khueng', '84210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไทรขึง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สินเจริญ', 'Sin Charoen', '84210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สินเจริญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไทรโสภา', 'Sai Sopha', '84210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไทรโสภา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สาคู', 'Sakhu', '84210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สาคู');

    -- District: Phunphin
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พุนพิน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พุนพิน', 'Phunphin') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าข้าม', 'Tha Kham', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าข้าม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าสะท้อน', 'Tha Sathon', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าสะท้อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลีเล็ด', 'Lilet', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลีเล็ด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางมะเดื่อ', 'Bang Maduea', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางมะเดื่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางเดือน', 'Bang Duean', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางเดือน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าโรงช้าง', 'Tha Rong Chang', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าโรงช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กรูด', 'Krut', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กรูด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พุนพิน', 'Phunphin', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พุนพิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางงอน', 'Bang Ngon', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางงอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศรีวิชัย', 'Si Wichai', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศรีวิชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำรอบ', 'Nam Rop', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำรอบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะลวน', 'Maluan', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะลวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวเตย', 'Hua Toei', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวเตย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไทร', 'Nong Sai', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไทร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาหัวควาย', 'Khao Hua Khwai', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาหัวควาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะปาน', 'Tapan', '84130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะปาน');

    -- District: Chai Buri
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ชัยบุรี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ชัยบุรี', 'Chai Buri') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สองแพรก', 'Song Phraek', '84350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สองแพรก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชัยบุรี', 'Chai Buri', '84350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชัยบุรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองน้อย', 'Khlong Noi', '84350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไทรทอง', 'Sai Thong', '84350' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไทรทอง');

    -- District: Vibhavadi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'วิภาวดี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'วิภาวดี', 'Vibhavadi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะกุกใต้', 'Takuk Tai', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะกุกใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะกุกเหนือ', 'Takuk Nuea', '84180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะกุกเหนือ');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Ranong
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ระนอง';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ระนอง', 'Ranong') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Ranong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองระนอง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองระนอง', 'Mueang Ranong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขานิเวศน์', 'Khao Niwet', '85000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขานิเวศน์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ราชกรูด', 'Ratchakrut', '85000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ราชกรูด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หงาว', 'Ngao', '85000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หงาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางริ้น', 'Bang Rin', '85000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางริ้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากน้ำ', 'Pak Nam', '85000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากน้ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางนอน', 'Bang Non', '85000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางนอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดส้มแป้น', 'Hat Som Paen', '85000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดส้มแป้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรายแดง', 'Sai Daeng', '85130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรายแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะพยาม', 'Ko Phayam', '85000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะพยาม');

    -- District: La-un
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ละอุ่น';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ละอุ่น', 'La-un') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ละอุ่นใต้', 'La-un Tai', '85130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ละอุ่นใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ละอุ่นเหนือ', 'La-un Nuea', '85130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ละอุ่นเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางพระใต้', 'Bang Phra Tai', '85130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางพระใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางพระเหนือ', 'Bang Phra Nuea', '85130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางพระเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางแก้ว', 'Bang Kaeo', '85130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในวงเหนือ', 'Nai Wong Nuea', '85130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในวงเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในวงใต้', 'Nai Wong Tai', '85130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในวงใต้');

    -- District: Kapoe
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กะเปอร์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กะเปอร์', 'Kapoe') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ม่วงกลวง', 'Muang Kluang', '85120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ม่วงกลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กะเปอร์', 'Kapoe', '85120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กะเปอร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชี่ยวเหลียง', 'Chiao Liang', '85120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชี่ยวเหลียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านนา', 'Ban Na', '85120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางหิน', 'Bang Hin', '85120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางหิน');

    -- District: Kra Buri
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กระบุรี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กระบุรี', 'Kra Buri') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำจืด', 'Nam Chuet', '85110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำจืด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำจืดน้อย', 'Nam Chuet Noi', '85110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำจืดน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มะมุ', 'Mamu', '85110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มะมุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากจั่น', 'Pak Chan', '85110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากจั่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำเลียง', 'Lamliang', '85110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำเลียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จ.ป.ร.', 'Choporo', '85110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จ.ป.ร.');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางใหญ่', 'Bang Yai', '85110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางใหญ่');

    -- District: Suk Samran
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สุขสำราญ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สุขสำราญ', 'Suk Samran') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาคา', 'Nakha', '85120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาคา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กำพวน', 'Kamphuan', '85120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กำพวน');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Chumphon
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ชุมพร';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ชุมพร', 'Chumphon') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Chumphon
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองชุมพร';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองชุมพร', 'Mueang Chumphon') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าตะเภา', 'Tha Taphao', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าตะเภา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากน้ำ', 'Pak Nam', '86120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากน้ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่ายาง', 'Tha Yang', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่ายาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางหมาก', 'Bang Mak', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางหมาก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาทุ่ง', 'Na Thung', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาทุ่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาชะอัง', 'Na Cha-ang', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาชะอัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตากแดด', 'Tak Daet', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตากแดด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางลึก', 'Bang Luek', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางลึก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดพันไกร', 'Hat Phan Krai', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดพันไกร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังไผ่', 'Wang Phai', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังไผ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังใหม่', 'Wang Mai', '86190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านนา', 'Ban Na', '86190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขุนกระทิง', 'Khun Krathing', '86000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขุนกระทิง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งคา', 'Thung Kha', '86100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งคา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วิสัยเหนือ', 'Wisai Nuea', '86100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วิสัยเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดทรายรี', 'Hat Sai Ri', '86120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดทรายรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ถ้ำสิงห์', 'Tham Sing', '86100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ถ้ำสิงห์');

    -- District: Tha Sae
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ท่าแซะ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ท่าแซะ', 'Tha Sae') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าแซะ', 'Tha Sae', '86140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าแซะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คุริง', 'Khuring', '86140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คุริง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สลุย', 'Salui', '86140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สลุย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นากระตาม', 'Na Kratam', '86140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นากระตาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'รับร่อ', 'Rap Ro', '86190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'รับร่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าข้าม', 'Tha Kham', '86140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าข้าม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หงษ์เจริญ', 'Hong Charoen', '86140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หงษ์เจริญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หินแก้ว', 'Hin Kaeo', '86190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หินแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรัพย์อนันต์', 'Sap Anan', '86140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรัพย์อนันต์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สองพี่น้อง', 'Song Phi Nong', '86140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สองพี่น้อง');

    -- District: Pathio
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปะทิว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปะทิว', 'Pathio') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางสน', 'Bang Song', '86160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางสน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทะเลทรัพย์', 'Thale Sap', '86160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทะเลทรัพย์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะพลี', 'Saphli', '86230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะพลี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชุมโค', 'Chum Kho', '86160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชุมโค');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนยาง', 'Don Yang', '86210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากคลอง', 'Pak Khlong', '86210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากคลอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาไชยราช', 'Khao Chai Rat', '86210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาไชยราช');

    -- District: Lang Suan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หลังสวน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หลังสวน', 'Lang Suan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หลังสวน', 'Lang Suan', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หลังสวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขันเงิน', 'Khan Ngoen', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขันเงิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่ามะพลา', 'Tha Maphla', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่ามะพลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาขา', 'Na Kha', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาขา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาพญา', 'Na Phaya', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาพญา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านควน', 'Ban Khuan', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านควน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางมะพร้าว', 'Bang Maphrao', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางมะพร้าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางน้ำจืด', 'Bang Nam Chuet', '86150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางน้ำจืด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากน้ำ', 'Pak Nam', '86150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากน้ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พ้อแดง', 'Pho Daeng', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พ้อแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แหลมทราย', 'Laem Sai', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แหลมทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังตะกอ', 'Wang Tako', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังตะกอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดยาย', 'Hat Yai', '86110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดยาย');

    -- District: Lamae
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ละแม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ละแม', 'Lamae') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ละแม', 'Lamae', '86170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ละแม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งหลวง', 'Thung Luang', '86170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สวนแตง', 'Suan Taeng', '86170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สวนแตง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งคาวัด', 'Thung Kha Wat', '86170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งคาวัด');

    -- District: Phato
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พะโต๊ะ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พะโต๊ะ', 'Phato') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พะโต๊ะ', 'Phato', '86180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พะโต๊ะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากทรง', 'Pak Song', '86180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากทรง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปังหวาน', 'Pang Wan', '86180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปังหวาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระรักษ์', 'Phra Rak', '86180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระรักษ์');

    -- District: Sawi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สวี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สวี', 'Sawi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาโพธิ์', 'Na Pho', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาโพธิ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สวี', 'Sawi', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สวี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งระยะ', 'Thung Raya', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งระยะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าหิน', 'Tha Hin', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าหิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากแพรก', 'Pak Phraek', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากแพรก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ด่านสวี', 'Dan Sawi', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ด่านสวี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ครน', 'Khron', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ครน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วิสัยใต้', 'Wisai Tai', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วิสัยใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาสัก', 'Na Sak', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาสัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาทะลุ', 'Khao Thalu', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาทะลุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาค่าย', 'Khao Khai', '86130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาค่าย');

    -- District: Thung Tako
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ทุ่งตะโก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ทุ่งตะโก', 'Thung Tako') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากตะโก', 'Pak Tako', '86220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากตะโก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งตะไคร', 'Thung Takhrai', '86220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งตะไคร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะโก', 'Tako', '86220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะโก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช่องไม้แก้ว', 'Chong Mai Kaeo', '86220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช่องไม้แก้ว');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Songkhla
    SELECT id INTO p_id FROM provinces WHERE name_th = 'สงขลา';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('สงขลา', 'Songkhla') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Songkhla
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองสงขลา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองสงขลา', 'Mueang Songkhla') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อยาง', 'Bo Yang', '90000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขารูปช้าง', 'Khao Rup Chang', '90000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขารูปช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะแต้ว', 'Ko Taeo', '90000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะแต้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พะวง', 'Phawong', '90100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พะวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งหวัง', 'Thung Wang', '90000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งหวัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะยอ', 'Ko Yo', '90100' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะยอ');

    -- District: Sathing Phra
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สทิงพระ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สทิงพระ', 'Sathing Phra') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จะทิ้งพระ', 'Chathing Phra', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จะทิ้งพระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กระดังงา', 'Kradangnga', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กระดังงา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สนามชัย', 'Sanam Chai', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สนามชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดีหลวง', 'Di Luang', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดีหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชุมพล', 'Chumphon', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชุมพล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองรี', 'Khlong Ri', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คูขุด', 'Khu Khut', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คูขุด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าหิน', 'Tha Hin', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าหิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วัดจันทร์', 'Wat Chan', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วัดจันทร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อแดง', 'Bo Daeng', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อดาน', 'Bor Dan', '90190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อดาน');

    -- District: Chana
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'จะนะ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'จะนะ', 'Chana') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านนา', 'Ban Na', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าชิง', 'Pa Ching', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าชิง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะพานไม้แก่น', 'Saphan Mai Kaen', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะพานไม้แก่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะกอม', 'Sakom', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะกอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหว้า', 'Na Wa', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหว้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาทับ', 'Na Thap', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาทับ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำขาว', 'Nam Khao', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขุนตัดหวาย', 'Khun Tat Wai', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขุนตัดหวาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าหมอไทร', 'Tha Mo Sai', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าหมอไทร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จะโหนง', 'Chanong', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จะโหนง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คู', 'Khu', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แค', 'Khae', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แค');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองเปียะ', 'Khlong Pia', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองเปียะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลิ่งชัน', 'Taling Chan', '90130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลิ่งชัน');

    -- District: Na Thawi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นาทวี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นาทวี', 'Na Thawi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาทวี', 'Na Thawi', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาทวี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฉาง', 'Chang', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฉาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหมอศรี', 'Na Mo Si', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหมอศรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองทราย', 'Khlong Sai', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปลักหนู', 'Plak Nu', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปลักหนู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าประดู่', 'Tha Pradu', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าประดู่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะท้อน', 'Sathon', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะท้อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทับช้าง', 'Thap Chang', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทับช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ประกอบ', 'Prakop', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ประกอบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองกวาง', 'Khlong Kwang', '90160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองกวาง');

    -- District: Thepha
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เทพา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เทพา', 'Thepha') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เทพา', 'Thepha', '90150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เทพา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากบาง', 'Pak Bang', '90150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากบาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะสะบ้า', 'Ko Saba', '90150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะสะบ้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำไพล', 'Lam Phlai', '90260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำไพล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าม่วง', 'Tha Muang', '90260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าม่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังใหญ่', 'Wang Yai', '90260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะกอม', 'Sakom', '90150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะกอม');

    -- District: Saba Yoi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สะบ้าย้อย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สะบ้าย้อย', 'Saba Yoi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะบ้าย้อย', 'Saba Yoi', '90210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะบ้าย้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งพอ', 'Thung Pho', '90210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งพอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เปียน', 'Pian', '90210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เปียน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านโหนด', 'Ban Not', '90210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านโหนด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จะแหน', 'Chanae', '90210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จะแหน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คูหา', 'Khuha', '90210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คูหา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาแดง', 'Khao Daeng', '90210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บาโหย', 'Ba Hoi', '90210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บาโหย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ธารคีรี', 'Than Khiri', '90210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ธารคีรี');

    -- District: Ranot
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ระโนด';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ระโนด', 'Ranot') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ระโนด', 'Ranot', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ระโนด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองแดน', 'Khlong Daen', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองแดน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะเครียะ', 'Takhria', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะเครียะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าบอน', 'Tha Bon', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าบอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านใหม่', 'Ban Mai', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อตรุ', 'Bo Tru', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อตรุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากแตระ', 'Pak Trae', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากแตระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พังยาง', 'Phang Yang', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พังยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ระวะ', 'Rawa', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ระวะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วัดสน', 'Wat Son', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วัดสน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านขาว', 'Ban Khao', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แดนสงวน', 'Daen Sa-nguan', '90140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แดนสงวน');

    -- District: Krasae Sin
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'กระแสสินธุ์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'กระแสสินธุ์', 'Krasae Sin') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะใหญ่', 'Ko Yai', '90270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โรง', 'Rong', '90270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โรง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชิงแส', 'Choeng Sae', '90270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชิงแส');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กระแสสินธุ์', 'Krasae Sin', '90270' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กระแสสินธุ์');

    -- District: Rattaphum
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'รัตภูมิ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'รัตภูมิ', 'Rattaphum') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กำแพงเพชร', 'Kamphaeng Phet', '90180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กำแพงเพชร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าชะมวง', 'Tha Chamuang', '90180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าชะมวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คูหาใต้', 'Khuha Tai', '90180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คูหาใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนรู', 'Khuan Ru', '90180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนรู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาพระ', 'Khao Phra', '90180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาพระ');

    -- District: Sadao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สะเดา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สะเดา', 'Sadao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะเดา', 'Sadao', '90120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะเดา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปริก', 'Prik', '90120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปริก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พังลา', 'Phang La', '90170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พังลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สำนักแต้ว', 'Samnak Taeo', '90120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สำนักแต้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งหมอ', 'Thung Mo', '90240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งหมอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าโพธิ์', 'Tha Pho', '90170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าโพธิ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปาดังเบซาร์', 'Padang Besa', '90240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปาดังเบซาร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สำนักขาม', 'Samnak Kham', '90320' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สำนักขาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขามีเกียรติ', 'Khao Mi Kiat', '90170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขามีเกียรติ');

    -- District: Hat Yai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หาดใหญ่';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หาดใหญ่', 'Hat Yai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดใหญ่', 'Hat Yai', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนลัง', 'Khuan Lang', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนลัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คูเต่า', 'Khu Tao', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คูเต่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คอหงส์', 'Kho Hong', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คอหงส์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองแห', 'Khlong Hae', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองแห');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองอู่ตะเภา', 'Khlong U Taphao', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองอู่ตะเภา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฉลุง', 'Chalung', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฉลุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งใหญ่', 'Thung Yai', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งตำเสา', 'Thung Tamsao', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งตำเสา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าข้าม', 'Tha Kham', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าข้าม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำน้อย', 'Nam Noi', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านพรุ', 'Ban Phru', '90250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านพรุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พะตง', 'Phatong', '90230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พะตง');

    -- District: Na Mom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'นาหม่อม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'นาหม่อม', 'Na Mom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาหม่อม', 'Na Mom', '90310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาหม่อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พิจิตร', 'Phichit', '90310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พิจิตร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งขมิ้น', 'Thung Khamin', '90310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งขมิ้น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองหรัง', 'Khlong Rhang', '90310' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองหรัง');

    -- District: Khuan Niang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ควนเนียง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ควนเนียง', 'Khuan Niang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'รัตภูมิ', 'Rattaphum', '90220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'รัตภูมิ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ควนโส', 'Khuan So', '90220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ควนโส');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยลึก', 'Huai Luek', '90220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยลึก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางเหรียง', 'Bang Rieang', '90220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางเหรียง');

    -- District: Bang Klam
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บางกล่ำ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บางกล่ำ', 'Bang Klam') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางกล่ำ', 'Bang Klam', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางกล่ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าช้าง', 'Tha Chang', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ทอม', 'Mae Thom', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ทอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านหาร', 'Ban Han', '90110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านหาร');

    -- District: Singhanakhon
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สิงหนคร';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สิงหนคร', 'Singhanakhon') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชิงโค', 'Ching Kho', '90280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชิงโค');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สทิงหม้อ', 'Sathing Mo', '90280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สทิงหม้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทำนบ', 'Thamnop', '90280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทำนบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'รำแดง', 'Ram Daeng', '90330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'รำแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วัดขนุน', 'Wat Khanun', '90330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วัดขนุน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชะแล้', 'Chalae', '90330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชะแล้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากรอ', 'Pak Ro', '90330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากรอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าขาด', 'Pa Khat', '90330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าขาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวเขา', 'Hua Khao', '90280' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวเขา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางเขียด', 'Bang Khiat', '90330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางเขียด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ม่วงงาม', 'Muang Ngam', '90330' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ม่วงงาม');

    -- District: Khlong Hoi Khong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'คลองหอยโข่ง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'คลองหอยโข่ง', 'Khlong Hoi Khong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองหอยโข่ง', 'Khlong Hoi Khong', '90230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองหอยโข่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งลาน', 'Thung Lan', '90230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกม่วง', 'Khok Muang', '90230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกม่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองหลา', 'Khlong La', '90115' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองหลา');

    -- District: Sum Nung Kam
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ท้องถิ่นเทศบาลตำบลสำนักขาม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ท้องถิ่นเทศบาลตำบลสำนักขาม', 'Sum Nung Kam') RETURNING id INTO d_id;
    END IF;

END $$;

