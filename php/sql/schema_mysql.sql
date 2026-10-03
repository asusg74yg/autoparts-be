-- MySQL Database Schema

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    business_name VARCHAR(255) NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    country VARCHAR(100) NULL,
    password_hash VARCHAR(255) NOT NULL,
    refresh_token TEXT NULL,
    otp_code BIGINT NULL,
    otp_expires_at DATETIME NULL,
    email_verified TINYINT(1) DEFAULT 0,
    approved TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    make VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number INT AUTO_INCREMENT UNIQUE KEY,
    user_id VARCHAR(36) NULL,
    shipping_status VARCHAR(20) DEFAULT 'PENDING',
    shipping_cost DOUBLE DEFAULT 0,
    stripe_session_id VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS additional_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    shipping_full_name VARCHAR(255) NOT NULL,
    shipping_email VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_zip_code VARCHAR(10) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    billing_full_name VARCHAR(255) NULL,
    billing_email VARCHAR(255) NULL,
    billing_address TEXT NULL,
    billing_city VARCHAR(100) NULL,
    billing_state VARCHAR(100) NULL,
    billing_zip_code VARCHAR(10) NULL,
    billing_country VARCHAR(100) NULL,
    billing_phone VARCHAR(20) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NULL,
    email_address VARCHAR(255) NULL,
    brand_label VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS base_vehicles (
    id VARCHAR(36) PRIMARY KEY,
    base_vehicle_id INT NOT NULL,
    year INT NULL,
    model VARCHAR(255) NULL,
    vehicle_type VARCHAR(255) NULL,
    vehicle_type_group VARCHAR(255) NULL,
    make VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS sub_models (
    id VARCHAR(36) PRIMARY KEY,
    sub_model VARCHAR(255) NULL,
    region_abbr VARCHAR(50) NULL,
    region_name VARCHAR(255) NULL,
    base_vehicle_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (base_vehicle_id) REFERENCES base_vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region_id INT NULL,
    parent_id INT NULL,
    region_abbr VARCHAR(50) NULL,
    region_name VARCHAR(255) NULL,
    submodel_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (submodel_id) REFERENCES sub_models(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS engine_bases (
    id VARCHAR(36) PRIMARY KEY,
    engine_base_id INT NOT NULL,
    liter VARCHAR(50) NULL,
    cc VARCHAR(50) NULL,
    cid VARCHAR(50) NULL,
    cylinders VARCHAR(50) NULL,
    block_type VARCHAR(50) NULL,
    eng_bore_in VARCHAR(50) NULL,
    eng_bore_metric VARCHAR(50) NULL,
    eng_stroke_in VARCHAR(50) NULL,
    eng_stroke_metric VARCHAR(50) NULL
);

CREATE TABLE IF NOT EXISTS engine_designations (
    id VARCHAR(36) PRIMARY KEY,
    engine_designation_id INT NOT NULL,
    engine_designation VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS engine_versions (
    id VARCHAR(36) PRIMARY KEY,
    engine_version_id INT NOT NULL,
    engine_version VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS engine_mfrs (
    id VARCHAR(36) PRIMARY KEY,
    engine_mfr_id INT NOT NULL,
    engine_mfr VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS fuel_types (
    id VARCHAR(36) PRIMARY KEY,
    fuel_type_id INT NOT NULL,
    fuel_type VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS brand_aaiaids (
    id VARCHAR(36) PRIMARY KEY,
    brand_aaiaid_id VARCHAR(255) NOT NULL,
    brand_aaiaid VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    mfr_label VARCHAR(255) NULL,
    part VARCHAR(255) NULL,
    action VARCHAR(50) NULL,
    hazard_material_code VARCHAR(50) NULL,
    part_number VARCHAR(255) NULL,
    brand_label VARCHAR(255) NULL,
    aces_applications TEXT NULL,
    item_quantity_size INT NULL,
    container_type VARCHAR(100) NULL,
    quantity_per_application INT NULL,
    minimum_order_quantity INT NULL,
    part_terminology_id INT NOT NULL,
    maintenance_type VARCHAR(100) NULL,
    part_type_id VARCHAR(36) NULL,
    base_vehicle_id VARCHAR(36) NOT NULL,
    engine_base_id VARCHAR(36) NOT NULL,
    engine_designation_id VARCHAR(36) NOT NULL,
    engine_version_id VARCHAR(36) NOT NULL,
    engine_mfr_id VARCHAR(36) NOT NULL,
    fuel_type_id VARCHAR(36) NOT NULL,
    brand_aaiaid_id VARCHAR(36) NOT NULL,
    rating DOUBLE DEFAULT 0,
    FOREIGN KEY (base_vehicle_id) REFERENCES base_vehicles(id),
    FOREIGN KEY (engine_base_id) REFERENCES engine_bases(id),
    FOREIGN KEY (engine_designation_id) REFERENCES engine_designations(id),
    FOREIGN KEY (engine_version_id) REFERENCES engine_versions(id),
    FOREIGN KEY (engine_mfr_id) REFERENCES engine_mfrs(id),
    FOREIGN KEY (fuel_type_id) REFERENCES fuel_types(id),
    FOREIGN KEY (brand_aaiaid_id) REFERENCES brand_aaiaids(id)
);

CREATE TABLE IF NOT EXISTS part_types (
    id VARCHAR(36) PRIMARY KEY,
    part_type_id INT NOT NULL,
    part_type_name VARCHAR(255) NULL,
    part_type_description TEXT NULL,
    category VARCHAR(255) NULL,
    subcategory VARCHAR(255) NULL,
    product_id VARCHAR(36) NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_descriptions (
    id VARCHAR(36) PRIMARY KEY,
    description_text TEXT NULL,
    description_code VARCHAR(50) NULL,
    maintenance_type VARCHAR(50) NULL,
    language_code VARCHAR(20) NULL,
    product_id VARCHAR(36) NOT NULL,
    sequence INT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pricings (
    id VARCHAR(36) PRIMARY KEY,
    price_sheet_number VARCHAR(100) NULL,
    currency_code VARCHAR(10) NULL,
    price DOUBLE NULL,
    price_type VARCHAR(50) NULL,
    maintenance_type VARCHAR(50) NULL,
    product_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_attributes (
    id VARCHAR(36) PRIMARY KEY,
    attribute_id VARCHAR(100) NULL,
    padb_attribute VARCHAR(255) NULL,
    record_number INT NULL,
    multi_value_quantity INT NULL,
    multi_value_sequence INT NULL,
    language_code VARCHAR(20) NULL,
    product_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS extended_product_informations (
    id VARCHAR(36) PRIMARY KEY,
    expi_code VARCHAR(50) NULL,
    description_text TEXT NULL,
    maintenance_type VARCHAR(50) NULL,
    language_code VARCHAR(20) NULL,
    product_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(36) PRIMARY KEY,
    package_id INT NULL,
    package_uom VARCHAR(50) NULL,
    quantity_of_eaches INT NULL,
    dimensions_height DOUBLE NULL,
    dimensions_width DOUBLE NULL,
    dimensions_length DOUBLE NULL,
    package_weight DOUBLE NULL,
    weight_uom VARCHAR(50) NULL,
    maintenance_type VARCHAR(50) NULL,
    product_id VARCHAR(36) NOT NULL UNIQUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS digital_assets (
    id VARCHAR(36) PRIMARY KEY,
    file_name VARCHAR(255) NULL,
    asset_type VARCHAR(50) NULL,
    file_type VARCHAR(50) NULL,
    uri TEXT NOT NULL,
    country VARCHAR(100) NULL,
    maintenance_type VARCHAR(50) NULL,
    product_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    price DOUBLE NOT NULL,
    price_type VARCHAR(50) NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    urls TEXT NOT NULL, -- JSON array string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    support_ticket_id VARCHAR(36) NULL,
    FOREIGN KEY (support_ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shipping_labels (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL UNIQUE,
    label_url TEXT NULL,
    tracking_number VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_pages (
    id VARCHAR(36) PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    actor_id VARCHAR(36) NULL,
    actor_role VARCHAR(20) NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(36) NULL,
    message TEXT NOT NULL,
    ip_address VARCHAR(50) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);
