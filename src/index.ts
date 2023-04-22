import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { Server } from "socket.io";
import identifiers from "../identifiers.json";
import { getDevice } from "./helpers";
import { BAUD_RATE, RECONNECT_INTERVAL } from "../CONSTANTS";

let port: SerialPort | null = null;

const io = new Server(3000, {
  cors: {
    origin: "*",
  },
});

const connectSerialPort = async () => {
  const devicePath = await getDevice(identifiers);
  if (!devicePath) return;
  port = new SerialPort({ path: devicePath, baudRate: BAUD_RATE });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  parser.on("data", (chunk) => {
    console.log(chunk);
    io.emit("/", JSON.stringify({ message: chunk }));
  });

  port.on("open", () => {
    console.log("Serial port connected");
  });

  port.on("close", () => {
    console.log("Serial port disconnected");
    port?.removeAllListeners();
    parser.removeAllListeners();
    parser.destroy();
    port?.destroy();
    port = null;
  });

  port.on("error", (err) => {
    console.error(`Serial port error: ${err}`);
    if (port) {
      try {
        port?.close();
      } catch (e) {
        console.log(e);
      }
    }
    port = null;
  });
};

setInterval(() => {
  if (!port || !port.isOpen) {
    console.log("Reconnecting...");
    connectSerialPort();
  }
}, RECONNECT_INTERVAL);
