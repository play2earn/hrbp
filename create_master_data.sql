
-- DEPARTMENTS & POSITIONS
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    department_id INTEGER REFERENCES departments(id),
    name_th TEXT NOT NULL,
    name_en TEXT
);

-- BUSINESS UNITS & CHANNELS
CREATE TABLE IF NOT EXISTS business_units (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    bu_id INTEGER REFERENCES business_units(id), -- Dependent on BU? Or is it global? User said "bu > channel (dependent)".
    name TEXT NOT NULL
);

-- UNIVERSITIES & FACULTIES (Colleges)
CREATE TABLE IF NOT EXISTS universities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faculties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- LOCATIONS (Province > District > Subdistrict)
CREATE TABLE IF NOT EXISTS provinces (
    id SERIAL PRIMARY KEY,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    province_id INTEGER REFERENCES provinces(id),
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subdistricts (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id),
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL,
    postcode TEXT
);


-- SEED DATA (Based on provided images/samples)

-- Departments
INSERT INTO departments (name_th, name_en) VALUES 
('บัญชี', 'Accounting'),
('การเกษตร', 'Agriculture'),
('สถาปนิกและออกแบบ', 'Architect & Design'),
('บริหารธุรกิจ', 'Business Administration'),
('พัฒนาธุรกิจ', 'Business Development'),
('การพาณิชย์', 'Commercial'),
('วิศวกรรม', 'Engineering')
ON CONFLICT DO NOTHING;

-- Positions (Sample)
WITH dept AS (SELECT id, name_en FROM departments)
INSERT INTO positions (department_id, name_th, name_en) 
SELECT id, 'เจ้าหน้าที่บัญชี', 'Accounting Officer' FROM dept WHERE name_en = 'Accounting'
UNION ALL SELECT id, 'ผู้จัดการฝ่ายบัญชี', 'Accounting Department Manager' FROM dept WHERE name_en = 'Accounting'
UNION ALL SELECT id, 'นักวิชาการเกษตร', NULL FROM dept WHERE name_en = 'Agriculture'
UNION ALL SELECT id, 'ผู้ช่วยนักวิจัย', NULL FROM dept WHERE name_en = 'Agriculture'
UNION ALL SELECT id, 'สถาปนิก', 'Architect' FROM dept WHERE name_en = 'Architect & Design'
UNION ALL SELECT id, 'วิศวกรเครื่องกล', 'Mechanical Engineer' FROM dept WHERE name_en = 'Engineering'
UNION ALL SELECT id, 'วิศวกรโยธา', 'Civil Engineer' FROM dept WHERE name_en = 'Engineering';


-- Business Units
INSERT INTO business_units (name) VALUES 
('DoubleA'), ('NPS'), ('ReLo'), ('IP'), ('Other')
ON CONFLICT DO NOTHING;

-- Channels (Mock mapping as specific mapping not fully clear, assuming simplified or cross-BU)
-- User image shows simple list. Mapping might be many-to-many or specific. Assuming per BU for now or global if BU not strictly enforcing.
-- Actually user said "bu > channel (dependent)". So channels belong to BU.
-- Creating generic channels attached to DoubleA for demo, others for others.
WITH unit AS (SELECT id, name FROM business_units)
INSERT INTO channels (bu_id, name)
SELECT id, 'Website' FROM unit WHERE name = 'DoubleA'
UNION ALL SELECT id, 'Booth' FROM unit WHERE name = 'DoubleA'
UNION ALL SELECT id, 'JobFair' FROM unit WHERE name = 'DoubleA'
UNION ALL SELECT id, 'Facebook' FROM unit WHERE name = 'DoubleA'
UNION ALL SELECT id, 'Website' FROM unit WHERE name = 'NPS'
UNION ALL SELECT id, 'LinkedIn' FROM unit WHERE name = 'ReLo';

-- Universities (Sample)
INSERT INTO universities (name) VALUES 
('Chulalongkorn University'),
('Kasetsart University'),
('Mahidol University'),
('Thammasat University'),
('Chiang Mai University'),
('Khon Kaen University')
ON CONFLICT DO NOTHING;

-- Faculties (Sample)
INSERT INTO faculties (name) VALUES 
('Engineering'),
('Science'),
('Business Administration'),
('Arts'),
('Education')
ON CONFLICT DO NOTHING;

-- Locations (Sample - Amnat Charoen from image)
INSERT INTO provinces (name_th, name_en) VALUES ('อำนาจเจริญ', 'Amnat Charoen') ON CONFLICT DO NOTHING;
INSERT INTO provinces (name_th, name_en) VALUES ('กรุงเทพมหานคร', 'Bangkok') ON CONFLICT DO NOTHING;

WITH prov AS (SELECT id, name_en FROM provinces)
INSERT INTO districts (province_id, name_th, name_en)
SELECT id, 'เมืองอำนาจเจริญ', 'Mueang Amnat Charoen' FROM prov WHERE name_en = 'Amnat Charoen'
UNION ALL SELECT id, 'ชานุมาน', 'Chanuman' FROM prov WHERE name_en = 'Amnat Charoen'
UNION ALL SELECT id, 'ปทุมราชวงศา', 'Pathum Ratchawongsa' FROM prov WHERE name_en = 'Amnat Charoen'
UNION ALL SELECT id, 'พระนคร', 'Phra Nakhon' FROM prov WHERE name_en = 'Bangkok'
UNION ALL SELECT id, 'ดุสิต', 'Dusit' FROM prov WHERE name_en = 'Bangkok';

WITH dist AS (SELECT id, name_en FROM districts)
INSERT INTO subdistricts (district_id, name_th, name_en, postcode)
SELECT id, 'บุ่ง', 'Bung', '37000' FROM dist WHERE name_en = 'Mueang Amnat Charoen'
UNION ALL SELECT id, 'ไก่คำ', 'Kai Kham', '37000' FROM dist WHERE name_en = 'Mueang Amnat Charoen'
UNION ALL SELECT id, 'ชานุมาน', 'Chanuman', '37210' FROM dist WHERE name_en = 'Chanuman'
UNION ALL SELECT id, 'พระบรมมหาราชวัง', 'Phra Borom Maha Ratchawang', '10200' FROM dist WHERE name_en = 'Phra Nakhon';


-- RLS POLICIES for Master Data (Public Read)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read departments" ON departments FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read positions" ON positions FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bu" ON business_units FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read channels" ON channels FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read universities" ON universities FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read faculties" ON faculties FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read provinces" ON provinces FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read districts" ON districts FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE subdistricts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read subdistricts" ON subdistricts FOR SELECT TO anon, authenticated USING (true);

