<?php
// php/api/router.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../helpers/ingestion.php';

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to match route path patterns e.g. /api/users/:id
function match_route(string $pattern, string $uri, &$params = []): bool {
    $pattern_regex = preg_replace('/:([a-zA-Z0-9_]+)/', '(?P<$1>[^/]+)', $pattern);
    $pattern_regex = '#^' . $pattern_regex . '$#';
    if (preg_match($pattern_regex, $uri, $matches)) {
        foreach ($matches as $key => $value) {
            if (is_string($key)) {
                $params[$key] = $value;
            }
        }
        return true;
    }
    return false;
}

$db = get_db_connection();
$input = get_json_input();
$params = [];

// ==========================================
// 1. AUTH ROUTES
// ==========================================
if ($uri === '/api/auth/signup' && $method === 'POST') {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $contactName = $input['contactName'] ?? '';
    $role = strtoupper($input['role'] ?? 'USER');
    $businessName = $input['businessName'] ?? null;
    $phone = $input['phone'] ?? null;
    $address = $input['address'] ?? null;
    $country = $input['country'] ?? null;

    if (empty($email) || empty($password) || empty($contactName)) {
        send_error_response('Missing required fields: email, password, contactName');
    }

    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        send_error_response('User with this email already exists', 400);
    }

    $id = generate_uuid();
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $db->prepare("INSERT INTO users (id, role, business_name, contact_name, email, phone, address, country, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $role, $businessName, $contactName, $email, $phone, $address, $country, $passwordHash]);

    $payload = ['id' => $id, 'email' => $email, 'role' => $role, 'contactName' => $contactName];
    $accessToken = jwt_encode($payload, 86400);
    $refreshToken = jwt_encode($payload, 604800);

    $db->prepare("UPDATE users SET refresh_token = ? WHERE id = ?")->execute([$refreshToken, $id]);

    $_SESSION['user'] = $payload;

    send_json_response([
        'message' => 'User created successfully',
        'user' => $payload,
        'accessToken' => $accessToken,
        'refreshToken' => $refreshToken
    ], 201);
}

if ($uri === '/api/auth/signin' && $method === 'POST') {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        send_error_response('Missing email or password');
    }

    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        send_error_response('Invalid credentials', 401);
    }

    $payload = ['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role'], 'contactName' => $user['contact_name']];
    $accessToken = jwt_encode($payload, 86400);
    $refreshToken = jwt_encode($payload, 604800);

    $db->prepare("UPDATE users SET refresh_token = ? WHERE id = ?")->execute([$refreshToken, $user['id']]);

    $_SESSION['user'] = $payload;

    send_json_response([
        'message' => 'Login successful',
        'user' => $payload,
        'accessToken' => $accessToken,
        'refreshToken' => $refreshToken
    ]);
}

if ($uri === '/api/auth/logout' && $method === 'POST') {
    unset($_SESSION['user']);
    session_destroy();
    send_json_response(['message' => 'Logged out successfully']);
}

if ($uri === '/api/auth/me' && $method === 'GET') {
    $user = require_auth();
    $stmt = $db->prepare("SELECT id, role, business_name as businessName, contact_name as contactName, email, phone, address, country, email_verified as emailVerified, approved, created_at as createdAt FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch();
    send_json_response($profile ?: $user);
}

// ==========================================
// 2. USER ROUTES
// ==========================================
if ($uri === '/api/users' && $method === 'GET') {
    require_roles(['ADMIN', 'STAFF']);
    $stmt = $db->query("SELECT id, role, business_name as businessName, contact_name as contactName, email, phone, address, country, created_at as createdAt FROM users");
    send_json_response($stmt->fetchAll());
}

if (match_route('/api/users/:id', $uri, $params) && $method === 'GET') {
    require_auth();
    $stmt = $db->prepare("SELECT id, role, business_name as businessName, contact_name as contactName, email, phone, address, country, created_at as createdAt FROM users WHERE id = ?");
    $stmt->execute([$params['id']]);
    $u = $stmt->fetch();
    if (!$u) send_error_response('User not found', 404);
    send_json_response($u);
}

if (match_route('/api/users/:id', $uri, $params) && ($method === 'PUT' || $method === 'PATCH')) {
    $authUser = require_auth();
    if ($authUser['id'] !== $params['id'] && !in_array(strtoupper($authUser['role']), ['ADMIN', 'STAFF'])) {
        send_error_response('Forbidden', 403);
    }
    $contactName = $input['contactName'] ?? null;
    $phone = $input['phone'] ?? null;
    $address = $input['address'] ?? null;

    $stmt = $db->prepare("UPDATE users SET contact_name = COALESCE(?, contact_name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?");
    $stmt->execute([$contactName, $phone, $address, $params['id']]);

    send_json_response(['message' => 'User updated successfully']);
}

if (match_route('/api/users/:id', $uri, $params) && $method === 'DELETE') {
    require_roles(['ADMIN']);
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$params['id']]);
    send_json_response(['message' => 'User deleted successfully']);
}

// ==========================================
// 3. VEHICLE ROUTES
// ==========================================
if ($uri === '/api/vehicles' && $method === 'GET') {
    $user = require_auth();
    $stmt = $db->prepare("SELECT * FROM vehicles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    send_json_response($stmt->fetchAll());
}

if ($uri === '/api/vehicles' && $method === 'POST') {
    $user = require_auth();
    $id = generate_uuid();
    $brand = $input['brand'] ?? '';
    $model = $input['model'] ?? '';
    $year = (int)($input['year'] ?? 0);
    $make = $input['make'] ?? '';

    $stmt = $db->prepare("INSERT INTO vehicles (id, user_id, brand, model, year, make) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $user['id'], $brand, $model, $year, $make]);
    send_json_response(['id' => $id, 'message' => 'Vehicle created'], 201);
}

if (match_route('/api/vehicles/:id', $uri, $params) && $method === 'DELETE') {
    $user = require_auth();
    $stmt = $db->prepare("DELETE FROM vehicles WHERE id = ? AND user_id = ?");
    $stmt->execute([$params['id'], $user['id']]);
    send_json_response(['message' => 'Vehicle deleted']);
}

// ==========================================
// 4. PRODUCT & FITMENT SEARCH ROUTES
// ==========================================
if ($uri === '/api/products' && $method === 'GET') {
    $make = $_GET['make'] ?? null;
    $model = $_GET['model'] ?? null;
    $year = $_GET['year'] ?? null;

    if ($make || $model || $year) {
        $sql = "SELECT p.*, bv.make, bv.model, bv.year FROM products p JOIN base_vehicles bv ON p.base_vehicle_id = bv.id WHERE 1=1";
        $binds = [];
        if ($make) { $sql .= " AND bv.make LIKE ?"; $binds[] = "%{$make}%"; }
        if ($model) { $sql .= " AND bv.model LIKE ?"; $binds[] = "%{$model}%"; }
        if ($year) { $sql .= " AND bv.year = ?"; $binds[] = (int)$year; }
        $sql .= " LIMIT 100";
        $stmt = $db->prepare($sql);
        $stmt->execute($binds);
    } else {
        $stmt = $db->query("SELECT * FROM products LIMIT 100");
    }

    $products = $stmt->fetchAll();
    send_json_response($products);
}

if (match_route('/api/products/:id', $uri, $params) && $method === 'GET') {
    $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$params['id']]);
    $p = $stmt->fetch();
    if (!$p) send_error_response('Product not found', 404);

    // Load related descriptions, pricings, attributes, packages, digital assets
    $p['descriptions'] = $db->prepare("SELECT * FROM product_descriptions WHERE product_id = ?");
    $p['descriptions']->execute([$params['id']]);
    $p['descriptions'] = $p['descriptions']->fetchAll();

    $p['pricings'] = $db->prepare("SELECT * FROM pricings WHERE product_id = ?");
    $p['pricings']->execute([$params['id']]);
    $p['pricings'] = $p['pricings']->fetchAll();

    $p['digitalAssets'] = $db->prepare("SELECT * FROM digital_assets WHERE product_id = ?");
    $p['digitalAssets']->execute([$params['id']]);
    $p['digitalAssets'] = $p['digitalAssets']->fetchAll();

    send_json_response($p);
}

if ($uri === '/api/products' && $method === 'POST') {
    require_roles(['ADMIN', 'SUPPLIER']);
    $id = generate_uuid();
    $partNumber = $input['partNumber'] ?? '';
    $brandLabel = $input['brandLabel'] ?? '';
    $part = $input['part'] ?? '';
    $rating = (float)($input['rating'] ?? 0);

    // Provide default foreign keys if empty
    $baseVehicleId = $input['baseVehicleId'] ?? generate_uuid();
    $engineBaseId = $input['engineBaseId'] ?? generate_uuid();
    $engineDesignationId = $input['engineDesignationId'] ?? generate_uuid();
    $engineVersionId = $input['engineVersionId'] ?? generate_uuid();
    $engineMfrId = $input['engineMfrId'] ?? generate_uuid();
    $fuelTypeId = $input['fuelTypeId'] ?? generate_uuid();
    $brandAaiaidId = $input['brandAaiaidId'] ?? generate_uuid();
    $partTerminologyId = (int)($input['partTerminologyId'] ?? 1);

    // Ensure referenced tables have placeholder records if needed
    $db_driver = getenv('DB_DRIVER') ?: 'sqlite';
    $ignoreClause = ($db_driver === 'mysql') ? "INSERT IGNORE INTO" : "INSERT OR IGNORE INTO";

    $db->prepare("{$ignoreClause} base_vehicles (id, base_vehicle_id) VALUES (?, 1)")->execute([$baseVehicleId]);
    $db->prepare("{$ignoreClause} engine_bases (id, engine_base_id) VALUES (?, 1)")->execute([$engineBaseId]);
    $db->prepare("{$ignoreClause} engine_designations (id, engine_designation_id) VALUES (?, 1)")->execute([$engineDesignationId]);
    $db->prepare("{$ignoreClause} engine_versions (id, engine_version_id) VALUES (?, 1)")->execute([$engineVersionId]);
    $db->prepare("{$ignoreClause} engine_mfrs (id, engine_mfr_id) VALUES (?, 1)")->execute([$engineMfrId]);
    $db->prepare("{$ignoreClause} fuel_types (id, fuel_type_id) VALUES (?, 1)")->execute([$fuelTypeId]);
    $db->prepare("{$ignoreClause} brand_aaiaids (id, brand_aaiaid_id) VALUES (?, 'DEFAULT')")->execute([$brandAaiaidId]);

    $stmt = $db->prepare("INSERT INTO products (id, part_number, brand_label, part, rating, part_terminology_id, base_vehicle_id, engine_base_id, engine_designation_id, engine_version_id, engine_mfr_id, fuel_type_id, brand_aaiaid_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $partNumber, $brandLabel, $part, $rating, $partTerminologyId, $baseVehicleId, $engineBaseId, $engineDesignationId, $engineVersionId, $engineMfrId, $fuelTypeId, $brandAaiaidId]);

    send_json_response(['id' => $id, 'message' => 'Product created successfully'], 201);
}

// ==========================================
// 5. INGESTION & ETL ROUTE (ACES / PIES)
// ==========================================
if ($uri === '/api/acespies/ingest' && $method === 'POST') {
    require_roles(['ADMIN', 'SUPPLIER']);

    if (!empty($_FILES['file']['tmp_name'])) {
        $raw = file_get_contents($_FILES['file']['tmp_name']);
        $items = json_decode($raw, true);
        if (is_array($items)) {
            $count = 0;
            foreach ($items as $item) {
                if (ingest_aces_pies_item($item)) {
                    $count++;
                }
            }
            send_json_response(['message' => "Successfully ingested {$count} ACES/PIES items"]);
        } else {
            send_error_response('Invalid JSON file format');
        }
    } elseif (!empty($input['items']) && is_array($input['items'])) {
        $count = 0;
        foreach ($input['items'] as $item) {
            if (ingest_aces_pies_item($item)) {
                $count++;
            }
        }
        send_json_response(['message' => "Successfully ingested {$count} ACES/PIES items"]);
    } else {
        send_error_response('No file or JSON items provided for ingestion');
    }
}

// ==========================================
// 6. ORDER ROUTES
// ==========================================
if ($uri === '/api/orders' && $method === 'GET') {
    $user = require_auth();
    if (in_array(strtoupper($user['role']), ['ADMIN', 'STAFF'])) {
        $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
    } else {
        $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user['id']]);
    }
    send_json_response($stmt->fetchAll());
}

if ($uri === '/api/orders' && $method === 'POST') {
    $user = get_authenticated_user();
    $userId = $user['id'] ?? null;
    $id = generate_uuid();
    $shippingCost = (float)($input['shippingCost'] ?? 0);
    $items = $input['items'] ?? [];

    $stmt = $db->prepare("INSERT INTO orders (id, user_id, shipping_cost, shipping_status) VALUES (?, ?, ?, 'PENDING')");
    $stmt->execute([$id, $userId, $shippingCost]);

    foreach ($items as $item) {
        $itemId = generate_uuid();
        $prodId = $item['productId'];
        $qty = (int)($item['quantity'] ?? 1);
        $price = (float)($item['price'] ?? 0);
        $db->prepare("INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)")
           ->execute([$itemId, $id, $prodId, $qty, $price]);
    }

    send_json_response(['id' => $id, 'message' => 'Order created successfully'], 201);
}

if (match_route('/api/orders/:id', $uri, $params) && $method === 'GET') {
    $user = require_auth();
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$params['id']]);
    $order = $stmt->fetch();
    if (!$order) send_error_response('Order not found', 404);

    $itemsStmt = $db->prepare("SELECT oi.*, p.part_number, p.brand_label FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
    $itemsStmt->execute([$params['id']]);
    $order['items'] = $itemsStmt->fetchAll();

    send_json_response($order);
}

// ==========================================
// 7. SUPPORT TICKET ROUTES
// ==========================================
if ($uri === '/api/support' && $method === 'GET') {
    $user = require_auth();
    if (in_array(strtoupper($user['role']), ['ADMIN', 'STAFF'])) {
        $stmt = $db->query("SELECT * FROM support_tickets ORDER BY created_at DESC");
    } else {
        $stmt = $db->prepare("SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user['id']]);
    }
    send_json_response($stmt->fetchAll());
}

if ($uri === '/api/support' && $method === 'POST') {
    $user = require_auth();
    $id = generate_uuid();
    $subject = $input['subject'] ?? '';
    $message = $input['message'] ?? '';
    $orderId = $input['orderId'] ?? null;

    $stmt = $db->prepare("INSERT INTO support_tickets (id, user_id, order_id, subject, message, status) VALUES (?, ?, ?, ?, ?, 'OPEN')");
    $stmt->execute([$id, $user['id'], $orderId, $subject, $message]);

    // Handle uploaded file attachments if any
    $uploaded_urls = handle_file_uploads('files', __DIR__ . '/../public/uploads/');
    if (!empty($uploaded_urls)) {
        $fileId = generate_uuid();
        $urls_json = json_encode($uploaded_urls);
        $db->prepare("INSERT INTO files (id, urls, support_ticket_id) VALUES (?, ?, ?)")
           ->execute([$fileId, $urls_json, $id]);
    }

    send_json_response(['id' => $id, 'message' => 'Support ticket created successfully'], 201);
}

// ==========================================
// 8. REVIEW ROUTES
// ==========================================
if ($uri === '/api/reviews' && $method === 'GET') {
    $productId = $_GET['productId'] ?? null;
    if ($productId) {
        $stmt = $db->prepare("SELECT r.*, u.contact_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC");
        $stmt->execute([$productId]);
    } else {
        $stmt = $db->query("SELECT r.*, u.contact_name FROM reviews r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC");
    }
    send_json_response($stmt->fetchAll());
}

if ($uri === '/api/reviews' && $method === 'POST') {
    $user = require_auth();
    $id = generate_uuid();
    $productId = $input['productId'] ?? '';
    $rating = (int)($input['rating'] ?? 5);
    $comment = $input['comment'] ?? '';

    $stmt = $db->prepare("INSERT INTO reviews (id, user_id, product_id, rating, comment) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$id, $user['id'], $productId, $rating, $comment]);

    send_json_response(['id' => $id, 'message' => 'Review submitted successfully'], 201);
}

// ==========================================
// 9. SUPPLIER ROUTES
// ==========================================
if ($uri === '/api/suppliers' && $method === 'GET') {
    $stmt = $db->query("SELECT * FROM suppliers ORDER BY created_at DESC");
    send_json_response($stmt->fetchAll());
}

if ($uri === '/api/suppliers' && $method === 'POST') {
    require_roles(['ADMIN', 'STAFF']);
    $id = generate_uuid();
    $name = $input['name'] ?? '';
    $contact = $input['contact'] ?? '';
    $emailAddress = $input['emailAddress'] ?? '';
    $brandLabel = $input['brandLabel'] ?? '';

    $stmt = $db->prepare("INSERT INTO suppliers (id, name, contact, email_address, brand_label) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$id, $name, $contact, $emailAddress, $brandLabel]);

    send_json_response(['id' => $id, 'message' => 'Supplier created'], 201);
}

// ==========================================
// 10. PROMOTION ROUTES
// ==========================================
if ($uri === '/api/promotions' && $method === 'GET') {
    $stmt = $db->query("SELECT * FROM promotions ORDER BY created_at DESC");
    send_json_response($stmt->fetchAll());
}

if ($uri === '/api/promotions' && $method === 'POST') {
    require_roles(['ADMIN', 'STAFF']);
    $id = generate_uuid();
    $title = $input['title'] ?? '';
    $imageUrl = $input['imageUrl'] ?? '';

    $stmt = $db->prepare("INSERT INTO promotions (id, title, image_url) VALUES (?, ?, ?)");
    $stmt->execute([$id, $title, $imageUrl]);

    send_json_response(['id' => $id, 'message' => 'Promotion created'], 201);
}

// ==========================================
// 11. CMS ROUTES
// ==========================================
if ($uri === '/api/cms' && $method === 'GET') {
    $stmt = $db->query("SELECT * FROM cms_pages ORDER BY created_at DESC");
    send_json_response($stmt->fetchAll());
}

if (match_route('/api/cms/:slug', $uri, $params) && $method === 'GET') {
    $stmt = $db->prepare("SELECT * FROM cms_pages WHERE slug = ?");
    $stmt->execute([$params['slug']]);
    $cms = $stmt->fetch();
    if (!$cms) send_error_response('CMS page not found', 404);
    send_json_response($cms);
}

if ($uri === '/api/cms' && $method === 'POST') {
    require_roles(['ADMIN', 'STAFF']);
    $id = generate_uuid();
    $slug = $input['slug'] ?? '';
    $title = $input['title'] ?? '';
    $content = $input['content'] ?? '';
    $status = $input['status'] ?? 'DRAFT';

    $stmt = $db->prepare("INSERT INTO cms_pages (id, slug, title, content, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$id, $slug, $title, $content, $status]);

    send_json_response(['id' => $id, 'message' => 'CMS page created'], 201);
}

// ==========================================
// 12. EMAIL TEMPLATE ROUTES
// ==========================================
if ($uri === '/api/email-templates' && $method === 'GET') {
    require_roles(['ADMIN', 'STAFF']);
    $stmt = $db->query("SELECT * FROM email_templates");
    send_json_response($stmt->fetchAll());
}

if ($uri === '/api/email-templates' && $method === 'POST') {
    require_roles(['ADMIN', 'STAFF']);
    $id = generate_uuid();
    $name = $input['name'] ?? '';
    $subject = $input['subject'] ?? '';
    $body = $input['body'] ?? '';

    $stmt = $db->prepare("INSERT INTO email_templates (id, name, subject, body) VALUES (?, ?, ?, ?)");
    $stmt->execute([$id, $name, $subject, $body]);

    send_json_response(['id' => $id, 'message' => 'Email template created'], 201);
}

// ==========================================
// 13. ACTIVITY LOG ROUTES
// ==========================================
if ($uri === '/api/activity-logs' && $method === 'GET') {
    require_roles(['ADMIN', 'STAFF']);
    $stmt = $db->query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100");
    send_json_response($stmt->fetchAll());
}

// If no route matches
send_error_response("Endpoint {$method} {$uri} not found", 404);
