
import json

def generate_sql():
    try:
        with open('thailand_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: thailand_data.json not found. Please download it first.")
        return

    sql_content = "-- Thailand Locations Seed Script (Complete)\n"
    sql_content += "-- Generated from kongvut/thai-province-data\n\n"

    chunk_size = 5
    for i, prov in enumerate(data):
        file_index = (i // chunk_size) + 1
        
        # Start new string buffer for new file
        if i % chunk_size == 0:
            if i > 0:
                 # Write previous file
                 filename = f'seed_locations_thailand_part_{file_index-1}.sql'
                 with open(filename, 'w', encoding='utf-8') as f:
                     f.write(current_sql_content)
                 print(f"Generated {filename}")

            current_sql_content = f"-- Thailand Locations Seed Script (Part {file_index})\n"
            current_sql_content += "-- Generated from kongvut/thai-province-data\n\n"

        # Use a transaction block per province
        current_sql_content += "DO $$\nDECLARE\n    p_id INT;\n    d_id INT;\nBEGIN\n"
        
        # ... (Province logic)
        name_th = prov['name_th'].replace("'", "''")
        name_en = prov['name_en'].replace("'", "''")
        current_sql_content += f"    -- Province: {name_en}\n"
        current_sql_content += f"    SELECT id INTO p_id FROM provinces WHERE name_th = '{name_th}';\n"
        current_sql_content += f"    IF p_id IS NULL THEN\n"
        current_sql_content += f"        INSERT INTO provinces (name_th, name_en) VALUES ('{name_th}', '{name_en}') RETURNING id INTO p_id;\n"
        current_sql_content += f"    END IF;\n\n"

        for dist in prov['districts']:
            d_name_th = dist['name_th'].replace("'", "''")
            d_name_en = dist['name_en'].replace("'", "''")
            
            current_sql_content += f"    -- District: {d_name_en}\n"
            current_sql_content += f"    SELECT id INTO d_id FROM districts WHERE province_id = p_id AND name_th = '{d_name_th}';\n"
            current_sql_content += f"    IF d_id IS NULL THEN\n"
            current_sql_content += f"        INSERT INTO districts (province_id, name_th, name_en) VALUES (p_id, '{d_name_th}', '{d_name_en}') RETURNING id INTO d_id;\n"
            current_sql_content += f"    END IF;\n"

            if 'sub_districts' in dist:
                for sub in dist['sub_districts']:
                    s_name_th = sub['name_th'].replace("'", "''")
                    s_name_en = sub['name_en'].replace("'", "''")
                    postcode = sub.get('zip_code', '')
                    if postcode is None: postcode = 'NULL'
                    else: postcode = f"'{postcode}'"

                    current_sql_content += f"    INSERT INTO subdistricts (district_id, name_th, name_en, postcode) \n"
                    current_sql_content += f"    SELECT d_id, '{s_name_th}', '{s_name_en}', {postcode} \n"
                    current_sql_content += f"    WHERE NOT EXISTS (SELECT 1 FROM subdistricts WHERE district_id = d_id AND name_th = '{s_name_th}');\n"
            
            current_sql_content += "\n"
        
        current_sql_content += "END $$;\n\n"

    # Write the last chunk
    last_index = (len(data) // chunk_size) + 1 if len(data) % chunk_size != 0 else (len(data) // chunk_size)
    filename = f'seed_locations_thailand_part_{last_index}.sql'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(current_sql_content)
    print(f"Generated {filename}")

if __name__ == "__main__":
    generate_sql()
