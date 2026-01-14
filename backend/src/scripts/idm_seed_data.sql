-- ============================================================
-- IDM COST SHEET APPLICATION DUMMY DATA
-- Database: PostgreSQL
-- ============================================================

BEGIN;

-- ============================
-- USERS
-- ============================

-- Note: All users have the default password 'password123'
-- The hash is a bcrypt hash for 'password123'
INSERT INTO users (username, password_hash, full_name, email, department, designation, is_active) VALUES
('initiator1', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Ramesh Kumar', 'ramesh.kumar@example.com', 'Sourcing', 'IDM - Team', TRUE),
('initiator2', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Priya Sharma', 'priya.sharma@example.com', 'Procurement', 'IDM - Team', TRUE),
('approverl1', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Suresh Gupta', 'suresh.gupta@example.com', 'Sourcing', 'IDM - Lead', TRUE),
('approverl2', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Amit Patel', 'amit.patel@example.com', 'Sourcing', 'IDM - Lead', TRUE),
('approverl3', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Rajesh Singh', 'rajesh.singh@example.com', 'Sourcing', 'Head Sourcing', TRUE),
('approverl4gto', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Anjali Mehta', 'anjali.mehta@example.com', 'Operations', 'GTO - COO', TRUE),
('approverl4gco', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Vikram Rao', 'vikram.rao@example.com', 'Finance', 'GCO - CFO', TRUE),
('approverl5', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Sunita Reddy', 'sunita.reddy@example.com', 'Finance', 'GCO - CFO', TRUE),
('approverl6', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Arun Verma', 'arun.verma@example.com', 'Executive', 'CEO', TRUE),
('admin', '$2b$10$Fsc5Mn546tG90wIZfpJKvOQRgaaoSa9kNnVaAsIZOSCtVWLF9z5mS', 'Admin User', 'admin@example.com', 'IT', 'System Administrator', TRUE);

-- ============================
-- ROLE ASSIGNMENTS
-- ============================

-- Initiators
INSERT INTO role_assignments (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'ramesh.kumar@example.com'), 'initiator'),
((SELECT id FROM users WHERE email = 'priya.sharma@example.com'), 'initiator');

-- Approvers
INSERT INTO role_assignments (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'suresh.gupta@example.com'), 'approver_l1'),
((SELECT id FROM users WHERE email = 'amit.patel@example.com'), 'approver_l2'),
((SELECT id FROM users WHERE email = 'rajesh.singh@example.com'), 'approver_l3'),
((SELECT id FROM users WHERE email = 'anjali.mehta@example.com'), 'approver_l4'),
((SELECT id FROM users WHERE email = 'vikram.rao@example.com'), 'approver_l4'),
((SELECT id FROM users WHERE email = 'sunita.reddy@example.com'), 'approver_l5'),
((SELECT id FROM users WHERE email = 'arun.verma@example.com'), 'approver_l6');

-- Admin
INSERT INTO role_assignments (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'admin@example.com'), 'admin');


-- ============================
-- APPROVAL MATRIX CONFIG
-- ============================

-- Rules for "Up to 10L"
INSERT INTO approval_rules (min_value, max_value, category) VALUES
(0, 1000000, 'technical'),
(0, 1000000, 'non_technical');

INSERT INTO approver_levels (rule_id, level, approver_role) VALUES
((SELECT id FROM approval_rules WHERE min_value = 0 AND category = 'technical'), 1, 'approver_l1'),
((SELECT id FROM approval_rules WHERE min_value = 0 AND category = 'technical'), 2, 'approver_l2'),
((SELECT id FROM approval_rules WHERE min_value = 0 AND category = 'non_technical'), 1, 'approver_l1'),
((SELECT id FROM approval_rules WHERE min_value = 0 AND category = 'non_technical'), 2, 'approver_l2');

-- Rules for "10L to 1 Cr"
INSERT INTO approval_rules (min_value, max_value, category) VALUES
(1000001, 10000000, 'technical'),
(1000001, 10000000, 'non_technical');

INSERT INTO approver_levels (rule_id, level, approver_role) VALUES
((SELECT id FROM approval_rules WHERE min_value = 1000001 AND category = 'technical'), 1, 'approver_l1'),
((SELECT id FROM approval_rules WHERE min_value = 1000001 AND category = 'technical'), 2, 'approver_l2'),
((SELECT id FROM approval_rules WHERE min_value = 1000001 AND category = 'technical'), 3, 'approver_l3'),
((SELECT id FROM approval_rules WHERE min_value = 1000001 AND category = 'non_technical'), 1, 'approver_l1'),
((SELECT id FROM approval_rules WHERE min_value = 1000001 AND category = 'non_technical'), 2, 'approver_l2'),
((SELECT id FROM approval_rules WHERE min_value = 1000001 AND category = 'non_technical'), 3, 'approver_l3');


-- ============================
-- SAP & VENDOR DATA
-- ============================

INSERT INTO sap_vendors (vendor_code, vendor_name) VALUES
('V001', 'Tech Innovations Ltd.'),
('V002', 'Global Office Supplies'),
('V003', 'Industrial Components Inc.'),
('V004', 'Creative Solutions');

INSERT INTO vendors (vendor_code, vendor_name, vendor_type) VALUES
('V001', 'Tech Innovations Ltd.', 'existing'),
('V002', 'Global Office Supplies', 'existing'),
('V003', 'Industrial Components Inc.', 'existing'),
(NULL, 'New Age Electronics', 'new'),
(NULL, 'Local Hardware Store', 'new');

INSERT INTO sap_prs (pr_number, release_date, accepted_date, requester, plant_code, description, est_value, currency, category) VALUES
('PR00001', '2025-12-01', '2025-12-02', 'Ramesh Kumar', 'P001', 'High-End Laptops for Dev Team', 950000, 'INR', 'technical'),
('PR00002', '2025-12-03', '2025-12-04', 'Priya Sharma', 'P002', 'Office Furniture', 15000000, 'INR', 'non_technical'),
('PR00003', '2025-12-05', '2025-12-06', 'Ramesh Kumar', 'P001', 'Server Rack Components', 60000000, 'INR', 'technical'),
('PR00004', '2025-12-07', '2025-12-08', 'Priya Sharma', 'P002', 'Marketing Campaign Materials', 500000, 'INR', 'non_technical');

INSERT INTO sap_pr_line_items (pr_number, line_item_number, part_code, description, qty, uom, plant_code, pr_price) VALUES
('PR00001', 10, 'LAP-DELL-XPS', 'Dell XPS 15 Laptop', 10, 'PCS', 'P001', 95000),
('PR00002', 10, 'OFF-CHAIR-ERG', 'Ergonomic Office Chair', 100, 'PCS', 'P002', 15000),
('PR00002', 20, 'OFF-DESK-STD', 'Standard Office Desk', 100, 'PCS', 'P002', 20000),
('PR00003', 10, 'SRV-RACK-42U', '42U Server Rack', 5, 'PCS', 'P001', 120000),
('PR00004', 10, 'MKT-BANNERS', 'Promotional Banners', 200, 'PCS', 'P002', 2500);


-- ============================
-- COST SHEETS & WORKFLOWS
-- ============================

-- Scenario 1: Draft Cost Sheet
INSERT INTO cost_sheets (cost_sheet_number, requirement_type, initiator_id, status) VALUES
('CS-DRAFT-001', 'technical', (SELECT id FROM users WHERE email = 'ramesh.kumar@example.com'), 'pending');
INSERT INTO cost_sheet_prs(cost_sheet_id, pr_number) VALUES (1, 'PR00001');
INSERT INTO cost_sheet_line_items(cost_sheet_id, sap_line_item_id, status, finalized_vendor_id) VALUES (1, 1, 'pending', NULL);

-- Scenario 2: Submitted & In-Approval
INSERT INTO cost_sheets (cost_sheet_number, requirement_type, initiator_id, status, final_order_value, current_approval_level) VALUES
('CS-IN-APPROVAL-001', 'non_technical', (SELECT id FROM users WHERE email = 'priya.sharma@example.com'), 'pending', 480000, 2);
INSERT INTO cost_sheet_prs(cost_sheet_id, pr_number) VALUES (2, 'PR00004');
INSERT INTO cost_sheet_line_items(cost_sheet_id, sap_line_item_id, status, finalized_vendor_id) VALUES (2, 5, 'pending', 2);
-- Quotations for CS-IN-APPROVAL-001
INSERT INTO vendor_quotations (line_item_id, vendor_id, r0_quoted_per_unit, r1_negotiated_per_unit, total_value, tax_code) VALUES
(2, 2, 2500, 2400, 480000, 'GST18'), -- L1
(2, 4, 2600, 2500, 500000, 'GST18');
-- Approval History
INSERT INTO approvals (cost_sheet_id, line_item_id, level, approver_id, status, comments) VALUES
(2, 2, 1, (SELECT id FROM users WHERE email = 'suresh.gupta@example.com'), 'approved', 'Looks good. Forwarding to next level.'),
(2, 2, 2, NULL, 'pending', 'Awaiting Level 2 Approval');

-- Scenario 3: Fully Approved
INSERT INTO cost_sheets (cost_sheet_number, requirement_type, initiator_id, status, final_order_value) VALUES
('CS-APPROVED-001', 'technical', (SELECT id FROM users WHERE email = 'ramesh.kumar@example.com'), 'approved', 920000);
INSERT INTO cost_sheet_prs(cost_sheet_id, pr_number) VALUES (3, 'PR00001');
INSERT INTO cost_sheet_line_items(cost_sheet_id, sap_line_item_id, status, finalized_vendor_id) VALUES (3, 1, 'approved', 5);
-- Quotations
INSERT INTO vendor_quotations (line_item_id, vendor_id, r0_quoted_per_unit, r1_negotiated_per_unit, total_value, tax_code) VALUES
(3, 1, 95000, 92000, 920000, 'GST18'), -- L1
(3, 5, 96000, 94000, 940000, 'GST18');
-- Deviation (L2 supplier chosen)
INSERT INTO deviations (line_item_id, deviation_type, raised_by, approved_by, remarks) VALUES
(3, 'l2_supplier', 1, 3, 'Selected L2 supplier for better warranty terms.');
-- Approvals
INSERT INTO approvals (cost_sheet_id, line_item_id, level, approver_id, status, comments) VALUES
(3, 3, 1, (SELECT id FROM users WHERE email = 'suresh.gupta@example.com'), 'approved', 'Approved based on deviation justification.'),
(3, 3, 2, (SELECT id FROM users WHERE email = 'amit.patel@example.com'), 'approved', 'Final approval granted.');


-- ============================
-- AUDIT, NOTIFICATIONS, PO
-- ============================

INSERT INTO audit_logs (user_id, cost_sheet_id, line_item_id, activity_type, description) VALUES
(1, 1, 1, 'CREATE_COST_SHEET', 'Cost sheet CS-DRAFT-001 created.'),
(2, 2, 2, 'SUBMIT_FOR_APPROVAL', 'Cost sheet CS-IN-APPROVAL-001 submitted for approval.'),
(3, 2, 2, 'APPROVE', 'Level 1 approval for CS-IN-APPROVAL-001.'),
(1, 3, 3, 'SUBMIT_FOR_APPROVAL', 'Cost sheet CS-APPROVED-001 submitted for approval.'),
(3, 3, 3, 'APPROVE', 'Level 1 approval for CS-APPROVED-001.'),
(4, 3, 3, 'APPROVE', 'Level 2 approval for CS-APPROVED-001.');

INSERT INTO notifications (cost_sheet_id, user_id, trigger_type, message) VALUES
(2, 4, 'PENDING_APPROVAL', 'Cost sheet CS-IN-APPROVAL-001 is awaiting your approval at Level 2.'),
(3, 1, 'FINAL_APPROVAL', 'Your cost sheet CS-APPROVED-001 has been fully approved.');

INSERT INTO po_requests (cost_sheet_id, po_type, status) VALUES
(3, 'NB', 'SUCCESS');

INSERT INTO attachments (cost_sheet_id, file_name, file_path, description) VALUES
(2, 'vendor_quote_office.pdf', '/attachments/vendor_quote_office.pdf', 'Vendor quotation for office supplies'),
(3, 'tech_specs_laptops.docx', '/attachments/tech_specs_laptops.docx', 'Technical specifications for Dell XPS laptops');

COMMIT;
