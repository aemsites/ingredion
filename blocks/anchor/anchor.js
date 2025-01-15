export default function decorate(block) {
  [...block.querySelectorAll('a.button')].forEach((button) => {
    button.classList.remove('button');
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      console.log(entry);
      const intersecting = entry.isIntersecting;
      if (!intersecting) {
        block.classList.add('is-visible');
        console.log('not-visible');       
      }      
    });
  });
  observer.observe(block);
}
