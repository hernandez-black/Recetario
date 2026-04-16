import React, { useEffect, useRef } from 'react';

export default function AdsterraNative() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Only inject once
    if (containerRef.current && !containerRef.current.hasChildNodes()) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.dataset.cfasync = 'false';
      script.src = 'https://pl29169535.profitablecpmratenetwork.com/7163d53c6b0d95ee677391e01bb0aeeb/invoke.js';
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '90px', display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <div id="container-7163d53c6b0d95ee677391e01bb0aeeb" ref={containerRef}></div>
    </div>
  );
}
