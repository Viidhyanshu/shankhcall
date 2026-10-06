import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: DATABASE_URL is not set in environment.');
  process.exit(1);
}

const sql = neon(databaseUrl);

const forestSamples = [
  { id: 'seed-f-1', lat: 29.53, lng: 78.7747, type: 'Tree', desc: 'Unusual tree cutting reported near reserve area', src: 'citizen', verified: false, lang: 'en', sentiment: -0.2 },
  { id: 'seed-f-2', lat: 21.5937, lng: 86.3487, type: 'Fire', desc: 'Forest fire spreading near hill region', src: 'citizen', verified: false, lang: 'en', sentiment: -0.8 },
  { id: 'seed-f-3', lat: 22.3345, lng: 80.6115, type: 'Hunting', desc: 'Hunting spotted in restricted area', src: 'citizen', verified: false, lang: 'en', sentiment: -0.5 },
  { id: 'seed-f-4', lat: 26.5775, lng: 93.1711, type: 'Poaching', desc: 'Poaching activity suspected by patrol team', src: 'citizen', verified: false, lang: 'en', sentiment: -0.7 },
  { id: 'seed-f-5', lat: 12.2958, lng: 76.6394, type: 'Logging', desc: 'Illegal logging trucks seen at night', src: 'citizen', verified: false, lang: 'en', sentiment: -0.4 },
  { id: 'seed-f-6', lat: 21.1240, lng: 70.8242, type: 'Wind', desc: 'Several trees blown down after storm', src: 'citizen', verified: false, lang: 'en', sentiment: -0.3 }
];

const oceanSamples = [
  { id: 'seed-o-1', lat: 13.0827, lng: 80.2707, type: 'swell', desc: 'Strong swell surges hitting Marina Beach', src: 'citizen', verified: false, lang: 'en', sentiment: -0.4 },
  { id: 'seed-o-2', lat: 17.6868, lng: 83.2185, type: 'waves', desc: 'High waves near RK Beach; fishermen advised caution', src: 'official', verified: true, lang: 'en', sentiment: -0.1 },
  { id: 'seed-o-3', lat: 19.0760, lng: 72.8777, type: 'flood', desc: 'लोकल बाढ़ की सूचना, कोलाबा साइड', src: 'citizen', verified: false, lang: 'hi', sentiment: -0.6 },
  { id: 'seed-o-4', lat: 20.2961, lng: 85.8245, type: 'tide', desc: 'Unusual high tide reported by lighthouse team', src: 'citizen', verified: false, lang: 'en', sentiment: -0.2 },
  { id: 'seed-o-5', lat: 25.2961, lng: 55.8245, type: 'flood', desc: 'Unusual high tide reported by NGO team', src: 'citizen', verified: false, lang: 'en', sentiment: -0.5 },
  { id: 'seed-o-6', lat: 21.1458, lng: 79.0882, type: 'damage', desc: 'Sea wall damage spotted after storm surge', src: 'citizen', verified: false, lang: 'en', sentiment: -0.7 }
];

async function seed() {
  console.log('Connecting to Neon PostgreSQL and creating tables...');

  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      src TEXT NOT NULL DEFAULT 'citizen',
      verified BOOLEAN DEFAULT FALSE,
      ts BIGINT NOT NULL,
      lang TEXT NOT NULL DEFAULT 'en',
      sentiment DOUBLE PRECISION DEFAULT 0,
      media JSONB DEFAULT '[]'::jsonb
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'citizen',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  console.log('Inserting seed reports...');
  const now = Date.now();
  const allReports = [...forestSamples, ...oceanSamples];

  for (let i = 0; i < allReports.length; i++) {
    const r = allReports[i];
    const ts = now - 1000 * 60 * 60 * (i + 1);
    await sql`
      INSERT INTO reports (id, lat, lng, type, description, src, verified, ts, lang, sentiment, media)
      VALUES (
        ${r.id},
        ${r.lat},
        ${r.lng},
        ${r.type},
        ${r.desc},
        ${r.src},
        ${r.verified},
        ${ts},
        ${r.lang},
        ${r.sentiment},
        '[]'::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        type = EXCLUDED.type,
        description = EXCLUDED.description,
        src = EXCLUDED.src,
        verified = EXCLUDED.verified,
        ts = EXCLUDED.ts,
        lang = EXCLUDED.lang,
        sentiment = EXCLUDED.sentiment;
    `;
  }

  console.log(`Successfully seeded ${allReports.length} hazard reports into Neon database!`);
}

seed()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
