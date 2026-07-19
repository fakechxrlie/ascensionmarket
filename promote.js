const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.user.update({
      where: { username: 'twink' },
      data: { 
        role: 'OWNER',
        level: 42,
        xp: 4200
      }
    });
    console.log('Successfully promoted twink to OWNER with LVL 42 and 4,200 XP.');
  } catch (err) {
    console.error('Failed to promote twink. Did you register the account yet? Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
