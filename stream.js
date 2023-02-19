const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

app.get("/stream", (req, res) => {
  // Add response object to connections set
  streamConnections.add(res);

  // Remove response object from connections set on close
  req.on("close", () => {
    streamConnections.delete(res);
  });
  // Set headers to keep connection alive
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");

  // Send initial message
  res.write('data: { "message": "Connected" }\n\n');

  // Send a message every 5 seconds
  // const intervalId = setInterval(() => {
  //   // Nachricht muss im SSE Format sein (Server-Sent-Events)
  //   let text = 'data: { "message": "xaaa" }\n\n'.replace(
  //     "xaaa",
  //     Date.now().toString()
  //   );
  //   res.write(text);
  // }, 5000);

  // Stop sending messages on client disconnect
  req.on("close", () => {
    //clearInterval(intervalId);
  });
});

app.get("/info", (req, res) => {
  const info = { message: "This is some info" };
  res.json(info);
});

app.get("/send", (req, res) => {
  const message = req.query.message;
  if (!message) {
    res.status(400).send("Bad Request: Message parameter is missing");
    return;
  }
  const text = `data: { "message": "${message}" }\n\n`;
  res.app.get("streamConnections").forEach((stream) => {
    stream.write(text);
  });
  res.status(200).send("Message sent successfully");
});

const PORT = 3000;
const host = "0.0.0.0";
const server = app.listen(PORT, host, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Keep track of stream connections
const streamConnections = new Set();
app.set("streamConnections", streamConnections);
