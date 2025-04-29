import React, { useState, useRef } from 'react';
import { useCanvas } from '../../context/CanvasContext';
import axios from 'axios';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { canvasRef } = useCanvas();

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const canvas = canvasRef.current;
      const canvasData = canvas.toDataURL('image/png');
      
      const response = await axios.post('/api/images/generate', {
        prompt,
        canvasData
      });

      setGeneratedImage({
        url: response.data.imageUrl,
        prompt: response.data.revisedPrompt
      });
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-generator">
      <div className="prompt-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>
      
      {generatedImage && (
        <div className="result-section">
          <img src={generatedImage.url} alt="Generated content" />
          <p className="revised-prompt">{generatedImage.prompt}</p>
        </div>
      )}
    </div>
  );
}
