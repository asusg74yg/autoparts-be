<?php
// php/helpers/ingestion.php

require_once __DIR__ . '/../config/database.php';

/**
 * Ingests a single ACES/PIES merged item into MySQL/SQLite database.
 */
function ingest_aces_pies_item(array $item): bool {
    $db = get_db_connection();

    try {
        $baseVehicleId = generate_uuid();
        $engineBaseId = generate_uuid();
        $engineDesignationId = generate_uuid();
        $engineVersionId = generate_uuid();
        $engineMfrId = generate_uuid();
        $fuelTypeId = generate_uuid();
        $brandAaiaidId = generate_uuid();
        $partTypeId = generate_uuid();
        $productId = generate_uuid();

        // 1. Base Vehicle
        $bv_id = $item['BaseVehicle']['id'] ?? rand(1000, 99999);
        $bv_data = $item['BaseVehicle']['data'] ?? [];
        $stmt = $db->prepare("SELECT id FROM base_vehicles WHERE base_vehicle_id = ?");
        $stmt->execute([$bv_id]);
        $existing_bv = $stmt->fetch();
        if ($existing_bv) {
            $baseVehicleId = $existing_bv['id'];
        } else {
            $db->prepare("INSERT INTO base_vehicles (id, base_vehicle_id, year, model, vehicle_type, vehicle_type_group, make) VALUES (?, ?, ?, ?, ?, ?, ?)")
               ->execute([
                   $baseVehicleId,
                   $bv_id,
                   $bv_data['Year'] ?? null,
                   $bv_data['Model'] ?? null,
                   $bv_data['VehicleType'] ?? null,
                   $bv_data['VehicleTypeGroup'] ?? null,
                   $bv_data['Make'] ?? null
               ]);
        }

        // 2. Engine Base
        $eb_id = $item['EngineBase']['id'] ?? rand(1000, 99999);
        $eb_data = $item['EngineBase']['data']['EngineBase'] ?? [];
        $stmt = $db->prepare("SELECT id FROM engine_bases WHERE engine_base_id = ?");
        $stmt->execute([$eb_id]);
        $existing_eb = $stmt->fetch();
        if ($existing_eb) {
            $engineBaseId = $existing_eb['id'];
        } else {
            $db->prepare("INSERT INTO engine_bases (id, engine_base_id, liter, cc, cid, cylinders, block_type, eng_bore_in, eng_bore_metric, eng_stroke_in, eng_stroke_metric) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
               ->execute([
                   $engineBaseId,
                   $eb_id,
                   $eb_data['Liter'] ?? null,
                   $eb_data['CC'] ?? null,
                   $eb_data['CID'] ?? null,
                   $eb_data['Cylinders'] ?? null,
                   $eb_data['BlockType'] ?? null,
                   $eb_data['EngBoreIn'] ?? null,
                   $eb_data['EngBoreMetric'] ?? null,
                   $eb_data['EngStrokeIn'] ?? null,
                   $eb_data['EngStrokeMetric'] ?? null,
               ]);
        }

        // 3. Engine Designation
        $ed_id = $item['EngineDesignation']['id'] ?? rand(100, 9999);
        $ed_name = $item['EngineDesignation']['data']['EngineDesignation'] ?? 'Standard';
        $stmt = $db->prepare("SELECT id FROM engine_designations WHERE engine_designation_id = ?");
        $stmt->execute([$ed_id]);
        $existing_ed = $stmt->fetch();
        if ($existing_ed) {
            $engineDesignationId = $existing_ed['id'];
        } else {
            $db->prepare("INSERT INTO engine_designations (id, engine_designation_id, engine_designation) VALUES (?, ?, ?)")
               ->execute([$engineDesignationId, $ed_id, $ed_name]);
        }

        // 4. Engine Version
        $ev_id = $item['EngineVersion']['id'] ?? rand(100, 9999);
        $ev_name = $item['EngineVersion']['data']['EngineVersion'] ?? 'v1.0';
        $stmt = $db->prepare("SELECT id FROM engine_versions WHERE engine_version_id = ?");
        $stmt->execute([$ev_id]);
        $existing_ev = $stmt->fetch();
        if ($existing_ev) {
            $engineVersionId = $existing_ev['id'];
        } else {
            $db->prepare("INSERT INTO engine_versions (id, engine_version_id, engine_version) VALUES (?, ?, ?)")
               ->execute([$engineVersionId, $ev_id, $ev_name]);
        }

        // 5. Engine Mfr
        $em_id = $item['EngineMfr']['id'] ?? rand(100, 9999);
        $em_name = $item['EngineMfr']['data']['EngineMfr'] ?? 'OEM';
        $stmt = $db->prepare("SELECT id FROM engine_mfrs WHERE engine_mfr_id = ?");
        $stmt->execute([$em_id]);
        $existing_em = $stmt->fetch();
        if ($existing_em) {
            $engineMfrId = $existing_em['id'];
        } else {
            $db->prepare("INSERT INTO engine_mfrs (id, engine_mfr_id, engine_mfr) VALUES (?, ?, ?)")
               ->execute([$engineMfrId, $em_id, $em_name]);
        }

        // 6. Fuel Type
        $ft_id = $item['FuelType']['id'] ?? rand(1, 100);
        $ft_name = $item['FuelType']['data']['FuelType'] ?? 'Gasoline';
        $stmt = $db->prepare("SELECT id FROM fuel_types WHERE fuel_type_id = ?");
        $stmt->execute([$ft_id]);
        $existing_ft = $stmt->fetch();
        if ($existing_ft) {
            $fuelTypeId = $existing_ft['id'];
        } else {
            $db->prepare("INSERT INTO fuel_types (id, fuel_type_id, fuel_type) VALUES (?, ?, ?)")
               ->execute([$fuelTypeId, $ft_id, $ft_name]);
        }

        // 7. Brand AAIAID
        $brand_id = $item['BrandAAIAID']['data']['BrandID'] ?? 'AAAA';
        $brand_name = $item['BrandAAIAID']['data']['BrandName'] ?? 'Default Brand';
        $stmt = $db->prepare("SELECT id FROM brand_aaiaids WHERE brand_aaiaid_id = ?");
        $stmt->execute([$brand_id]);
        $existing_b = $stmt->fetch();
        if ($existing_b) {
            $brandAaiaidId = $existing_b['id'];
        } else {
            $db->prepare("INSERT INTO brand_aaiaids (id, brand_aaiaid_id, brand_aaiaid) VALUES (?, ?, ?)")
               ->execute([$brandAaiaidId, $brand_id, $brand_name]);
        }

        // 8. Part Type
        $pt_id = $item['PartType']['id'] ?? rand(100, 9999);
        $pt_data = $item['PartType']['data'] ?? [];
        $stmt = $db->prepare("SELECT id FROM part_types WHERE part_type_id = ?");
        $stmt->execute([$pt_id]);
        $existing_pt = $stmt->fetch();
        if ($existing_pt) {
            $partTypeId = $existing_pt['id'];
        } else {
            $db->prepare("INSERT INTO part_types (id, part_type_id, part_type_name, part_type_description, category, subcategory) VALUES (?, ?, ?, ?, ?, ?)")
               ->execute([
                   $partTypeId,
                   $pt_id,
                   $pt_data['PartTypeName'] ?? null,
                   $pt_data['PartTypeDescription'] ?? null,
                   $pt_data['Category'] ?? null,
                   $pt_data['Subcategory'] ?? null
               ]);
        }

        // 9. Product
        $partNumber = $item['PartNumber'] ?? ('PN-' . rand(10000, 99999));
        $stmt = $db->prepare("SELECT id FROM products WHERE part_number = ?");
        $stmt->execute([$partNumber]);
        if ($stmt->fetch()) {
            return true; // Product already exists
        }

        $db->prepare("INSERT INTO products (id, mfr_label, part, action, hazard_material_code, part_number, brand_label, aces_applications, item_quantity_size, container_type, quantity_per_application, minimum_order_quantity, part_terminology_id, maintenance_type, part_type_id, base_vehicle_id, engine_base_id, engine_designation_id, engine_version_id, engine_mfr_id, fuel_type_id, brand_aaiaid_id, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
           ->execute([
               $productId,
               $item['MfrLabel'] ?? 'MFR',
               $item['Part'] ?? 'Auto Part',
               $item['action'] ?? 'A',
               $item['HazardousMaterialCode'] ?? 'N',
               $partNumber,
               $item['BrandLabel'] ?? 'AutoCare',
               $item['ACESApplications'] ?? null,
               (int)($item['ItemQuantitySize']['_text'] ?? 1),
               $item['ContainerType'] ?? 'Box',
               (int)($item['QuantityPerApplication']['_text'] ?? 1),
               (int)($item['MinimumOrderQuantity']['_text'] ?? 1),
               (int)($item['PartTerminologyID'] ?? 100),
               $item['MaintenanceType'] ?? 'R',
               $partTypeId,
               $baseVehicleId,
               $engineBaseId,
               $engineDesignationId,
               $engineVersionId,
               $engineMfrId,
               $fuelTypeId,
               $brandAaiaidId,
               4.5
           ]);

        // Descriptions
        if (!empty($item['Descriptions']['Description']) && is_array($item['Descriptions']['Description'])) {
            foreach ($item['Descriptions']['Description'] as $desc) {
                $db->prepare("INSERT INTO product_descriptions (id, description_text, description_code, maintenance_type, language_code, sequence, product_id) VALUES (?, ?, ?, ?, ?, ?, ?)")
                   ->execute([
                       generate_uuid(),
                       $desc['_text'] ?? '',
                       $desc['DescriptionCode'] ?? null,
                       $desc['MaintenanceType'] ?? null,
                       $desc['LanguageCode'] ?? 'EN',
                       (int)($desc['Sequence'] ?? -1),
                       $productId
                   ]);
            }
        }

        // Pricings
        if (!empty($item['Prices']['Pricing']) && is_array($item['Prices']['Pricing'])) {
            foreach ($item['Prices']['Pricing'] as $p) {
                $db->prepare("INSERT INTO pricings (id, price_sheet_number, currency_code, price, price_type, maintenance_type, product_id) VALUES (?, ?, ?, ?, ?, ?, ?)")
                   ->execute([
                       generate_uuid(),
                       $p['PriceSheetNumber'] ?? null,
                       $p['CurrencyCode'] ?? 'USD',
                       (float)($p['Price']['_text'] ?? 0),
                       $p['PriceType'] ?? 'LIST',
                       $p['MaintenanceType'] ?? null,
                       $productId
                   ]);
            }
        }

        return true;
    } catch (Exception $e) {
        return false;
    }
}
