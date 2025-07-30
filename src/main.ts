import '@logseq/libs';
import { parseICS } from './events'

// const relevantEvents = parseICS();

function main() {

    logseq.App.registerCommand(
        'Pull Calendar',
        {
            desc: 'pull gcal',
            key: 'Pull Calendar',
            label: 'Pull Calendar',
            palette: true,
        },
        populateLogseq
    );
    // logseq.Editor.registerSlashCommand(
    //     'Pull Calendar',
    //     populateLogseq,
    // );
}

async function populateLogseq() {

    const relevantEvents = await parseICS();
    const block = await logseq.Editor.getCurrentBlock();

    let newContent = "# Weekly Agenda";
    await logseq.Editor.updateBlock(block.uuid, newContent);

    for (const event of relevantEvents) {
        console.log(event.summary);
        
        const isoString = event.startTime.toString();
        const date = new Date(isoString);

        const readable = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
        });

        console.log(readable);



        await logseq.Editor.insertBlock(
            block.uuid, 
            event.summary + ": " + readable, 
            {
                before: false,
                isPageBlock: false,
                properties: {},
                sibling: false,
            }
        );
    }

    return;
}

logseq.ready(main).catch(console.error);
