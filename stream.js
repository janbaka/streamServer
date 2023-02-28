const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());
let notifications = [];

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
  //res.write('data: { "message": "Connected" }\n\n');

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

app.get("/notifications", (req, res) => {
  res.json(notifications);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/send", (req, res) => {
  const { id, title, message, severity } = req.query;
  if (!title || !message || !severity) {
    res.status(400).send("Bad Request: Message parameter is missing");
    return;
  }
  let notification = {
    identifier: id,
    type: "SimulationNotification",
    title: title,
    message: message,
    severity: severity,
    created: "2023-02-27T12:39:39.8956872+00:00",
    acknowledged: null,
    isAcknowledgable: true,
    properties: {
      displayName: "SimulationNotification",
      identifier: "SimulationNotification",
      description: null,
      value: {
        type: "Class",
        unitType: "None",
        current: "SimulationNotification",
        default: "SimulationNotification",
        possible: null,
        isReadOnly: false,
      },
      validation: {
        minimum: -1.7976931348623157e308,
        maximum: 1.7976931348623157e308,
        regex: null,
        isRequired: false,
      },
      subEntries: [
        {
          displayName: "Name",
          identifier: "Name",
          description: null,
          value: {
            type: "String",
            unitType: "None",
            current: "LÃ¶tmaschine-1",
            default: null,
            possible: null,
            isReadOnly: false,
          },
          validation: {
            minimum: -1.7976931348623157e308,
            maximum: 1.7976931348623157e308,
            regex: null,
            isRequired: false,
          },
          subEntries: [],
          prototypes: [],
        },
      ],
      prototypes: [],
    },
    sender: "19",
    source: "ResourceManager",
  };

  notifications.push(notification);
  let myString = "data: " + JSON.stringify(notifications) + "\n\n";

  res.app.get("streamConnections").forEach((stream) => {
    stream.write(myString);
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
