import sql from "mssql";
import * as h3 from "h3-js";
import { connectToDatabase } from "../services/db.js";

const TARGET_RES = 9;

const allowRemote = process.argv.includes("--allow-remote");
const dryRun = process.argv.includes("--dry-run");

function toTargetRes(id) {
  return h3.getResolution(id) > TARGET_RES
    ? h3.cellToParent(id, TARGET_RES)
    : id;
}

async function main() {
  const server = process.env.SERVER_NAME || "";
  if (server.includes("database.windows.net") && !allowRemote) {
    throw new Error(
      `Refusing to run against remote server "${server}". Point .env at a local DB, or pass --allow-remote if this is an intentional production migration.`
    );
  }

  const pool = await connectToDatabase();
  console.log(`Target: ${server}/${process.env.DATABASE_NAME}`);
  if (dryRun) console.log("DRY RUN - no writes will be made");

  const { recordset: rows } = await pool
    .request()
    .query("SELECT AnnotationID, H3ID FROM dbo.Hexagon");

  const byAnnotation = new Map();
  const beforeByRes = {};

  for (const { AnnotationID, H3ID } of rows) {
    const res = h3.getResolution(H3ID);
    beforeByRes[res] = (beforeByRes[res] || 0) + 1;

    if (!byAnnotation.has(AnnotationID)) {
      byAnnotation.set(AnnotationID, new Set());
    }
    byAnnotation.get(AnnotationID).add(toTargetRes(H3ID));
  }

  let after = 0;
  for (const cells of byAnnotation.values()) after += cells.size;

  console.log(`Rows before:      ${rows.length}`);
  console.log(`  by resolution:  ${JSON.stringify(beforeByRes)}`);
  console.log(`Annotations:      ${byAnnotation.size}`);
  console.log(`Rows after:       ${after}`);
  console.log(
    `Reduction:        ${
      rows.length ? (rows.length / (after || 1)).toFixed(2) : 0
    }x`
  );

  if (dryRun) {
    await pool.close();
    return;
  }

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    await transaction.request().query("DELETE FROM dbo.Hexagon");

    let written = 0;
    for (const [annotationId, cells] of byAnnotation) {
      const list = [...cells];
      for (let i = 0; i < list.length; i += 1000) {
        const values = list
          .slice(i, i + 1000)
          .map((hex) => `(${annotationId}, '${hex}')`)
          .join(",");

        await transaction
          .request()
          .query(
            `INSERT INTO [dbo].[Hexagon] (AnnotationID, H3ID) VALUES ${values}`
          );

        written += Math.min(1000, list.length - i);
      }
    }

    await transaction.commit();
    console.log(`Committed. ${rows.length} -> ${written} rows at res ${TARGET_RES}.`);
  } catch (error) {
    await transaction.rollback();
    console.error("Rolled back, no changes made.");
    throw error;
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
