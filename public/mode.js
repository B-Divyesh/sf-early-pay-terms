if (location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1') {
  document.documentElement.dataset.demo = 'true';
  document.title = 'Demo — Early Pay Terms';
  const demoUrl = 'https://early-pay-terms.sociobot.in/demo';
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', demoUrl);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', demoUrl);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'Demo — Early Pay Terms');
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'Demo — Early Pay Terms');
}
