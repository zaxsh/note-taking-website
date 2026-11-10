const STORAGE_KEY = "note-taker.notes";

let notes = loadNotes();

const noteListEl = document.getElementById("noteList");
const newNoteBtn = document.getElementById("newNoteBtn");

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function escapeHtml(str) {
  return String(str)
    .replace(/[&<>"]/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[ch]));
}

function render() {
  noteListEl.innerHTML = "";
  if (notes.length === 0) {
    noteListEl.innerHTML = '<p class="empty">No notes yet. Click “New Note” to create your first note.</p>';
    return;
  }
  notes.forEach((note) => {
    noteListEl.appendChild(renderNote(note));
  });
}

function renderNote(note) {
  const card = document.createElement("div");
  card.className = "note";
  card.dataset.id = note.id;

  const header = document.createElement("div");
  header.className = "note__header";

  const titleInput = document.createElement("input");
  titleInput.className = "note__title";
  titleInput.value = note.title || "";
  titleInput.addEventListener("input", () => {
    note.title = titleInput.value;
  });

  const actions = document.createElement("div");
  actions.className = "note__actions";
  const editBtn = document.createElement("button");
  editBtn.className = "btn btn--sm";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => openEdit(note));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn--sm btn--danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    notes = notes.filter((n) => n.id !== note.id);
    saveNotes();
    render();
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  header.appendChild(titleInput);
  header.appendChild(actions);
  card.appendChild(header);

  const content = document.createElement("p");
  content.className = "note__content";
  content.textContent = note.content || "";
  card.appendChild(content);

  return card;
}

function openEdit(note) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal__backdrop"></div>
    <div class="modal__card">
      <h2>Edit note</h2>
      <input class="modal__input" id="noteTitle" value="${escapeHtml(note.title)}" />
      <textarea class="modal__input modal__input--area" id="noteContent">${escapeHtml(note.content)}</textarea>
      <div class="modal__actions">
        <button class="btn" id="noteCancel">Cancel</button>
        <button class="btn btn--primary" id="noteSave">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("noteTitle").addEventListener("input", (e) => {
    note.title = e.target.value;
  });
  document.getElementById("noteContent").addEventListener("input", (e) => {
    note.content = e.target.value;
  });
  document.getElementById("noteSave").addEventListener("click", () => {
    saveNotes();
    render();
    modal.remove();
  });
  document.getElementById("noteCancel").addEventListener("click", () => modal.remove());
}

function openNew() {
  const note = {
    id: uid(),
    title: "",
    content: "",
    createdAt: new Date().toISOString()
  };
  notes = notes.concat(note);
  saveNotes();
  render();
  openEdit(note);
}

newNoteBtn.addEventListener("click", openNew);
render();
