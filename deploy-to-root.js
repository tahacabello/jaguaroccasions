const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN || '';
const OWNER = 'tahacabello';
const REPO = 'jaguar-occasions';
const BASE_DIR = path.join(__dirname, 'jaguar-next');

// List of old files to delete at the root of the repository
const filesToDelete = [
  'index.html',
  'category.html',
  'product.html',
  'admin.html',
  'site.webmanifest',
  'sw.js'
];

async function deleteFile(fileName) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${fileName}`;
  
  // First, get the file's SHA (required for deleting)
  let sha = null;
  try {
    const checkRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Antigravity-Agent'
      }
    });
    if (checkRes.ok) {
      const data = await checkRes.json();
      sha = data.sha;
    }
  } catch (err) {
    // File already deleted or doesn't exist
  }

  if (!sha) {
    console.log(`ℹ️ File ${fileName} does not exist or already deleted.`);
    return;
  }

  console.log(`Deleting old file ${fileName}...`);
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Antigravity-Agent',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Cleanup: delete old ${fileName}`,
        sha: sha
      })
    });

    if (res.ok) {
      console.log(`✅ Deleted: ${fileName}`);
    } else {
      console.error(`❌ Failed to delete ${fileName}: ${res.status}`);
    }
  } catch (err) {
    console.error(`❌ Error deleting ${fileName}:`, err);
  }
}

async function uploadFile(filePath, relativePath) {
  const fileContent = fs.readFileSync(filePath);
  const base64Content = fileContent.toString('base64');
  
  // Notice: no "jaguar-next/" prefix! We write directly to the root of the repo!
  const githubPath = relativePath.replace(/\\/g, '/');
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${githubPath}`;
  
  let sha = null;
  try {
    const checkRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Antigravity-Agent'
      }
    });
    if (checkRes.ok) {
      const data = await checkRes.json();
      sha = data.sha;
    }
  } catch (err) {
    // File doesn't exist yet
  }

  const body = {
    message: `Enterprise Deploy: upload ${githubPath} to root`,
    content: base64Content,
  };
  if (sha) {
    body.sha = sha;
  }

  console.log(`Uploading ${githubPath} to root...`);
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Antigravity-Agent',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      console.log(`✅ Success: ${githubPath}`);
      return true;
    } else {
      const errData = await res.json().catch(() => ({}));
      console.error(`❌ Failed: ${githubPath} - Status: ${res.status} ${res.statusText}`, errData);
      return false;
    }
  } catch (err) {
    console.error(`❌ Error uploading ${githubPath}:`, err);
    return false;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.relative(BASE_DIR, filePath);
    
    // Ignore patterns
    if (relativePath.includes('node_modules') || 
        relativePath.includes('.next') || 
        relativePath.includes('package-lock.json') ||
        file === '.git') {
      continue;
    }
    
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else {
      fileList.push({ filePath, relativePath });
    }
  }
  return fileList;
}

async function main() {
  console.log(`🚨 STARTING ENTERPRISE DEPLOY TO ROOT DIRECTORY of ${OWNER}/${REPO}...`);
  
  // 1. Delete old static files first
  console.log('\n--- 1. CLEANING UP OLD STATIC WEBSITE FILES ---');
  for (const file of filesToDelete) {
    await deleteFile(file);
    await new Promise(resolve => setTimeout(resolve, 500)); // small delay
  }

  // 2. Upload new Next.js files to root
  console.log('\n--- 2. UPLOADING NEXT.JS ENTERPRISE PROJECT TO ROOT ---');
  if (!fs.existsSync(BASE_DIR)) {
    console.error(`Error: Base Next.js directory ${BASE_DIR} does not exist`);
    process.exit(1);
  }

  const allFiles = walkDir(BASE_DIR);
  console.log(`Found ${allFiles.length} files to deploy to root.`);

  let successCount = 0;
  let failCount = 0;

  for (const file of allFiles) {
    await new Promise(resolve => setTimeout(resolve, 300)); // rate limiting delay
    const success = await uploadFile(file.filePath, file.relativePath);
    if (success) {
      successCount++;
    } else {
      failCount++;
      if (failCount === 1) {
        console.error('🛑 Aborting: First upload failed. Check token or repository state.');
        break;
      }
    }
  }

  console.log(`\n🎉 ENTERPRISE DEPLOY COMPLETE: ${successCount} files uploaded, ${failCount} failed.`);
}

main();
