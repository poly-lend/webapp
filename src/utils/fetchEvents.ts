import { Event } from "@/types/polyLend";
import { transformMarkets } from "./fetchMarkets";

function transformEvents(events: any[]): Event[] {
  events.forEach((event) => {
    event.markets = transformMarkets(event.markets);
  });
  return events;
}

export default async function fetchMarkets(): Promise<Event[]> {
  const url = `https://api.polylend.com/events`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch markets: ${response.statusText}`);
  }
  const events = await response.json();
  return transformEvents(events);
}
