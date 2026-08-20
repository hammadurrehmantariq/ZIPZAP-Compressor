# ⚡ ZIPZAP Compressor

**ZIPZAP Compressor** is a web-based file compression application designed to reduce the size of images and documents while providing users with a simple, modern, and responsive interface.

The application is built using **Node.js, Express.js, HTML, CSS, JavaScript, MySQL, Sharp, Ghostscript, PDF-Lib, Adm-Zip, Archiver, and other supporting tools**.

ZIPZAP supports multiple file formats and uses different compression techniques depending on the type of file being processed.

---

## 🚀 Features

* 📁 Drag-and-drop file uploading
* 🖼️ Image compression
* 📄 Document compression
* 📑 PDF processing
* 📝 DOC/DOCX support
* 📊 PPT/PPTX support
* 📃 TXT support
* 📦 ZIP-based compression
* 🗜️ Embedded image compression inside DOCX/PPTX
* 🖥️ Modern responsive web interface
* 📈 Compression progress indicator
* ⬇️ Download compressed files
* 🗄️ MySQL compression/upload logging
* 📋 Admin page for viewing compression history
* 🛡️ File-extension validation
* 📏 Maximum upload size of **50 MB**
* 🔄 Compress another file without refreshing the page

---

# 🛠️ Technology Stack

| Category         | Technology             | Purpose                              |
| ---------------- | ---------------------- | ------------------------------------ |
| Runtime          | **Node.js**            | Backend JavaScript runtime           |
| Backend          | **Express.js**         | Web server and REST API              |
| Frontend         | **HTML5**              | Application structure                |
| Styling          | **CSS3**               | User interface and responsive design |
| Frontend Logic   | **JavaScript**         | Uploads, UI and API communication    |
| Image Processing | **Sharp**              | Image compression and resizing       |
| PDF Processing   | **Ghostscript**        | PDF optimization/compression         |
| PDF Processing   | **PDF-Lib**            | PDF manipulation                     |
| Office Files     | **Adm-Zip**            | DOCX/PPTX archive manipulation       |
| ZIP Compression  | **Archiver**           | ZIP archive creation                 |
| File Uploads     | **Multer**             | Handling multipart file uploads      |
| Database         | **MySQL**              | Upload/compression history           |
| Database Driver  | **MySQL2**             | Node.js ↔ MySQL communication        |
| Configuration    | **Dotenv**             | Environment variables                |
| Networking       | **CORS**               | Cross-origin request handling        |
| IDE              | **Visual Studio Code** | Development                          |
| Version Control  | **Git**                | Source-code management               |
| Repository       | **GitHub**             | Project hosting                      |

---

# 🏗️ Project Architecture

```text
ZIPZAP-Compressor/
│
├── compressed/
│   └── Generated compressed files
│
├── uploads/
│   └── Temporary uploaded files
│
├── public/
│   ├── index.html
│   ├── image.html
│   ├── document.html
│   ├── admin.html
│   ├── script.js
│   └── style.css
│
├── database.js
├── server.js
├── package.json
├── package-lock.json
├── .env
├── debug_error.log
└── test.txt
```

### Main Components

| File / Directory       | Responsibility                                      |
| ---------------------- | --------------------------------------------------- |
| `server.js`            | Express server, uploads, compression and API routes |
| `database.js`          | MySQL connection and database initialization        |
| `public/index.html`    | Main ZIPZAP landing page                            |
| `public/image.html`    | Image compression interface                         |
| `public/document.html` | Document compression interface                      |
| `public/admin.html`    | Upload/compression logs                             |
| `public/script.js`     | Frontend functionality                              |
| `public/style.css`     | Frontend styling                                    |
| `uploads/`             | Temporary uploaded files                            |
| `compressed/`          | Generated compressed files                          |
| `.env`                 | Environment configuration                           |
| `package.json`         | Dependencies and project configuration              |

---

# 🔄 How ZIPZAP Works

The application follows this general workflow:

```text
                    User
                     │
                     ▼
              Select / Drop File
                     │
                     ▼
             Frontend Validation
                     │
                     ▼
              Express / Multer
                     │
                     ▼
              File Validation
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
        Image       PDF      DOCX/PPTX
          │          │          │
          ▼          ▼          ▼
        Sharp    Ghostscript   Adm-Zip
          │          │          │
          │          │     Embedded Images
          │          │          │
          │          │        Sharp
          │          │          │
          └──────────┼──────────┘
                     │
                     ▼
             Compressed Output
                     │
                     ▼
               Save to Server
                     │
                     ▼
                MySQL Log
                     │
                     ▼
              Download Result
```

---

# 🖼️ Image Compression

ZIPZAP supports:

```text
.jpg
.jpeg
.png
```

Image processing is handled using **Sharp**.

### Image compression workflow

1. User uploads an image.
2. Multer receives the file.
3. The backend validates the extension.
4. Sharp processes the image.
5. Images are resized to a maximum width of **1920 pixels** without enlarging smaller images.
6. Output is converted to JPEG.
7. JPEG quality is set to approximately **60**.
8. The resulting file is stored in the `compressed/` directory.
9. A download URL is returned to the frontend.

Sharp provides fast native image processing and is well suited for server-side image compression.

---

# 📄 Document Compression

ZIPZAP supports:

```text
.pdf
.doc
.docx
.txt
.ppt
.pptx
```

Different document formats require different compression approaches.

---

## 📕 PDF Compression

PDF files are fundamentally different from normal image files.

Simply placing a PDF inside a ZIP archive does not necessarily provide significant additional compression because PDFs may already contain compressed streams.

For this reason, dedicated PDF-processing tools such as **Ghostscript** can be used to optimize PDF content.

### Ghostscript

**Ghostscript** is a powerful document-processing utility commonly used for PDF optimization and conversion.

It can process:

* PDF objects
* Embedded images
* Fonts
* PDF streams
* Image resolution
* Image compression
* PDF compatibility

Typical Ghostscript compression presets include:

```text
/screen
    Smaller file size
    Lower image quality

/ebook
    Balanced compression and quality

/printer
    Higher quality
    Larger file size

/prepress
    High-quality output
```

A typical Ghostscript PDF compression command looks like:

```bash
gswin64c.exe ^
  -sDEVICE=pdfwrite ^
  -dCompatibilityLevel=1.4 ^
  -dPDFSETTINGS=/ebook ^
  -dNOPAUSE ^
  -dQUIET ^
  -dBATCH ^
  -sOutputFile=compressed.pdf ^
  input.pdf
```

On Linux, the command is commonly:

```bash
gs
```

Ghostscript is particularly useful when the goal is to **reduce the internal size of a PDF**, rather than simply archive the PDF.

---

## 📑 PDF-Lib

**PDF-Lib** is a JavaScript library for creating and manipulating PDF files.

It can be used to:

* Load PDF documents
* Read PDF structures
* Manipulate PDF pages
* Save PDF documents
* Work with PDF objects

ZIPZAP uses PDF-related functionality alongside dedicated PDF optimization tooling.

---

# 📃 DOCX & PPTX Compression

Microsoft Office Open XML formats such as:

```text
.docx
.pptx
```

are internally ZIP containers.

They contain files such as:

```text
XML
Images
Relationships
Metadata
Formatting information
Other resources
```

ZIPZAP uses **Adm-Zip** to access these archives.

### Workflow

```text
DOCX / PPTX
     │
     ▼
Open ZIP container
     │
     ▼
Find embedded images
     │
     ▼
Extract image
     │
     ▼
Compress using Sharp
     │
     ▼
Replace original image
     │
     ▼
Rebuild Office document
```

Embedded images can be resized to a maximum width of approximately **1200 pixels** and compressed before being placed back into the document.

This can reduce the overall size of Office documents containing large images.

---

# 📦 Archiver

**Archiver** is used to create ZIP archives.

It provides a fallback compression mechanism for supported document types where direct content-level compression is not being performed.

The application can use maximum DEFLATE compression:

```javascript
zlib: {
    level: 9
}
```

Compression level `9` requests the highest DEFLATE compression level.

---

# 🛡️ File Validation

ZIPZAP limits uploads to:

```text
50 MB
```

Supported extensions include:

```text
.pdf
.doc
.docx
.txt
.ppt
.pptx
.png
.jpg
.jpeg
```

Files with unsupported extensions are rejected.

Temporary uploaded files are also removed when validation fails.

### Security Note

The application's file validation is primarily **extension-based validation**.

It should not be described as a complete antivirus system.

A real production deployment should additionally implement:

* MIME-type validation
* File signature/magic-byte validation
* Antivirus scanning
* Rate limiting
* Authentication
* Secure filename handling
* Resource limits
* Automatic file cleanup

---

# 🗄️ MySQL Database

ZIPZAP uses **MySQL** to maintain a record of uploaded and compressed files.

The application uses **MySQL2** to communicate between Node.js and MySQL.

A connection pool is used for database connections.

---

## `upload_logs` Table

The application maintains a table similar to:

| Column                | Type         | Description                   |
| --------------------- | ------------ | ----------------------------- |
| `id`                  | INT          | Unique upload ID              |
| `original_filename`   | VARCHAR(255) | Original uploaded filename    |
| `compressed_filename` | VARCHAR(255) | Generated compressed filename |
| `upload_date`         | DATETIME     | Upload/compression timestamp  |

This information is displayed through the admin interface.

---

# 📊 Admin Dashboard

ZIPZAP contains an administrative page:

```text
/admin.html
```

The page displays recent compression history.

Information includes:

* Upload ID
* Original filename
* Compressed filename
* Upload date

The frontend retrieves this information through:

```text
GET /api/logs
```

The backend returns the most recent records from the MySQL database.

### Security Consideration

The current admin page should be protected with authentication before deploying the project publicly.

---

# 🔌 API Endpoints

## `POST /upload`

Uploads and processes a file.

### Request

```text
POST /upload
Content-Type: multipart/form-data
```

The uploaded file uses:

```text
file
```

as the form field.

### Response

A successful request returns information similar to:

```json
{
  "message": "File successfully scanned and compressed.",
  "downloadUrl": "/download/..."
}
```

---

## `GET /download/:filename`

Downloads a generated compressed file.

Example:

```text
GET /download/compressed-file-name
```

The backend verifies that the requested file exists before sending it.

---

## `GET /api/logs`

Retrieves compression/upload history from MySQL.

Example:

```text
GET /api/logs
```

The endpoint returns recent database records ordered by upload date.

---

# 🧰 Development Tools

## Visual Studio Code

VS Code can be used as the primary development environment for:

* JavaScript
* Node.js
* HTML
* CSS
* SQL
* Git

---

## Git

Git provides version control for the project.

It is used to:

* Track changes
* Create commits
* Manage project versions
* Collaborate on development
* Push the project to GitHub

---

## GitHub

GitHub is used to host the ZIPZAP source code.

**Repository:**

https://github.com/hammadurrehmantariq/ZIPZAP-Compressor

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/hammadurrehmantariq/ZIPZAP-Compressor.git
```

```bash
cd ZIPZAP-Compressor
```

---

## 2. Install Node.js Dependencies

```bash
npm install
```

This installs the dependencies defined in `package.json`.

---

## 3. Install MySQL

Make sure MySQL is installed and running on your system.

Create/configure the required database credentials through your environment variables.

---

## 4. Install Ghostscript

If Ghostscript is used for the PDF compression workflow, install it on the system.

### Windows

Install Ghostscript and make sure its executable can be accessed from the command line.

The command-line executable is generally:

```text
gswin64c.exe
```

### Linux

Install Ghostscript using your distribution's package manager.

For Debian/Ubuntu:

```bash
sudo apt update
sudo apt install ghostscript
```

Verify the installation:

```bash
gs --version
```

---

## 5. Configure Environment Variables

Create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zipzap
PORT=3000
```

Replace the values with your own configuration.

**Never commit real passwords or API keys to GitHub.**

---

## 6. Start the Server

```bash
node server.js
```

The server should start on:

```text
http://localhost:3000
```

---

## 7. Open ZIPZAP

Open your browser and navigate to:

```text
http://localhost:3000
```

---

# 🖥️ Using ZIPZAP

## Compress an Image

1. Open the Images section.
2. Drag and drop an image.
3. Select the image from your computer.
4. Wait for processing to finish.
5. Download the compressed image.

---

## Compress a Document

1. Open the Documents section.
2. Drag and drop a supported document.
3. ZIPZAP validates the file.
4. The backend selects the appropriate compression method.
5. Download the compressed document.

---

# 🔬 Compression Pipeline

ZIPZAP uses different processing technologies depending on the file type:

```text
                     FILE
                       │
                       ▼
                File Validation
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
      IMAGE           PDF          DOCX/PPTX
        │              │              │
        ▼              ▼              ▼
      Sharp       Ghostscript      Adm-Zip
        │              │              │
        │              │       Embedded Images
        │              │              │
        │              │            Sharp
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                Compressed Output
                       │
                       ▼
                  Save File
                       │
                       ▼
                  MySQL Log
                       │
                       ▼
                    Download
```

---

# 📁 Supported Formats

| File Type     | Extension | Processing                   |
| ------------- | --------- | ---------------------------- |
| JPEG Image    | `.jpg`    | Sharp                        |
| JPEG Image    | `.jpeg`   | Sharp                        |
| PNG Image     | `.png`    | Sharp                        |
| PDF           | `.pdf`    | PDF processing / Ghostscript |
| Word Document | `.doc`    | ZIP/fallback processing      |
| Word Document | `.docx`   | Adm-Zip + Sharp              |
| PowerPoint    | `.ppt`    | ZIP/fallback processing      |
| PowerPoint    | `.pptx`   | Adm-Zip + Sharp              |
| Text          | `.txt`    | ZIP compression              |

---

# 🧪 Testing

The current project does not contain a comprehensive automated testing framework.

Future tests could cover:

* File extension validation
* File size validation
* Image compression
* PDF compression
* DOCX processing
* PPTX processing
* ZIP generation
* Database logging
* Download endpoints
* API responses
* Error handling

---

# ⚠️ Current Limitations

The current implementation has several areas that could be improved for production use:

* File security relies heavily on extension validation.
* A real antivirus scanner should be added.
* Admin authentication is not currently implemented.
* Uploaded files are stored on the local filesystem.
* Compressed files should be automatically cleaned up.
* There is no comprehensive automated test suite.
* Large files may consume significant server resources.
* Rate limiting should be added for public deployment.
* Production database credentials must be securely managed.
* `node_modules` should normally not be committed to Git.
* `.env` should never contain publicly exposed production secrets.

---

# 🚀 Future Improvements

Possible future improvements include:

### 🔐 Security

* Add admin authentication
* Add real antivirus scanning
* Validate MIME types and file signatures
* Add rate limiting
* Prevent malicious file names
* Add secure file storage
* Implement automatic file expiration

### ⚡ Performance

* Add background compression jobs
* Use worker threads/processes for large files
* Implement cloud storage
* Add caching
* Optimize database queries

### 📊 Analytics

* Display original file size
* Display compressed file size
* Calculate compression percentage
* Show compression time
* Add compression history charts
* Add per-user statistics

### 🗜️ Compression

* Add more image formats
* Add configurable image quality
* Add configurable PDF compression levels
* Add additional document formats
* Add ZIP/RAR/7z support
* Improve Office document optimization

### ☁️ Deployment

* Dockerize the application
* Deploy the backend to a cloud server
* Use cloud object storage
* Add HTTPS
* Add production monitoring
* Add CI/CD through GitHub Actions

---

# 📌 Project Learning Outcomes

ZIPZAP demonstrates practical experience in several areas of software development:

### Backend Development

* Node.js
* Express.js
* REST APIs
* File uploads
* Server-side validation
* File processing

### Frontend Development

* HTML5
* CSS3
* JavaScript
* Drag-and-drop interfaces
* Asynchronous API requests
* Responsive UI design

### Data & Database

* MySQL
* SQL
* Database connection pooling
* CRUD operations
* Logging

### File Processing

* Image compression
* PDF processing
* ZIP archives
* DOCX/PPTX manipulation
* Embedded media optimization

### Software Engineering

* Git
* GitHub
* Environment variables
* Project structure
* Dependency management
* API design

---

# 👨‍💻 Author

## Hammad Ur Rehman Tariq

GitHub:

https://github.com/hammadurrehmantariq

---

# 📄 License

This project currently uses the **ISC License** as specified in `package.json`.

---

# ⭐ Project Summary

ZIPZAP Compressor is a full-stack file compression application that brings together:

```text
Frontend Development
        +
Backend Development
        +
File Upload Handling
        +
Image Processing
        +
PDF Processing
        +
Document Processing
        +
ZIP Compression
        +
MySQL Database
        +
Git/GitHub
        =
ZIPZAP Compressor
```

The project demonstrates how different specialized tools can be combined into a single web application to process and compress different types of files.

**ZIPZAP — Compress smarter. Save space.**
