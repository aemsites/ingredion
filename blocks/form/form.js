function createSelect(fd) {
  const select = document.createElement('select');
  select.name = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  if (fd.Options && fd.Options?.startsWith('https://')) {
    const optionsUrl = new URL(fd.Options);
    // using async to avoid rendering
    fetch(`${optionsUrl.pathname}${optionsUrl.search}`)
      .then(async (response) => {
        const json = await response.json();
        json.data.forEach((opt) => {
          const option = document.createElement('option');
          option.textContent = opt.Option.trim();
          option.value = (opt.Value || opt.Option).trim();
          select.append(option);
        });
      });
  } else {
    fd.Options.split(',').forEach((o) => {
      const option = document.createElement('option');
      option.textContent = o.trim();
      option.value = o.trim();
      select.append(option);
    });
  }
  if (fd.Required && fd.Required !== 'false') {
    select.setAttribute('required', 'required');
  }
  return select;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.name] = fe.value;
    } else if (fe.name) {
      payload[fe.name] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  const resp = await fetch(form.dataset.action, {
  // const resp = await fetch('https://webhook.site/1b65ccd2-baa2-4f34-ad4b-ec73c91b9243', {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

function createButton(fd, onSubmit) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  if (fd.Type === 'submit') {
    button.addEventListener('click', (event) => {
      const form = button.closest('form');
      let doSubmit = onSubmit;
      if (!doSubmit) {
        doSubmit = async () => {
          await submitForm(form);
          const redirectTo = fd.Extra;
          window.location.href = redirectTo;
        };
      }
      if (fd.Placeholder) form.dataset.action = fd.Placeholder;
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        doSubmit(fd);
      }
    });
  }
  return button;
}

function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.name = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Required && fd.Required !== 'false') {
    input.setAttribute('required', 'required');
  }
  if (fd.Pattern) {
    input.setAttribute('pattern', fd.Pattern);
    if (fd.Title) {
      input.setAttribute('title', fd.Title);
    }
  }
  if (fd.Checked) {
    input.setAttribute('checked', fd.Checked);
  }
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.name = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Required && fd.Required !== 'false') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Required && fd.Required !== 'false') {
    label.classList.add('required');
  }
  return label;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const { type, condition: { key, operator, value } } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value) {
          form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

/**
 * Builds a <form> element based on the definition in a spreadsheet from
 * the source repository. The method will request the form content, then
 * use the provided JSON data to construct the element.
 * @param {string} formURL Full URL from which the form's configuration will
 *  be retrieved.
 * @param {function} [onSubmit] If provided, will be called when the form
 *  is successfully submitted. The default behavior will be to submit the
 *  form's data as JSON back to the form's URL.
 * @returns {Promise<HTMLElement>} Resolves with the newly created form
 *  element.
 */
export async function createForm(formURL, onSubmit) {
  const resp = await fetch(formURL);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = String(formURL).split('.json')[0];
  // form.dataset.action = 'https://webhook.site/1b65ccd2-baa2-4f34-ad4b-ec73c91b9243';
  // form.dataset.action = '';
  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    const fieldId = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    fieldWrapper.classList.add('field-wrapper');
    fieldWrapper.classList.add(fd.Field);
    switch (fd.Type) {
      case 'select':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case 'heading':
        fieldWrapper.append(createHeading(fd));
        break;
      case 'checkbox':
        fieldWrapper.append(createInput(fd));
        fieldWrapper.append(createLabel(fd));
        break;
      case 'text-area':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createTextArea(fd));
        break;
      case 'submit':
        fieldWrapper.append(createButton(fd, onSubmit));
        break;
      default:
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    form.append(fieldWrapper);
  });

  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);
  return (form);
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    const { pathname } = new URL(form.href);
    form.replaceWith(await createForm(pathname));
  }
}

//

function hideField(field) {
  field.classList.add('hidden');
  const inputs = field.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    input.disabled = true;
  });
}

function showField(field) {
  field.classList.remove('hidden');
  const inputs = field.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    input.disabled = false;
  });
}

function applyRules1(form, rules) {
  rules.forEach(({ fieldId, rule }) => {
    const targetField = form.querySelector(`#${fieldId}`).closest('.field-wrapper');
    const sourceField = form.querySelector(`#${rule.field}`);

    if (sourceField) {
      const sourceValue = sourceField.value;
      const { value, operator = '=' } = rule;

      let show = false;
      switch (operator) {
        case '=':
          show = sourceValue === value;
          break;
        case '!=':
          show = sourceValue !== value;
          break;
        case '>':
          show = parseFloat(sourceValue) > parseFloat(value);
          break;
        case '<':
          show = parseFloat(sourceValue) < parseFloat(value);
          break;
        case 'contains':
          show = sourceValue.includes(value);
          break;
        default:
          // eslint-disable-next-line no-console
          console.warn(`Unknown operator ${operator}`);
      }

      if (show) {
        showField(targetField);
      } else {
        hideField(targetField);
      }
    }
  });
}
