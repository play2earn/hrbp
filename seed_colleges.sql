-- =============================================
-- CREATE COLLEGES TABLE AND SEED DATA
-- Run this in Supabase SQL Editor
-- =============================================

-- Create colleges table (if not exists)
CREATE TABLE IF NOT EXISTS colleges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    name_en TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on colleges" 
ON colleges FOR SELECT 
TO anon, authenticated 
USING (true);

-- Create policy for authenticated users to manage
CREATE POLICY "Allow authenticated users to manage colleges" 
ON colleges FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Insert Thai Colleges/Vocational Schools
INSERT INTO colleges (name, name_en, is_active) VALUES
-- วิทยาลัยอาชีวศึกษา (Vocational Colleges)
('วิทยาลัยอาชีวศึกษาธนบุรี', 'Thonburi Vocational College', true),
('วิทยาลัยอาชีวศึกษาเชียงราย', 'Chiang Rai Vocational College', true),
('วิทยาลัยอาชีวศึกษาเชียงใหม่', 'Chiang Mai Vocational College', true),
('วิทยาลัยอาชีวศึกษาสุราษฎร์ธานี', 'Surat Thani Vocational College', true),
('วิทยาลัยอาชีวศึกษานครราชสีมา', 'Nakhon Ratchasima Vocational College', true),
('วิทยาลัยอาชีวศึกษาขอนแก่น', 'Khon Kaen Vocational College', true),
('วิทยาลัยอาชีวศึกษาอุดรธานี', 'Udon Thani Vocational College', true),
('วิทยาลัยอาชีวศึกษาภูเก็ต', 'Phuket Vocational College', true),
('วิทยาลัยอาชีวศึกษากาญจนบุรี', 'Kanchanaburi Vocational College', true),
('วิทยาลัยอาชีวศึกษาพิษณุโลก', 'Phitsanulok Vocational College', true),

-- วิทยาลัยเทคนิค (Technical Colleges)
('วิทยาลัยเทคนิคกรุงเทพ', 'Bangkok Technical College', true),
('วิทยาลัยเทคนิคดอนเมือง', 'Don Mueang Technical College', true),
('วิทยาลัยเทคนิคมีนบุรี', 'Minburi Technical College', true),
('วิทยาลัยเทคนิคสมุทรปราการ', 'Samut Prakan Technical College', true),
('วิทยาลัยเทคนิคนนทบุรี', 'Nonthaburi Technical College', true),
('วิทยาลัยเทคนิคราชสิทธาราม', 'Ratchasittharam Technical College', true),
('วิทยาลัยเทคนิคชลบุรี', 'Chonburi Technical College', true),
('วิทยาลัยเทคนิคปทุมธานี', 'Pathum Thani Technical College', true),
('วิทยาลัยเทคนิคสุพรรณบุรี', 'Suphan Buri Technical College', true),
('วิทยาลัยเทคนิคนครปฐม', 'Nakhon Pathom Technical College', true),

-- วิทยาลัยเทคโนโลยี (Technology Colleges)
('วิทยาลัยเทคโนโลยีจิตรลดา', 'Chitralada Technology College', true),
('วิทยาลัยเทคโนโลยีพนมวันท์', 'Phanomwan Technology College', true),
('วิทยาลัยเทคโนโลยีภาคใต้', 'Southern Technology College', true),
('วิทยาลัยเทคโนโลยีสยาม', 'Siam Technology College', true),
('วิทยาลัยเทคโนโลยีไทยบริหารธุรกิจ', 'Thai Business Administration Technology College', true),
('วิทยาลัยเทคโนโลยีตะวันออก', 'Eastern Technology College', true),
('วิทยาลัยเทคโนโลยีเอเชีย', 'Asian Technology College', true),

-- วิทยาลัยพาณิชยการ (Commercial Colleges)
('วิทยาลัยพาณิชยการธนบุรี', 'Thonburi Commercial College', true),
('วิทยาลัยพาณิชยการบางนา', 'Bangna Commercial College', true),
('วิทยาลัยพาณิชยการเชตุพน', 'Chetuporn Commercial College', true),
('วิทยาลัยพาณิชยการอินทราชัย', 'Intrarachai Commercial College', true),

-- วิทยาลัยเอกชน (Private Colleges)
('วิทยาลัยเชียงราย', 'Chiang Rai College', true),
('วิทยาลัยเซนต์หลุยส์', 'Saint Louis College', true),
('วิทยาลัยเซาธ์อีสบางกอก', 'Southeast Bangkok College', true),
('วิทยาลัยดุสิตธานี', 'Dusit Thani College', true),
('วิทยาลัยนครราชสีมา', 'Nakhon Ratchasima College', true),
('วิทยาลัยบัณฑิตเอเชีย', 'Asian Scholars College', true),
('วิทยาลัยพิษณุโลก', 'Phitsanulok College', true),
('วิทยาลัยราชพฤกษ์', 'Ratchaphruek College', true),
('วิทยาลัยสันตพล', 'Santapol College', true),
('วิทยาลัยนานาชาติเซนต์เทเรซา', 'St. Theresa International College', true),
('วิทยาลัยเทคโนโลยีพระมหาไถ่', 'Pramaha Thai Polytechnic College', true),
('วิทยาลัยแสงธรรม', 'Saengtham College', true),
('วิทยาลัยทองสุข', 'Thongsook College', true),

-- วิทยาลัยการอาชีพ (Vocational Training Colleges)
('วิทยาลัยการอาชีพบางแก้ว', 'Bang Kaeo Vocational College', true),
('วิทยาลัยการอาชีพนวมินทราชินีมุกดาหาร', 'Nawamintarachinee Mukdahan Vocational College', true),
('วิทยาลัยการอาชีพหนองแค', 'Nong Khae Vocational College', true),
('วิทยาลัยการอาชีพเวียงสา', 'Wiang Sa Vocational College', true),
('วิทยาลัยการอาชีพปัตตานี', 'Pattani Vocational College', true)

ON CONFLICT (name) DO NOTHING;

-- Show results
SELECT COUNT(*) as total_colleges FROM colleges;
