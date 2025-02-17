function createErrorElements(element) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = 'Please check your form entries';

  const validateIcon = document.createElement('span');
  validateIcon.classList.add('form-icon');
  if (element.type !== 'select-one') {
    element.parentElement.append(validateIcon);
    validateIcon.insertAdjacentElement('afterend', errorDiv);
  } else {
    element.parentElement.append(errorDiv);
  }
  return { errorDiv, validateIcon };
}

export function toggleError(element, show, message = 'Please check your form entries') {
  const errorDiv = element.parentElement.querySelector('.field-error');
  const validateIcon = element.parentElement.querySelector('.form-icon');

  if (errorDiv) {
    errorDiv.style.display = show ? 'block' : 'none';
    errorDiv.textContent = message;
  }

  if (element.tagName === 'DIV') {
    const number = element.querySelector('.number');
    number.classList.toggle('field-valid', !show);
    number.classList.toggle('field-invalid', show);
  } else {
    element.classList.toggle('field-valid', !show);
    element.classList.toggle('field-invalid', show);
  }

  if (validateIcon) {
    if (show) {
      validateIcon.classList.add('icon-reject');
      validateIcon.classList.remove('icon-approve');
    } else {
      validateIcon.classList.remove('icon-reject');
      validateIcon.classList.add('icon-approve');
    }
  }
}

export function addErrorHandling(element) {
  createErrorElements(element);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    return true;
  };

  element.addEventListener('input', (e) => {
    const isEmpty = !element.value;
    if (e.target.classList.contains('email') && !isEmpty) {
      if (validateEmail(element.value)) {
        toggleError(element, false);
      } else {
        toggleError(element, true, e.target.getAttribute('validation-error-message'));
      }
    } else if (!e.target.classList.contains('number')) {
      toggleError(element, isEmpty, 'Please check your form entries');
    }
  });

  element.addEventListener('invalid', (e) => {
    e.preventDefault();
    toggleError(element, true);
  });
}

function createSelect(fd) {
  const select = document.createElement('select');
  select.id = fd.Field;
  select.name = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    ph.setAttribute('value', '');
    select.append(ph);
  }
  if (fd.Options && fd.Options?.startsWith('https://')) {
    const optionsUrl = new URL(fd.Options);
    fetch(`${optionsUrl.pathname}${optionsUrl.search}`)
      .then(async (response) => {
        const json = await response.json();
        json.data.forEach((opt) => {
          const option = document.createElement('option');
          option.textContent = opt.Option.trim();
          option.value = (opt.Value || opt.Option).trim();
          if (select.name === 'stateOrProvince') {
            option.setAttribute('data-country', opt.Country);
            option.hidden = option?.dataset?.country !== 'US';
          }
          if (select.name === 'category') {
            option.setAttribute('data-market', opt.Market);
            option.hidden = true;
          }
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
  if (select.name === 'country') {
    select.addEventListener('change', (e) => {
      const stateWrapper = document.querySelector('.stateOrProvince');
      const countryCode = e.target.value.toUpperCase();
      if (countryCode === 'US' || countryCode === 'CA' || countryCode === 'MX') {
        stateWrapper.style.display = 'block';
        const { options } = stateWrapper.querySelector('select');
        Array.from(options).forEach((option) => {
          option.hidden = option?.dataset?.country !== countryCode;
        });
      } else {
        stateWrapper.style.display = 'none';
      }
    });
  }
  if (select.name === 'market') {
    select.addEventListener('change', (e) => {
      const categoryWrapper = document.querySelector('.form-select-wrapper.category');
      const categorySelect = categoryWrapper.querySelector('select');
      if (e.target.value) {
        categoryWrapper.style.display = 'block';
        const { options } = categorySelect;
        Array.from(options).forEach((option) => {
          option.hidden = option?.dataset?.market !== e.target.value;
        });
      } else {
        categoryWrapper.style.display = 'none';
        categorySelect.value = '';
      }
    });
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
  input.id = fd.Field;
  input.type = fd.Type;
  if (fd.Type === 'number' || fd.Type === 'email') {
    input.type = 'text-input';
  }
  input.name = fd.Field;
  if (fd.Type === 'number') {
    input.classList.add('number');
  }
  if (fd.Type === 'email') {
    input.classList.add('email');
  }
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Pattern) {
    input.setAttribute('pattern', fd.Pattern);
    if (fd.Title) {
      input.setAttribute('title', fd.Title);
    }
  }
  if (fd.Checked) {
    input.setAttribute('checked', fd.Checked);
  }
  if (fd.ValidationErrorMessage) {
    input.setAttribute('validation-error-message', fd.ValidationErrorMessage);
  }
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.id = fd.Field;
  input.name = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  return input;
}

function createText(fd) {
  const input = document.createElement('p');
  input.textContent = fd.Label;
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

function createFieldWrapper(fd, tagName = 'div') {
  const fieldWrapper = document.createElement(tagName);
  const nameStyle = fd.Field ? ` form-${fd.Field}` : '';
  const fieldId = `form-${fd.Type}-wrapper${nameStyle}`;
  fieldWrapper.className = fieldId;
  fieldWrapper.dataset.fieldset = fd.Fieldset ? fd.Fieldset : '';
  fieldWrapper.classList.add('field-wrapper');
  return fieldWrapper;
}

function createFieldSet(fd) {
  const wrapper = createFieldWrapper(fd, 'fieldset');
  wrapper.name = fd.Field;
  if (fd.Extra) {
    wrapper.classList.add('align-vertical');
  }
  return wrapper;
}

function handleFormElement(form, fieldWrapper, fd, element) {
  const shouldAddLabel = !['fieldset', 'submit', 'heading', 'text'].includes(fd.Type);
  const container = fd.Fieldset ? form.querySelector(`.${fd.Fieldset} fieldset`) : fieldWrapper;

  if (shouldAddLabel) {
    fieldWrapper.append(createLabel(fd));
  }

  fieldWrapper.append(element);
  if (fd.Required && fd.Required !== 'false') {
    element.setAttribute('required', 'required');
    addErrorHandling(element);
  }

  if (fd.Fieldset) {
    container.append(fieldWrapper);
  }

  if (fd.Extra === 'hidden') {
    fieldWrapper.style.display = 'none';
  }
}

export async function createForm(formURL, submitUrl, onSubmit) {
  const resp = await fetch(formURL);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  form.dataset.action = submitUrl;
  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text-input';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    const fieldId = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    fieldWrapper.classList.add('field-wrapper');
    fieldWrapper.classList.add(fd.Field);
    if (fd.Colspan) {
      fieldWrapper.classList.add(`col-span-${fd.Colspan}`);
    }
    if (fd.Fieldset !== '' && fd.Colspan === '') {
      fieldWrapper.style.flex = '1';
    }
    switch (fd.Type) {
      case 'select':
        handleFormElement(form, fieldWrapper, fd, createSelect(fd));
        break;
      case 'heading':
        handleFormElement(form, fieldWrapper, fd, createHeading(fd));
        break;
      case 'checkbox':
        if (fd.Fieldset) {
          const fieldset = form.querySelector(`.${fd.Fieldset} fieldset`);
          fieldWrapper.append(createInput(fd));
          fieldWrapper.append(createLabel(fd));
          fieldset.append(fieldWrapper);
        } else {
          fieldWrapper.append(createInput(fd));
          fieldWrapper.append(createLabel(fd));
        }
        break;
      case 'text-area':
        handleFormElement(form, fieldWrapper, fd, createTextArea(fd));
        break;
      case 'fieldset':
        handleFormElement(form, fieldWrapper, fd, createFieldSet(fd));
        break;
      case 'submit':
        handleFormElement(form, fieldWrapper, fd, createButton(fd, onSubmit));
        break;
      case 'text':
        handleFormElement(form, fieldWrapper, fd, createText(fd));
        break;
      default:
        handleFormElement(form, fieldWrapper, fd, createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    if (fd.Fieldset === '') {
      form.append(fieldWrapper);
    }
  });

  return (form);
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    const { pathname } = new URL(form.href);
    const submitAction = block.querySelectorAll('p > a')[1];
    const submitUrl = submitAction ? new URL(submitAction.href) : String(pathname).split('.json')[0];
    submitAction.parentElement.style.display = 'none';
    form.replaceWith(await createForm(pathname, submitUrl));
  }
}
