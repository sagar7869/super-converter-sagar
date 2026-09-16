export async function mergePdfs(files) {
    // pdf-lib library CDN se global object 'PDFLib' ke roop me milti hai
    const { PDFDocument } = PDFLib; 
    
    // Ek naya khali PDF create karein
    const mergedPdf = await PDFDocument.create();

    // Har selected file ko loop mein process karein
    for (let file of files) {
        // File ko read karein (ArrayBuffer format mein)
        const arrayBuffer = await file.arrayBuffer();
        
        // Existing PDF ko load karein
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // Us PDF ke saare pages copy karein
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        // Naye PDF mein paste karein
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Final PDF ko save karein
    const mergedPdfBytes = await mergedPdf.save();
    
    // Browser mein download trigger karein
    downloadBlob(mergedPdfBytes, 'Merged_SuperConverter.pdf', 'application/pdf');
}

// Download helper function
function downloadBlob(bytes, filename, contentType) {
    const blob = new Blob([bytes], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
