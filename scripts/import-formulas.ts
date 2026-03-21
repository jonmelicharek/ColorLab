#!/usr/bin/env ts-node
// ═══════════════════════════════════════════════════════════════
// ColorLab AI — CSV Formula Importer
// ═══════════════════════════════════════════════════════════════
// Usage: npx ts-node scripts/import-formulas.ts ./formulas.csv
//
// CSV columns (header row required):
//   beforeImageUrl, beforeHairColor, beforeLevel, beforeHairType, beforeCondition,
//   afterImageUrl, afterHairColor, afterLevel,
//   technique, formulaDetails,
//   colorBrand, colorLine, colorShades, developer, developerRatio,
//   lightener, lightenerMix, toner, tonerDeveloper, additives,
//   processingTime, tags, difficulty, priceRange, estimatedTime, notes
//
// Multi-value fields (colorShades, additives, tags) use semicolons:
//   "9V;9P"  →  ["9V", "9P"]
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function splitMulti(val: string): string[] {
  if (!val) return [];
  return val.split(';').map(s => s.trim()).filter(Boolean);
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: npx ts-node scripts/import-formulas.ts <path-to-csv>');
    console.error('\nSee scripts/sample-formulas.csv for the expected format.');
    process.exit(1);
  }

  const fullPath = path.resolve(csvPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length < 2) {
    console.error('CSV must have a header row + at least one data row.');
    process.exit(1);
  }

  const headers = parseCSVLine(lines[0]);
  console.log(`\n🎨 Importing formulas from: ${path.basename(fullPath)}`);
  console.log(`   Columns: ${headers.length}`);
  console.log(`   Rows: ${lines.length - 1}\n`);

  let imported = 0;
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx] || '';
    });

    try {
      await prisma.formulaEntry.create({
        data: {
          beforeImageUrl: row.beforeImageUrl || '/images/placeholder.jpg',
          beforeHairColor: row.beforeHairColor || 'Unknown',
          beforeHairType: row.beforeHairType || null,
          beforeCondition: row.beforeCondition || null,
          beforeLevel: row.beforeLevel ? parseInt(row.beforeLevel) : null,
          afterImageUrl: row.afterImageUrl || '/images/placeholder.jpg',
          afterHairColor: row.afterHairColor || 'Unknown',
          afterLevel: row.afterLevel ? parseInt(row.afterLevel) : null,
          technique: row.technique || 'Not specified',
          formulaDetails: row.formulaDetails || 'Not specified',
          colorBrand: row.colorBrand || null,
          colorLine: row.colorLine || null,
          colorShades: splitMulti(row.colorShades),
          developer: row.developer || null,
          developerRatio: row.developerRatio || null,
          lightener: row.lightener || null,
          lightenerMix: row.lightenerMix || null,
          toner: row.toner || null,
          tonerDeveloper: row.tonerDeveloper || null,
          additives: splitMulti(row.additives),
          processingTime: row.processingTime || null,
          tags: splitMulti(row.tags),
          difficulty: row.difficulty || null,
          priceRange: row.priceRange || null,
          estimatedTime: row.estimatedTime || null,
          notes: row.notes || null,
        },
      });
      imported++;
      console.log(`  ✓ Row ${i}: ${row.technique} (Lvl ${row.beforeLevel} → ${row.afterLevel})`);
    } catch (err: any) {
      errors++;
      console.error(`  ✗ Row ${i}: ${err.message}`);
    }
  }

  console.log(`\n✅ Done: ${imported} imported, ${errors} errors.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
