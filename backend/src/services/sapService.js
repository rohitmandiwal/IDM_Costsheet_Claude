const { Op } = require('sequelize');
const { SapPr, SapPrLineItem, SapVendor } = require('../models');
const logger = require('../utils/logger');

const fetchPRsFromSAP = async (prNumbers) => {
  logger.info(`Fetching PR data from database for: ${prNumbers.join(', ')}`);

  const prs = await SapPr.findAll({
    where: {
      pr_number: {
        [Op.in]: prNumbers,
      },
    },
    include: [
      {
        model: SapPrLineItem,
        as: 'sap_pr_line_items',
      },
    ],
  });

  if (prs.length !== prNumbers.length) {
    const foundPrNumbers = prs.map(pr => pr.pr_number);
    const notFound = prNumbers.filter(pr => !foundPrNumbers.includes(pr));
    logger.error(`PR numbers not found in database: ${notFound.join(', ')}`);
    throw new Error(`PR numbers not found: ${notFound.join(', ')}`);
  }

  // Map to the format expected by the calling service
  const results = prs.map(pr => ({
    prNumber: pr.pr_number,
    description: pr.description,
    plant: pr.plant_code,
    requester: pr.requester,
    lineItemCount: pr.sap_pr_line_items.length,
    estimatedValue: pr.est_value,
    category: pr.category, // Added category
    lineItems: pr.sap_pr_line_items.map(item => ({
      prNumber: item.pr_number,
      lineNumber: item.line_item_number,
      partCode: item.part_code,
      description: item.description,
      quantity: item.qty,
      uom: item.uom,
      plant: item.plant_code,
      prPrice: item.pr_price,
      lastYearPrice: item.earlier_po_est,
      specifications: '', // This field was in mock data but not in DB model, so leave it empty
    })),
  }));

  logger.info(`Successfully fetched PR data for: ${prNumbers.join(', ')}`);
  return results;
};

const searchVendors = async (searchTerm) => {
  logger.info(`Searching for vendors in database with term: ${searchTerm}`);
  const lowercasedTerm = searchTerm.toLowerCase();

  const vendors = await SapVendor.findAll({
    where: {
      [Op.or]: [
        { vendor_name: { [Op.iLike]: `%${lowercasedTerm}%` } },
        { vendor_code: { [Op.iLike]: `%${lowercasedTerm}%` } },
      ],
    },
  });

  return vendors.map(vendor => ({
    vendorCode: vendor.vendor_code,
    vendorName: vendor.vendor_name,
    city: '', // This field was in mock data but not in DB model
  }));
};

const createPoInSap = async (poData) => {
  logger.info(`Simulating PO creation in SAP for: ${JSON.stringify(poData.costSheetId)}`);
  // This function remains a simulation as per CLAUDE.md, but the mock PO number generation is retained.
  // In a real scenario, this would call the actual SAP API.
  await new Promise(resolve => setTimeout(resolve, 500));

  const poNumber = `45000${Math.floor(Math.random() * 100000)}`;

  return {
    poNumber,
    sapStatus: 'created',
    message: 'Purchase Order successfully created in SAP (simulation).',
  };
};

module.exports = {
  fetchPRsFromSAP,
  searchVendors,
  createPoInSap,
}
