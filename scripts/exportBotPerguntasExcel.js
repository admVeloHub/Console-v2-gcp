/**
 * Exporta a collection MongoDB console_conteudo.Bot_perguntas para planilha Excel (.xlsx).
 *
 * VERSION: v1.1.0 | DATE: 2026-05-26 | AUTHOR: VeloHub Development Team
 * CHANGELOG: v1.1.0 — Modo --dry-run: conecta, conta documentos, amostra de chaves; não grava .xlsx.
 *
 * Uso (na raiz do projeto Console):
 *   node scripts/exportBotPerguntasExcel.js
 *   node scripts/exportBotPerguntasExcel.js --dry-run
 *   npm run dryrun
 *
 * Requer na FONTE DA VERDADE/.env: MONGODB_URI ou MONGO_ENV com string Atlas/local.
 *
 * Observação: a dependência SheetJS (`xlsx`) gera arquivo no formato OOXML (.xlsx), que o Excel
 * abre normalmente; formato binário legado .xls (BIFF8) não é suportado pela versão community.
 *
 * Celulas muito grandes (ex.: base64 em `media`) são truncadas ao limite do Excel (~32k caracteres).
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const XLSX = require('xlsx');

const EXCEL_MAX_CELL = 32700;

require(path.join(__dirname, '../backend/config/loadFonteVerdadeEnv')).loadFrom(__dirname);

function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_ENV ||
    process.env.MONGO_URI ||
    ''
  ).trim();
}

function cellValue(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    try {
      const s = JSON.stringify(v);
      return s.length > EXCEL_MAX_CELL ? s.slice(0, EXCEL_MAX_CELL) + '…[truncado]' : s;
    } catch {
      return String(v);
    }
  }
  const s = String(v);
  return s.length > EXCEL_MAX_CELL ? s.slice(0, EXCEL_MAX_CELL) + '…[truncado]' : s;
}

function isDryRun() {
  const a = process.argv.slice(2);
  return a.includes('--dry-run') || a.includes('--dryrun');
}

async function main() {
  const dryRun = isDryRun();
  const uri = getMongoUri();
  if (!uri) {
    console.error(
      'Defina MONGODB_URI ou MONGO_ENV na FONTE DA VERDADE/.env (ou VELOHUB_DOTENV_PATH).'
    );
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'exports');
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const outfile = path.join(outDir, `Bot_perguntas_${stamp}.xlsx`);

  const client = new MongoClient(uri, { maxPoolSize: 5 });
  await client.connect();
  try {
    const col = client.db('console_conteudo').collection('Bot_perguntas');

    if (dryRun) {
      const total = await col.countDocuments({});
      const sample = await col.findOne(
        {},
        { projection: { pergunta: 1, palavrasChave: 1, createdAt: 1 } }
      );
      console.log('[dry-run] database: console_conteudo | collection: Bot_perguntas');
      console.log(`[dry-run] total de documentos: ${total}`);
      if (sample) {
        console.log('[dry-run] amostra (projeção parcial):', {
          _id: sample._id && String(sample._id),
          pergunta:
            typeof sample.pergunta === 'string'
              ? sample.pergunta.slice(0, 120) +
                (sample.pergunta.length > 120 ? '…' : '')
              : sample.pergunta,
          palavrasChave: sample.palavrasChave,
          createdAt: sample.createdAt,
        });
      } else {
        console.log('[dry-run] sem documentos para amostra.');
      }
      console.log('[dry-run] Nenhum arquivo escrito (sem gravação de .xlsx).');
      return;
    }

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const docs = await col.find({}).sort({ _id: 1 }).toArray();
    if (docs.length === 0) {
      console.warn('Nenhum documento em Bot_perguntas. Arquivo será criado vazio.');
    }

    const rows = docs.map((d) => ({
      _id: cellValue(d._id && d._id.toString()),
      pergunta: cellValue(d.pergunta),
      resposta: cellValue(d.resposta),
      palavrasChave: cellValue(d.palavrasChave),
      sinonimos: cellValue(d.sinonimos),
      tabulacao: cellValue(d.tabulacao),
      media: cellValue(d.media),
      createdAt: cellValue(
        d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt
      ),
      updatedAt: cellValue(
        d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt
      ),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bot_perguntas');

    XLSX.writeFile(wb, outfile, { bookType: 'xlsx' });
    console.log(`Exportados ${docs.length} documento(s).`);
    console.log(`Arquivo: ${outfile}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
