import {type CommandDictionary } from "../types/commandDictionaryTypes";

export const getCommandsDictionary =
  async (): Promise<CommandDictionary[]> => {
    try {
      const res = await fetch(
        "http://localhost/api/mcc/command",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch commands");
      }

      return await res.json();
    } catch (error) {
      console.error(
        "Error fetching command dictionary:",
        error
      );
      return [];
    }
  };