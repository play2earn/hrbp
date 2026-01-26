-- =============================================
-- SEED UNIVERSITIES IN THAILAND
-- Run this in Supabase SQL Editor
-- =============================================

-- First, add name_en column if not exists
ALTER TABLE universities ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Add unique constraint on name if not exists (ignore error if already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'universities_name_unique'
    ) THEN
        ALTER TABLE universities ADD CONSTRAINT universities_name_unique UNIQUE (name);
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if constraint already exists
    NULL;
END $$;

-- Insert Thai Universities
INSERT INTO universities (name, name_en, is_active) VALUES
-- มหาวิทยาลัยของรัฐ (Public Universities)
('จุฬาลงกรณ์มหาวิทยาลัย', 'Chulalongkorn University', true),
('มหาวิทยาลัยมหิดล', 'Mahidol University', true),
('มหาวิทยาลัยเกษตรศาสตร์', 'Kasetsart University', true),
('มหาวิทยาลัยธรรมศาสตร์', 'Thammasat University', true),
('มหาวิทยาลัยเชียงใหม่', 'Chiang Mai University', true),
('มหาวิทยาลัยขอนแก่น', 'Khon Kaen University', true),
('มหาวิทยาลัยสงขลานครินทร์', 'Prince of Songkla University', true),
('มหาวิทยาลัยศรีนครินทรวิโรฒ', 'Srinakharinwirot University', true),
('มหาวิทยาลัยบูรพา', 'Burapha University', true),
('มหาวิทยาลัยนเรศวร', 'Naresuan University', true),
('มหาวิทยาลัยศิลปากร', 'Silpakorn University', true),
('มหาวิทยาลัยแม่ฟ้าหลวง', 'Mae Fah Luang University', true),
('มหาวิทยาลัยแม่โจ้', 'Maejo University', true),
('มหาวิทยาลัยวลัยลักษณ์', 'Walailak University', true),
('มหาวิทยาลัยรามคำแหง', 'Ramkhamhaeng University', true),
('มหาวิทยาลัยสุโขทัยธรรมาธิราช', 'Sukhothai Thammathirat Open University', true),
('มหาวิทยาลัยมหาสารคาม', 'Mahasarakham University', true),
('มหาวิทยาลัยอุบลราชธานี', 'Ubon Ratchathani University', true),
('มหาวิทยาลัยทักษิณ', 'Thaksin University', true),
('มหาวิทยาลัยนครพนม', 'Nakhon Phanom University', true),
('มหาวิทยาลัยพะเยา', 'University of Phayao', true),

-- มหาวิทยาลัยเทคโนโลยีพระจอมเกล้า (King Mongkut's)
('สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง', 'KMITL', true),
('มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี', 'KMUTT', true),
('มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ', 'KMUTNB', true),

-- มหาวิทยาลัยเทคโนโลยีราชมงคล (Rajamangala)
('มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี', 'RMUTT', true),
('มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ', 'RMUTK', true),
('มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร', 'RMUTP', true),
('มหาวิทยาลัยเทคโนโลยีราชมงคลรัตนโกสินทร์', 'RMUTR', true),
('มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา', 'RMUTL', true),
('มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย', 'RMUTSV', true),
('มหาวิทยาลัยเทคโนโลยีราชมงคลสุวรรณภูมิ', 'RUS', true),
('มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน', 'RMUTI', true),
('มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก', 'RMUTTO', true),

-- มหาวิทยาลัยราชภัฏ (Rajabhat Universities)
('มหาวิทยาลัยราชภัฏจันทรเกษม', 'CRU', true),
('มหาวิทยาลัยราชภัฏสวนสุนันทา', 'SSRU', true),
('มหาวิทยาลัยราชภัฏพระนคร', 'PNRU', true),
('มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา', 'BSRU', true),
('มหาวิทยาลัยราชภัฏธนบุรี', 'DRU', true),
('มหาวิทยาลัยราชภัฏเชียงใหม่', 'CMRU', true),
('มหาวิทยาลัยราชภัฏนครราชสีมา', 'NRRU', true),
('มหาวิทยาลัยราชภัฏภูเก็ต', 'PKRU', true),
('มหาวิทยาลัยราชภัฏสุราษฎร์ธานี', 'SRU', true),
('มหาวิทยาลัยราชภัฏนครศรีธรรมราช', 'NSTRU', true),

-- มหาวิทยาลัยเอกชน (Private Universities)
('มหาวิทยาลัยกรุงเทพ', 'Bangkok University', true),
('มหาวิทยาลัยอัสสัมชัญ', 'ABAC', true),
('มหาวิทยาลัยรังสิต', 'Rangsit University', true),
('มหาวิทยาลัยศรีปทุม', 'SPU', true),
('มหาวิทยาลัยธุรกิจบัณฑิตย์', 'DPU', true),
('มหาวิทยาลัยหอการค้าไทย', 'UTCC', true),
('มหาวิทยาลัยสยาม', 'Siam University', true),
('มหาวิทยาลัยเอเชียอาคเนย์', 'SAU', true),
('มหาวิทยาลัยกรุงเทพธนบุรี', 'BTU', true),
('มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ', 'HCU', true),
('มหาวิทยาลัยเกริก', 'Krirk University', true),
('มหาวิทยาลัยนอร์ทกรุงเทพ', 'NBU', true),
('มหาวิทยาลัยเซนต์จอห์น', 'SJU', true),
('มหาวิทยาลัยนานาชาติแสตมฟอร์ด', 'STIU', true),
('มหาวิทยาลัยเว็บสเตอร์ (ประเทศไทย)', 'Webster Thailand', true),
('มหาวิทยาลัยอีสเทิร์นเอเชีย', 'EAU', true),
('มหาวิทยาลัยพายัพ', 'Payap University', true),
('มหาวิทยาลัยเทคโนโลยีมหานคร', 'MUT', true)

ON CONFLICT (name) DO NOTHING;

-- Show results
SELECT COUNT(*) as total_universities FROM universities;
