module.exports = async function(context, baseUrl) {
  const pagesToTest = [
    '/', '/app', '/blog/', '/convert'
  ];

  const results = [];

  for (const page of pagesToTest) {
    const pageObj = await context.newPage();
    const url = `${baseUrl}${page}`;
    
    await pageObj.goto(url, { waitUntil: 'load' });

    // Check if ads exist
    const adTop = await pageObj.$('.ad-banner-top');
    const adBottom = await pageObj.$('.ad-banner-bottom');
    const adSidebar = await pageObj.$('.page-sidebar');

    const hasAdTop = adTop !== null;
    const hasAdBottom = adBottom !== null;
    const hasAdSidebar = adSidebar !== null;

    results.push({
      page,
      hasAdTop,
      hasAdBottom,
      hasAdSidebar,
      status: 'pass' // This is just informational logging
    });

    await pageObj.close();
  }

  return results;
};
