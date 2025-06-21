from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets.manager import ws_manager

router = APIRouter()

@router.websocket("/game/{game_id}")
async def websocket_game_endpoint(
    websocket: WebSocket,
    game_id: str
):
    await ws_manager.connect(websocket, game_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Обработка входящих сообщений (если нужно)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, game_id)