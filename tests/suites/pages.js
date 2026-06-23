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

    pageObj.on('pageerror', err => errors.push(err.message));
    pageObj.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    try {
      const startTime = Date.now();
      const response = await pageObj.goto(url, { waitUntil: 'networkidle' });
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
