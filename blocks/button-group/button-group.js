export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) {
    return;
  }
  const labels = [...rows[0].children];
  const links = [...rows[1].children];
  const wrapper = document.createElement('div');
  wrapper.classList.add('button-group-wrapper');
  labels.forEach((labelCell, index) => {
    const label = labelCell.textContent.trim();
    const href = links[index]?.textContent.trim();
    if (!label || !href) {
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.title = label;
    anchor.textContent = label;
    anchor.classList.add('button');
    wrapper.append(anchor);
  });
  block.replaceChildren(wrapper);
} 