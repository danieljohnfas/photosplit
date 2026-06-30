module.exports = async function(context, baseUrl) {
  const pagesToTest = [
    '/', '/app', '/convert', '/crop', '/resize', '/passport', '/transcribe',
    '/about', '/contact', '/tips', '/games', '/privacy-policy', '/terms',
    '/blog/'
  ];

  const results = [];

  for (const page of pagesToTest) {
    const pageObj = await context.newPage();
    const url = `${baseUrl}${page}`;
    
    let loadMs = 0;
    let errors = [];
    let status = 'pass';

    // Only capture errors from first-party (localhost) scripts, not ad networks
    pageObj.on('pageerror', err => errors.push(err.stack || err.message));
    pageObj.on('console', msg => {
      if (msg.type() === 'error') {
        const location = msg.location();
        const url = location && location.url ? location.url : '';
        // Skip errors from external/third-party scripts (ad networks, CDNs, etc.)
        if (!url || url.startsWith(`${baseUrl}`) || url.startsWith('about:') || url === '') {
          errors.push(msg.text());
        }
      }
    });

    try {
      const startTime = Date.now();
      const response = await pageObj.goto(url, { waitUntil: 'load' });
      loadMs = Date.now() - startTime;
      
      if (!response.ok()) {
        status = 'fail';
        errors.push(`HTTP ${response.status()}`);
      }
    } catch (e) {
      status = 'fail';
      errors.push(e.message);
    }

    results.push({
      page,
      url,
      loadMs,
      errors,
      status: (status === 'fail' || errors.length > 0) ? 'fail' : 'pass'
    });

    await pageObj.close();
  }

  return results;
};
