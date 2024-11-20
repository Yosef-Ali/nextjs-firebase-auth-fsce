import fs from 'fs';
import path from 'path';
import https from 'https';

const imageUrls = {
  'conference.jpg': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
  'workshop.jpg': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
  'campaign.jpg': 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800',
  'training.jpg': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
  'forum.jpg': 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800',
  'exhibition.jpg': 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800'
};

const downloadImage = (url: string, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create events directory if it doesn't exist
    const eventsDir = path.join(process.cwd(), 'public', 'images', 'events');
    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir, { recursive: true });
    }

    const filepath = path.join(eventsDir, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

async function downloadAllImages() {
  try {
    const downloads = Object.entries(imageUrls).map(([filename, url]) => 
      downloadImage(url, filename)
    );
    
    await Promise.all(downloads);
    console.log('All event images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

// Run the function
downloadAllImages();
