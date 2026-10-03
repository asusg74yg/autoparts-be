<?php
// php/seeder/seed.php

require_once __DIR__ . '/../config/database.php';

echo "Starting Database Seeder...\n";

$db = get_db_connection();
$db_driver = getenv('DB_DRIVER') ?: 'sqlite';

// 1. Initialize Tables from SQL Schema
echo "Initializing database tables...\n";
if ($db_driver === 'mysql') {
    $schema_sql = file_get_contents(__DIR__ . '/../sql/schema_mysql.sql');
} else {
    $schema_sql = file_get_contents(__DIR__ . '/../sql/schema_sqlite.sql');
}

$db->exec($schema_sql);
echo "Tables initialized successfully.\n";

// 2. Seed Default Admin User
echo "Seeding Admin User...\n";
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute(['admin@example.com']);
if (!$stmt->fetch()) {
    $adminId = generate_uuid();
    $hash = password_hash('Admin123!', PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO users (id, role, contact_name, email, password_hash, email_verified, approved) VALUES (?, 'ADMIN', 'System Admin', 'admin@example.com', ?, 1, 1)");
    $stmt->execute([$adminId, $hash]);
    echo "Admin user created: admin@example.com / Admin123!\n";
} else {
    echo "Admin user already exists.\n";
}

// 3. Seed CMS Pages
echo "Seeding CMS Pages...\n";
$cms_pages = [
    [
        'id' => generate_uuid(),
        'slug' => 'home',
        'title' => 'Welcome to AutoCare Catalog',
        'content' => '<h1>Welcome to AutoCare Parts Catalog</h1><p>Your one-stop solution for automotive parts and ACES/PIES standards data.</p>',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => generate_uuid(),
        'slug' => 'about-us',
        'title' => 'About Us',
        'content' => '<h1>About Us</h1><p>We provide high quality automotive parts and ACES/PIES compatibility datasets.</p>',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => generate_uuid(),
        'slug' => 'terms',
        'title' => 'Terms and Conditions',
        'content' => '<h1>Terms and Conditions</h1><p>Please review our standard terms of service.</p>',
        'status' => 'PUBLISHED'
    ]
];

foreach ($cms_pages as $page) {
    $check = $db->prepare("SELECT id FROM cms_pages WHERE slug = ?");
    $check->execute([$page['slug']]);
    if (!$check->fetch()) {
        $stmt = $db->prepare("INSERT INTO cms_pages (id, slug, title, content, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$page['id'], $page['slug'], $page['title'], $page['content'], $page['status']]);
    }
}
echo "CMS Pages seeded.\n";

// 4. Seed Sample Products and AutoCare ACES/PIES Data
echo "Seeding Sample AutoCare Products...\n";

$sample_parts = [
    ['partNumber' => 'AC-1001', 'brandLabel' => 'Bosch', 'part' => 'Oil Filter', 'rating' => 4.8, 'price' => 12.99, 'desc' => 'Premium engine oil filter designed for maximum filtration and durability.'],
    ['partNumber' => 'AC-1002', 'brandLabel' => 'ACDelco', 'part' => 'Brake Pad Set', 'rating' => 4.6, 'price' => 45.50, 'desc' => 'Ceramic disc brake pad set with noise reduction shims.'],
    ['partNumber' => 'AC-1003', 'brandLabel' => 'NGK', 'part' => 'Iridium Spark Plug', 'rating' => 4.9, 'price' => 8.99, 'desc' => 'High performance laser iridium spark plug for optimal fuel efficiency.'],
    ['partNumber' => 'AC-1004', 'brandLabel' => 'Monroe', 'part' => 'Shock Absorber', 'rating' => 4.4, 'price' => 78.25, 'desc' => 'Rear gas-matic shock absorber for smooth ride comfort.'],
    ['partNumber' => 'AC-1005', 'brandLabel' => 'Gates', 'part' => 'Serpentine Belt', 'rating' => 4.7, 'price' => 24.99, 'desc' => 'Heavy duty micro-v serpentine belt.']
];

$db->beginTransaction();
try {
    foreach ($sample_parts as $p) {
        $check = $db->prepare("SELECT id FROM products WHERE part_number = ?");
        $check->execute([$p['partNumber']]);
        if ($check->fetch()) continue;

        $baseVehicleId = generate_uuid();
        $engineBaseId = generate_uuid();
        $engineDesignationId = generate_uuid();
        $engineVersionId = generate_uuid();
        $engineMfrId = generate_uuid();
        $fuelTypeId = generate_uuid();
        $brandAaiaidId = generate_uuid();
        $productId = generate_uuid();

        // Base Vehicle
        $db->prepare("INSERT INTO base_vehicles (id, base_vehicle_id, year, model, vehicle_type, make) VALUES (?, ?, 2022, 'Civic', 'Passenger Car', 'Honda')")
           ->execute([$baseVehicleId, rand(1000, 9999)]);

        // Engine Base
        $db->prepare("INSERT INTO engine_bases (id, engine_base_id, liter, cc, cylinders) VALUES (?, ?, '2.0L', '1996', '4')")
           ->execute([$engineBaseId, rand(1000, 9999)]);

        // Engine Designation
        $db->prepare("INSERT INTO engine_designations (id, engine_designation_id, engine_designation) VALUES (?, ?, 'K20C2')")
           ->execute([$engineDesignationId, rand(100, 9999)]);

        // Engine Version
        $db->prepare("INSERT INTO engine_versions (id, engine_version_id, engine_version) VALUES (?, ?, 'v1.0')")
           ->execute([$engineVersionId, rand(100, 9999)]);

        // Engine Mfr
        $db->prepare("INSERT INTO engine_mfrs (id, engine_mfr_id, engine_mfr) VALUES (?, ?, 'Honda')")
           ->execute([$engineMfrId, rand(100, 9999)]);

        // Fuel Type
        $db->prepare("INSERT INTO fuel_types (id, fuel_type_id, fuel_type) VALUES (?, ?, 'Gasoline')")
           ->execute([$fuelTypeId, rand(1, 100)]);

        // Brand AAIAID
        $db->prepare("INSERT INTO brand_aaiaids (id, brand_aaiaid_id, brand_aaiaid) VALUES (?, 'BOSCH', ?)")
           ->execute([$brandAaiaidId, $p['brandLabel']]);

        // Product
        $db->prepare("INSERT INTO products (id, part_number, brand_label, part, rating, part_terminology_id, base_vehicle_id, engine_base_id, engine_designation_id, engine_version_id, engine_mfr_id, fuel_type_id, brand_aaiaid_id) VALUES (?, ?, ?, ?, ?, 100, ?, ?, ?, ?, ?, ?, ?)")
           ->execute([$productId, $p['partNumber'], $p['brandLabel'], $p['part'], $p['rating'], $baseVehicleId, $engineBaseId, $engineDesignationId, $engineVersionId, $engineMfrId, $fuelTypeId, $brandAaiaidId]);

        // Product Description & Price
        $db->prepare("INSERT INTO product_descriptions (id, description_text, language_code, product_id) VALUES (?, ?, 'EN', ?)")
           ->execute([generate_uuid(), $p['desc'], $productId]);

        $db->prepare("INSERT INTO pricings (id, price, currency_code, price_type, product_id) VALUES (?, ?, 'USD', 'LIST', ?)")
           ->execute([generate_uuid(), $p['price'], $productId]);
    }
    $db->commit();
    echo "Sample products seeded.\n";
} catch (Exception $e) {
    $db->rollBack();
    echo "Error seeding products: " . $e->getMessage() . "\n";
}

echo "Database Seeder Finished Successfully.\n";
