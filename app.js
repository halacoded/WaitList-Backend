//imports
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler.js");
const { google } = require("googleapis");
const path = require("path");
const punycode = require("punycode/");

//init
dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();
// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
const keyPath = path.join(__dirname, "./Key.json");

async function appendData(name, email) {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const request = {
    spreadsheetId: "1pZrr3YEFapmTjOY1frc1A1k2cuu_8v4Ge34VBdGss1Q", // Replace with your spreadsheet ID
    range: "A1:B1", // Adjust the range as needed
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: [[name, email]],
    },
  };

  try {
    const response = await sheets.spreadsheets.values.append(request);
    console.log("Data appended:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error appending data:", error);
    throw error;
  }
}

app.post("/api/waitlist", async (req, res) => {
  const { name, email } = req.body;

  try {
    await appendData(name, email);
    res.status(200).send("Form submitted successfully");
  } catch (error) {
    res.status(500).send("Failed to submit form");
  }
});

// Not Found Handling middleware

app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
