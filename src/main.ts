import "@logseq/libs";
import { parseICS } from "./events";

function main() {
  logseq.App.registerCommand(
    "Pull Calendar",
    {
      desc: "pull cal",
      key: "Pull Calendar",
      label: "Pull Calendar",
      palette: true,
    },
    populateLogseq,
  );

  // logseq.Editor.registerSlashCommand(
  //     'Pull Calendar',
  //     populateLogseq,
  // );
}

async function populateLogseq() {
  const relevantEvents = await parseICS();
  const maxLength = relevantEvents.reduce(
    (max, e) => Math.max(max, e.summary.length),
    0,
  );

  const block = await logseq.Editor.getCurrentBlock();

  const newContent = "# Weekly Agenda";
  await logseq.Editor.updateBlock(block.uuid, newContent);

  for (const event of relevantEvents) {
    console.log(event.summary);

    const isoString = event.startTime.toString();
    const date = new Date(isoString);

    const readable = date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const paddingSpaces = " ".repeat(maxLength - event.summary.length);

    const line = `${event.summary}:${paddingSpaces} ${readable}`;

    await logseq.Editor.insertBlock(block.uuid, line, {
      before: false,
      isPageBlock: false,
      properties: {},
      sibling: false,
    });
  }

  return;
}

logseq.ready(main).catch(console.error);
