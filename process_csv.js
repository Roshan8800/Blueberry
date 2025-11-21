import fs from 'fs';
import readline from 'readline';
import path from 'path';

const csvPath = 'extracted_videos/pornhub.com-db.csv';
const outputDir = 'videos_json';

const rl = readline.createInterface({
  input: fs.createReadStream(csvPath),
  crlfDelay: Infinity
});

let index = 1;
const maxRows = 2000;

rl.on('line', (line) => {
  if (index > maxRows) {
    rl.close();
    return;
  }

  const fields = line.split('|');
  if (fields.length < 11) {
    console.error(`Skipping line ${index}: insufficient fields`);
    index++;
    return;
  }

  const video = {
    embed: fields[0],
    thumbnail: fields[1],
    screenshots: fields[2].split(';'),
    title: fields[3],
    tags: fields[4].split(';'),
    categories: fields[5].split(';'),
    performers: fields[6].split(';'),
    duration: parseInt(fields[7]) || 0,
    views: parseInt(fields[8]) || 0,
    likes: parseInt(fields[9]) || 0,
    dislikes: parseInt(fields[10]) || 0
  };

  const filename = `video_${index}.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(video, null, 2));

  index++;
});

rl.on('close', () => {
  console.log(`Processed ${index - 1} videos.`);
});