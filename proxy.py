import asyncio
import websockets
import telnetlib3
import json

clients = {}

async def handle_connection(websocket, path):
    query = websocket.path.split("?")[-1]
    params = dict(param.split("=") for param in query.split("&") if "=" in param)

    host = params.get("host", "localhost")
    port = int(params.get("port", 23))

    reader, writer = await telnetlib3.open_connection(host, port)
    clients[websocket] = (reader, writer)

    async def read_from_mud():
        while not reader.at_eof():
            try:
                data = await reader.read(1024)
                await websocket.send(data)
            except:
                break

    asyncio.create_task(read_from_mud())

    try:
        async for message in websocket:
            writer.write(message + "\n")
    except:
        pass
    finally:
        del clients[websocket]
        writer.close()
        await writer.wait_closed()

async def main():
    async with websockets.serve(handle_connection, "0.0.0.0", 8888):
        await asyncio.Future()

asyncio.run(main())
