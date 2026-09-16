export async function mergePdfs(files) {
    const { PDFDocument } = PDFLib; 
    const mergedPdf = await PDFDocument.create();

    for (let file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    downloadBlob(mergedPdfBytes, 'Merged_SuperConverter.pdf', 'application/pdf');
}

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
