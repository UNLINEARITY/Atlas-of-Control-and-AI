document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.querySelector('.site-stats');

    const animateStat = (element) => {
        const target = parseInt(element.dataset.target, 10);
        let current = 0;

        const increment = target / 150; // Animate over  150 steps
        const stepTime = 10; // 10ms per step


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
