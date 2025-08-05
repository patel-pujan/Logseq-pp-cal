import ICAL from "ical.js";
import { URL } from "../secret/cals";

interface ClippedEvent {
  event: ICAL.Event;
  summary: string;
  startTime: ICAL.Time;
}

async function fetchICS(): Promise<ICAL.Component[]> {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

  const textData = await res.text();
  const jcalData = ICAL.parse(textData);
  const comp = new ICAL.Component(jcalData);

  // Register all timezones
  const vtimezones = comp.getAllSubcomponents("vtimezone");
  vtimezones.forEach((vtimezone) => {
    ICAL.TimezoneService.register(vtimezone);
  });

  const vevents = comp.getAllSubcomponents("vevent");

  return vevents;
}

async function clipEvents(vevents: ICAL.Component[]): Promise<ClippedEvent[]> {
  const period_days = 7;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + period_days);

  const startTime = ICAL.Time.fromJSDate(startDate, true);
  const endTime = ICAL.Time.fromJSDate(endDate, true);

  const pacificTz = ICAL.TimezoneService.get("America/Los_Angeles"); 
  console.log(`Filtering between ${startTime} and ${endTime}`);

  const eventsThisWeek: ClippedEvent[] = [];
  vevents.forEach((vevent) => {
    const event = new ICAL.Event(vevent);

    const eventStart = event.startDate.convertToZone(pacificTz);

    if (
      !event.isRecurring() &&
      eventStart.compareDateOnlyTz(startTime, pacificTz) >= 0 &&
      eventStart.compareDateOnlyTz(endTime, pacificTz) <= 0
    ) {
      console.log(eventStart);
      eventsThisWeek.push({
        event: event,
        summary: event.summary.trimEnd(),
        startTime: eventStart,
      });
      return;
    }

    const iter = event.iterator();
    let next = iter.next();
    while (next) {
      const occurrenceStart = next.convertToZone(pacificTz);
      if (
        occurrenceStart.compareDateOnlyTz(
          startTime,
          pacificTz,
        ) >= 0 &&
        occurrenceStart.compareDateOnlyTz(endTime, pacificTz) <=
          0
      ) {
        const occurrence = event.getOccurrenceDetails(next);
        eventsThisWeek.push({
          event: occurrence.item,
          summary: event.summary.trimEnd(),
          startTime: occurrenceStart,
        });
      } else if (occurrenceStart.compare(endTime) > 0) {
        break;
      }

      next = iter.next();
    }
  });

  eventsThisWeek.sort(
    (a, b) =>
      a.startTime.toJSDate().getTime() - b.startTime.toJSDate().getTime(),
  );

  return eventsThisWeek;
}

export async function parseICS(): Promise<ClippedEvents[]> {
  const scheduledEvents = await fetchICS();
  const relevantEvents = await clipEvents(scheduledEvents);

  return relevantEvents;
}
