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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevice = void 0;
const serialport_1 = require("serialport");
const getDevice = (identifiers) => __awaiter(void 0, void 0, void 0, function* () {
    const list = yield serialport_1.SerialPort.list();
    console.log(list);
    const arduinos = list.filter((device) => {
        const deviceObj = device;
        const fits = Object.keys(identifiers).every((key) => {
            if (!(key in device))
                return false;
            return deviceObj[key] === identifiers[key];
        });
        return fits;
    });
    console.log(arduinos);
    const arduino = arduinos[0];
    return (arduino === null || arduino === void 0 ? void 0 : arduino.path) || null;
});
exports.getDevice = getDevice;
