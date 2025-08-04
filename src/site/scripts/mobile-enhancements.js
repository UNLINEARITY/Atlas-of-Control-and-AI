// 移动端触摸优化和增强功能

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // 检测是否为触摸设备
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = window.innerWidth <= 768;
    
    
    
    // 防抖滚动处理
    let ticking = false;
    function updateScroll() {
        handleScroll();
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    });
    
    // 触摸反馈增强
    if (isTouch) {
        document.addEventListener('touchstart', function(e) {
            const target = e.target.closest('a, button, [role="button"]');
            if (target) {
                target.style.transform = 'scale(0.98)';
                target.style.transition = 'transform 0.1s ease';
            }
        });
        
        document.addEventListener('touchend', function(e) {
            const target = e.target.closest('a, button, [role="button"]');
            if (target) {
                setTimeout(() => {
                    target.style.transform = '';
                }, 100);
            }
        });
    }
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // 触摸滚动优化
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    
    
    // 优化输入框体验
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // 防止键盘遮挡输入框
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
    
    // 触摸手势支持
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                // 向左滑动 - 可以添加返回功能
                console.log('Swiped left');
            } else {
                // 向右滑动 - 可以添加前进功能
                console.log('Swiped right');
            }
        }
    }
    
    // 性能优化：延迟加载非关键内容
    if (isMobile) {
        // 在移动设备上延迟加载大图
        const largeImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        largeImages.forEach(img => imageObserver.observe(img));
    }
    
    // 网络状态检测
    function updateNetworkStatus() {
        if (navigator.onLine) {
            document.body.classList.remove('offline');
        } else {
            document.body.classList.add('offline');
        }
    }
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
    
    // 振动反馈（如果支持）
    function provideHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
    
    // 为按钮添加振动反馈
    document.addEventListener('click', function(e) {
        if (e.target.matches('button, [role="button"], a')) {
            provideHapticFeedback();
        }
    });
    
    console.log('Mobile enhancements loaded');
});