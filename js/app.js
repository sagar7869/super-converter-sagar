import { mergePdfs } from './tools/pdf-merge.js';
import { processImages } from './tools/image-resizer.js';

let currentTool = 'merge';
let pendingFiles = []; // FILES KO HOLD KARNE KE LIYE ARRAY

const btnMerge = document.getElementById('btn-merge');
const btnResize = document.getElementById('btn-resize');
const btnScan = document.getElementById('btn-scan');
const workspace = document.getElementById('workspace');
const resizeOptions = document.getElementById('resize-options');

// Naye UI elements (Staging Area)
const fileListContainer = document.getElementById('file-list-container');
const fileList = document.getElementById('file-list');
const btnAction = document.getElementById('btn-action');

function setActiveTool(toolId, buttonElement) {
    currentTool = toolId;
    pendingFiles = []; // Tool change par purani files clear karein
    updateFileListUI(); // UI reset karein
    
    document.querySelectorAll('.tool-card').forEach(btn => btn.style.borderColor = '#e5e7eb');
    buttonElement.style.borderColor = '#4F46E5';
    
    if (toolId === 'resize') {
        resizeOptions.classList.remove('hidden');
        workspace.innerHTML = `<p style="color: #4F46E5; font-weight: bold;">Set options, then Drop images!</p>`;
    } else {
        resizeOptions.classList.add('hidden');
        workspace.innerHTML = `<p style="color: #4F46E5; font-weight: bold;">Ready to ${toolId}. Drop files above!</p>`;
    }
}

btnMerge.addEventListener('click', () => setActiveTool('merge', btnMerge));
btnResize.addEventListener('click', () => setActiveTool('resize', btnResize));
btnScan.addEventListener('click', () => setActiveTool('scan', btnScan));

// TURANT PROCESS NAHI KARENGE, SIRF ARRAY MEIN SAVE KARENGE
function handleFiles(files) {
    pendingFiles = Array.from(files);
    updateFileListUI();
}

// FILES KI LIST UI PAR DIKHANE KA FUNCTION
function updateFileListUI() {
    if (pendingFiles.length === 0) {
        fileListContainer.classList.add('hidden');
        return;
    }

    fileListContainer.classList.remove('hidden');
    
    let html = `<p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Selected Files (${pendingFiles.length}):</p>`;
    pendingFiles.forEach(file => {
        html += `<div class="file-item">
                    <span class="file-item-name">📄 ${file.name}</span>
                    <span class="file-item-size">${(file.size / 1024).toFixed(1)} KB</span>
                 </div>`;
    });
    fileList.innerHTML = html;

    // Button ka naam tool ke hisaab se set karein
    if (currentTool === 'merge') {
        btnAction.innerText = "Merge & Download PDFs";
    } else if (currentTool === 'resize') {
        btnAction.innerText = "Compress & Download Images";
    }
}

// JAB USER "PROCESS FILES" BUTTON DBAYE TABHI START HOGA
btnAction.addEventListener('click', async () => {
    if (pendingFiles.length === 0) return;

    btnAction.innerText = "Processing... Please wait ⏳";
    btnAction.disabled = true;

    if (currentTool === 'merge') {
        try {
            await mergePdfs(pendingFiles);
            alert("Success! Merged PDF is downloading.");
        } catch (error) {
            alert("Error: Please make sure all files are PDFs.");
        }
    } else if (currentTool === 'resize') {
        // Naya KB/MB wala logic
        const sizeValue = document.getElementById('input-size').value;
        const unit = document.getElementById('input-unit').value;
        
        let finalKB = sizeValue;
        if (sizeValue && unit === 'MB') {
            finalKB = sizeValue * 1024; 
        }

        const options = {
            width: document.getElementById('input-width').value,
            height: document.getElementById('input-height').value,
            targetKB: finalKB,
            format: document.getElementById('input-format').value
        };
        
        await processImages(pendingFiles, options);
        alert("Success! Images are processed and downloading.");
    } else {
        alert("Smart Scanner is coming next!");
    }

    // Process hone ke baad reset kar do
    btnAction.disabled = false;
    pendingFiles = [];
    updateFileListUI();
    
    // Tools reset
    if (currentTool === 'merge') {
        setActiveTool('merge', btnMerge);
    } else {
        setActiveTool('resize', btnResize);
    }
});

// Drag & Drop Init (Integrated logic)
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFiles(e.target.files);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    });

    setActiveTool('merge', btnMerge);
});
