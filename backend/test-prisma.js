const prisma = require('./src/utils/prisma');

async function test() {
    try {
        const sectors = await prisma.serviceSector.findMany();
        console.log('Success! Found sectors:', sectors.length);
    } catch (e) {
        console.error('Failed to query database:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
