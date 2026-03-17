chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'convert-image') {
    const { url, format } = message;
    
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        let mimeType = 'image/png';
        if (format === 'jpg') mimeType = 'image/jpeg';
        if (format === 'webp') mimeType = 'image/webp';
        
        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        
        chrome.runtime.sendMessage({
          type: 'download-ready',
          dataUrl: dataUrl,
          format: format
        });
      };
      
      img.onerror = () => {
        console.error("Failed to load image for conversion.");
      };
      
      img.src = url;
    } catch (e) {
      console.error(e);
    }
  }
});