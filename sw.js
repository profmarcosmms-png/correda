/**
 * CORREDA - service worker
 * By Marcos Mont
 *
 * Guarda o próprio CORREDA.html em cache, para o app abrir mesmo sem
 * internet (a correção em si continua precisando de conexão, por
 * depender da IA). Sempre busca a versão mais nova na rede primeiro;
 * só usa o cache se a rede falhar. Suba este arquivo (sw.js) na MESMA
 * pasta do CORREDA.html no GitHub Pages.
 *
 * Sem este arquivo, a CORREDA funciona normalmente — só não fica
 * instalável/offline da forma mais robusta (o registro abaixo, no
 * próprio HTML, falha em silêncio se o navegador não achar o sw.js).
 */
const CACHE = 'correda-v1';
const ARQUIVO = self.registration.scope + 'CORREDA.html';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.add(ARQUIVO).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((chaves) => Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // fontes, pdf.js, firebase etc. seguem direto para a rede

  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match(ARQUIVO)))
  );
});
