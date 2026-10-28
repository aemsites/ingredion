export default function decorate(block) {
  const link = block.querySelector('a');

  if (link) {
    link.classList.add('button');
    link.setAttribute('aria-label', link.textContent.trim());
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
}
