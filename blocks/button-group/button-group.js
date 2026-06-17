export default function decorate(block) {
 const wrapper = document.createElement('div');
 wrapper.className = 'button-group-wrapper';
 [...block.children].forEach((row) => {
   const cells = [...row.children];
   if (cells.length < 2) return;
   const label = cells[0].textContent.trim();
   const href = cells[1].textContent.trim();
   if (!label || !href) return;
   const link = document.createElement('a');
   link.href = href;
   link.textContent = label;
   link.title = label;
   link.classList.add('button');
   wrapper.append(link);
 });
 block.replaceChildren(wrapper);
} 