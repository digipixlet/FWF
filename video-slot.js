if (!customElements.get('video-slot')) {
// video-slot — drag-and-drop video placeholder, IndexedDB-persisted
// Usage: <video-slot id="scene-outfall" label="IMG_2290.MOV · WWTW Outfall"></video-slot>
// Style via width/height on the element; it fills its container by default.

const DB_NAME = 'fwf-video-slots';
const DB_VER  = 1;
const STORE   = 'clips';

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VER);
    r.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
    r.onsuccess = e => res(e.target.result);
    r.onerror   = e => rej(e.target.error);
  });
}
async function dbGet(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx  = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}
async function dbPut(id, file) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx  = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put(file, id);
    req.onsuccess = () => res();
    req.onerror   = e => rej(e.target.error);
  });
}

class VideoSlot extends HTMLElement {
  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;
    this._id     = this.getAttribute('id')    || 'video-slot-' + Math.random().toString(36).slice(2);
    this._label  = this.getAttribute('label') || 'Drop video footage here';
    this._objectUrl = null;

    // Host styling
    Object.assign(this.style, {
      display: 'block', position: 'relative',
      width: this.style.width || '100%',
      height: this.style.height || '100%',
      background: '#03060a',
      overflow: 'hidden',
    });

    this._buildDOM();
    this._bindDrag();
    this._loadPersisted();
  }

  disconnectedCallback() {
    if (this._objectUrl) URL.revokeObjectURL(this._objectUrl);
  }

  _buildDOM() {
    // Placeholder
    this._ph = document.createElement('div');
    Object.assign(this._ph.style, {
      position: 'absolute', inset: '0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '18px', pointerEvents: 'none',
    });
    this._ph.innerHTML = `
      <div style="width:80px;height:80px;border-radius:50%;border:2.5px solid #FBB708;display:flex;align-items:center;justify-content:center;">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <polygon points="13,9 30,18 13,27" fill="#FBB708"/>
          <rect x="5" y="9" width="5" height="18" rx="1.5" fill="#FBB708"/>
        </svg>
      </div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#fff;text-align:center;padding:0 40px;line-height:1.2;">
        ${this._label}
      </div>
      <div style="font-family:'Barlow',sans-serif;font-size:16px;color:#8FE0FF;letter-spacing:0.5px;">
        Drag &amp; drop MOV / MP4 file — or click to browse
      </div>
    `;
    this.appendChild(this._ph);

    // Border dashes overlay (shows only when empty)
    this._border = document.createElement('div');
    Object.assign(this._border.style, {
      position: 'absolute', inset: '28px',
      border: '2px dashed rgba(251,183,8,0.5)',
      borderRadius: '10px', pointerEvents: 'none',
    });
    this.appendChild(this._border);

    // Video element
    this._vid = document.createElement('video');
    Object.assign(this._vid.style, {
      position: 'absolute', inset: '0',
      width: '100%', height: '100%',
      objectFit: 'cover', display: 'none',
    });
    this._vid.autoplay = true;
    this._vid.muted    = true;
    this._vid.loop     = true;
    this._vid.playsInline = true;
    this.appendChild(this._vid);

    // Drag-over highlight overlay
    this._hl = document.createElement('div');
    Object.assign(this._hl.style, {
      position: 'absolute', inset: '0',
      background: 'rgba(251,183,8,0.12)',
      border: '3px solid #FBB708',
      display: 'none', pointerEvents: 'none',
    });
    this.appendChild(this._hl);

    // Hidden file input for click-to-browse
    this._input = document.createElement('input');
    this._input.type   = 'file';
    this._input.accept = 'video/*';
    this._input.style.display = 'none';
    this._input.addEventListener('change', () => {
      if (this._input.files[0]) this._accept(this._input.files[0]);
    });
    this.appendChild(this._input);

    // Click to browse (only when empty)
    this.addEventListener('click', () => {
      if (!this._filled) this._input.click();
    });
  }

  _bindDrag() {
    this.addEventListener('dragenter', e => { e.preventDefault(); this._hl.style.display = 'block'; });
    this.addEventListener('dragover',  e => { e.preventDefault(); });
    this.addEventListener('dragleave', e => {
      if (!this.contains(e.relatedTarget)) this._hl.style.display = 'none';
    });
    this.addEventListener('drop', e => {
      e.preventDefault();
      this._hl.style.display = 'none';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) this._accept(file);
    });
  }

  async _accept(file) {
    await dbPut(this._id, file);
    this._play(file);
  }

  async _loadPersisted() {
    try {
      const file = await dbGet(this._id);
      if (file) this._play(file);
    } catch (_) {}
  }

  _play(file) {
    if (this._objectUrl) URL.revokeObjectURL(this._objectUrl);
    this._objectUrl = URL.createObjectURL(file);
    this._vid.src = this._objectUrl;
    this._vid.style.display = 'block';
    this._ph.style.display  = 'none';
    this._border.style.display = 'none';
    this._filled = true;
    this._vid.play().catch(() => {});
  }

  // Public: clear the slot (for testing)
  clear() {
    this._vid.src = '';
    this._vid.style.display = 'none';
    this._ph.style.display  = 'flex';
    this._border.style.display = 'block';
    this._filled = false;
    dbPut(this._id, null).catch(() => {});
  }
}

customElements.define('video-slot', VideoSlot);

}