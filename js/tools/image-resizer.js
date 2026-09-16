export async function processImages(files, options) {
    for (let file of files) {
        if (!file.type.startsWith('image/')) continue;
        try {
            await processSingleImage(file, options);
        } catch (err) {
            console.error("Error skipping file:", file.name);
        }
    }
}

function processSingleImage(file, options) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onerror = () => resolve(); // Error aayi toh hang mat ho, aage badho
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => resolve(); 
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    let width = options.width ? parseInt(options.width) : img.width;
                    let height = options.height ? parseInt(options.height) : img.height;

                    if (options.width && !options.height) height = (img.height / img.width) * width;
                    else if (options.height && !options.width) width = (img.width / img.height) * height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    if (options.targetKB && options.format === 'image/jpeg') {
                        compressToExactKB(canvas, options.targetKB, file.name, resolve);
                    } else {
                        canvas.toBlob((blob) => {
                            if (blob) downloadBlob(blob, file.name, options.format);
                            resolve(); // Hamesha resolve karo
                        }, options.format, 0.9);
                    }
                } catch (err) {
                    resolve(); // Canvas fat gaya toh bhi hang mat ho
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function compressToExactKB(canvas, targetKB, originalName, callback) {
    let minQuality = 0.01;
    let maxQuality = 1.0;
    let currentQuality = 0.5;
    const targetBytes = targetKB * 1024;
    
    const tolerance = 2048; 
    let attempts = 0;
    const maxAttempts = 20; 
    
    let bestBlob = null;
    let closestDiff = Infinity;

    function attemptCompression() {
        try {
            canvas.toBlob((blob) => {
                // Agar mobile browser ne crash karke null de diya
                if (!blob) {
                    if (bestBlob) downloadBlob(bestBlob, originalName, 'image/jpeg');
                    callback();
                    return;
                }

                attempts++;
                const diff = Math.abs(blob.size - targetBytes);

                if (diff < closestDiff) {
                    closestDiff = diff;
                    bestBlob = blob;
                }

                if (diff <= tolerance || attempts >= maxAttempts) {
                    downloadBlob(bestBlob, originalName, 'image/jpeg');
                    callback();
                    return;
                }

                if (blob.size > targetBytes) maxQuality = currentQuality;
                else minQuality = currentQuality;
                
                currentQuality = (minQuality + maxQuality) / 2;
                attemptCompression();
                
            }, 'image/jpeg', currentQuality);
        } catch (err) {
            callback(); // Loop break karo agar error aaye
        }
    }
    attemptCompression();
}

function downloadBlob(blob, originalName, contentType) {
    if (!blob) return; // Null error roko
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
