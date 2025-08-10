// Service Worker for Nonlinear Knowledge Base
const CACHE_NAME = 'nonlinear-kb-v1';
const urlsToCache = [
  '/',
  '/styles/digital-garden-base.css',
  '/styles/obsidian-base.css',
  '/styles/style.css',
  '/styles/custom-style.css',
  '/styles/mobile-optimization.css',
  '/styles/copy-code.css',
  '/styles/lazy-loading.css',
  '/scripts/lazy-loading.js',
  '/scripts/copy-code.js',
  '/scripts/mobile-enhancements.js',
  '/img/Logo.svg',
  '/favicon.svg'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const cachePromises = urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Request for ${url} failed with status ${response.status}`);
              }
              return cache.put(url, response);
            })
            .catch(error => {
              console.warn(`Failed to cache ${url}. It will be skipped.`, error);
            });
        });
        return Promise.all(cachePromises);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 获取事件 - 缓存优先策略
self.addEventListener('fetch', event => {
  // 跳过chrome-extension协议的请求
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // 跳过POST等非GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，直接返回
        if (response) {
          return response;
        }

        // 克隆请求
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // 检查是否有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// 网络优先策略 - 用于API和动态内容
function networkFirst(request) {
  // 跳过chrome-extension协议的请求
  if (request.url.startsWith('chrome-extension://')) {
    return fetch(request);
  }
  
  // 跳过POST等非GET请求
  if (request.method !== 'GET') {
    return fetch(request);
  }

  return fetch(request)
    .then(response => {
      // 只缓存有效的GET响应
      if (response && response.status === 200 && response.type === 'basic') {
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(request, responseClone);
          });
      }
      return response;
    })
    .catch(() => {
      return caches.match(request);
    });
}

// 缓存优先策略 - 用于静态资源
function cacheFirst(request) {
  return caches.match(request)
    .then(response => {
      return response || fetch(request);
    });
}

// 消息事件 - 处理页面消息
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 后台同步 - 用于离线操作
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(backgroundSync());
  }
});

async function backgroundSync() {
  // 这里可以添加离线操作同步逻辑
  console.log('Background sync triggered');
}

// 推送通知支持
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/img/Logo.svg',
    badge: '/img/Logo.svg',
    vibrate: [200, 100, 200],
    tag: 'content-update',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Nonlinear Knowledge Base', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 定期更新缓存
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-update') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    await Promise.all(
      requests.map(async request => {
        try {
          // 跳过chrome-extension协议的请求
          if (request.url.startsWith('chrome-extension://')) {
            return;
          }
          
          // 跳过非GET请求
          if (request.method !== 'GET') {
            return;
          }
          
          const response = await fetch(request, { cache: 'no-cache' });
          if (response.ok) {
            await cache.put(request, response);
          }
        } catch (error) {
          console.warn('Failed to update:', request.url);
        }
      })
    );
  } catch (error) {
    console.error('Update failed:', error);
  }
}