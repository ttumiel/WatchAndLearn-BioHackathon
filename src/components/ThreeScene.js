import React from 'react';

const ThreeSceneIframe = () => {
    return (
        <iframe
            src="https://watch-and-learn-sim3-d.vercel.app/" // Replace with the URL to your Three.js HTML file
            width="100%"
            height="500px" // Adjust the size as needed
            frameBorder="2"
            allowFullScreen
        ></iframe>
    );
};

export default ThreeSceneIframe;
