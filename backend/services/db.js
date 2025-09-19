import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const config = {
  user: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
  server: process.env.SERVER_NAME,
  database: process.env.DATABASE_NAME,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
  requestTimeout: 30000,
};

export async function initializeDatabase() {
  const pool = await connectToDatabase();

  const tableCreationQueries = [
    // Interview table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Interview' AND xtype='U')
     CREATE TABLE Interview (
       InterviewID INT IDENTITY(1,1) PRIMARY KEY,
       IntervieweeCode NVARCHAR(128),
       Timestamp DATETIME
     );`,

    // Annotation table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Annotation' AND xtype='U')
     CREATE TABLE Annotation (
       AnnotationID INT IDENTITY(1,1) PRIMARY KEY,
       InterviewID INT,
       StartedAt DATETIME,
       ModifiedAt DATETIME,
       AnnotationType NVARCHAR(255),
       Title TEXT,
       Note TEXT,
       DataTitle TEXT,
       LocationRating NVARCHAR(50),
       Explanation TEXT,
       FOREIGN KEY (InterviewID) REFERENCES Interview(InterviewID)
     );`,

    // Hexagon table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Hexagon' AND xtype='U')
     CREATE TABLE Hexagon (
       AnnotationID INT,
       H3ID TEXT,
       FOREIGN KEY (AnnotationID) REFERENCES Annotation(AnnotationID)
     );`,
  ];

  try {
    for (const query of tableCreationQueries) {
      await pool.request().query(query);
    }

    // Add new columns to existing Annotation table if they don't exist
    const columnAdditionQueries = [
      `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'Annotation' AND COLUMN_NAME = 'DataTitle')
       ALTER TABLE Annotation ADD DataTitle TEXT;`,

      `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'Annotation' AND COLUMN_NAME = 'LocationRating')
       ALTER TABLE Annotation ADD LocationRating NVARCHAR(50);`,

      `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'Annotation' AND COLUMN_NAME = 'Explanation')
       ALTER TABLE Annotation ADD Explanation TEXT;`
    ];

    // Migrate old data to new columns (but keep old columns for backwards compatibility)
    const dataMigrationQueries = [
      // Migrate Title to DataTitle
      `IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Annotation' AND COLUMN_NAME = 'Title')
       AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Annotation' AND COLUMN_NAME = 'DataTitle')
       BEGIN
         UPDATE Annotation
         SET DataTitle = ISNULL(CAST(Title AS NVARCHAR(MAX)), '')
         WHERE DataTitle IS NULL OR CAST(DataTitle AS NVARCHAR(MAX)) = '';
       END`,

      // Migrate Note to Explanation
      `IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Annotation' AND COLUMN_NAME = 'Note')
       AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Annotation' AND COLUMN_NAME = 'Explanation')
       BEGIN
         UPDATE Annotation
         SET Explanation = ISNULL(CAST(Note AS NVARCHAR(MAX)), '')
         WHERE Explanation IS NULL OR CAST(Explanation AS NVARCHAR(MAX)) = '';
       END`

      // NOTE: Title and Note columns are kept for backwards compatibility with main branch
      // Drop them manually later when main branch is updated
    ];

    for (const query of columnAdditionQueries) {
      await pool.request().query(query);
    }

    for (const query of dataMigrationQueries) {
      await pool.request().query(query);
    }

    console.log("Database tables checked and initialized");
  } catch (error) {
    console.error("Error initializing database", error);
  }
}

export async function connectToDatabase(maxRetries = 5, retryDelay = 5000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const pool = await sql.connect(config);
      console.log("Connected to database");
      return pool;
    } catch (error) {
      attempt++;
      console.error(
        `Database connection failed (attempt ${attempt} of ${maxRetries}):`,
        error
      );

      if (attempt >= maxRetries) {
        console.error(
          "Maximum retry attempts reached. Unable to connect to the database."
        );
        throw error;
      }

      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}
