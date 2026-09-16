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
                        downloadBlob(blob, file.name, options.format);
                        resolve();
                    }, options.format, 0.9);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function compressToExactKB(canvas, targetKB, originalName, callback) {
    let minQuality = 0.0;
    let maxQuality = 1.0;
    let currentQuality = 0.5;
    const targetBytes = targetKB * 1024;
    let attempts = 0;
    let bestBlob = null;

    function attemptCompression() {
        canvas.toBlob((blob) => {
            attempts++;
            bestBlob = blob;
            if (attempts > 10 || Math.abs(blob.size - targetBytes) <= 1024) {
                downloadBlob(bestBlob, originalName, 'image/jpeg');
                callback();
                return;
            }
            if (blob.size > targetBytes) maxQuality = currentQuality; 
            else minQuality = currentQuality; 
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
