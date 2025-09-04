const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function replaceWithRealInvestors() {
  console.log('🔄 Nahrádzam testovacích investorov reálnymi dátami...');
  
  try {
    // Najprv vymazať len testovacích investorov a ich dáta
    console.log('🧹 Mazanie testovacích dát...');
    
    // Zmazať investor snapshots
    await prisma.investorSnapshot.deleteMany();
    console.log('  ✅ Zmazané investor snapshots');
    
    // Zmazať period snapshots  
    await prisma.periodSnapshot.deleteMany();
    console.log('  ✅ Zmazané period snapshots');
    
    // Zmazať investor cashflows
    await prisma.investorCashflow.deleteMany();
    console.log('  ✅ Zmazané investor cashflows');
    
    // Zmazať investorov
    await prisma.investor.deleteMany();
    console.log('  ✅ Zmazaní investori');
    
    // Zmazať len INVESTOR používateľov, ponechať ADMIN a INTERNAL
    await prisma.user.deleteMany({ 
      where: { role: 'INVESTOR' } 
    });
    console.log('  ✅ Zmazaní INVESTOR používatelia');

    // Reálni používatelia
    const realUsers = [
      { id: 'inv_andrej', email: 'andrej.pavlik@example.com', name: 'Andrej Pavlík', role: 'INVESTOR' },
      { id: 'inv_mikail', email: 'mikail.pirgozi@example.com', name: 'Mikail Pirgozi', role: 'INVESTOR' },
      { id: 'inv_vladimir', email: 'vladimir.duzek@example.com', name: 'Vladimír Dužek', role: 'INVESTOR' },
      { id: 'inv_marian', email: 'marian.cingel@example.com', name: 'Marián Cingel', role: 'INVESTOR' },
      { id: 'inv_richard', email: 'richard.zimanyi@example.com', name: 'Richard Zimányi', role: 'INVESTOR' },
      { id: 'inv_roman', email: 'roman.priecel@example.com', name: 'Roman Priecel', role: 'INVESTOR' },
      { id: 'inv_patrik', email: 'patrik.pavlik@example.com', name: 'Patrik Pavlík', role: 'INVESTOR' },
      { id: 'inv_kamil', email: 'kamil.zavodsky@example.com', name: 'Kamil Zavodsky', role: 'INVESTOR' },
      { id: 'inv_steffen', email: 'steffen.tatge@example.com', name: 'Steffen Tatge', role: 'INVESTOR' },
      { id: 'inv_jan', email: 'jan.lajda@example.com', name: 'Ján Lajda', role: 'INVESTOR' },
      { id: 'inv_stanislava', email: 'stanislava.zacikova@example.com', name: 'Stanislava Záčiková', role: 'INVESTOR' },
      { id: 'inv_matus', email: 'matus.holos@example.com', name: 'Matúš Hološ', role: 'INVESTOR' },
      { id: 'inv_rezervny', email: 'rezervny.fond@example.com', name: 'Rezervný fond', role: 'INTERNAL' }
    ];

    // Reálni investori
    const realInvestors = [
      { id: 'investor_andrej', userId: 'inv_andrej', name: 'Andrej Pavlík', email: 'andrej.pavlik@example.com' },
      { id: 'investor_mikail', userId: 'inv_mikail', name: 'Mikail Pirgozi', email: 'mikail.pirgozi@example.com' },
      { id: 'investor_vladimir', userId: 'inv_vladimir', name: 'Vladimír Dužek', email: 'vladimir.duzek@example.com' },
      { id: 'investor_marian', userId: 'inv_marian', name: 'Marián Cingel', email: 'marian.cingel@example.com' },
      { id: 'investor_richard', userId: 'inv_richard', name: 'Richard Zimányi', email: 'richard.zimanyi@example.com' },
      { id: 'investor_roman', userId: 'inv_roman', name: 'Roman Priecel', email: 'roman.priecel@example.com' },
      { id: 'investor_patrik', userId: 'inv_patrik', name: 'Patrik Pavlík', email: 'patrik.pavlik@example.com' },
      { id: 'investor_kamil', userId: 'inv_kamil', name: 'Kamil Zavodsky', email: 'kamil.zavodsky@example.com' },
      { id: 'investor_steffen', userId: 'inv_steffen', name: 'Steffen Tatge', email: 'steffen.tatge@example.com' },
      { id: 'investor_jan', userId: 'inv_jan', name: 'Ján Lajda', email: 'jan.lajda@example.com' },
      { id: 'investor_stanislava', userId: 'inv_stanislava', name: 'Stanislava Záčiková', email: 'stanislava.zacikova@example.com' },
      { id: 'investor_matus', userId: 'inv_matus', name: 'Matúš Hološ', email: 'matus.holos@example.com' },
      { id: 'investor_rezervny', userId: 'inv_rezervny', name: 'Rezervný fond', email: 'rezervny.fond@example.com' }
    ];

    // Reálne cashflows (kapitál k 30.6.2025)
    const realCashflows = [
      { id: 'cf_andrej', investorId: 'investor_andrej', type: 'DEPOSIT', amount: 427657, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_mikail', investorId: 'investor_mikail', type: 'DEPOSIT', amount: 427657, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_vladimir', investorId: 'investor_vladimir', type: 'DEPOSIT', amount: 126274, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_marian', investorId: 'investor_marian', type: 'DEPOSIT', amount: 145724, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_richard', investorId: 'investor_richard', type: 'DEPOSIT', amount: 70224, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_roman', investorId: 'investor_roman', type: 'DEPOSIT', amount: 44129, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_patrik', investorId: 'investor_patrik', type: 'DEPOSIT', amount: 86627, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_kamil', investorId: 'investor_kamil', type: 'DEPOSIT', amount: 108462, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_steffen', investorId: 'investor_steffen', type: 'DEPOSIT', amount: 95268, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_jan', investorId: 'investor_jan', type: 'DEPOSIT', amount: 64515, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_stanislava', investorId: 'investor_stanislava', type: 'DEPOSIT', amount: 57791, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_matus', investorId: 'investor_matus', type: 'DEPOSIT', amount: 86687, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' },
      { id: 'cf_rezervny', investorId: 'investor_rezervny', type: 'DEPOSIT', amount: 13098, date: '2025-06-30', note: 'Aktuálny kapitál k 30.6.2025' }
    ];

    // Vytvoriť reálnych používateľov
    console.log('👥 Vytváram reálnych používateľov...');
    for (const user of realUsers) {
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            password: '$2b$10$dummy.hash.for.now',
            createdAt: new Date('2025-09-03T13:50:41.705Z')
          }
        });
        console.log(`  ✅ Vytvorený používateľ: ${user.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️  Používateľ ${user.name} už existuje, preskakujem`);
        } else {
          console.error(`  ❌ Chyba pri vytváraní používateľa ${user.name}:`, error.message);
        }
      }
    }

    // Vytvoriť reálnych investorov
    console.log('💼 Vytváram reálnych investorov...');
    for (const investor of realInvestors) {
      try {
        await prisma.investor.create({
          data: {
            id: investor.id,
            userId: investor.userId,
            name: investor.name,
            email: investor.email,
            createdAt: new Date('2025-09-03T13:50:50.289Z')
          }
        });
        console.log(`  ✅ Vytvorený investor: ${investor.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️  Investor ${investor.name} už existuje, preskakujem`);
        } else {
          console.error(`  ❌ Chyba pri vytváraní investora ${investor.name}:`, error.message);
        }
      }
    }

    // Vytvoriť reálne cashflows
    console.log('💰 Vytváram reálne cashflows...');
    for (const cashflow of realCashflows) {
      try {
        await prisma.investorCashflow.create({
          data: {
            id: cashflow.id,
            investorId: cashflow.investorId,
            type: cashflow.type,
            amount: cashflow.amount,
            date: new Date(cashflow.date + 'T00:00:00.000Z'),
            note: cashflow.note,
            createdAt: new Date('2025-09-03T13:51:02.241Z')
          }
        });
        console.log(`  ✅ Vytvorený cashflow: ${cashflow.amount.toLocaleString()} EUR pre ${realInvestors.find(i => i.id === cashflow.investorId)?.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️  Cashflow už existuje, preskakujem`);
        } else {
          console.error(`  ❌ Chyba pri vytváraní cashflow:`, error.message);
        }
      }
    }

    console.log('✅ REÁLNE dáta úspešne obnovené!');
    
    // Vypočítať celkový kapitál
    const totalCapital = realCashflows.reduce((sum, cf) => sum + cf.amount, 0);
    console.log(`💰 Celkový kapitál investorov: €${totalCapital.toLocaleString()}`);
    
    // Overiť obnovené dáta
    const counts = {
      users: await prisma.user.count(),
      investors: await prisma.investor.count(),
      cashflows: await prisma.investorCashflow.count()
    };
    
    console.log('📊 Aktuálne počty v databáze:', counts);
    
  } catch (error) {
    console.error('❌ Obnovenie zlyhalo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

replaceWithRealInvestors();
