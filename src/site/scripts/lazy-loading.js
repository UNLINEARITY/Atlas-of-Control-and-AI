/**
 * 图片懒加载增强功能
 * 支持现代浏览器的原生懒加载，并提供回退方案
 */

(function() {
  'use strict';

  // 检查浏览器是否支持原生懒加载
  const supportsNativeLazyLoading = 'loading' in HTMLImageElement.prototype;

  // 图片加载状态跟踪
  const imageObserver = supportsNativeLazyLoading ? null : new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        loadImage(img);
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  /**
   * 加载图片
   */
  function loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
    
    img.classList.add('fade-in');
    
    // 处理加载错误
    img.onerror = function() {
      img.classList.add('error');
      img.alt = '图片加载失败';
    };
  }

  /**
   * 初始化懒加载
   */
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
      // 添加加载动画类
      img.addEventListener('load', function() {
        img.classList.add('fade-in');
      });

      // 处理错误
      img.addEventListener('error', function() {
        img.classList.add('error');
      });

      // 如果浏览器不支持原生懒加载，使用Intersection Observer
      if (!supportsNativeLazyLoading && imageObserver) {
        imageObserver.observe(img);
      }
    });
  }

  /**
   * 预防CLS（累积布局偏移）
   */
  function preventCLS() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // 确保图片有明确的尺寸
      if (!img.getAttribute('width') || !img.getAttribute('height')) {
        // 尝试从图片元数据获取尺寸
        const rect = img.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          img.setAttribute('width', rect.width);
          img.setAttribute('height', rect.height);
        }
      }
    });
  }

  /**
   * 优化响应式图片加载
   */
  function optimizeResponsiveImages() {
    const pictures = document.querySelectorAll('picture');
    
    pictures.forEach(picture => {
      const img = picture.querySelector('img');
      if (img) {
        // 确保响应式图片也支持懒加载
        if (!img.getAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        
        // 添加解码优化
        if (!img.getAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      }
    });
  }

  /**
   * 预加载关键图片
   */
  function preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('img[data-critical="true"]');
    
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    });
  }

  // 初始化
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initLazyLoading);
      document.addEventListener('DOMContentLoaded', preventCLS);
      document.addEventListener('DOMContentLoaded', optimizeResponsiveImages);
      document.addEventListener('DOMContentLoaded', preloadCriticalImages);
    } else {
      initLazyLoading();
      preventCLS();
      optimizeResponsiveImages();
      preloadCriticalImages();
    }
  }

  // 监听页面变化
  function observeChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'IMG') {
                initLazyLoading();
              } else if (node.querySelectorAll) {
                const newImages = node.querySelectorAll('img');
                if (newImages.length > 0) {
                  initLazyLoading();
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 启动所有功能
  init();
  observeChanges();

  // 暴露公共API
  window.LazyLoading = {
    init: initLazyLoading,
    refresh: preventCLS,
    preload: preloadCriticalImages
  };

})();