-- Add columns for Job Interest
alter table applications 
add column if not exists business_unit text,
add column if not exists expected_salary text,
add column if not exists is_salary_negotiable boolean,
add column if not exists availability text;

-- Add columns for Personal Info
alter table applications
add column if not exists is_thai_national boolean,
add column if not exists national_id text,
add column if not exists passport_no text,
add column if not exists title text,
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists nickname text,
add column if not exists date_of_birth text,
add column if not exists age text,
add column if not exists weight text,
add column if not exists height text,
add column if not exists military_status text;

-- Add columns for Address
alter table applications
add column if not exists registered_address text,
add column if not exists registered_province text,
add column if not exists registered_district text,
add column if not exists registered_sub_district text,
add column if not exists current_address text,
add column if not exists current_province text,
add column if not exists current_district text,
add column if not exists current_sub_district text;

-- Add columns for Family
alter table applications
add column if not exists marital_status text,
add column if not exists children_count integer,
add column if not exists spouse_name text,
add column if not exists spouse_age text,
add column if not exists spouse_occupation text,
add column if not exists father_name text,
add column if not exists father_age text,
add column if not exists father_occupation text,
add column if not exists mother_name text,
add column if not exists mother_age text,
add column if not exists mother_occupation text,
add column if not exists sibling_count integer;

-- Add columns for Skills & Language
alter table applications
add column if not exists english_skill text,
add column if not exists english_score text,
add column if not exists chinese_skill text,
add column if not exists chinese_score text,
add column if not exists computer_skills jsonb,
add column if not exists graphics_skills jsonb,
add column if not exists driving jsonb;

-- Add columns for Questionnaire
alter table applications
add column if not exists strength text,
add column if not exists weakness text,
add column if not exists less_fit_task text,
add column if not exists principles text,
add column if not exists trouble_resolve text,
add column if not exists job_criteria text,
add column if not exists interests text,
add column if not exists digital_transform_opinion text,
add column if not exists special_ability text,
add column if not exists hobbies text,
add column if not exists upcountry_locations jsonb;

-- Add columns for Medical & Emergency
alter table applications
add column if not exists emergency_contact_name text,
add column if not exists emergency_contact_relation text,
add column if not exists emergency_contact_phone text,
add column if not exists emergency_contact_company text,
add column if not exists emergency_contact_position text,
add column if not exists has_chronic_disease boolean,
add column if not exists chronic_disease_detail text,
add column if not exists has_surgery boolean,
add column if not exists surgery_detail text,
add column if not exists has_medical_record boolean,
add column if not exists medical_record_detail text;

-- Add columns for Files
alter table applications
add column if not exists photo_url text,
add column if not exists resume_url text,
add column if not exists certificate_url text,
add column if not exists other_docs_url text;

-- Add columns for Complex Lists
alter table applications
add column if not exists education jsonb,
add column if not exists experience jsonb;
