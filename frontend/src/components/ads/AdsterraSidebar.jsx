import React, { useEffect, useRef } from 'react';

export default function AdsterraSidebar() {
  const bannerRef = useRef(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.hasChildNodes()) {
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.innerHTML = `
        atOptions = {
          'key' : '74321d168abbe91c4b7180b59516dda9',
          'format' : 'iframe',
          'height' : 600,
          'width' : 160,
          'params' : {}
        };
      `;

      const loadScript = document.createElement('script');
      loadScript.type = 'text/javascript';
      loadScript.src = "https://www.highperformanceformat.com/74321d168abbe91c4b7180b59516dda9/invoke.js";
      
      bannerRef.current.appendChild(confScript);
      bannerRef.current.appendChild(loadScript);
    }
  }, []);

  return (
    <div style={{ width: '160px', height: '600px', margin: '20px auto', overflow: 'hidden' }} ref={bannerRef}></div>
  );
}
