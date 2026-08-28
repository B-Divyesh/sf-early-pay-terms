if (location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1') {
  document.documentElement.dataset.demo = 'true';
  document.title = 'Demo — Early Pay Terms';
}
