document.addEventListener('DOMContentLoaded', () => {
  let notes = [];
  let currentPage = 1;
  let currentSort = 'date-desc';
  let currentFilters = ['all'];
  let itemsPerPage = 6; // Default value

  async function loadNotes() {
    try {
      const response = await fetch('data/notes.json');
      if (!response.ok) throw new Error('Failed to load notes');
      const data = await response.json();
      return data.notes;
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }

  function renderNote(note) {
    return `
      <div class="col-12 col-md-6 col-lg-4 note-item">
        <div class="card h-100">
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
    if (!currentFilters.includes('all')) {
      filtered = notes.filter(note => 
        note.topics.some(topic => currentFilters.includes(topic))
      );
    }
    
    return filtered.sort((a, b) => {
      switch(currentSort) {
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'date-desc': return new Date(b.date) - new Date(a.date);
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        default: return 0;
      }
    });
  }

  function updatePagination(filteredNotes) {
    const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
    document.querySelector('.total-pages').textContent = totalPages;

    const pageSelect = document.querySelector('.page-select');
    pageSelect.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      if (i === currentPage) {
        option.selected = true;
      }
      pageSelect.appendChild(option);
    }

    document.querySelector('.page-prev').classList.toggle('disabled', currentPage === 1);
    document.querySelector('.page-next').classList.toggle('disabled', currentPage === totalPages);
  }

  function renderNotes() {
    const filteredNotes = filterAndSortNotes();
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const notesToShow = filteredNotes.slice(startIdx, endIdx);
    
    const notesGrid = document.getElementById('notes-grid');
    notesGrid.innerHTML = notesToShow.map(renderNote).join('');
    updatePagination(filteredNotes);
  }

  // Initialize
  (async () => {
    notes = await loadNotes();
    if (notes.length > 0) renderNotes();
  })();

  // Event Listeners
  document.querySelector('.sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    renderNotes();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = e.target.getAttribute('data-filter');
      if (value === 'all') {
        currentFilters = ['all'];
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      } else {
        const allBtn = document.querySelector('[data-filter="all"]');
        allBtn.classList.remove('active');
        currentFilters = currentFilters.filter(filter => filter !== 'all');
        if (e.target.classList.contains('active')) {
          e.target.classList.remove('active');
          currentFilters = currentFilters.filter(filter => filter !== value);
        } else {
          e.target.classList.add('active');
          currentFilters.push(value);
        }
        if (currentFilters.length === 0) {
          allBtn.classList.add('active');
          currentFilters = ['all'];
        }
      }
      currentPage = 1;
      renderNotes();
    });
  });

  document.querySelector('.page-prev').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderNotes();
    }
  });

  document.querySelector('.page-next').addEventListener('click', (e) => {
    e.preventDefault();
    const totalPages = Math.ceil(filterAndSortNotes().length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderNotes();
    }
  });

  document.querySelector('.page-select').addEventListener('change', (e) => {
    currentPage = parseInt(e.target.value);
    renderNotes();
  });

  document.querySelector('.per-page-select').addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1; // Reset to first page when changing items per page
    renderNotes();
  });
});