export async function processImages(files, options) {
    for (let file of files) {
        if (!file.type.startsWith('image/')) continue;
        await processSingleImage(file, options);
    }
}

function processSingleImage(file, options) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = options.width ? parseInt(options.width) : img.width;
                let height = options.height ? parseInt(options.height) : img.height;

                // Aspect ratio maintain karein agar ek dimension missing ho
                if (options.width && !options.height) height = (img.height / img.width) * width;
                else if (options.height && !options.width) width = (img.width / img.height) * height;

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // JPG compression algorithm tabhi chalega jab Target KB diya gaya ho
                if (options.targetKB && options.format === 'image/jpeg') {
                    compressToExactKB(canvas, options.targetKB, file.name, resolve);
                } else {
                    canvas.toBlob((blob) => {
                        downloadBlob(blob, file.name, options.format);
                        resolve();
                    }, options.format, 0.9); // Default high quality for PNG or normal JPG
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Improved Binary Search Compression
function compressToExactKB(canvas, targetKB, originalName, callback) {
    let minQuality = 0.01; // Minimum possible quality
    let maxQuality = 1.0;
    let currentQuality = 0.5;
    const targetBytes = targetKB * 1024;
    
    // Tolerance (koshish karenge ki +-2KB ke andar aa jaye)
    const tolerance = 2048; 
    let attempts = 0;
    const maxAttempts = 20; // Zyada try karega
    
    let bestBlob = null;
    let closestDiff = Infinity;

    function attemptCompression() {
        canvas.toBlob((blob) => {
            attempts++;
            const diff = Math.abs(blob.size - targetBytes);

            // Hamesha sabse closest result ko bestBlob manenge
            if (diff < closestDiff) {
                closestDiff = diff;
                bestBlob = blob;
            }

            // Exit Conditions: Agar tolerance me aa jaye, ya maximum tries pure ho jayein
            if (diff <= tolerance || attempts > maxAttempts) {
                // Agar target se bahot chota/bada hai, tab bhi sabse best jo mila wo de do
                console.log(`Finished after ${attempts} attempts. Target: ${targetBytes} bytes, Result: ${bestBlob.size} bytes. Quality used: ${currentQuality}`);
                downloadBlob(bestBlob, originalName, 'image/jpeg');
                callback();
                return;
            }

            // Adjust Quality based on size
            if (blob.size > targetBytes) {
                maxQuality = currentQuality; // Kam karo
            } else {
                minQuality = currentQuality; // Badao
            }
            
            // Naya average calculate karein agle loop ke liye
            currentQuality = (minQuality + maxQuality) / 2;
            attemptCompression();
            
        }, 'image/jpeg', currentQuality);
    }
    attemptCompression();
}

function downloadBlob(blob, originalName, contentType) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const ext = contentType === 'image/png' ? '.png' : '.jpg';
    const cleanName = originalName.replace(/\.[^/.]+$/, ""); 
    link.download = `Resized_${cleanName}${ext}`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
