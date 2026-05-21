const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp-memories.json', 'utf8'));

// Find observations that mention "WU-" or "PR #"
console.log('--- Search results ---');
data.observations.forEach(o => {
  if (o.content && (o.content.includes('WU-') || o.content.includes('PR #'))) {
    console.log(`[Observation ${o.id}] (Title: ${o.title}, Topic: ${o.topic_key}):`);
    console.log(o.content);
    console.log('--------------------------------------------------');
  }
});
