"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = require("serialport");
const parser_readline_1 = require("@serialport/parser-readline");
const identifiers_json_1 = __importDefault(require("../identifiers.json"));
const helpers_1 = require("./helpers");
const CONSTANTS_1 = require("../CONSTANTS");
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const app = (0, express_1.default)();
app.use(express_1.default.static("./static"));
app.get("*", (req, res) => {
    res.sendFile((0, path_1.join)(__dirname, "../static/index.html"));
});
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
const port = process.env.PORT || 3000;
let serialPort = null;
server.listen(port, () => {
    console.log("Server listening at port %d", port);
});
/* const io = new Server(3000, {
  cors: {
    origin: "*",
  },
}); */
const connectSerialPort = () => __awaiter(void 0, void 0, void 0, function* () {
    const devicePath = yield (0, helpers_1.getDevice)(identifiers_json_1.default);
    if (!devicePath)
        return;
    serialPort = new serialport_1.SerialPort({ path: devicePath, baudRate: CONSTANTS_1.BAUD_RATE });
    const parser = serialPort.pipe(new parser_readline_1.ReadlineParser({ delimiter: "\r\n" }));
    parser.on("data", (chunk) => {
        console.log(chunk);
        io.emit("/", JSON.stringify({ message: chunk }));
    });
    serialPort.on("open", () => {
        console.log("Serial port connected");
    });
    serialPort.on("close", () => {
        console.log("Serial port disconnected");
        serialPort === null || serialPort === void 0 ? void 0 : serialPort.removeAllListeners();
        parser.removeAllListeners();
        parser.destroy();
        serialPort === null || serialPort === void 0 ? void 0 : serialPort.destroy();
        serialPort = null;
    });
    serialPort.on("error", (err) => {
        console.error(`Serial port error: ${err}`);
        if (serialPort) {
            try {
                serialPort === null || serialPort === void 0 ? void 0 : serialPort.close();
            }
            catch (e) {
                console.log(e);
            }
        }
        serialPort = null;
    });
});
setInterval(() => {
    if (!serialPort || !serialPort.isOpen) {
        console.log("Reconnecting...");
        connectSerialPort();
    }
}, CONSTANTS_1.RECONNECT_INTERVAL);
