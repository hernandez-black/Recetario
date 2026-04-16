import React, { useEffect, useRef } from 'react';

export default function AdsterraMobileBanner() {
  const bannerRef = useRef(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.hasChildNodes()) {
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.innerHTML = `
        atOptions = {
          'key' : 'b0525eb4c6ff494448ad8da341da39f8',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;

      const loadScript = document.createElement('script');
      loadScript.type = 'text/javascript';
      loadScript.src = "https://www.highperformanceformat.com/b0525eb4c6ff494448ad8da341da39f8/invoke.js";
      
      bannerRef.current.appendChild(confScript);
      bannerRef.current.appendChild(loadScript);
    }
  }, []);

  return (
    <div style={{ width: '320px', height: '50px', margin: '20px auto', overflow: 'hidden' }} ref={bannerRef}></div>
  );
}
