import { sequelize } from '../config/database';
import { User } from '../models/userModel';
import { CostSheet } from '../models/costSheetModel';

const seedCostSheets = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected for seeding cost sheets.');

    await sequelize.sync();

    const initiator = await User.findOne({ where: { username: 'initiator' } });
    if (!initiator) {
      console.error('Initiator user not found. Please run seed-users.ts first.');
      process.exit(1);
    }

    const existingCostSheets = await CostSheet.findAll();
    if (existingCostSheets.length > 0) {
      console.log('Cost sheets already exist. Skipping seed.');
      process.exit(0);
    }

    await CostSheet.bulkCreate([
      {
        cost_sheet_number: 'CS-2024-001',
        pr_number: '13633801',
        description: 'Technical equipment procurement for Plant A',
        line_items: 5,
        plant: 'Plant A',
        type: 'Technical',
        total_value: 125000.00,
        status: 'Pending L1',
        progress: 100,
        created_by: initiator.id,
      },
      {
        cost_sheet_number: 'CS-2024-002',
        pr_number: '24678012',
        description: 'Office supplies and materials',
        line_items: 8,
        plant: 'Plant B',
        type: 'Non-Technical',
        total_value: 45000.00,
        status: 'Pending L1',
        progress: 100,
        created_by: initiator.id,
      },
      {
        cost_sheet_number: 'CS-2024-003',
        pr_number: '35489023',
        description: 'Maintenance parts for machinery',
        line_items: 3,
        plant: 'Plant A',
        type: 'Technical',
        total_value: 78000.00,
        status: 'Draft',
        progress: 60,
        created_by: initiator.id,
      },
      {
        cost_sheet_number: 'CS-2024-004',
        pr_number: '46790134',
        description: 'Safety equipment and PPE',
        line_items: 12,
        plant: 'Plant C',
        type: 'Non-Technical',
        total_value: 32000.00,
        status: 'Draft',
        progress: 35,
        created_by: initiator.id,
      },
      {
        cost_sheet_number: 'CS-2024-005',
        pr_number: '57891245',
        description: 'Industrial chemicals and reagents',
        line_items: 6,
        plant: 'Plant B',
        type: 'Technical',
        total_value: 95000.00,
        status: 'Approved',
        progress: 100,
        created_by: initiator.id,
      },
    ]);

    console.log('Cost sheets seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding cost sheets:', error);
    process.exit(1);
  }
};

seedCostSheets();
