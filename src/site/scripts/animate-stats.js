document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.querySelector('.site-stats');

    const animateStat = (element) => {
        const target = parseInt(element.dataset.target, 10);
        let current = 0;
        const increment = target / 100; // Animate over 100 steps
        const stepTime = 15; // 20ms per step

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.innerText = Math.floor(current);
        }, stepTime);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-num');
                statNumbers.forEach(num => animateStat(num));
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, { threshold: 0.5 });

    if (statsContainer) {
        observer.observe(statsContainer);
    }
});
