import { type CommandReply} from "../types/CommandResponses.types";

const BASE_URL =
  "http://localhost/api/mcc"

export const getCommandReplies =
  async (
    commandLogId: number
  ): Promise<CommandReply[]> => {

    const res = await fetch(
      `${BASE_URL}/command/replies/${commandLogId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    )

    if (!res.ok) {
      throw new Error(
        "Failed to fetch replies"
      )
    }

    return res.json()
}