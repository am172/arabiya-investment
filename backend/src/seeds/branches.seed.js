const BranchGroup = require('../models/BranchGroup.model');
const data = require('../data/arabiya.defaults');
const logger = require('../utils/logger');

const clone = (value) => JSON.parse(JSON.stringify(value));

const seedBranches = async ({ force = false } = {}) => {
    const count = await BranchGroup.countDocuments();
    if (count > 0 && !force) {
        logger.info('Branches already exist, skipping');
        return;
    }
    if (force) await BranchGroup.deleteMany({});
    if (data.branches.length === 0) return;

    await BranchGroup.insertMany(
        data.branches.map((group, index) => ({ ...clone(group), order: index, isActive: group.isActive !== false }))
    );
    logger.info('Branches seeded');
};

module.exports = seedBranches;