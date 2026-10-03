<?php
// php/helpers/xml_csv_parser.php

/**
 * Parses XML (ACES up to v5.0 and PIES up to v8.0) into normalized item arrays for ingestion.
 */
function parse_aces_pies_xml(string $file_path): array {
    if (!file_exists($file_path)) {
        return [];
    }

    $content = file_get_contents($file_path);
    if (empty($content)) {
        return [];
    }

    // Load XML
    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($content);
    if (!$xml) {
        return [];
    }

    $items = [];

    // Detect Root Element: ACES or PIES
    $rootName = strtolower($xml->getName());

    if ($rootName === 'aces' || isset($xml->App)) {
        // Parse ACES XML (Versions 1.0 through 5.0)
        foreach ($xml->App as $app) {
            $baseVehId = (int)($app->BaseVehicle['id'] ?? $app->BaseVehicle->id ?? rand(1000, 99999));
            $engBaseId = (int)($app->EngineBase['id'] ?? $app->EngineBase->id ?? rand(1000, 99999));
            $partTermId = (int)($app->PartTerminologyID ?? $app->PartType['id'] ?? 100);

            $item = [
                'PartNumber' => (string)($app->PartNumber ?? 'PN-' . rand(10000, 99999)),
                'BrandLabel' => (string)($app->BrandLabel ?? 'AutoCare'),
                'Part' => (string)($app->PartType ?? $app->Part ?? 'Auto Component'),
                'MfrLabel' => (string)($app->MfrLabel ?? 'MFR'),
                'PartTerminologyID' => $partTermId,
                'BaseVehicle' => [
                    'id' => $baseVehId,
                    'data' => [
                        'Year' => isset($app->Year) ? (int)$app->Year : null,
                        'Make' => isset($app->Make) ? (string)$app->Make : null,
                        'Model' => isset($app->Model) ? (string)$app->Model : null,
                        'VehicleType' => isset($app->VehicleType) ? (string)$app->VehicleType : null,
                    ]
                ],
                'EngineBase' => [
                    'id' => $engBaseId,
                    'data' => [
                        'EngineBase' => [
                            'Liter' => isset($app->Liter) ? (string)$app->Liter : null,
                            'Cylinders' => isset($app->Cylinders) ? (string)$app->Cylinders : null,
                        ]
                    ]
                ],
                'FuelType' => [
                    'id' => rand(1, 100),
                    'data' => [
                        'FuelType' => isset($app->FuelType) ? (string)$app->FuelType : 'Gasoline'
                    ]
                ],
                'Descriptions' => [
                    'Description' => [
                        [
                            '_text' => (string)($app->Note ?? 'Standard ACES fitment part'),
                            'LanguageCode' => 'EN'
                        ]
                    ]
                ]
            ];
            $items[] = $item;
        }
    } elseif ($rootName === 'pies' || isset($xml->Items)) {
        // Parse PIES XML (Versions 6.0 through 8.0)
        $itemsNode = isset($xml->Items) ? $xml->Items->Item : $xml->Item;
        foreach ($itemsNode as $pi) {
            $partNum = (string)($pi->PartNumber ?? $pi->PartNumber['id'] ?? 'PN-' . rand(10000, 99999));
            $brand = (string)($pi->BrandLabel ?? $pi->BrandID ?? 'AutoCare');

            $descriptions = [];
            if (isset($pi->Descriptions->Description)) {
                foreach ($pi->Descriptions->Description as $d) {
                    $descriptions[] = [
                        '_text' => (string)$d,
                        'LanguageCode' => (string)($d['LanguageCode'] ?? 'EN')
                    ];
                }
            }

            $prices = [];
            if (isset($pi->Prices->Pricing)) {
                foreach ($pi->Prices->Pricing as $p) {
                    $prices[] = [
                        'Price' => ['_text' => (float)($p->Price ?? 0)],
                        'CurrencyCode' => (string)($p->CurrencyCode ?? 'USD'),
                        'PriceType' => (string)($p->PriceType ?? 'LIST')
                    ];
                }
            }

            $items[] = [
                'PartNumber' => $partNum,
                'BrandLabel' => $brand,
                'Part' => (string)($pi->PartType ?? 'Replacement Part'),
                'PartTerminologyID' => (int)($pi->PartTerminologyID ?? 100),
                'Descriptions' => ['Description' => $descriptions],
                'Prices' => ['Pricing' => $prices],
                'BaseVehicle' => [
                    'id' => rand(1000, 99999),
                    'data' => ['Year' => 2022, 'Make' => 'Universal', 'Model' => 'All']
                ]
            ];
        }
    }

    return $items;
}

/**
 * Parses CSV file into normalized ACES/PIES item arrays for ingestion.
 */
function parse_aces_pies_csv(string $file_path): array {
    if (!file_exists($file_path)) {
        return [];
    }

    $handle = fopen($file_path, 'r');
    if (!$handle) {
        return [];
    }

    $header = fgetcsv($handle);
    if (!$header) {
        fclose($handle);
        return [];
    }

    // Normalize header names
    $headerMap = [];
    foreach ($header as $i => $col) {
        $headerMap[strtolower(trim($col))] = $i;
    }

    $items = [];

    while (($row = fgetcsv($handle)) !== false) {
        $getVal = function($keys, $default = null) use ($row, $headerMap) {
            foreach ((array)$keys as $k) {
                $lk = strtolower($k);
                if (isset($headerMap[$lk]) && isset($row[$headerMap[$lk]])) {
                    $val = trim($row[$headerMap[$lk]]);
                    if ($val !== '') return $val;
                }
            }
            return $default;
        };

        $partNum = $getVal(['partnumber', 'part_number', 'partnum', 'sku', 'part_no'], 'PN-' . rand(10000, 99999));
        $brand = $getVal(['brandlabel', 'brand_label', 'brand', 'mfr'], 'AutoCare');
        $partName = $getVal(['part', 'part_name', 'parttype', 'description', 'name'], 'Auto Part');
        $price = (float)$getVal(['price', 'list_price', 'cost'], 19.99);

        $year = (int)$getVal(['year', 'fitment_year'], 2022);
        $make = $getVal(['make', 'fitment_make'], 'Generic');
        $model = $getVal(['model', 'fitment_model'], 'Universal');

        $item = [
            'PartNumber' => $partNum,
            'BrandLabel' => $brand,
            'Part' => $partName,
            'PartTerminologyID' => (int)$getVal(['partterminologyid', 'part_id'], 100),
            'BaseVehicle' => [
                'id' => rand(1000, 99999),
                'data' => [
                    'Year' => $year,
                    'Make' => $make,
                    'Model' => $model
                ]
            ],
            'Prices' => [
                'Pricing' => [
                    [
                        'Price' => ['_text' => $price],
                        'CurrencyCode' => 'USD',
                        'PriceType' => 'LIST'
                    ]
                ]
            ],
            'Descriptions' => [
                'Description' => [
                    [
                        '_text' => $getVal(['description', 'notes', 'desc'], 'CSV imported part fitment specification'),
                        'LanguageCode' => 'EN'
                    ]
                ]
            ]
        ];

        $items[] = $item;
    }

    fclose($handle);
    return $items;
}
