const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const statusArea = document.getElementById('statusArea');
const resultArea = document.getElementById('resultArea');

const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const statusSubtext = document.getElementById('statusSubtext');
const progressFill = document.getElementById('progressFill');

const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

if (uploadArea) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight on drag
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
    });

    // Handle drop
    uploadArea.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFiles, false);
    
    resetBtn.addEventListener('click', resetUI);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFiles(e) {
    if (this.files.length > 0) {
        processFile(this.files[0]);
    }
}

function processFile(file) {
    // 1. Switch UI to Scanning
    uploadArea.classList.add('hidden');
    statusArea.classList.remove('hidden');
    
    // Reset status UI
    statusIcon.innerHTML = '<div class="spinner"></div>';
    statusText.innerText = 'Scanning file...';
    statusSubtext.innerText = 'Ensuring your file is safe.';
    progressFill.style.width = '0%';
    
    // Simulate scan delay (Progress 0 to 50%)
    let scanProgress = 0;
    const scanInterval = setInterval(() => {
        scanProgress += 5;
        progressFill.style.width = `${scanProgress}%`;
        
        if (scanProgress >= 50) {
            clearInterval(scanInterval);
            uploadFile(file); // Move to actual upload/compression
        }
    }, 100);
}

async function uploadFile(file) {
    statusText.innerText = 'Compressing file...';
    statusSubtext.innerText = 'Applying optimal compression algorithms.';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        // Progress goes to 100% when response is received
        progressFill.style.width = '100%';
        
        if (response.ok) {
            const data = await response.json();
            showSuccess(data.downloadUrl);
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'An error occurred during upload.');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
}

function showSuccess(downloadUrl) {
    setTimeout(() => {
        statusArea.classList.add('hidden');
        resultArea.classList.remove('hidden');
        
        // Setup download link
        downloadBtn.href = downloadUrl;
        
        // Change icon to success for next time
        statusIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
    }, 500);
}

function showError(msg) {
    statusIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:50px;height:50px;margin:0 auto">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    `;
    statusText.innerText = 'Error';
    statusSubtext.innerText = msg;
    progressFill.style.backgroundColor = '#ef4444';
    
    // Add a back button to retry
    if (!document.getElementById('retryBtn')) {
        const retryBtn = document.createElement('button');
        retryBtn.id = 'retryBtn';
        retryBtn.innerText = 'Try Again';
        retryBtn.className = 'reset-btn';
        retryBtn.style.marginTop = '1rem';
        retryBtn.onclick = resetUI;
        statusIcon.parentElement.appendChild(retryBtn);
    }
}

resetBtn.addEventListener('click', resetUI);

function resetUI() {
    resultArea.classList.add('hidden');
    statusArea.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    fileInput.value = '';
    
    progressFill.style.width = '0%';
    progressFill.style.backgroundColor = ''; // Reset to default gradient
    
    const retry = document.getElementById('retryBtn');
    if (retry) retry.remove();
}
