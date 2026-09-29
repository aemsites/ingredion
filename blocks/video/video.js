/*
 * Video Block
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function embedVimeo(url, autoplay) {
  const [, video] = url.pathname.split('/');
  let suffix = '';
  if (autoplay) {
    suffix = '?autoplay=1';
  }
  const temp = document.createElement('div');
  temp.innerHTML = `<div class="video-modal" style="display: block;">
    <div class="video-modal-wrapper">
      <div class='video-modal-content'">
        <iframe src="https://player.vimeo.com/video/${video}${suffix}" 
          frameborder="0" allow="autoplay" scrolling="no" allowfullscreen data-ready="true"  
          title="Content from Vimeo" loading="lazy"></iframe>
        <div class="video-modal-close icon-close-blk" tabindex="0" aria-label="Close Video Modal" role="button"></div>
      </div>
    </div>
  </div>`;
  return temp.children.item(0);
}

function embedYoutube(url, autoplay, background, eager) {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      mute: background ? '1' : '0',
      controls: background ? '0' : '1',
      disablekb: background ? '1' : '0',
      loop: background ? '1' : '0',
      playsinline: background ? '1' : '0',
    };
    suffix = `&${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div class="video-modal" style="display: block;">
    <div class="video-modal-wrapper">
      <div class='video-modal-content'>
        <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}"
        frameborder="0" allow="autoplay" scrolling="no" allowfullscreen data-ready="true"
        title="Content from YouTube" loading="${eager ? 'eager' : 'lazy'}"></iframe>
        <div class="video-modal-close icon-close-blk" tabindex="0" aria-label="Close Video Modal" role="button"></div>
      </div>
    </div>
  </div>`;
  return temp.children.item(0);
}

function embedBoxUrl(url) {
  // Sample URL: https://app.box.com/s/p60c7tfpt5ttg94xkrw30thegyzv242d
  const [, boxId] = url.pathname.split('/s/');
  const temp = document.createElement('div');
  temp.innerHTML = `<div class="video-modal" style="display: block;">
    <div class="video-modal-wrapper">
      <div class='video-modal-content'>
        <iframe src="https://app.box.com/s/${boxId}" allowfullscreen title="Content from Box" loading="lazy"></iframe>
        <div class="video-modal-close icon-close-blk" tabindex="0" aria-label="Close Video Modal" role="button"></div>
      </div>
    </div>
  </div>`;
  return temp.children.item(0);
}

function getVideoElement(source, autoplay, background) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  if (autoplay) video.setAttribute('autoplay', '');
  if (background) {
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.removeAttribute('controls');
    video.addEventListener('canplay', () => {
      video.muted = true;
      if (autoplay) video.play();
    });
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.append(sourceEl);

  return video;
}

const loadVideoEmbed = (block, link, autoplay, background) => {
  if (block.dataset.embedLoaded === 'true') {
    return;
  }
  const url = new URL(link);

  const isYoutube = link.includes('youtube') || link.includes('youtu.be');
  const isVimeo = link.includes('vimeo');
  const isBox = link.includes('box');

  if (isYoutube) {
    const embedWrapper = embedYoutube(url, autoplay, background, block.classList.contains('eager-test'));
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
    document.body.classList.add('modal-open');
    const closeBtn = embedWrapper.querySelector('.video-modal-close');
    let escapeHandler;
    const closeHandler = () => {
      embedWrapper.remove();
      block.dataset.embedLoaded = false;
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', escapeHandler);
    };
    escapeHandler = (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('modal-open')) {
        closeHandler();
      }
    };
    closeBtn.addEventListener('click', closeHandler);
    closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeHandler();
      }
    });
    document.addEventListener('keydown', escapeHandler);
  } else if (isVimeo) {
    const embedWrapper = embedVimeo(url, autoplay, background);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
    document.body.classList.add('modal-open');
    const closeBtn = embedWrapper.querySelector('.video-modal-close');
    let escapeHandler;
    const closeHandler = () => {
      embedWrapper.remove();
      block.dataset.embedLoaded = false;
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', escapeHandler);
    };
    escapeHandler = (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('modal-open')) {
        closeHandler();
      }
    };
    closeBtn.addEventListener('click', closeHandler);
    closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeHandler();
      }
    });
    document.addEventListener('keydown', escapeHandler);
  } else if (isBox) {
    const embedWrapper = embedBoxUrl(url);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
    document.body.classList.add('modal-open');
    const closeBtn = embedWrapper.querySelector('.video-modal-close');
    let escapeHandler;
    const closeHandler = () => {
      embedWrapper.remove();
      block.dataset.embedLoaded = false;
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', escapeHandler);
    };
    escapeHandler = (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('modal-open')) {
        closeHandler();
      }
    };
    closeBtn.addEventListener('click', closeHandler);
    closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeHandler();
      }
    });
    document.addEventListener('keydown', escapeHandler);
  } else {
    const videoEl = getVideoElement(link, autoplay, background);
    block.append(videoEl);
    videoEl.addEventListener('canplay', () => {
      block.dataset.embedLoaded = true;
    });
  }
};

function getVideoSchemaData(block, link) {
  const url = new URL(link);
  const videoId = new URLSearchParams(url.search).get('v')
    || url.pathname.split('/').filter(Boolean).pop();
  if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;

  const rowValue = (label) => {
    const row = [...block.children].find((element) => {
      const cells = [...element.children];
      return cells.length > 1 && cells[0].textContent.trim().toLowerCase() === label;
    });
    return row?.children[1].textContent.trim() || '';
  };

  const name = rowValue('title');
  const description = rowValue('description');
  if (!name || !description) return null;

  const poster = block.querySelector('picture img')?.getAttribute('src');
  const thumbnailUrl = poster
    ? new URL(poster, window.location.href).href
    : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const uploadDate = rowValue('upload date');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
  if (uploadDate && !Number.isNaN(Date.parse(uploadDate))) {
    schema.uploadDate = new Date(uploadDate).toISOString();
  }
  return { videoId, schema };
}

function addVideoSchema(block, link) {
  if (!block.classList.contains('schema-test') || !link) return;
  const data = getVideoSchemaData(block, link);
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.videoSchema = data.videoId;
  script.textContent = JSON.stringify(data.schema);
  document.head.append(script);
}

export default async function decorate(block) {
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a')?.href;
  addVideoSchema(block, link);
  block.textContent = '';
  block.dataset.embedLoaded = false;

  const autoplay = block.classList.contains('autoplay');
  if (!placeholder && autoplay) {
    const playOnLoad = autoplay && !prefersReducedMotion.matches;
    loadVideoEmbed(block, link, playOnLoad, autoplay);
  } else if (!placeholder || autoplay) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        const playOnLoad = autoplay && !prefersReducedMotion.matches;
        loadVideoEmbed(block, link, playOnLoad, autoplay);
      }
    });
    observer.observe(block);
  }

  if (placeholder) {
    block.classList.add('placeholder');
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.append(placeholder);

    if (!autoplay) {
      wrapper.insertAdjacentHTML(
        'beforeend',
        '<button class="play-button" aria-label="Play video"><span class="icon-play-button"></span></button>',
      );
      const playHandler = () => {
        loadVideoEmbed(block, link, true, false);
      };
      wrapper.addEventListener('click', playHandler);
      wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playHandler();
        }
      });
    }
    block.append(wrapper);
  }
}
