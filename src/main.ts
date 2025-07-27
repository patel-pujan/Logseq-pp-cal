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

    let newContent = "# Events This Week ";

    for (const event of relevantEvents) {
        newContent += `\n ${event.summary}`;
    }

    await logseq.Editor.updateBlock(block.uuid, newContent);

    return;
}


logseq.ready(main).catch(console.error);
