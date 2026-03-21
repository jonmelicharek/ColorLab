import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleFormulas = [
  {
    beforeImageUrl: '/images/samples/before-1.jpg',
    beforeHairColor: 'Level 4 warm brown with orange undertones',
    beforeHairType: '2A wavy, medium porosity',
    beforeCondition: 'Previously colored, box dye history',
    beforeLevel: 4,
    afterImageUrl: '/images/samples/after-1.jpg',
    afterHairColor: 'Level 8 cool-toned beige blonde balayage',
    afterLevel: 8,
    technique: 'Balayage with foil boosting',
    formulaDetails: `Lightener: Redken Flash Lift + 30 vol (1:2 ratio). Paint balayage freehand on mid-lengths to ends. Foil boost face frame pieces. Process 45 minutes checking every 10. Rinse when lifted to pale yellow (level 9-10 inside foils). Toner: Shades EQ 9V + 9P equal parts with processing solution. Process 20 minutes. Finish with Acidic Bonding Concentrate conditioner.`,
    colorBrand: 'Redken',
    colorLine: 'Shades EQ',
    colorShades: ['9V', '9P'],
    developer: '30 vol',
    developerRatio: '1:2',
    lightener: 'Flash Lift',
    lightenerMix: '30 vol, 1:2 ratio',
    toner: 'Shades EQ 9V + 9P equal parts',
    tonerDeveloper: 'Processing solution',
    additives: ['Olaplex No.1'],
    processingTime: '45 min lightener, 20 min toner',
    tags: ['balayage', 'blonde', 'cool-tone', 'redken', 'beige'],
    difficulty: 'intermediate',
    priceRange: '$$$',
    estimatedTime: '3-4 hours',
    notes: 'Client had box dye history — did a strand test first. Needed foil boosting for adequate lift through resistant mid-shaft.',
  },
  {
    beforeImageUrl: '/images/samples/before-2.jpg',
    beforeHairColor: 'Level 6 neutral brown, virgin hair',
    beforeHairType: '1C straight, low porosity',
    beforeCondition: 'Virgin hair, healthy',
    beforeLevel: 6,
    afterImageUrl: '/images/samples/after-2.jpg',
    afterHairColor: 'Level 7 warm copper auburn all-over',
    afterLevel: 7,
    technique: 'All-over color with gloss finish',
    formulaDetails: `Color: Wella Koleston Perfect 7/43 + 7/34 (equal parts) with 20 vol developer (1:1 ratio). Apply root to ends on dry hair. Process 35 minutes. Rinse. Gloss: Shinefinity 08/34 with activator. Process 20 minutes. Finish with Color Motion mask.`,
    colorBrand: 'Wella',
    colorLine: 'Koleston Perfect',
    colorShades: ['7/43', '7/34'],
    developer: '20 vol',
    developerRatio: '1:1',
    lightener: null,
    lightenerMix: null,
    toner: null,
    tonerDeveloper: null,
    additives: ['Wellaplex No.1'],
    processingTime: '35 min color, 20 min gloss',
    tags: ['auburn', 'copper', 'warm', 'all-over', 'wella', 'virgin-hair'],
    difficulty: 'beginner',
    priceRange: '$$',
    estimatedTime: '1.5-2 hours',
    notes: 'Virgin hair lifts easily. Low porosity — apply to dry hair for better penetration.',
  },
  {
    beforeImageUrl: '/images/samples/before-3.jpg',
    beforeHairColor: 'Level 2 black with prior permanent color',
    beforeHairType: '3A curly, high porosity',
    beforeCondition: 'Previously colored, slight damage at ends',
    beforeLevel: 2,
    afterImageUrl: '/images/samples/after-3.jpg',
    afterHairColor: 'Level 5 rich chocolate with caramel money pieces',
    afterLevel: 5,
    technique: 'Money piece highlights with all-over gloss',
    formulaDetails: `Money pieces: Schwarzkopf BlondMe Bond Enforcing Premium Lift 9+ with 20 vol (1:1.5). Foil face-framing pieces (4-5 foils per side). Process 35 min. All-over gloss: Schwarzkopf IGORA Vibrance 5-65 + 5-57 (2:1 ratio) with activator lotion. Process 20 min. Bond treatment: Fibreplex No.2 post-service.`,
    colorBrand: 'Schwarzkopf',
    colorLine: 'IGORA Vibrance',
    colorShades: ['5-65', '5-57'],
    developer: '20 vol',
    developerRatio: '1:1.5',
    lightener: 'BlondMe Premium Lift 9+',
    lightenerMix: '20 vol, 1:1.5 ratio',
    toner: null,
    tonerDeveloper: null,
    additives: ['Fibreplex No.1', 'Fibreplex No.2'],
    processingTime: '35 min lightener, 20 min gloss',
    tags: ['money-piece', 'face-frame', 'chocolate', 'caramel', 'schwarzkopf', 'curly'],
    difficulty: 'intermediate',
    priceRange: '$$$',
    estimatedTime: '2.5-3 hours',
    notes: 'High porosity curly hair — use lower volume developer for controlled lift. Avoid overlapping on previously lightened areas.',
  },
];

async function main() {
  console.log('🎨 Seeding ColorLab AI database...\n');

  for (const formula of sampleFormulas) {
    const entry = await prisma.formulaEntry.create({ data: formula });
    console.log(`  ✓ Created: ${entry.technique} (Level ${entry.beforeLevel} → ${entry.afterLevel})`);
  }

  console.log(`\n✅ Seeded ${sampleFormulas.length} formula entries.`);
  console.log('💡 Add more entries via the admin dashboard at /dashboard');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
