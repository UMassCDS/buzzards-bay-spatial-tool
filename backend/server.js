import express from "express";
import cors from "cors";
import { connectToDatabase, initializeDatabase } from "./services/db.js";
import sql from "mssql";
import dotenv from "dotenv";
import morgan from "morgan";
import { promises } from "fs";
import * as h3 from "h3-js";

dotenv.config();

// Resolution used by the frontend to generate annotation hexes. Kept in sync so
// we can un-compact hexes back to their full-resolution set before storing them.
const HEX_RESOLUTION = 10;

const app = express();
app.use(cors());
// Selections over large areas produce big hex arrays. The frontend compacts them
// before sending, but allow a generous body size so we never reject a valid save.
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));

app.get("/", async (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.post("/api/save", async (req, res) => {
  const interview = req.body;
  console.log(interview);

  const pool = await connectToDatabase();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const request = transaction.request();

    console.log("Attempting to insert interview...");
    const interviewInsertResult = await request
      .input("IntervieweeCode", sql.NVarChar(128), interview.intervieweeId)
      .input("Timestamp", sql.DateTime, new Date())
      .query(
        `INSERT INTO [dbo].[Interview] (IntervieweeCode, Timestamp) OUTPUT INSERTED.InterviewID VALUES (@IntervieweeCode, @Timestamp)`
      );

    console.log(
      "Interview inserted, ID:",
      interviewInsertResult.recordset[0].InterviewID
    );
    const interviewId = interviewInsertResult.recordset[0].InterviewID;
    // console.log(interview.annotations);

    // Gotta do unique names for the parameters for EACH entry
    for (const [
      annotationIndex,
      annotation,
    ] of interview.annotations.entries()) {
      const annotationInsertResult = await request
        .input(`InterviewID_${annotationIndex}`, sql.Int, interviewId)
        .input(
          `StartedAt_${annotationIndex}`,
          sql.DateTime,
          annotation.createdAt
        )
        .input(
          `ModifiedAt_${annotationIndex}`,
          sql.DateTime,
          annotation.modifiedAt
        )
        .input(
          `AnnotationType_${annotationIndex}`,
          sql.NVarChar(128),
          annotation.type
        )
        .input(`Title_${annotationIndex}`, sql.Text, annotation.dataTitle || "") // For backwards compatibility
        .input(`Note_${annotationIndex}`, sql.Text, annotation.explanation || "") // For backwards compatibility
        .input(`DataTitle_${annotationIndex}`, sql.Text, annotation.dataTitle || "")
        .input(`LocationRating_${annotationIndex}`, sql.NVarChar(50), annotation.locationRating || "Not applicable")
        .input(`Explanation_${annotationIndex}`, sql.Text, annotation.explanation || "")
        .query(
          `INSERT INTO [dbo].[Annotation] (InterviewID, StartedAt, ModifiedAt, AnnotationType, Title, Note, DataTitle, LocationRating, Explanation) OUTPUT INSERTED.AnnotationID VALUES (@InterviewID_${annotationIndex}, @StartedAt_${annotationIndex}, @ModifiedAt_${annotationIndex}, @AnnotationType_${annotationIndex}, @Title_${annotationIndex}, @Note_${annotationIndex}, @DataTitle_${annotationIndex}, @LocationRating_${annotationIndex}, @Explanation_${annotationIndex})`
        );

      const annotationId = annotationInsertResult.recordset[0].AnnotationID;
      console.log("Annotation inserted, ID:", annotationId);

      // The frontend may send a compacted set of hexes (mixed resolutions) to
      // keep the payload small. Expand it back to the full HEX_RESOLUTION set so
      // the Hexagon table always stores uniform-resolution cells. Un-compacting a
      // set that is already at full resolution is a no-op, so this is safe either way.
      let hexes = annotation.annotationHexes || [];
      if (hexes.length > 0) {
        try {
          hexes = h3.uncompactCells(hexes, HEX_RESOLUTION);
        } catch (err) {
          console.warn(
            "Failed to un-compact hexes, storing as received:",
            err.message
          );
        }
      }

      if (hexes.length > 0) {
        const batchSize = 1000; // SQL server limit
        for (let i = 0; i < hexes.length; i += batchSize) {
          const batchHexes = hexes.slice(i, i + batchSize);
          const hexValues = batchHexes
            .map((hex) => `(${annotationId}, '${hex}')`)
            .join(",");

          await request.query(
            `INSERT INTO [dbo].[Hexagon] (AnnotationID, H3ID) VALUES ${hexValues}`
          );

          console.log("Hexagons batch inserted");
        }
      }
    }

    await transaction.commit();

    res.status(200).json({ message: "Interview saved" });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction failed with error:", {
      message: error.message,
      procedure: error.procedure,
      number: error.number,
      state: error.state,
      class: error.class,
      lineNumber: error.lineNumber,
      data: interview, // Log the input data
    });
    console.error(error);
    res.status(500).json({ message: "Error saving interview" });
  }
});

app.get("/data/sensor_sites", async (req, res) => {
  try {
    const region = req.query.region || "newengland";

    // Map region names to file paths
    const regionFiles = {
      "newengland": "./data/sites/NewEngland_2km_EPSG_4326.csv",
      "midatlanticnorth": "./data/sites/MidAtlanticNorth_2km_EPSG_4326.csv",
      "midatlanticsouth": "./data/sites/MidAtlanticSouth_2km_EPSG_4326.csv"
    };

    const filePath = regionFiles[region.toLowerCase()];
    if (!filePath) {
      return res.status(400).json({ error: "Invalid region specified" });
    }

    const data = await promises.readFile(filePath, "utf-8");

    // Parse CSV data
    const lines = data.trim().split('\n');

    // Convert CSV to JSON array
    const jsonData = lines.slice(1).map((line, index) => {
      const values = line.split(',');
      return {
        site: `Site ${index + 1}`,
        latitude: parseFloat(values[2]), // POINT_Y
        longitude: parseFloat(values[1]), // POINT_X
        description: `Evenly spaced node ${index + 1}`,
        tide_station: "N/A"
      };
    });

    res.json(jsonData);
  } catch (error) {
    console.log("Error reading sensor sites: ", error);
    res.status(500).json({ error: "Failed fetching sensor sites" });
  }
});

// Error-handling middleware. Turns body-parser's "payload too large" (thrown
// before any route runs) into a clear, actionable JSON message for the client.
app.use((err, req, res, next) => {
  if (err && (err.type === "entity.too.large" || err.status === 413)) {
    console.error("Rejected save: request body too large");
    return res.status(413).json({
      message:
        "The selected area is too large to save. Please select a smaller region, or split it into multiple annotations.",
    });
  }
  console.error("Unhandled request error:", err);
  return res.status(500).json({ message: "Unexpected server error" });
});

const checkDatabaseConnection = async () => {
  try {
    console.log("Checking database connection...");
    const pool = await connectToDatabase();
    await pool.query`SELECT 1`;
    console.log("Database connection is healthy");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

setInterval(checkDatabaseConnection, 60000);

initializeDatabase()
  .then(() => {
    console.log("Database initialization complete");
  })
  .catch((err) => {
    console.error("Error during database initialization:", err);
  });

const port = process.env.VITE_BACKEND_PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
