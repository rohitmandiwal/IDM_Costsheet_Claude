-- ============================================================
-- COMPLETE APPROVAL MATRIX FOR ALL VALUE BANDS
-- ============================================================

BEGIN;

-- 1. Clear existing rules and levels (optional safely, or just existing ones to avoid duplicates)
-- We will delete all to ensure a clean slate aligned with the requirement.
DELETE FROM approver_levels;
DELETE FROM approval_rules;

-- 2. Ensure Value Bands Exist (just in case)
-- (They should exist from seed data, but let's assume they do based on idm_seed_data.sql)
-- We'll query them by name to insert rules.

-- ============================================================
-- BAND 1: Up to 10L (L1, L2)
-- ============================================================
-- Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'technical' FROM value_bands WHERE name = 'Up to 10L'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert;

-- Non-Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'non_technical' FROM value_bands WHERE name = 'Up to 10L'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert;


-- ============================================================
-- BAND 2: 10L to 1 Cr (L1, L2, L3)
-- ============================================================
-- Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'technical' FROM value_bands WHERE name = '10L to 1 Cr'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert
UNION ALL
SELECT id, 3, 'approver_l3' FROM rule_insert;

-- Non-Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'non_technical' FROM value_bands WHERE name = '10L to 1 Cr'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert
UNION ALL
SELECT id, 3, 'approver_l3' FROM rule_insert;


-- ============================================================
-- BAND 3: 1 Cr to 2 Cr (L1, L2, L3, L4)
-- ============================================================
-- Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'technical' FROM value_bands WHERE name = '1 Cr to 2 Cr'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert
UNION ALL
SELECT id, 3, 'approver_l3' FROM rule_insert
UNION ALL
SELECT id, 4, 'approver_l4' FROM rule_insert;

-- Non-Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'non_technical' FROM value_bands WHERE name = '1 Cr to 2 Cr'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert
UNION ALL
SELECT id, 3, 'approver_l3' FROM rule_insert
UNION ALL
SELECT id, 4, 'approver_l4' FROM rule_insert;


-- ============================================================
-- BAND 4: 2 Cr to 5 Cr (L1, L2, L3, L4, L5)
-- ============================================================
-- Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'technical' FROM value_bands WHERE name = '2 Cr to 5 Cr'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert
UNION ALL
SELECT id, 3, 'approver_l3' FROM rule_insert
UNION ALL
SELECT id, 4, 'approver_l4' FROM rule_insert
UNION ALL
SELECT id, 5, 'approver_l5' FROM rule_insert;

-- Non-Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'non_technical' FROM value_bands WHERE name = '2 Cr to 5 Cr'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert
UNION ALL
SELECT id, 3, 'approver_l3' FROM rule_insert
UNION ALL
SELECT id, 4, 'approver_l4' FROM rule_insert
UNION ALL
SELECT id, 5, 'approver_l5' FROM rule_insert;


-- ============================================================
-- BAND 5: More than 5 Cr (L1, L2, L3, L4, L5, L6)
-- ============================================================
-- Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'technical' FROM value_bands WHERE name = 'More than 5 Cr'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert
UNION ALL
SELECT id, 3, 'approver_l3' FROM rule_insert
UNION ALL
SELECT id, 4, 'approver_l4' FROM rule_insert
UNION ALL
SELECT id, 5, 'approver_l5' FROM rule_insert
UNION ALL
SELECT id, 6, 'approver_l6' FROM rule_insert;

-- Non-Technical
WITH rule_insert AS (
    INSERT INTO approval_rules (value_band_id, category) 
    SELECT id, 'non_technical' FROM value_bands WHERE name = 'More than 5 Cr'
    RETURNING id
)
INSERT INTO approver_levels (rule_id, level, approver_role)
SELECT id, 1, 'approver_l1' FROM rule_insert
UNION ALL
SELECT id, 2, 'approver_l2' FROM rule_insert
UNION ALL
SELECT id, 3, 'approver_l3' FROM rule_insert
UNION ALL
SELECT id, 4, 'approver_l4' FROM rule_insert
UNION ALL
SELECT id, 5, 'approver_l5' FROM rule_insert
UNION ALL
SELECT id, 6, 'approver_l6' FROM rule_insert;

COMMIT;
