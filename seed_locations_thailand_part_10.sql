-- Thailand Locations Seed Script (Part 10)
-- Generated from kongvut/thai-province-data

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Mae Hong Son
    SELECT id INTO p_id FROM provinces WHERE name_th = 'แม่ฮ่องสอน';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('แม่ฮ่องสอน', 'Mae Hong Son') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Mae Hong Son
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองแม่ฮ่องสอน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองแม่ฮ่องสอน', 'Mueang Mae Hong Son') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จองคำ', 'Chong Kham', '58000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จองคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยโป่ง', 'Huai Pong', '58000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยโป่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ผาบ่อง', 'Pha Bong', '58000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ผาบ่อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปางหมู', 'Pang Mu', '58000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปางหมู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หมอกจำแป่', 'Mok Champae', '58000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หมอกจำแป่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยผา', 'Huai Pha', '58000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยผา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยปูลิง', 'Huai Pu Ling', '58000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยปูลิง');

    -- District: Khun Yuam
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ขุนยวม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ขุนยวม', 'Khun Yuam') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขุนยวม', 'Khun Yuam', '58140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขุนยวม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่เงา', 'Mae Ngao', '58140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่เงา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองปอน', 'Mueang Pon', '58140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองปอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ยวมน้อย', 'Mae Yuam Noi', '58140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ยวมน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่กิ๊', 'Mae Ki', '58140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่กิ๊');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่อูคอ', 'Mae Uo Kor', '58140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่อูคอ');

    -- District: Pai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปาย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปาย', 'Pai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียงใต้', 'Wiang Tai', '58130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียงใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เวียงเหนือ', 'Wiang Nuea', '58130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เวียงเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่นาเติง', 'Mae Na Toeng', '58130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่นาเติง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ฮี้', 'Mae Hi', '58130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ฮี้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งยาว', 'Thung Yao', '58130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งยาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองแปง', 'Mueang Paeng', '58130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองแปง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โป่งสา', 'Pong Sa', '58130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โป่งสา');

    -- District: Mae Sariang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่สะเรียง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่สะเรียง', 'Mae Sariang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านกาศ', 'Ban Kat', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านกาศ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สะเรียง', 'Mae Sariang', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สะเรียง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่คง', 'Mae Khong', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่คง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่เหาะ', 'Mae Ho', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่เหาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ยวม', 'Mae Yuam', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ยวม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เสาหิน', 'Sao Hin', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เสาหิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าแป๋', 'Pa Pae', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าแป๋');

    -- District: Mae La Noi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่ลาน้อย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่ลาน้อย', 'Mae La Noi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ลาน้อย', 'Mae La Noi', '58120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ลาน้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ลาหลวง', 'Mae La Luang', '58120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ลาหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าผาปุ้ม', 'Tha Pha Pum', '58120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าผาปุ้ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่โถ', 'Mae Tho', '58120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่โถ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยห้อม', 'Huai Hom', '58120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยห้อม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่นาจาง', 'Mae Na Chang', '58120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่นาจาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สันติคีรี', 'Santi Khiri', '58120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สันติคีรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขุนแม่ลาน้อย', 'Khun Mae La Noi', '58120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขุนแม่ลาน้อย');

    -- District: Sop Moei
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สบเมย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สบเมย', 'Sop Moei') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สบเมย', 'Sop Moei', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สบเมย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่คะตวน', 'Mae Khatuan', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่คะตวน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กองก๋อย', 'Kong Koi', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กองก๋อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สวด', 'Mae Suat', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สวด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าโปง', 'Pa Pong', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าโปง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สามแลบ', 'Mae Sam Laep', '58110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สามแลบ');

    -- District: Pang Mapha
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปางมะผ้า';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปางมะผ้า', 'Pang Mapha') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สบป่อง', 'Sop Pong', '58150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สบป่อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปางมะผ้า', 'Pang Mapha', '58150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปางมะผ้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ถ้ำลอด', 'Tham Lot', '58150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ถ้ำลอด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาปู่ป้อม', 'Na Pu Pom', '58150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาปู่ป้อม');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Nakhon Sawan
    SELECT id INTO p_id FROM provinces WHERE name_th = 'นครสวรรค์';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('นครสวรรค์', 'Nakhon Sawan') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Nakhon Sawan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองนครสวรรค์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองนครสวรรค์', 'Mueang Nakhon Sawan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปากน้ำโพ', 'Paknam Pho', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปากน้ำโพ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'กลางแดด', 'Klang Daet', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'กลางแดด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกรียงไกร', 'Kriangkrai', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกรียงไกร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แควใหญ่', 'Khwae Yai', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แควใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะเคียนเลื่อน', 'Takhian Luean', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะเคียนเลื่อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นครสวรรค์ตก', 'Nakhon Sawan Tok', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นครสวรรค์ตก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นครสวรรค์ออก', 'Nakhon Sawan Ok', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นครสวรรค์ออก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางพระหลวง', 'Bang Phra Luang', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางพระหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางม่วง', 'Bang Muang', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางม่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านมะเกลือ', 'Ban Makluea', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านมะเกลือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแก่ง', 'Ban Kaeng', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแก่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระนอน', 'Phra Non', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระนอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วัดไทร', 'Wat Sai', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วัดไทร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกรด', 'Nong Krot', '60240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกรด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกระโดน', 'Nong Kradon', '60240' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกระโดน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองปลิง', 'Nong Pling', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองปลิง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บึงเสนาท', 'Bueng Senat', '60000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บึงเสนาท');

    -- District: Krok Phra
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'โกรกพระ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'โกรกพระ', 'Krok Phra') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โกรกพระ', 'Krok Phra', '60170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โกรกพระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยางตาล', 'Yang Tan', '60170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยางตาล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางมะฝ่อ', 'Bang Mafo', '60170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางมะฝ่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางประมุง', 'Bang Pramung', '60170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางประมุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นากลาง', 'Na Klang', '60170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นากลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศาลาแดง', 'Sala Daeng', '60170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศาลาแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เนินกว้าว', 'Noen Kwao', '60170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เนินกว้าว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เนินศาลา', 'Noen Sala', '60170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เนินศาลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดสูง', 'Hat Sung', '60170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดสูง');

    -- District: Chum Saeng
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ชุมแสง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ชุมแสง', 'Chum Saeng') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชุมแสง', 'Chum Saeng', '60120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชุมแสง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทับกฤช', 'Thap Krit', '60250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทับกฤช');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พิกุล', 'Phikun', '60120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พิกุล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกยไชย', 'Koei Chai', '60120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกยไชย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าไม้', 'Tha Mai', '60120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าไม้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางเคียน', 'Bang Khian', '60120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางเคียน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกระเจา', 'Nong Krachao', '60120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกระเจา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พันลาน', 'Phan Lan', '60250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พันลาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกหม้อ', 'Khok Mo', '60120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกหม้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไผ่สิงห์', 'Phai Sing', '60120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไผ่สิงห์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ฆะมัง', 'Khamang', '60120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ฆะมัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทับกฤชใต้', 'Thap Krit Tai', '60250' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทับกฤชใต้');

    -- District: Nong Bua
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองบัว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองบัว', 'Nong Bua') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัว', 'Nong Bua', '60110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกลับ', 'Nong Klap', '60110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกลับ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ธารทหาร', 'Than Thahan', '60110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ธารทหาร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยร่วม', 'Huai Ruam', '60110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยร่วม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยถั่วใต้', 'Huai Thua Tai', '60110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยถั่วใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยถั่วเหนือ', 'Huai Thua Nuea', '60110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยถั่วเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยใหญ่', 'Huai Yai', '60110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งทอง', 'Thung Thong', '60110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังบ่อ', 'Wang Bo', '60110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังบ่อ');

    -- District: Banphot Phisai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บรรพตพิสัย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บรรพตพิสัย', 'Banphot Phisai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่างิ้ว', 'Tha Ngio', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่างิ้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางตาหงาย', 'Bang Ta Ngai', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางตาหงาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หูกวาง', 'Hukwang', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หูกวาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อ่างทอง', 'Ang Thong', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อ่างทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านแดน', 'Ban Daen', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านแดน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บางแก้ว', 'Bang Kaeo', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บางแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาขีด', 'Ta Khit', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาขีด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาสัง', 'Ta Sang', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาสัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ด่านช้าง', 'Dan Chang', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ด่านช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกรด', 'Nong Krot', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกรด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองตางู', 'Nong Ta Ngu', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองตางู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บึงปลาทู', 'Bueng Pla Thu', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บึงปลาทู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เจริญผล', 'Charoen Phon', '60180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เจริญผล');

    -- District: Kao Liao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เก้าเลี้ยว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เก้าเลี้ยว', 'Kao Liao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มหาโพธิ', 'Maha Phot', '60230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มหาโพธิ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เก้าเลี้ยว', 'Kao Liao', '60230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เก้าเลี้ยว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเต่า', 'Nong Tao', '60230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเต่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาดิน', 'Khao Din', '60230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาดิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวดง', 'Hua Dong', '60230' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวดง');

    -- District: Takhli
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ตาคลี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ตาคลี', 'Takhli') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตาคลี', 'Takhli', '60140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตาคลี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช่องแค', 'Chong Khae', '60210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช่องแค');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จันเสน', 'Chan Sen', '60260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จันเสน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยหอม', 'Huai Hom', '60210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยหอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวหวาย', 'Hua Wai', '60140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวหวาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองโพ', 'Nong Pho', '60140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองโพ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหม้อ', 'Nong Mo', '60140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหม้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สร้อยทอง', 'Soi Thong', '60210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สร้อยทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลาดทิพรส', 'Lat Thippharot', '60260' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลาดทิพรส');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พรหมนิมิต', 'Phrom Nimit', '60210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พรหมนิมิต');

    -- District: Takhli
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ท่าตะโก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ท่าตะโก', 'Takhli') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าตะโก', 'Tha Tako', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าตะโก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พนมรอก', 'Phanom Rok', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พนมรอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวถนน', 'Hua Thanon', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวถนน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สายลำโพง', 'Sai Lamphong', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สายลำโพง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังมหากร', 'Wang Mahakon', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังมหากร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนคา', 'Don Kha', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนคา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทำนบ', 'Thamnop', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทำนบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังใหญ่', 'Wang Yai', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พนมเศษ', 'Phanom Set', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พนมเศษ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหลวง', 'Nong Luang', '60160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหลวง');

    -- District: Phaisali
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ไพศาลี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ไพศาลี', 'Phaisali') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกเดื่อ', 'Khok Duea', '60220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกเดื่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สำโรงชัย', 'Samrong Chai', '60220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สำโรงชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังน้ำลัด', 'Wang Nam Lat', '60220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังน้ำลัด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตะคร้อ', 'Takhro', '60220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตะคร้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพธิ์ประสาท', 'Pho Prasat', '60220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพธิ์ประสาท');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังข่อย', 'Wang Khoi', '60220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังข่อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาขอม', 'Na Khom', '60220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาขอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไพศาลี', 'Phaisali', '60220' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไพศาลี');

    -- District: Phayuha Khiri
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พยุหะคีรี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พยุหะคีรี', 'Phayuha Khiri') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พยุหะ', 'Phayuha', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พยุหะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เนินมะกอก', 'Noen Makok', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เนินมะกอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นิคมเขาบ่อแก้ว', 'Nikhom Khao Bo Kaeo', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นิคมเขาบ่อแก้ว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ม่วงหัก', 'Muang Hak', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ม่วงหัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยางขาว', 'Yang Khao', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยางขาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ย่านมัทรี', 'Yan Matsi', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ย่านมัทรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาทอง', 'Khao Thong', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าน้ำอ้อย', 'Tha Nam Oi', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าน้ำอ้อย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำทรง', 'Nam Song', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำทรง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขากะลา', 'Khao Kala', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขากะลา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สระทะเล', 'Sa Thale', '60130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สระทะเล');

    -- District: Phayuha Khiri
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ลาดยาว';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ลาดยาว', 'Phayuha Khiri') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลาดยาว', 'Lat Yao', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลาดยาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยน้ำหอม', 'Huai Nam Hom', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยน้ำหอม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังม้า', 'Wang Ma', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังม้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังเมือง', 'Wang Mueang', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สร้อยละคร', 'Soi Lakhon', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สร้อยละคร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มาบแก', 'Map Kae', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มาบแก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองยาว', 'Nong Yao', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองยาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองนมวัว', 'Nong Nom Wua', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองนมวัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านไร่', 'Ban Rai', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านไร่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เนินขี้เหล็ก', 'Noen Khilek', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เนินขี้เหล็ก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ศาลเจ้าไก่ต่อ', 'San Chao Kai To', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ศาลเจ้าไก่ต่อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สระแก้ว', 'Sa Kaeo', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สระแก้ว');

    -- District: Tak Fa
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ตากฟ้า';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ตากฟ้า', 'Tak Fa') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตากฟ้า', 'Tak Fa', '60190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตากฟ้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลำพยนต์', 'Lam Phayon', '60190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลำพยนต์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สุขสำราญ', 'Suk Samran', '60190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สุขสำราญ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองพิกุล', 'Nong Phikun', '60190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองพิกุล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พุนกยูง', 'Phu Nok Yung', '60190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พุนกยูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อุดมธัญญา', 'Udom Thanya', '60190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อุดมธัญญา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาชายธง', 'Khao Chai Thong', '60190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาชายธง');

    -- District: Mae Wong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่วงก์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่วงก์', 'Mae Wong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่วงก์', 'Mae Wong', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่วงก์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่เล่ย์', 'Mae Le', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่เล่ย์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังซ่าน', 'Wang San', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังซ่าน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาชนกัน', 'Khao Chon Kan', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาชนกัน');

    -- District: Mae Poen
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่เปิน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่เปิน', 'Mae Poen') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่เปิน', 'Mae Poen', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่เปิน');

    -- District: Chum Ta Bong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ชุมตาบง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ชุมตาบง', 'Chum Ta Bong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ชุมตาบง', 'Chum Ta Bong', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ชุมตาบง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปางสวรรค์', 'Pang Sawan', '60150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปางสวรรค์');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Uthai Thani
    SELECT id INTO p_id FROM provinces WHERE name_th = 'อุทัยธานี';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('อุทัยธานี', 'Uthai Thani') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Uthai Thani
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองอุทัยธานี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองอุทัยธานี', 'Mueang Uthai Thani') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อุทัยใหม่', 'Uthai Mai', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อุทัยใหม่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำซึม', 'Nam Suem', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำซึม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สะแกกรัง', 'Sakae Krang', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สะแกกรัง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนขวาง', 'Don Khwang', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนขวาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หาดทนง', 'Hat Thanong', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หาดทนง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะเทโพ', 'Ko Thepho', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะเทโพ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าซุง', 'Tha Sung', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าซุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแก', 'Nong Kae', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนเหล็ก', 'Non Lek', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนเหล็ก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองเต่า', 'Nong Tao', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองเต่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไผ่แบน', 'Nong Phai Baen', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไผ่แบน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองพังค่า', 'Nong Phang Kha', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองพังค่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งใหญ่', 'Thung Yai', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งใหญ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เนินแจง', 'Noen Chaeng', '61000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เนินแจง');

    -- District: Thap Than
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ทัพทัน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ทัพทัน', 'Thap Than') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทัพทัน', 'Thap Than', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทัพทัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งนาไทย', 'Thung Na Thai', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งนาไทย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาขี้ฝอย', 'Khao Khi Foi', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาขี้ฝอย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหญ้าปล้อง', 'Nong Ya Plong', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหญ้าปล้อง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โคกหม้อ', 'Khok Mo', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โคกหม้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองยายดา', 'Nong Yai Da', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองยายดา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกลางดง', 'Nong Klang Dong', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกลางดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองกระทุ่ม', 'Nong Krathum', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองกระทุ่ม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสระ', 'Nong Sa', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลุกดู่', 'Taluk Du', '61120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลุกดู่');

    -- District: Sawang Arom
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สว่างอารมณ์';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สว่างอารมณ์', 'Sawang Arom') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สว่างอารมณ์', 'Sawang Arom', '61150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สว่างอารมณ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหลวง', 'Nong Luang', '61150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พลวงสองนาง', 'Phluang Song Nang', '61150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พลวงสองนาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไผ่เขียว', 'Phai Khiao', '61150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไผ่เขียว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อยาง', 'Bor Yang', '61150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อยาง');

    -- District: Nong Chang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองฉาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองฉาง', 'Nong Chang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองฉาง', 'Nong Chang', '61110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองฉาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองยาง', 'Nong Yang', '61110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองนางนวล', 'Nong Nang Nuan', '61110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองนางนวล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองสรวง', 'Nong Suang', '61110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองสรวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านเก่า', 'Ban Kao', '61110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านเก่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อุทัยเก่า', 'Uthai Kao', '61110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อุทัยเก่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งโพ', 'Thung Pho', '61110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งโพ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งพง', 'Thung Phong', '61110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งพง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาบางแกรก', 'Khao Bang Kraek', '61170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาบางแกรก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขากวางทอง', 'Khao Kwang Thong', '61110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขากวางทอง');

    -- District: Nong Khayang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'หนองขาหย่าง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'หนองขาหย่าง', 'Nong Khayang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองขาหย่าง', 'Nong Khayang', '61130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองขาหย่าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไผ่', 'Nong Phai', '61130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไผ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนกลอย', 'Don Kloi', '61130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนกลอย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยรอบ', 'Huai Rop', '61130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยรอบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งพึ่ง', 'Thung Phueng', '61130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งพึ่ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าโพ', 'Tha Pho', '61130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าโพ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หมกแถว', 'Mok Thaeo', '61130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หมกแถว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หลุมเข้า', 'Lum Khao', '61130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หลุมเข้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดงขวาง', 'Dong Kwang', '61130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดงขวาง');

    -- District: Ban Rai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านไร่';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านไร่', 'Ban Rai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านไร่', 'Ban Rai', '61140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านไร่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทัพหลวง', 'Thap Luang', '61140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทัพหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยแห้ง', 'Huai Haeng', '61140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยแห้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คอกควาย', 'Khok Khwai', '61140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คอกควาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังหิน', 'Wang Hin', '61180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังหิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เมืองการุ้ง', 'Mueang Ka Rung', '61180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เมืองการุ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แก่นมะกรูด', 'Kaen Makrut', '61140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แก่นมะกรูด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองจอก', 'Nong Chok', '61180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองจอก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หูช้าง', 'Hu Chang', '61180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หูช้าง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านบึง', 'Ban Bueng', '61140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านบึง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านใหม่คลองเคียน', 'Ban Mai Khlong Khian', '61180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านใหม่คลองเคียน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบ่มกล้วย', 'Nong Bom Kluai', '61180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบ่มกล้วย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เจ้าวัด', 'Chao Wat', '61140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เจ้าวัด');

    -- District: Lan Sak
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ลานสัก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ลานสัก', 'Lan Sak') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลานสัก', 'Lan Sak', '61160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลานสัก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ประดู่ยืน', 'Pradu Yuen', '61160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ประดู่ยืน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าอ้อ', 'Pa O', '61160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าอ้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ระบำ', 'Rabam', '61160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ระบำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำรอบ', 'Nam Rop', '61160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำรอบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งนางาม', 'Thung Na Ngam', '61160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งนางาม');

    -- District: Huai Khot
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ห้วยคต';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ห้วยคต', 'Huai Khot') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สุขฤทัย', 'Suk Ruethai', '61170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สุขฤทัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทองหลาง', 'Thonglang', '61170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทองหลาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยคต', 'Huai Khot', '61170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยคต');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Kamphaeng Phet
    SELECT id INTO p_id FROM provinces WHERE name_th = 'กำแพงเพชร';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('กำแพงเพชร', 'Kamphaeng Phet') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Kamphaeng Phet
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองกำแพงเพชร';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองกำแพงเพชร', 'Mueang Kamphaeng Phet') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ในเมือง', 'Nai Mueang', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ในเมือง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไตรตรึงษ์', 'Trai Trueng', '62160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไตรตรึงษ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อ่างทอง', 'Ang Thong', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อ่างทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาบ่อคำ', 'Na Bo Kham', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาบ่อคำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นครชุม', 'Nakhon Chum', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นครชุม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทรงธรรม', 'Song Tham', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทรงธรรม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลานดอกไม้', 'Lan Dokmai', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลานดอกไม้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองปลิง', 'Nong Pling', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองปลิง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คณฑี', 'Khonthi', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คณฑี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นิคมทุ่งโพธิ์ทะเล', 'Nikhom Thung Pho Thale', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นิคมทุ่งโพธิ์ทะเล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เทพนคร', 'Thep Nakhon', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เทพนคร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังทอง', 'Wang Thong', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าขุนราม', 'Tha Khun Ram', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าขุนราม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองแม่ลาย', 'Khlong Mae Lai', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองแม่ลาย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ธำมรงค์', 'Thammarong', '62160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ธำมรงค์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สระแก้ว', 'Sa Kaeo', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สระแก้ว');

    -- District: Sai Ngam
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ไทรงาม';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ไทรงาม', 'Sai Ngam') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไทรงาม', 'Sai Ngam', '62150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไทรงาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองคล้า', 'Nong Khla', '62150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองคล้า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองทอง', 'Nong Thong', '62150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองไม้กอง', 'Nong Mai Kong', '62150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองไม้กอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มหาชัย', 'Maha Chai', '62150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มหาชัย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พานทอง', 'Phan Thong', '62150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พานทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองแม่แตง', 'Nong Mae Taeng', '62150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองแม่แตง');

    -- District: Khlong Lan
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'คลองลาน';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'คลองลาน', 'Khlong Lan') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองน้ำไหล', 'Khlong Nam Lai', '62180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองน้ำไหล');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โป่งน้ำร้อน', 'Pong Nam Ron', '62180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โป่งน้ำร้อน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองลานพัฒนา', 'Khlong Lan Phatthana', '62180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองลานพัฒนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สักงาม', 'Sak Ngam', '62180' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สักงาม');

    -- District: Khanu Woralaksaburi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ขาณุวรลักษบุรี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ขาณุวรลักษบุรี', 'Khanu Woralaksaburi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยางสูง', 'Yang Sung', '62130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยางสูง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่าพุทรา', 'Pa Phutsa', '62130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่าพุทรา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แสนตอ', 'Saen To', '62130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แสนตอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สลกบาตร', 'Salok Bat', '62140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สลกบาตร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ่อถ้ำ', 'Bo Tham', '62140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ่อถ้ำ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ดอนแตง', 'Don Taeng', '62140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ดอนแตง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังชะพลู', 'Wang Chaphlu', '62140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังชะพลู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โค้งไผ่', 'Khong Phai', '62140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โค้งไผ่');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปางมะค่า', 'Pang Makha', '62140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปางมะค่า');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังหามแห', 'Wang Ham Hae', '62140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังหามแห');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะตาล', 'Ko Tan', '62130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะตาล');

    -- District: Khlong Khlung
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'คลองขลุง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'คลองขลุง', 'Khlong Khlung') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองขลุง', 'Khlong Khlung', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองขลุง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่ามะเขือ', 'Tha Makhuea', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่ามะเขือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าพุทรา', 'Tha Phutsa', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าพุทรา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ลาด', 'Mae Lat', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ลาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังยาง', 'Wang Yang', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังแขม', 'Wang Khaem', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังแขม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวถนน', 'Hua Thanon', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวถนน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังไทร', 'Wang Sai', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังไทร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังบัว', 'Wang Bua', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังบัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองสมบูรณ์', 'Khlong Sombun', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองสมบูรณ์');

    -- District: Phran Kratai
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พรานกระต่าย';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พรานกระต่าย', 'Phran Kratai') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พรานกระต่าย', 'Phran Kratai', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พรานกระต่าย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหัววัว', 'Nong Hua Wua', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหัววัว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าไม้', 'Tha Mai', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าไม้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังควง', 'Wang Khuang', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังควง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังตะแบก', 'Wang Tabaek', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังตะแบก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เขาคีริส', 'Khao Khirit', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เขาคีริส');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คุยบ้านโอง', 'Khui Ban Ong', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คุยบ้านโอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คลองพิไกร', 'Khlong Phikrai', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คลองพิไกร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ถ้ำกระต่ายทอง', 'Tham Kratai Thong', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ถ้ำกระต่ายทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ห้วยยั้ง', 'Huai Yang', '62110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ห้วยยั้ง');

    -- District: Lan Krabue
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ลานกระบือ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ลานกระบือ', 'Lan Krabue') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลานกระบือ', 'Lan Krabue', '62170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลานกระบือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช่องลม', 'Chong Lom', '62170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช่องลม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหลวง', 'Nong Luang', '62170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โนนพลวง', 'Non Phluang', '62170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โนนพลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ประชาสุขสันต์', 'Pracha Suk San', '62170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ประชาสุขสันต์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บึงทับแรต', 'Bueng Thap Raet', '62170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บึงทับแรต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'จันทิมา', 'Chanthima', '62170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'จันทิมา');

    -- District: Sai Thong Watthana
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ทรายทองวัฒนา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ทรายทองวัฒนา', 'Sai Thong Watthana') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งทราย', 'Thung Sai', '62190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งทราย');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งทอง', 'Thung Thong', '62190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ถาวรวัฒนา', 'Thawon Watthana', '62190' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ถาวรวัฒนา');

    -- District: Pang Sila Thong
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ปางศิลาทอง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ปางศิลาทอง', 'Pang Sila Thong') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โพธิ์ทอง', 'Pho Thong', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โพธิ์ทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หินดาต', 'Hin Dat', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หินดาต');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ปางตาไว', 'Pang Ta Wai', '62120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ปางตาไว');

    -- District: Bueng Samakkhi
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บึงสามัคคี';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บึงสามัคคี', 'Bueng Samakkhi') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บึงสามัคคี', 'Bueng Samakkhi', '62210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บึงสามัคคี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังชะโอน', 'Wang Cha-on', '62210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังชะโอน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ระหาน', 'Rahan', '62210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ระหาน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เทพนิมิต', 'Thep Nimit', '62210' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เทพนิมิต');

    -- District: Kosamphi Nakhon
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'โกสัมพีนคร';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'โกสัมพีนคร', 'Kosamphi Nakhon') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โกสัมพี', 'Kosamphi', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โกสัมพี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เพชรชมภู', 'Phet Chomphu', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เพชรชมภู');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ลานดอกไม้ตก', 'Lan Dokmai Tok', '62000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ลานดอกไม้ตก');

END $$;

DO $$
DECLARE
    p_id INT;
    d_id INT;
BEGIN
    -- Province: Tak
    SELECT id INTO p_id FROM provinces WHERE name_th = 'ตาก';
    IF p_id IS NULL THEN
        INSERT INTO provinces (name_th, name_en) VALUES ('ตาก', 'Tak') RETURNING id INTO p_id;
    END IF;

    -- District: Mueang Tak
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'เมืองตาก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'เมืองตาก', 'Mueang Tak') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ระแหง', 'Rahaeng', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ระแหง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหลวง', 'Nong Luang', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงเงิน', 'Chiang Ngoen', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงเงิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หัวเดียด', 'Hua Diat', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หัวเดียด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัวเหนือ', 'Nong Bua Nuea', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัวเหนือ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ไม้งาม', 'Mai Ngam', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ไม้งาม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โป่งแดง', 'Pong Daeng', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โป่งแดง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'น้ำรึม', 'Nam Ruem', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'น้ำรึม');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังหิน', 'Wang Hin', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังหิน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ท้อ', 'Mae Tho', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ท้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ป่ามะม่วง', 'Pa Mamuang', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ป่ามะม่วง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองบัวใต้', 'Nong Bua Tai', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองบัวใต้');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังประจบ', 'Wang Prachop', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังประจบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตลุกกลางทุ่ง', 'Taluk Klang Thung', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตลุกกลางทุ่ง');

    -- District: Ban Tak
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'บ้านตาก';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'บ้านตาก', 'Ban Tak') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตากออก', 'Tak Ok', '63120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตากออก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สมอโคน', 'Samo Khon', '63120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สมอโคน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สลิด', 'Mae Salit', '63120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สลิด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ตากตก', 'Tak Tok', '63120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ตากตก');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เกาะตะเภา', 'Ko Taphao', '63120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เกาะตะเภา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ทุ่งกระเชาะ', 'Thung Kracho', '63120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ทุ่งกระเชาะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท้องฟ้า', 'Thong Fa', '63120' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท้องฟ้า');

    -- District: Sam Ngao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'สามเงา';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'สามเงา', 'Sam Ngao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สามเงา', 'Sam Ngao', '63130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สามเงา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังหมัน', 'Wang Man', '63130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังหมัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ยกกระบัตร', 'Yokkrabat', '63130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ยกกระบัตร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ย่านรี', 'Yan Ri', '63130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ย่านรี');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'บ้านนา', 'Ban Na', '63130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'บ้านนา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วังจันทร์', 'Wang Chan', '63130' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วังจันทร์');

    -- District: Mae Ramat
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่ระมาด';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่ระมาด', 'Mae Ramat') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ระมาด', 'Mae Ramat', '63140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ระมาด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่จะเรา', 'Mae Charao', '63140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่จะเรา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ขะเนจื้อ', 'Khane Chue', '63140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ขะเนจื้อ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ตื่น', 'Mae Tuen', '63140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ตื่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'สามหมื่น', 'Sam Muen', '63140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'สามหมื่น');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระธาตุ', 'Phra That', '63140' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระธาตุ');

    -- District: Tha Song Yang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'ท่าสองยาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'ท่าสองยาง', 'Tha Song Yang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าสองยาง', 'Tha Song Yang', '63150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าสองยาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ต้าน', 'Mae Tan', '63150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ต้าน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สอง', 'Mae Song', '63150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่หละ', 'Mae La', '63150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่หละ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่วะหลวง', 'Mae Wa Luang', '63150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่วะหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่อุสุ', 'Mae Usu', '63150' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่อุสุ');

    -- District: Mae Sot
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'แม่สอด';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'แม่สอด', 'Mae Sot') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่สอด', 'Mae Sot', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่สอด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่กุ', 'Mae Ku', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่กุ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พะวอ', 'Phawo', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พะวอ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ตาว', 'Mae Tao', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ตาว');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่กาษา', 'Mae Kasa', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่กาษา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ท่าสายลวด', 'Tha Sai Luat', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ท่าสายลวด');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ปะ', 'Mae Pa', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ปะ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'มหาวัน', 'Mahawan', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'มหาวัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ด่านแม่ละเมา', 'Dan Mae Lamao', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ด่านแม่ละเมา');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พระธาตุผาแดง', 'Phra That Pha Daeng', '63110' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พระธาตุผาแดง');

    -- District: Phop Phra
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'พบพระ';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'พบพระ', 'Phop Phra') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'พบพระ', 'Phop Phra', '63160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'พบพระ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ช่องแคบ', 'Chong Khaep', '63160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ช่องแคบ');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'คีรีราษฎร์', 'Khiri Rat', '63160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'คีรีราษฎร์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'วาเล่ย์', 'Wale', '63160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'วาเล่ย์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'รวมไทยพัฒนา', 'Ruam Thai Phatthana', '63160' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'รวมไทยพัฒนา');

    -- District: Umphang
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'อุ้มผาง';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'อุ้มผาง', 'Umphang') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'อุ้มผาง', 'Umphang', '63170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'อุ้มผาง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'หนองหลวง', 'Nong Luang', '63170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'หนองหลวง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'โมโกร', 'Mokro', '63170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'โมโกร');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่จัน', 'Mae Chan', '63170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่จัน');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่ละมุ้ง', 'Mae Lamung', '63170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่ละมุ้ง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'แม่กลอง', 'Mae Klong', '63170' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'แม่กลอง');

    -- District: Wang Chao
    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = 'วังเจ้า';
    IF d_id IS NULL THEN
        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, 'วังเจ้า', 'Wang Chao') RETURNING id INTO d_id;
    END IF;
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'เชียงทอง', 'Chiang Thong', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'เชียงทอง');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'นาโบสถ์', 'Na Bot', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'นาโบสถ์');
    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) 
    SELECT d_id, 'ประดาง', 'Pradang', '63000' 
    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = 'ประดาง');

END $$;

