// npm install axios dotenv
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/scraper', async (req, res) => {
    console.log(req.body);
    const url = req.body.url;

    try {
        const extractedData = await scrape(url);
        res.json(extractedData);
    } catch (error) {
        res.status(500).json({ error: 'Scraping or AI processing failed' });
    }
});

app.listen(8000, () => {
  console.log('Server is running on  http://localhost:8000');
});

dotenv.config();  // Load environment variables

const genAI = new GoogleGenerativeAI(process.env.GEN_AI_SECRET);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: "Extract the title and problem statement of a DSA problem from the given webpage. Return JSON format with 'title' and 'statement' fields.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

  
let data = {}; // Variable to store scraped data

const scrape = async (url) => {
    try {
        const apikey = process.env.ZENROWS_API_KEY;
        const response = await axios({
            url: 'https://api.zenrows.com/v1/',
            method: 'GET',
            params: {
                'url': url,
                'apikey': apikey,
                'js_render': 'true',
                'json_response': 'true',
                'response_type': 'plaintext',
            },
        });
        const extractedText = response.data.plaintext;
        return await run(extractedText); // Wait for AI response
    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    }
};


async function run(input) {
    try {
        const chatSession = model.startChat({ generationConfig, history: [
            {
              role: "user",
              parts: [
                {text: "Enter\n|\nRegister\nHome\nTop\nCatalog\nContests\nGym\nProblemset\nGroups\nRating\nEdu\nAPI\nCalendar\nHelp\nRayan\nCodeforces Round 802 (Div. 2)\nFinished\n→ Practice?\nWant to solve the contest problems after the official contest ends? Just register for practice and you will be able to submit solutions.\n→ Virtual participation\nVirtual contest is a way to take part in past contest, as close as possible to participation on time. It is supported only ICPC mode for virtual contests.\nIf you've seen these problems, a virtual contest is not for you - solve these problems in the archive.\nIf you just want to solve some problem from a contest, a virtual contest is not for you - solve this problem in the archive.\nNever use someone else's code, read the tutorials or communicate with other person during a virtual contest.\n→ Problem tags\nconstructive algorithms\ngreedy\nmath\n*800\nNo tag edit access\n→ Contest materials\nAnnouncement\nTutorial\n(en)\nProblems\nSubmit Code\nMy Submissions\nStatus\nHacks\nRoom\nStandings\nCustom Invocation\nThe problem statement has recently been changed.\nView the changes.\n×\nA. Optimal Path\ntime limit per test\n2 seconds\nmemory limit per test\n256 megabytes\ninput\nstandard input\noutput\nstandard output\nYou are given a table $$$a$$$ of size $$$n \\times m$$$. We will consider the table rows numbered from top to bottom from $$$1$$$ to $$$n$$$, and the columns numbered from left to right from $$$1$$$ to $$$m$$$. We will denote a cell that is in the $$$i$$$-th row and in the $$$j$$$-th column as $$$(i, j)$$$. In the cell $$$(i, j)$$$ there is written a number $$$(i - 1) \\cdot m + j$$$, that is $$$a_{ij} = (i - 1) \\cdot m + j$$$.\nA turtle initially stands in the cell $$$(1, 1)$$$ and it wants to come to the cell $$$(n, m)$$$. From the cell $$$(i, j)$$$ it can in one step go to one of the cells $$$(i + 1, j)$$$ or $$$(i, j + 1)$$$, if it exists. A path is a sequence of cells in which for every two adjacent in the sequence cells the following satisfies: the turtle can reach from the first cell to the second cell in one step. A cost of a path is the sum of numbers that are written in the cells of the path.\nFor example, with $$$n = 2$$$ and $$$m = 3$$$ the table will look as shown above. The turtle can take the following path: $$$(1, 1) \\rightarrow (1, 2) \\rightarrow (1, 3) \\rightarrow (2, 3)$$$. The cost of such way is equal to $$$a_{11} + a_{12} + a_{13} + a_{23} = 12$$$. On the other hand, the paths $$$(1, 1) \\rightarrow (1, 2) \\rightarrow (2, 2) \\rightarrow (2, 1)$$$ and $$$(1, 1) \\rightarrow (1, 3)$$$ are incorrect, because in the first path the turtle can't make a step $$$(2, 2) \\rightarrow (2, 1)$$$, and in the second path it can't make a step $$$(1, 1) \\rightarrow (1, 3)$$$.\nYou are asked to tell the turtle a minimal possible cost of a path from the cell $$$(1, 1)$$$ to the cell $$$(n, m)$$$. Please note that the cells $$$(1, 1)$$$ and $$$(n, m)$$$ are a part of the way.\nInput\nThe first line contains a single integer $$$t$$$ ($$$1 \\leq t \\leq 1000$$$) — the number of test cases. The description of test cases follows.\nA single line of each test case contains two integers $$$n$$$ and $$$m$$$ ($$$1 \\leq n, m \\leq 10^4$$$) — the number of rows and columns of the table $$$a$$$ respectively.\nOutput\nFor each test case output a single integer — a minimal possible cost of a path from the cell $$$(1, 1)$$$ to the cell $$$(n, m)$$$.\nExample\nInput\n7\n1 1\n2 3\n3 2\n7 1\n1 10\n5 5\n10000 10000\nOutput\n1\n12\n13\n28\n55\n85\n500099995000\nNote\nIn the first test case the only possible path consists of a single cell $$$(1, 1)$$$.\nThe path with the minimal cost in the second test case is shown in the statement.\nIn the fourth and the fifth test cases there is only one path from $$$(1, 1)$$$ to $$$(n, m)$$$. Both paths visit every cell in the table.\nCodeforces\n(c) Copyright 2010-2025 Mike Mirzayanov\nThe only programming contests Web 2.0 platform\nServer time:\nMar/06/2025 20:50:59\n(h2).\nDesktop version, switch to\nmobile version\n.\nPrivacy Policy\nSupported by\nUser lists\nName\n"},
              ],
            },
            {
              role: "model",
              parts: [
                {text: "{\n  \"problem_details\": \"You are given a table a of size n × m. We will consider the table rows numbered from top to bottom from 1 to n, and the columns numbered from left to right from 1 to m. We will denote a cell that is in the i-th row and in the j-th column as (i, j). In the cell (i, j) there is written a number (i - 1) \\n\\n m + j, that is aij = (i - 1) \\n\\n m + j.\\nA turtle initially stands in the cell (1, 1) and it wants to come to the cell (n, m). From the cell (i, j) it can in one step go to one of the cells (i + 1, j) or (i, j + 1), if it exists. A path is a sequence of cells in which for every two adjacent in the sequence cells the following satisfies: the turtle can reach from the first cell to the second cell in one step. A cost of a path is the sum of numbers that are written in the cells of the path.\\nFor example, with n = 2 and m = 3 the table will look as shown above. The turtle can take the following path: (1, 1) → (1, 2) → (1, 3) → (2, 3). The cost of such way is equal to a11 + a12 + a13 + a23 = 12. On the other hand, the paths (1, 1) → (1, 2) → (2, 2) → (2, 1) and (1, 1) → (1, 3) are incorrect, because in the first path the turtle can't make a step (2, 2) → (2, 1), and in the second path it can't make a step (1, 1) → (1, 3).\\nYou are asked to tell the turtle a minimal possible cost of a path from the cell (1, 1) to the cell (n, m). Please note that the cells (1, 1) and (n, m) are a part of the way.\\nInput\\nThe first line contains a single integer t (1 \\n\\n t \\n\\n 1000) — the number of test cases. The description of test cases follows.\\nA single line of each test case contains two integers n and m (1 \\n\\n n, m \\n\\n 104) — the number of rows and columns of the table a respectively.\\nOutput\\nFor each test case output a single integer — a minimal possible cost of a path from the cell (1, 1) to the cell (n, m).\",\n  \"problem_title\": \"A. Optimal Path\"\n}"},
              ],
            },
          ], });
        const result = await chatSession.sendMessage([input]);

        const responseText = result.response.text();
        return JSON.parse(responseText); // Convert to JSON and return
    } catch (err) {
        console.error("Gemini AI processing failed:", err);
        throw err;
    }
}


