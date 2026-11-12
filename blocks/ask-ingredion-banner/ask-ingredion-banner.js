export default function decorate(block) {
  const links = block.querySelectorAll('a');
  const link = links[0];

  if (links.length === 1) {
    block.classList.add('single');
  }

  if (link) {
    link.classList.add('button');
    link.setAttribute('aria-label', link.textContent.trim());
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
}
