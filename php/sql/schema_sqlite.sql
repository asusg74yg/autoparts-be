-- SQLite Database Schema

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'USER',
    business_name TEXT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NULL,
    address TEXT NULL,
    country TEXT NULL,
    password_hash TEXT NOT NULL,
    refresh_token TEXT NULL,
    otp_code INTEGER NULL,
    otp_expires_at TEXT NULL,
    email_verified INTEGER DEFAULT 0,
    approved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    make TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number INTEGER NULL UNIQUE,
    user_id TEXT NULL,
    shipping_status TEXT DEFAULT 'PENDING',
    shipping_cost REAL DEFAULT 0,
    stripe_session_id TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS additional_orders (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    shipping_full_name TEXT NOT NULL,
    shipping_email TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_zip_code TEXT NOT NULL,
    shipping_country TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    billing_full_name TEXT NULL,
    billing_email TEXT NULL,
    billing_address TEXT NULL,
    billing_city TEXT NULL,
    billing_state TEXT NULL,
    billing_zip_code TEXT NULL,
    billing_country TEXT NULL,
    billing_phone TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT NULL,
    email_address TEXT NULL,
    brand_label TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS base_vehicles (
    id TEXT PRIMARY KEY,
    base_vehicle_id INTEGER NOT NULL,
    year INTEGER NULL,
    model TEXT NULL,
    vehicle_type TEXT NULL,
    vehicle_type_group TEXT NULL,
    make TEXT NULL
);

CREATE TABLE IF NOT EXISTS sub_models (
    id TEXT PRIMARY KEY,
    sub_model TEXT NULL,
    region_abbr TEXT NULL,
    region_name TEXT NULL,
    base_vehicle_id TEXT NOT NULL,
    FOREIGN KEY (base_vehicle_id) REFERENCES base_vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NULL,
    parent_id INTEGER NULL,
    region_abbr TEXT NULL,
    region_name TEXT NULL,
    submodel_id TEXT NOT NULL,
    FOREIGN KEY (submodel_id) REFERENCES sub_models(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS engine_bases (
    id TEXT PRIMARY KEY,
    engine_base_id INTEGER NOT NULL,
    liter TEXT NULL,
    cc TEXT NULL,
    cid TEXT NULL,
    cylinders TEXT NULL,
    block_type TEXT NULL,
    eng_bore_in TEXT NULL,
    eng_bore_metric TEXT NULL,
    eng_stroke_in TEXT NULL,
    eng_stroke_metric TEXT NULL
);

CREATE TABLE IF NOT EXISTS engine_designations (
    id TEXT PRIMARY KEY,
    engine_designation_id INTEGER NOT NULL,
    engine_designation TEXT NULL
);

CREATE TABLE IF NOT EXISTS engine_versions (
    id TEXT PRIMARY KEY,
    engine_version_id INTEGER NOT NULL,
    engine_version TEXT NULL
);

CREATE TABLE IF NOT EXISTS engine_mfrs (
    id TEXT PRIMARY KEY,
    engine_mfr_id INTEGER NOT NULL,
    engine_mfr TEXT NULL
);

CREATE TABLE IF NOT EXISTS fuel_types (
    id TEXT PRIMARY KEY,
    fuel_type_id INTEGER NOT NULL,
    fuel_type TEXT NULL
);

CREATE TABLE IF NOT EXISTS brand_aaiaids (
    id TEXT PRIMARY KEY,
    brand_aaiaid_id TEXT NOT NULL,
    brand_aaiaid TEXT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    mfr_label TEXT NULL,
    part TEXT NULL,
    action TEXT NULL,
    hazard_material_code TEXT NULL,
    part_number TEXT NULL,
    brand_label TEXT NULL,
    aces_applications TEXT NULL,
    item_quantity_size INTEGER NULL,
    container_type TEXT NULL,
    quantity_per_application INTEGER NULL,
    minimum_order_quantity INTEGER NULL,
    part_terminology_id INTEGER NOT NULL,
    maintenance_type TEXT NULL,
    part_type_id TEXT NULL,
    base_vehicle_id TEXT NOT NULL,
    engine_base_id TEXT NOT NULL,
    engine_designation_id TEXT NOT NULL,
    engine_version_id TEXT NOT NULL,
    engine_mfr_id TEXT NOT NULL,
    fuel_type_id TEXT NOT NULL,
    brand_aaiaid_id TEXT NOT NULL,
    rating REAL DEFAULT 0,
    FOREIGN KEY (base_vehicle_id) REFERENCES base_vehicles(id),
    FOREIGN KEY (engine_base_id) REFERENCES engine_bases(id),
    FOREIGN KEY (engine_designation_id) REFERENCES engine_designations(id),
    FOREIGN KEY (engine_version_id) REFERENCES engine_versions(id),
    FOREIGN KEY (engine_mfr_id) REFERENCES engine_mfrs(id),
    FOREIGN KEY (fuel_type_id) REFERENCES fuel_types(id),
    FOREIGN KEY (brand_aaiaid_id) REFERENCES brand_aaiaids(id)
);

CREATE TABLE IF NOT EXISTS part_types (
    id TEXT PRIMARY KEY,
    part_type_id INTEGER NOT NULL,
    part_type_name TEXT NULL,
    part_type_description TEXT NULL,
    category TEXT NULL,
    subcategory TEXT NULL,
    product_id TEXT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_descriptions (
    id TEXT PRIMARY KEY,
    description_text TEXT NULL,
    description_code TEXT NULL,
    maintenance_type TEXT NULL,
    language_code TEXT NULL,
    product_id TEXT NOT NULL,
    sequence INTEGER NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pricings (
    id TEXT PRIMARY KEY,
    price_sheet_number TEXT NULL,
    currency_code TEXT NULL,
    price REAL NULL,
    price_type TEXT NULL,
    maintenance_type TEXT NULL,
    product_id TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_attributes (
    id TEXT PRIMARY KEY,
    attribute_id TEXT NULL,
    padb_attribute TEXT NULL,
    record_number INTEGER NULL,
    multi_value_quantity INTEGER NULL,
    multi_value_sequence INTEGER NULL,
    language_code TEXT NULL,
    product_id TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS extended_product_informations (
    id TEXT PRIMARY KEY,
    expi_code TEXT NULL,
    description_text TEXT NULL,
    maintenance_type TEXT NULL,
    language_code TEXT NULL,
    product_id TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    package_id INTEGER NULL,
    package_uom TEXT NULL,
    quantity_of_eaches INTEGER NULL,
    dimensions_height REAL NULL,
    dimensions_width REAL NULL,
    dimensions_length REAL NULL,
    package_weight REAL NULL,
    weight_uom TEXT NULL,
    maintenance_type TEXT NULL,
    product_id TEXT NOT NULL UNIQUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS digital_assets (
    id TEXT PRIMARY KEY,
    file_name TEXT NULL,
    asset_type TEXT NULL,
    file_type TEXT NULL,
    uri TEXT NOT NULL,
    country TEXT NULL,
    maintenance_type TEXT NULL,
    product_id TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    price_type TEXT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    order_id TEXT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    urls TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    support_ticket_id TEXT NULL,
    FOREIGN KEY (support_ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shipping_labels (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    label_url TEXT NULL,
    tracking_number TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_pages (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NULL,
    actor_role TEXT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NULL,
    message TEXT NOT NULL,
    ip_address TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);
