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
    console.log("Database tables checked and initialized");
  } catch (error) {
    console.error("Error initializing database", error);
  }
}

export async function connectToDatabase() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to database");
    return pool;
  } catch (error) {
    console.error("Error connecting to database", error);
  }
}
