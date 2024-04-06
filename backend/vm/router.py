from fastapi import APIRouter, WebSocket, Response, Cookie

from vm.utils import ConnectionManager

import pty as pypty
import os
import select
import uuid
import subprocess
from typing import Annotated

router = APIRouter()

manager = ConnectionManager()

@router.get("/")
async def get_vm_id(response: Response):
    id = uuid.uuid4()
    response.set_cookie(key = "id", value = str(id))
    return {"id": id}

@router.websocket("/")
async def interact_with_vm(websocket: WebSocket, id: Annotated[str | None, Cookie()] = None):
    pty, tty = pypty.openpty()

    subprocess.Popen(['docker', 'exec', '-it', str(id), 'bash'], stdin=tty, stdout=tty, stderr=tty)
    
    await manager.connect(websocket)

    error_msg = f"Error response from daemon: No such container: {str(id)}"
    container_doesnt_exist = False
    last_message = ""

    while True:
        r, _, _ = select.select([pty], [], [], 1)
        if pty in r:
            data = os.read(pty, 10240)
            if data.decode().strip() == error_msg.strip():
                container_doesnt_exist = True
                break
            last_message = data.decode()
        else:
            break

    if container_doesnt_exist:
        subprocess.Popen(['docker', 'run', '--name', str(id), '-it', '--rm', '--privileged', '-e', 'DISPLAY', '-v', '/tmp/.X11-unix:/tmp/.X11-unix', '-v', '/lib/modules:/lib/modules', 'ubuntu'], stdin=tty, stdout=tty, stderr=tty)
        while True:
            r, _, _ = select.select([pty], [], [], 1)
            if pty in r:
                data = os.read(pty, 10240)
                last_message = data.decode()
            else:
                break

    await websocket.send_text(last_message)

    while True:
        data = await websocket.receive_text()
        data = data + "\n"
        os.write(pty, data.encode())

        while True:
            r, _, _ = select.select([pty], [], [], 0.1)
            if pty in r:
                out = os.read(pty, 10240)
                if data[0:2] == "cd":
                    cut = len(data) + 2
                    out = out[cut:]
                    await websocket.send_text(out.decode())
                    continue
                if out.decode().strip()[:-10] == data.strip():
                    continue
                await websocket.send_text(out.decode())
            else:
                break
