import axios from "axios";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/execute", async (req, res) => {
  const { code, languageId } = req.body;
  console.log("Code Received:", code, "Language ID:", languageId);

  try {
    const output = await compileCode(code, languageId);
    res.json({ stdout: output });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ error: "Error executing code" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});

async function checkResult(token) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
    const resultOptions = {
      method: "GET",
      url: `https://judge0-extra-ce.p.rapidapi.com/submissions/${token}`,
      params: { base64_encoded: "false", fields: "*" },
      headers: {
        "x-rapidapi-key": "49b498d17bmsh5f50997fa0b7e6ap15a0c9jsn46563dbb5aef",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      },
    };

    const response = await axios.request(resultOptions);
    return response.data.stdout || response.data.stderr || "No output";
  } catch (error) {
    console.error("Error fetching execution result:", error);
    return "Error fetching result";
  }
}

async function compileCode(code, languageId) {
  try {
    const response = await axios.post(
      "https://judge0-extra-ce.p.rapidapi.com/submissions",
      {
        language_id: languageId,
        source_code: code,
        stdin: "",
        base64_encoded: false,
      },
      {
        headers: {
          "x-rapidapi-key": "49b498d17bmsh5f50997fa0b7e6ap15a0c9jsn46563dbb5aef",
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );

    return await checkResult(response.data.token);
  } catch (error) {
    console.error("Compilation error:", error);
    return "Compilation error";
  }
}
