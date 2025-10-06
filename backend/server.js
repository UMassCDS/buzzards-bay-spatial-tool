import express from "express";
import cors from "cors";
import { connectToDatabase, initializeDatabase } from "./services/db.js";
import sql from "mssql";
import dotenv from "dotenv";
import morgan from "morgan";
import { promises } from "fs";
import path from "path";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
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

      if (annotation.annotationHexes?.length > 0) {
        const batchSize = 1000; // SQL server limit
        for (let i = 0; i < annotation.annotationHexes.length; i += batchSize) {
          const batchHexes = annotation.annotationHexes.slice(i, i + batchSize);
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

app.get("/data/annotation_types", async (req, res) => {
  try {
    const filePath = "./data/annotationtypes.json";
    const data = await promises.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    console.log("Error reading types: ", error);
    res.status(500).json({ error: "Failed fetching types" });
  }
});

app.get("/data/sensor_sites", async (req, res) => {
  try {

    // const filePath = "./data/sites/EastCoastPoint_2km.csv";
    const filePath = "./data/example_sites/sites.csv"
    const data = await promises.readFile(filePath, "utf-8");

    // Parse CSV data
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');

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
