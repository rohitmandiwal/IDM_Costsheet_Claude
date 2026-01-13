const { sequelize } = require('../config/database');
const { SapPo } = require('../models');

const seedSapPos = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync just the SapPo model
        await SapPo.sync({ force: true });
        console.log('SapPo table synced.');

        const pos = [
            {
                po_number: 'PO-2024-1234',
                vendor_code: 'V001',
                vendor_name: 'Tech Innovations Ltd.',
                part_code: 'LAP-DELL-XPS',
                description: 'Dell XPS 15 Laptop',
                qty: 5,
                unit_price: 94000,
                po_date: '2024-09-15',
                plant_code: 'P001',
            },
            {
                po_number: 'PO-2024-1235',
                vendor_code: 'V004', // Creative Solutions
                vendor_name: 'Creative Solutions',
                part_code: 'OFF-CHAIR-ERG',
                description: 'Ergonomic Office Chair',
                qty: 50,
                unit_price: 14500,
                po_date: '2024-10-01',
                plant_code: 'P002',
            },
            {
                po_number: 'PO-2023-0987',
                vendor_code: 'V002', // Global Office Supplies
                vendor_name: 'Global Office Supplies',
                part_code: 'OFF-DESK-STD',
                description: 'Standard Office Desk',
                qty: 20,
                unit_price: 19500,
                po_date: '2023-11-20',
                plant_code: 'P002',
            },
            {
                po_number: 'PO-2023-0555',
                vendor_code: 'V003', // Industrial Components Inc.
                vendor_name: 'Industrial Components Inc.',
                part_code: 'SRV-RACK-42U',
                description: '42U Server Rack',
                qty: 2,
                unit_price: 115000,
                po_date: '2023-05-10',
                plant_code: 'P001',
            }
        ];

        await SapPo.bulkCreate(pos);
        console.log('SapPo data seeded successfully.');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding SapPo data:', error);
        process.exit(1);
    }
};

seedSapPos();
