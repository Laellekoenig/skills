import { getRequestConfig } from "next-intl/server"
import enMessages from "@/messages/en.json"

// One locale for now. To add one, add `messages/<locale>.json` with the same
// keys and resolve the locale here, e.g. from a cookie, the user's saved
// preference, then the Accept-Language header.
export default getRequestConfig(async () => {
  return {
    locale: "en",
    messages: enMessages,
  }
})
