import React from 'react';

const MermaidIframe = () => {
    return (
        <iframe
            src="https://watch-and-learn-sim3-d.vercel.app/mermaid.html"
            width="100%"
            style={{ backgroundColor: 'inherit' }}
            height="300px" // Adjust the size as needed
            frameBorder="2"
            allowFullScreen
        ></iframe>
    );
};

export default MermaidIframe;
