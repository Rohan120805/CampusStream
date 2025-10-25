import dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Testing GCS Configuration...\n');
console.log('Environment Variables:');
console.log('  GCS_PROJECT_ID:', process.env.GCS_PROJECT_ID);
console.log('  GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
console.log('  GCS_KEY_FILE:', process.env.GCS_KEY_FILE);

const keyFilePath = path.join(__dirname, process.env.GCS_KEY_FILE);
console.log('\n📁 Key File Path:', keyFilePath);
console.log('  Key file exists:', fs.existsSync(keyFilePath) ? '✅ Yes' : '❌ No');

if (!fs.existsSync(keyFilePath)) {
    console.error('\n❌ Key file not found! Please ensure gcs-key.json is in the root directory.');
    process.exit(1);
}

try {
    // Read and validate key file
    const keyContent = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    console.log('\n📋 Key File Contents:');
    console.log('  Project ID:', keyContent.project_id);
    console.log('  Client Email:', keyContent.client_email);
    console.log('  Private Key:', keyContent.private_key ? '✅ Present' : '❌ Missing');

    // Initialize Storage
    console.log('\n🚀 Initializing Google Cloud Storage...');
    const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        keyFilename: keyFilePath
    });

    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
    
    // Test connection by checking if bucket exists
    console.log('  Checking bucket:', process.env.GCS_BUCKET_NAME);
    
    bucket.exists().then(([exists]) => {
        if (exists) {
            console.log('\n✅ SUCCESS! Google Cloud Storage is properly configured!');
            console.log('✅ Bucket exists and is accessible!');
            console.log('\n📦 Bucket Details:');
            return bucket.getMetadata();
        } else {
            console.log('\n❌ Bucket does not exist. Please create it in GCP Console.');
            process.exit(1);
        }
    }).then(([metadata]) => {
        if (metadata) {
            console.log('  Name:', metadata.name);
            console.log('  Location:', metadata.location);
            console.log('  Storage Class:', metadata.storageClass);
            console.log('\n🎉 GCS Connection Test Complete!');
        }
    }).catch(error => {
        console.error('\n❌ Error connecting to GCS:', error.message);
        if (error.code === 403) {
            console.error('   Permission denied. Check your service account permissions.');
        } else if (error.code === 404) {
            console.error('   Bucket not found. Please create the bucket in GCP Console.');
        }
        process.exit(1);
    });

} catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
}
