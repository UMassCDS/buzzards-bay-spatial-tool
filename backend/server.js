import express from "express";
import cors from "cors";
import { connectToDatabase, initializeDatabase } from "./services/db.js";
import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
        .input(`Title_${annotationIndex}`, sql.Text, annotation.title)
        .input(`Note_${annotationIndex}`, sql.Text, annotation.notes)
        .query(
          `INSERT INTO [dbo].[Annotation] (InterviewID, StartedAt, ModifiedAt, AnnotationType, Title, Note) OUTPUT INSERTED.AnnotationID VALUES (@InterviewID_${annotationIndex}, @StartedAt_${annotationIndex}, @ModifiedAt_${annotationIndex}, @AnnotationType_${annotationIndex}, @Title_${annotationIndex}, @Note_${annotationIndex})`
        );

      const annotationId = annotationInsertResult.recordset[0].AnnotationID;
      console.log("Annotation inserted, ID:", annotationId);

      if (annotation.annotationHexes?.length > 0) {
        const hexValues = annotation.annotationHexes
          .map((hex) => `(${annotationId}, '${hex}')`)
          .join(",");

        await request.query(
          `INSERT INTO [dbo].[Hexagon] (AnnotationID, H3ID) VALUES ${hexValues}`
        );

        console.log("Hexagons inserted");
      }

      // for (const [index, h3Id] of (
      //   annotation.annotationHexes || []
      // ).entries()) {
      //   await request
      //     .input(
      //       `AnnotationID_${annotationIndex}_${index}`,
      //       sql.Int,
      //       annotationId
      //     )
      //     .input(`H3ID_${annotationIndex}_${index}`, sql.NVarChar(255), h3Id)
      //     .query(
      //       `INSERT INTO [dbo].[Hexagon] (AnnotationID, H3ID) VALUES (@AnnotationID_${annotationIndex}_${index}, @H3ID_${annotationIndex}_${index})`
      //     );
      // }
      // console.log("Hexagons inserted");
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

initializeDatabase()
  .then(() => {
    console.log("Database initialization complete");
  })
  .catch((err) => {
    console.error("Error during database initialization:", err);
  });

const port = process.env.VITE_BACKEND_PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
