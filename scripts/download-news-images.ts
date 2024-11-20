import fs from 'fs';
import path from 'path';
import https from 'https';

const imageUrls = {
  'child-protection.jpg': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
  'unicef-partnership.jpg': 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800',
  'impact-report.jpg': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
  'dire-dawa-office.jpg': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  'summer-program.jpg': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
  'vocational-training.jpg': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
  'success-story.jpg': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800',
  'youth-center.jpg': 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800',
  'business-partnership.jpg': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
  'ngo-collaboration.jpg': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800'
};

const downloadImage = (url: string, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(process.cwd(), 'public', 'images', 'news', filename);
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
    console.log('All images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

// Run the function
downloadAllImages();
