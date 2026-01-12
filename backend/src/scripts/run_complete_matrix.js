const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

async function run() {
    try {
        const sqlPath = path.join(__dirname, 'complete_approval_matrix.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing complete_approval_matrix.sql...');
        await sequelize.query(sql);
        console.log('Successfully updated approval matrix!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating approval matrix:', error);
        process.exit(1);
    }
}

run();
