const prisma = require('../utils/prisma');

const getSectors = async (req, res) => {
    try {
        const sectors = await prisma.serviceSector.findMany({
            include: { services: true }
        });
        res.json(sectors);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sectors', error: error.message });
    }
};

const createSector = async (req, res) => {
    const { name, description, icon } = req.body;
    try {
        const sector = await prisma.serviceSector.create({
            data: { name, description, icon }
        });
        res.status(201).json(sector);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create sector', error: error.message });
    }
};

const createService = async (req, res) => {
    const { name, description, mode, availability, icon, sectorId } = req.body;
    try {
        const service = await prisma.service.create({
            data: { name, description, mode, availability, icon, sectorId }
        });
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create service', error: error.message });
    }
};

const updateSector = async (req, res) => {
    const { id } = req.params;
    const { name, description, icon } = req.body;
    try {
        const sector = await prisma.serviceSector.update({
            where: { id },
            data: { name, description, icon }
        });
        res.json(sector);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update sector', error: error.message });
    }
};

const deleteSector = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.serviceSector.delete({ where: { id } });
        res.json({ message: 'Sector deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete sector', error: error.message });
    }
};

const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, description, mode, availability, icon } = req.body;
    try {
        const service = await prisma.service.update({
            where: { id },
            data: { name, description, mode, availability, icon }
        });
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update service', error: error.message });
    }
};

const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.service.delete({ where: { id } });
        res.json({ message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete service', error: error.message });
    }
};

module.exports = { getSectors, createSector, createService, updateSector, deleteSector, updateService, deleteService };
