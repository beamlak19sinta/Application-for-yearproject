const prisma = require('../src/utils/prisma');

async function main() {
    console.log('Seeding database...');

    // Create Sectors
    const sectors = await Promise.all([
        prisma.serviceSector.create({
            data: {
                name: 'Vital Statistics',
                description: 'Birth, Marriage, and Death certifications.',
                icon: 'User',
                services: {
                    create: [
                        { name: 'Birth Certificate', mode: 'QUEUE', availability: 'Mon-Fri' },
                        { name: 'Marriage Registration', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
                        { name: 'ID Card Renewal', mode: 'QUEUE', availability: 'Daily' },
                    ]
                }
            }
        }),
        prisma.serviceSector.create({
            data: {
                name: 'Land Management',
                description: 'Property registration and title deeds.',
                icon: 'Map',
                services: {
                    create: [
                        { name: 'Land Title Transfer', mode: 'ONLINE', availability: '24/7' },
                        { name: 'Property Valuation', mode: 'APPOINTMENT', availability: 'Tue, Thu' },
                    ]
                }
            }
        })
    ]);

    console.log('Seeding completed:', sectors.length, 'sectors created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
