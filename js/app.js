import { setupDragAndDrop } from './components/drag-drop.js';
import { mergePdfs } from './tools/pdf-merge.js';

let currentTool = 'merge'; // Default tool

// Buttons ko select karein
const btnMerge = document.getElementById('btn-merge');
const btnResize = document.getElementById('btn-resize');
const btnScan = document.getElementById('btn-scan');
const workspace = document.getElementById('workspace');

// Tool Selection Logic
function setActiveTool(toolId, buttonElement) {
    currentTool = toolId;
    document.querySelectorAll('.tool-card').forEach(btn => btn.style.borderColor = '#e5e7eb');
    buttonElement.style.borderColor = '#4F46E5';
    workspace.innerHTML = `<p style="color: #4F46E5; font-weight: bold;">Ready to ${toolId}. Drop files above!</p>`;
}

btnMerge.addEventListener('click', () => setActiveTool('merge', btnMerge));
btnResize.addEventListener('click', () => setActiveTool('resize', btnResize));
btnScan.addEventListener('click', () => setActiveTool('scan', btnScan));

// File Handling Logic
async function handleFiles(files) {
    if (currentTool === 'merge') {
        workspace.innerHTML = `<p>Merging ${files.length} PDFs... Please wait.</p>`;
        
        try {
            await mergePdfs(files);
            workspace.innerHTML = `<p style="color: green; font-weight: bold;">Merge Complete! Check your downloads.</p>`;
        } catch (error) {
            console.error(error);
            workspace.innerHTML = `<p style="color: red;">Error merging PDFs. Make sure you only uploaded PDF files.</p>`;
        }
    } else {
        alert("Yeh tool abhi under construction hai!");
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop(handleFiles);
    setActiveTool('merge', btnMerge); // Start with merge tool active
});
