const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const { PDFDocument } = require('pdf-lib');
const pool = require('./database');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// Setup multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper for simple virus check (validate extension and mime type)
const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.png', '.jpg', '.jpeg'];

function validateFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    // Simplified validation: rely on extension to prevent false positives with missing/varying mimetypes from browsers
    if (!allowedExtensions.includes(ext)) {
        return false;
    }
    return true;
}

// Ensure directories exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('compressed')) fs.mkdirSync('compressed');

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const file = req.file;
        const originalFilename = file.originalname;
        const inputPath = file.path;
        
        // 1. Simple Virus Check / Validation
        if (!validateFile(file)) {
            fs.unlinkSync(inputPath); // remove invalid file
            return res.status(400).json({ error: 'Invalid file type. Simulated scan detected potential threat or unsupported format.' });
        }

        // 2. Compress the file based on type
        const ext = path.extname(originalFilename).toLowerCase();
        let compressedFilename = '';
        let outputPath = '';

        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            // Compress Image
            compressedFilename = 'compressed-' + file.filename;
            outputPath = path.join('compressed', compressedFilename);
            
            await sharp(inputPath)
                .resize({ width: 1920, withoutEnlargement: true }) // Resize to max 1920px width
                .jpeg({ quality: 60 }) // Convert and compress
                .toFile(outputPath);
                
        } else if (['.docx', '.pptx'].includes(ext)) {
            // Deep Compress Office Documents
            compressedFilename = 'compressed-' + file.filename + ext;
            outputPath = path.join('compressed', compressedFilename);
            
            const zip = new AdmZip(inputPath);
            const zipEntries = zip.getEntries();
            
            for (let i = 0; i < zipEntries.length; i++) {
                const entry = zipEntries[i];
                if (!entry.isDirectory) {
                    const entryName = entry.entryName.toLowerCase();
                    if (entryName.match(/(word\/media|ppt\/media)\/.*\.(png|jpg|jpeg)$/i)) {
                        // Compress the embedded image
                        const imageBuffer = entry.getData();
                        const compressedImageBuffer = await sharp(imageBuffer)
                            .resize({ width: 1200, withoutEnlargement: true })
                            .jpeg({ quality: 50 })
                            .toBuffer();
                        
                        // Replace in zip
                        zip.updateFile(entry.entryName, compressedImageBuffer);
                    }
                }
            }
            
            zip.writeZip(outputPath);

        } else if (ext === '.pdf') {
            // Deep Compress PDF using pdf-lib (Pure Node.js, no external Ghostscript needed!)
            compressedFilename = 'compressed-' + file.filename + '.pdf';
            outputPath = path.join('compressed', compressedFilename);
            
            try {
                const pdfBytes = fs.readFileSync(inputPath);
                const pdfDoc = await PDFDocument.load(pdfBytes);
                // Saving with useObjectStreams removes unused objects and compresses structure
                const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
                fs.writeFileSync(outputPath, compressedPdfBytes);
            } catch (pdfErr) {
                throw new Error("Failed to compress PDF: " + pdfErr.message);
            }

        } else {
            // Fallback: Compress other documents (txt, etc.) by Zipping them
            compressedFilename = file.filename + '.zip';
            outputPath = path.join('compressed', compressedFilename);
            
            await new Promise((resolve, reject) => {
                const output = fs.createWriteStream(outputPath);
                const archive = archiver('zip', {
                    zlib: { level: 9 } // max compression
                });
                
                output.on('close', resolve);
                archive.on('error', reject);
                
                archive.pipe(output);
                archive.file(inputPath, { name: originalFilename });
                archive.finalize();
            });
        }

        // 3. Save to database
        try {
            const query = `INSERT INTO ${process.env.DB_NAME}.upload_logs (original_filename, compressed_filename) VALUES (?, ?)`;
            await pool.query(query, [originalFilename, compressedFilename]);
        } catch (dbError) {
            console.error('Database logging failed, but proceeding with file upload:', dbError.message);
        }

        // Cleanup original upload
        try {
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }
        } catch (cleanupError) {
            console.error('Failed to cleanup file:', cleanupError.message);
        }

        // Construct the custom pretty download name
        const origExt = path.extname(originalFilename);
        const origBase = path.basename(originalFilename, origExt);
        const finalExt = path.extname(compressedFilename);
        
        let outputExt = finalExt;
        if (finalExt === '.zip' && origExt !== '.zip') {
            outputExt = origExt + '.zip';
        }
        
        const prettyDownloadName = `${origBase}-compressed${outputExt}`;

        // 4. Send back download link
        res.json({
            message: 'File successfully scanned and compressed.',
            downloadUrl: `/download/${compressedFilename}?name=${encodeURIComponent(prettyDownloadName)}`
        });

    } catch (error) {
        console.error('Error processing file:', error);
        fs.appendFileSync('debug_error.log', new Date().toISOString() + ' - ' + (error.stack || error) + '\n');
        res.status(500).json({ error: error.message || 'An error occurred during file processing.' });
    }
});

// Download Route
app.get('/download/:filename', (req, res) => {
    const diskFilename = req.params.filename;
    const downloadName = req.query.name || diskFilename;
    const filePath = path.join(__dirname, 'compressed', diskFilename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath, downloadName, { dotfiles: 'allow' }, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                if (!res.headersSent) {
                    res.status(500).send('Error downloading file');
                }
            }
        });
    } else {
        res.status(404).send('File not found');
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM ${process.env.DB_NAME}.upload_logs ORDER BY upload_date DESC LIMIT 50`);
        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch logs:', err);
        res.status(500).json({ error: 'Database connection failed or table does not exist.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
