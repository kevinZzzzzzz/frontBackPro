// import { Configuration, OpenAIApi } from "openai";
// import readline from "readline";
import path from 'path';
import * as dotenv from "dotenv";
import express from "express";
import * as http from "http";
import cors from "cors";
import Controller from "./controller.js";

const __dirname = path.resolve();
const UPLOAD_DIR = path.resolve(__dirname, "./", "target"); // 大文件存储目录
const ctrl = new Controller(UPLOAD_DIR)
const app = express();
const server = http.createServer(app);

const port = 3000;
dotenv.config();

app.use(cors({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  // "Content-Type": "multipart/form-data",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
}));
// app.use(express.json()); // post 请求获取请求体的参数

// const configuration = new Configuration({
//   organization: process.env.OPENAI_API_PERSON_KEY,
//   apiKey: process.env.OPENAI_API_SECRET_KEY,
// });
// const openai = new OpenAIApi(configuration);

// app.post("/api/gpt", async (req, res) => {
//   const { prompt } = req.body;
//   console.log(prompt)
//   const result = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo-1106",
//       messages: [{ role: "user", content: prompt }],
//     })
//     .then((res) => {
//       res.status(200).send(res.data.choices[0]);
//       console.log(res.data.choices[0].message.content);
//     })
//     .catch((e) => {
//       res.status(500).send(e);
//       console.log(e);
//     });
//     console.log(result)
// });
app.get('/kevin/test', (req, res) => {
  res.send('kevin')
})
app.post('/kevin/upload', async (req, res) => {
  await ctrl.handleUpload(req, res)
})
app.post('/kevin/verify', async(req, res) => {
  await ctrl.handleVerify(req, res)
})
app.post('/kevin/mergeFile', async(req, res) => {
  await ctrl.handleMergeFile(req, res)
})
server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
