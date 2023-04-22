import { SerialPort } from "serialport";

export const getDevice = async (
  identifiers: Record<string, string | number>
): Promise<string | null> => {
  const list = await SerialPort.list();
  console.log(list);

  const arduinos = list.filter((device) => {
    const deviceObj = device as Record<string, any>;
    const fits = Object.keys(identifiers).every((key) => {
      if (!(key in device)) return false;
      return deviceObj[key] === identifiers[key as keyof typeof identifiers];
    });
    return fits;
  });
  console.log(arduinos);

  const arduino = arduinos[0];
  return arduino?.path || null;
};
