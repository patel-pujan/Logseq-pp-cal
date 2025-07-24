import '@logseq/libs';
import ICAL from 'ical.js';
import { URL } from "../secret/cals";

const now = new Date();
const oneWeekLater = new Date(now);
oneWeekLater.setDate(now.getDate() + 7);

const defaultStartTime = ICAL.Time.fromJSDate(new Date(0), true);
const startTime = ICAL.Time.fromJSDate(now, true);
const endTime = ICAL.Time.fromJSDate(oneWeekLater, true);
console.log("Filtering events between", startTime.toJSDate(), "and", endTime.toJSDate());

async function fetchAndParseICS() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  const textData = await res.text(); 
  const jcalData = ICAL.parse(textData);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents("vevent");
  
  const eventsThisWeek = [];
  vevents.forEach((vevent) => {
    
    const event = new ICAL.Event(vevent);
   
    if (event.isRecurring()) {
      const iter = event.iterator();
      let next;

      while ((next = iter.next())) {
        if (next.compare(startTime) >= 0 && next.compare(endTime) <= 0) {
          const occurrence = event.getOccurrenceDetails(next);
          eventsThisWeek.push({
            event: occurrence.item,
            summary: event.summary,
          });
        } else if (next.compare(endTime) > 0) {
          break;
        }
      }
    } else {
      if (event.startDate.compare(startTime) >= 0 && event.startDate.compare(endTime) <= 0) {
        eventsThisWeek.push({
          event: event,
          summary: event.summary,
        })
      ;}
    }
  });
  
  console.log(eventsThisWeek);
}

logseq.ready(fetchAndParseICS);
