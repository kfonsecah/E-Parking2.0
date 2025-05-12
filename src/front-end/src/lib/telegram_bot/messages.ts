import axios from "axios";
import { TELEGRAM_API } from "./constants";

export async function sendMessage(
  chatId: number,
  text: string,
  extra?: object
) {
  try {
    const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text,
      ...extra,
    });
    return res.data.result.message_id;
  } catch (err: any) {
    console.error(
      "❌ Error al enviar mensaje:",
      err.response?.data || err.message
    );
    return null;
  }
}
