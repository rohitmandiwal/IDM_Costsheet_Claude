import logger from '../utils/logger';

interface PRLineItemMock {
  prNumber: string;
  lineNumber: string;
  partCode: string;
  description: string;
  quantity: number;
  uom: string;
  plant: string;
  prPrice: number;
  lastYearPrice: number;
  specifications: string;
}

interface PRSummaryMock {
  prNumber: string;
  description: string;
  plant: string;
  requester: string;
  lineItemCount: number;
  estimatedValue: number;
  lineItems: PRLineItemMock[];
}

const MOCK_PR_DATABASE: Record<string, PRSummaryMock> = {
  '13633801': {
    prNumber: '13633801',
    description: 'Laptop Model X, Intel i7, 16GB, 512GB SSD',
    plant: 'P001 - Mumbai Plant',
    requester: 'Rajesh Kumar',
    lineItemCount: 1,
    estimatedValue: 240000.00,
    lineItems: [
      {
        prNumber: '13633801',
        lineNumber: '00010',
        partCode: 'LAP-INT-2024',
        description: 'Laptop Model X, Intel i7, 16GB RAM, 512GB SSD',
        quantity: 10,
        uom: 'PCS',
        plant: 'P001',
        prPrice: 24000.00,
        lastYearPrice: 23500.00,
        specifications: 'Intel i7, 16GB RAM, 512GB SSD',
      },
    ],
  },
  '24678012': {
    prNumber: '24678012',
    description: 'Office Ergonomic Chair',
    plant: 'P002 - Delhi Plant',
    requester: 'Amit Sharma',
    lineItemCount: 1,
    estimatedValue: 200000.00,
    lineItems: [
      {
        prNumber: '24678012',
        lineNumber: '00010',
        partCode: 'CHAIR-STD-01',
        description: 'Office Ergonomic Chair - Executive Model',
        quantity: 50,
        uom: 'PCS',
        plant: 'P002',
        prPrice: 4000.00,
        lastYearPrice: 3800.00,
        specifications: 'Executive Model, Adjustable Height',
      },
    ],
  },
  '13633802': {
    prNumber: '13633802',
    description: 'Electrical Components',
    plant: 'P002 - Delhi Plant',
    requester: 'Amit Sharma',
    lineItemCount: 8,
    estimatedValue: 128400.00,
    lineItems: [
      {
        prNumber: '13633802',
        lineNumber: '00010',
        partCode: 'ELEC-CAP-100',
        description: 'Capacitor 100µF 450V',
        quantity: 500,
        uom: 'PCS',
        plant: 'P002',
        prPrice: 25.00,
        lastYearPrice: 24.00,
        specifications: 'Electrolytic, 100µF, 450V',
      },
      {
        prNumber: '13633802',
        lineNumber: '00020',
        partCode: 'ELEC-RES-220',
        description: 'Resistor 220Ω 5W',
        quantity: 1000,
        uom: 'PCS',
        plant: 'P002',
        prPrice: 5.00,
        lastYearPrice: 4.80,
        specifications: 'Carbon Film, 220Ω, 5W',
      },
      {
        prNumber: '13633802',
        lineNumber: '00030',
        partCode: 'ELEC-REL-24V',
        description: 'Relay 24V DC DPDT',
        quantity: 200,
        uom: 'PCS',
        plant: 'P002',
        prPrice: 150.00,
        lastYearPrice: 145.00,
        specifications: '24V DC, DPDT, 10A',
      },
      {
        prNumber: '13633802',
        lineNumber: '00040',
        partCode: 'ELEC-WIRE-10',
        description: 'Wire Cable 10mm² Copper',
        quantity: 500,
        uom: 'MTR',
        plant: 'P002',
        prPrice: 80.00,
        lastYearPrice: 75.00,
        specifications: 'Copper, 10mm², PVC Insulated',
      },
      {
        prNumber: '13633802',
        lineNumber: '00050',
        partCode: 'ELEC-CONN-3P',
        description: 'Terminal Connector 3-Pin',
        quantity: 300,
        uom: 'PCS',
        plant: 'P002',
        prPrice: 35.00,
        lastYearPrice: 32.00,
        specifications: '3-Pin, 10A Rating',
      },
      {
        prNumber: '13633802',
        lineNumber: '00060',
        partCode: 'ELEC-FUSE-10A',
        description: 'Fuse 10A Fast Blow',
        quantity: 600,
        uom: 'PCS',
        plant: 'P002',
        prPrice: 12.00,
        lastYearPrice: 11.00,
        specifications: 'Glass Tube, 10A, Fast Blow',
      },
      {
        prNumber: '13633802',
        lineNumber: '00070',
        partCode: 'ELEC-LED-5MM',
        description: 'LED Indicator 5mm Red',
        quantity: 800,
        uom: 'PCS',
        plant: 'P002',
        prPrice: 8.00,
        lastYearPrice: 7.50,
        specifications: '5mm, Red, 20mA',
      },
      {
        prNumber: '13633802',
        lineNumber: '00080',
        partCode: 'ELEC-TRANS-12V',
        description: 'Transformer 12V 2A',
        quantity: 150,
        uom: 'PCS',
        plant: 'P002',
        prPrice: 250.00,
        lastYearPrice: 240.00,
        specifications: '220V to 12V, 2A Output',
      },
    ],
  },
  'PR1001': {
    prNumber: 'PR1001',
    description: 'Laptop purchase for new employees',
    plant: 'P001',
    requester: 'John Doe',
    lineItemCount: 2,
    estimatedValue: 126000.00,
    lineItems: [
      {
        prNumber: 'PR1001',
        lineNumber: '001',
        partCode: 'LAPTOP-PRO',
        description: 'High-performance Laptop',
        quantity: 5,
        uom: 'PCS',
        plant: 'P001',
        prPrice: 25000.00,
        lastYearPrice: 24000.00,
        specifications: 'Intel i7, 16GB RAM, 512GB SSD',
      },
      {
        prNumber: 'PR1001',
        lineNumber: '002',
        partCode: 'MOUSE-WIRELESS',
        description: 'Wireless Mouse',
        quantity: 5,
        uom: 'PCS',
        plant: 'P001',
        prPrice: 1000.00,
        lastYearPrice: 950.00,
        specifications: 'Ergonomic design',
      },
    ],
  },
  'PR1002': {
    prNumber: 'PR1002',
    description: 'Software licenses renewal',
    plant: 'P002',
    requester: 'John Doe',
    lineItemCount: 1,
    estimatedValue: 30000.00,
    lineItems: [
      {
        prNumber: 'PR1002',
        lineNumber: '001',
        partCode: 'SW-LICENSE-365',
        description: 'Microsoft 365 Business License',
        quantity: 10,
        uom: 'EA',
        plant: 'P002',
        prPrice: 3000.00,
        lastYearPrice: 2900.00,
        specifications: 'Annual subscription',
      },
    ],
  },
  'PR1003': {
    prNumber: 'PR1003',
    description: 'Office furniture upgrade',
    plant: 'P001',
    requester: 'Jane Smith',
    lineItemCount: 1,
    estimatedValue: 200000.00,
    lineItems: [
      {
        prNumber: 'PR1003',
        lineNumber: '001',
        partCode: 'DESK-ERGON',
        description: 'Ergonomic Office Desk',
        quantity: 10,
        uom: 'PCS',
        plant: 'P001',
        prPrice: 20000.00,
        lastYearPrice: 19500.00,
        specifications: 'Adjustable height, Wood finish',
      },
    ],
  },
  'PR1004': {
    prNumber: 'PR1004',
    description: 'Small office supplies',
    plant: 'P003',
    requester: 'Jane Smith',
    lineItemCount: 2,
    estimatedValue: 10000.00,
    lineItems: [
      {
        prNumber: 'PR1004',
        lineNumber: '001',
        partCode: 'PAPER-A4',
        description: 'A4 Paper Ream',
        quantity: 50,
        uom: 'BOX',
        plant: 'P003',
        prPrice: 150.00,
        lastYearPrice: 145.00,
        specifications: 'White, 500 sheets per ream',
      },
      {
        prNumber: 'PR1004',
        lineNumber: '002',
        partCode: 'PEN-BLUE',
        description: 'Blue Ballpoint Pen',
        quantity: 100,
        uom: 'PCS',
        plant: 'P003',
        prPrice: 25.00,
        lastYearPrice: 24.00,
        specifications: 'Medium tip',
      },
    ],
  },
  'PR1005': {
    prNumber: 'PR1005',
    description: 'Network equipment',
    plant: 'P001',
    requester: 'John Doe',
    lineItemCount: 2,
    estimatedValue: 50000.00,
    lineItems: [
      {
        prNumber: 'PR1005',
        lineNumber: '001',
        partCode: 'ROUTER-CISCO',
        description: 'Cisco Router',
        quantity: 1,
        uom: 'PCS',
        plant: 'P001',
        prPrice: 30000.00,
        lastYearPrice: 28000.00,
        specifications: 'Gigabit Ethernet, VPN support',
      },
      {
        prNumber: 'PR1005',
        lineNumber: '002',
        partCode: 'SWITCH-TP',
        description: 'TP-Link Network Switch',
        quantity: 2,
        uom: 'PCS',
        plant: 'P001',
        prPrice: 10000.00,
        lastYearPrice: 9800.00,
        specifications: '8-Port, Unmanaged',
      },
    ],
  },
};

export const fetchPRsFromSAP = async (prNumbers: string[]): Promise<PRSummaryMock[]> => {
  logger.info(`SAP PR Fetch requested for: ${prNumbers.join(', ')}`);

  const results: PRSummaryMock[] = [];
  const notFound: string[] = [];

  for (const prNumber of prNumbers) {
    const prData = MOCK_PR_DATABASE[prNumber];
    if (prData) {
      results.push(prData);
    } else {
      notFound.push(prNumber);
    }
  }

  if (notFound.length > 0) {
    logger.error(`PR numbers not found in SAP: ${notFound.join(', ')}`);
    throw new Error(`PR numbers not found: ${notFound.join(', ')}`);
  }

  logger.info(`SAP PR Fetch successful for: ${prNumbers.join(', ')}`);
  return results;
};

export const getDemoPRNumbers = (): string[] => {
  return ['13633801', '24678012', '13633802', 'PR1001', 'PR1002', 'PR1003', 'PR1004', 'PR1005'];
};
