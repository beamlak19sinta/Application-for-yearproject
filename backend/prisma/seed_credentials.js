const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding specific credentials for testing...');

    const adminHash = await bcrypt.hash('admin123', 10);
    const officerHash = await bcrypt.hash('officer123', 10);
    const citizenHash = await bcrypt.hash('password123', 10);

    const users = [
        {
            name: 'System Admin',
            phoneNumber: '0911111111',
            password: adminHash,
            role: 'ADMIN',
            identificationNumber: 'ADM-001'
        },
        {
            name: 'Sample Officer',
            phoneNumber: '0900000000',
            password: officerHash,
            role: 'OFFICER',
            identificationNumber: 'OFF-001'
        },
        {
            name: 'Sample Citizen',
            phoneNumber: '0909090909',
            password: citizenHash,
            role: 'CITIZEN',
            identificationNumber: 'CIT-001'
        }
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { phoneNumber: user.phoneNumber },
            update: {
                password: user.password,
                role: user.role,
                name: user.name
            },
            create: user
        });
        console.log(`User seeded/updated: ${user.name} (${user.role}) - ${user.phoneNumber} / ${user.role.toLowerCase()}123 (or password123 for citizen)`);
    }

    console.log('Credentials seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
