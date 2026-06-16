import { toPng } from 'html-to-image';

export async function shareElement(elementId: string, title: string, text: string) {
  try {
    const node = document.getElementById(elementId);
    if (!node) return false;

    // Temporarily add watermark styling before capturing
    const originalPosition = node.style.position;
    node.style.position = 'relative';
    
    const watermark = document.createElement('div');
    watermark.innerText = 'Tracked effortlessly with ScoreboardHub.app';
    watermark.style.position = 'absolute';
    watermark.style.bottom = '8px';
    watermark.style.right = '12px';
    watermark.style.fontSize = '10px';
    watermark.style.color = 'currentColor';
    watermark.style.opacity = '0.5';
    node.appendChild(watermark);

    const dataUrl = await toPng(node, { quality: 0.95, backgroundColor: '#0f0f1a' });
    
    // Clean up
    node.removeChild(watermark);
    node.style.position = originalPosition;

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'recap.png', { type: blob.type });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file]
      });
      return true;
    } else {
      // Fallback: download the image
      const link = document.createElement('a');
      link.download = 'recap.png';
      link.href = dataUrl;
      link.click();
      return true;
    }
  } catch (error) {
    console.error('Error sharing recap:', error);
    return false;
  }
}
