import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import identifiers from "../identifiers.json";
import { getDevice } from "./helpers";
import { BAUD_RATE, RECONNECT_INTERVAL } from "../CONSTANTS";

import { Server } from "socket.io";

import { createServer } from "http";

import express from "express";
import { join } from "path";
const app = express();

app.use(express.static("./static"));

app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../static/index.html"));
});

const server = createServer(app);

const io = new Server(server);

const port = process.env.PORT || 3000;

let serialPort: SerialPort | null = null;

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});

/* const io = new Server(3000, {
  cors: {
    origin: "*",
  },
}); */

const connectSerialPort = async () => {
  const devicePath = await getDevice(identifiers);
  if (!devicePath) return;
  serialPort = new SerialPort({ path: devicePath, baudRate: BAUD_RATE });

  const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  parser.on("data", (chunk) => {
    console.log(chunk);
    io.emit("/", JSON.stringify({ message: chunk }));
  });

  serialPort.on("open", () => {
    console.log("Serial port connected");
  });

  serialPort.on("close", () => {
    console.log("Serial port disconnected");
    serialPort?.removeAllListeners();
    parser.removeAllListeners();
    parser.destroy();
    serialPort?.destroy();
    serialPort = null;
  });

  serialPort.on("error", (err) => {
    console.error(`Serial port error: ${err}`);
    if (serialPort) {
      try {
        serialPort?.close();
      } catch (e) {
        console.log(e);
      }
    }
    serialPort = null;
  });
};

setInterval(() => {
  if (!serialPort || !serialPort.isOpen) {
    console.log("Reconnecting...");
    connectSerialPort();
  }
}, RECONNECT_INTERVAL);
