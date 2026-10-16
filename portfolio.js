const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.project-card');
filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.filter;
    cards.forEach((card) => {
      card.classList.toggle('hidden', category !== 'all' && card.dataset.category !== category);
    });
  });
});

const header = document.querySelector('.site-header');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  header.style.background = currentScroll > 20 ? 'rgba(17,19,20,.86)' : 'transparent';
  header.style.backdropFilter = currentScroll > 20 ? 'blur(14px)' : 'none';
  header.style.position = currentScroll > lastScroll && currentScroll > 160 ? 'absolute' : 'fixed';
  header.style.top = currentScroll > lastScroll && currentScroll > 160 ? '-90px' : '0';
  header.style.left = '0';
  header.style.right = '0';
  lastScroll = currentScroll;
}, { passive: true });
