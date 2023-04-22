# serial-bridge

a simple, lightweight typescript-script that opens and reconnects to a serialport and publishes every newline via a websocket.
the available ports are filtered based on certain properties to filter out the one you need:

```json
{ "manufacturer": "Arduino LLC" }
```

## getting started

```sh
pnpm i # install necessary dependencies
pnpm start # start the script
```
