import ICAL from 'ical.js';
import { URL } from "../secret/cals";
export { parseICS };

interface ClippedEvent {
    event: ICAL.Event;
    summary: string;
    startTime: ICAL.Time;
}

const period_days = 7
const startDate = new Date();
const endDate = new Date();
endDate.setDate(startDate.getDate() + period_days);

const startTime = ICAL.Time.fromJSDate(startDate, true);
const endTime = ICAL.Time.fromJSDate(endDate, true);
console.log("Filtering events between", startTime.toJSDate(), "and", endTime.toJSDate());

async function fetchICS() {

    const res = await fetch(URL);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

    const textData = await res.text();
    const jcalData = ICAL.parse(textData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    return vevents;
}

async function clipEvents(vevents: ICAL.Component[]): Promise<ClippedEvent[]> {

    const eventsThisWeek: ClippedEvent[] = [];
    vevents.forEach((vevent) => {
        let event = new ICAL.Event(vevent);

        if (!event.isRecurring() && event.startDate.compare(startTime) >= 0 && event.startDate.compare(endTime) <= 0) {
            eventsThisWeek.push({
            event: event,
            summary: event.summary.trimEnd(),
            startTime: event.startDate,
            });
            return;
        }

        let iter = event.iterator();
        let next;
        while ((next = iter.next())) {
            if (next.compare(startTime) >= 0 && next.compare(endTime) <= 0) {
                let occurrence = event.getOccurrenceDetails(next);
                eventsThisWeek.push({
                    event: occurrence.item,
                    summary: event.summary.trimEnd(),
                    startTime: occurrence.startDate,
                });
            } else if (next.compare(endTime) > 0) {
                return;
            }
        }
    });

    eventsThisWeek.sort((a, b) => a.startTime.toJSDate().getTime() - b.startTime.toJSDate().getTime());

    return eventsThisWeek;
}

async function parseICS() {
    
    const scheduledEvents = await fetchICS();
    const relevantEvents = await clipEvents(scheduledEvents);

    return relevantEvents
}
