import { Message } from "@/types";

export const formatTimestamp = (timestamp: Message["createdAt"]) => {
  if (!timestamp) return "";
  const date = new Date(
    timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
  );
  return date.toLocaleString();
};
