import { mergePdfs } from './tools/pdf-merge.js';
import { processImages } from './tools/image-resizer.js';

let currentTool = 'merge';

const btnMerge = document.getElementById('btn-merge');
const btnResize = document.getElementById('btn-resize');
const btnScan = document.getElementById('btn-scan');
const workspace = document.getElementById('workspace');
const resizeOptions = document.getElementById('resize-options');

function setActiveTool(toolId, buttonElement) {
    currentTool = toolId;
    document.querySelectorAll('.tool-card').forEach(btn => btn.style.borderColor = '#e5e7eb');
    buttonElement.style.borderColor = '#4F46E5';
    
    if (toolId === 'resize') {
        resizeOptions.classList.remove('hidden');
        workspace.innerHTML = `<p style="color: #4F46E5; font-weight: bold;">Set width/height or target KB, then Drop images!</p>`;
    } else {
        resizeOptions.classList.add('hidden');
        workspace.innerHTML = `<p style="color: #4F46E5; font-weight: bold;">Ready to ${toolId}. Drop files above!</p>`;
    }
}

btnMerge.addEventListener('click', () => setActiveTool('merge', btnMerge));
btnResize.addEventListener('click', () => setActiveTool('resize', btnResize));
btnScan.addEventListener('click', () => setActiveTool('scan', btnScan));

async function handleFiles(files) {
    if (currentTool === 'merge') {
        workspace.innerHTML = `<p>Merging ${files.length} PDFs... Please wait.</p>`;
        try {
            await mergePdfs(files);
            workspace.innerHTML = `<p style="color: green; font-weight: bold;">Merge Complete! Check your downloads.</p>`;
        } catch (error) {
            workspace.innerHTML = `<p style="color: red;">Error: Please upload only PDF files.</p>`;
        }
    } else if (currentTool === 'resize') {
        const options = {
            width: document.getElementById('input-width').value,
            height: document.getElementById('input-height').value,
            targetKB: document.getElementById('input-kb').value,
            format: document.getElementById('input-format').value
        };
        workspace.innerHTML = `<p>Processing ${files.length} image(s)...</p>`;
        await processImages(files, options);
        workspace.innerHTML = `<p style="color: green; font-weight: bold;">Images Processed Successfully!</p>`;
    } else {
        alert("Smart Scanner tool is coming next!");
    }
}

// --- DRAG AND DROP LOGIC INTEGRATED HERE ---
function setupDragAndDrop() {
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
}

document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
    setActiveTool('merge', btnMerge);
});
