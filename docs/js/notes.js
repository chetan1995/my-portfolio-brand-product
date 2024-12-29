const ITEMS_PER_PAGE = 6;
let notes = [];
let currentPage = 1;
let currentSort = 'date';
let currentFilter = 'all';

async function loadNotes() {
  const response = await fetch('data/notes.json');
  const data = await response.json();
  return data.notes;
}

function renderNote(note) {
  return `
    <div class="note-item" data-topics='${JSON.stringify(note.topics)}'>
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">
            <a href="${note.url}" class="text-decoration-none">${note.title}</a>
          </h5>
          <div class="mb-2">
            ${note.topics.map(topic => 
              `<span class="badge bg-primary topic-badge">${topic}</span>`
            ).join('')}
          </div>
          <p class="card-text">${note.summary}</p>
          <p class="card-text">
            <small class="text-muted">Last updated: ${note.date}</small>
          </p>
        </div>
      </div>
    </div>
  `;
}

function filterAndSortNotes() {
  let filtered = notes;
  if (currentFilter !== 'all') {
    filtered = notes.filter(note => 
      note.topics.includes(currentFilter)
    );
  }
  
  return filtered.sort((a, b) => {
    switch(currentSort) {
      case 'date': return new Date(b.date) - new Date(a.date);
      case 'title': return a.title.localeCompare(b.title);
      case 'topic': return a.topics[0].localeCompare(b.topics[0]);
      default: return 0;
    }
  });
}

function updatePagination(filteredNotes) {
  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE);
  document.querySelector('.current-page').textContent = currentPage;
  document.querySelector('.total-pages').textContent = totalPages;
  
  document.querySelector('.page-prev').disabled = currentPage === 1;
  document.querySelector('.page-next').disabled = currentPage === totalPages;
}

function renderNotes() {
  const filteredNotes = filterAndSortNotes();
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const notesToShow = filteredNotes.slice(startIdx, endIdx);
  
  const notesGrid = document.getElementById('notes-grid');
  notesGrid.innerHTML = notesToShow.map(renderNote).join('');
  updatePagination(filteredNotes);
}

async function initialize() {
  notes = await loadNotes();
  renderNotes();

  // Event Listeners
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelector('.sort-btn.active').classList.remove('active');
      e.target.classList.add('active');
      currentSort = e.target.dataset.sort;
      currentPage = 1;
      renderNotes();
    });
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelector('.filter-btn.active').classList.remove('active');
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      currentPage = 1;
      renderNotes();
    });
  });

  document.querySelector('.page-prev').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderNotes();
    }
  });

  document.querySelector('.page-next').addEventListener('click', () => {
    const totalPages = Math.ceil(filterAndSortNotes().length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
      currentPage++;
      renderNotes();
    }
  });
}

document.addEventListener('DOMContentLoaded', initialize);