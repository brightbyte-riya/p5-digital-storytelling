/**
 * P5 ET401 DIGITAL STORYTELLING — STUDENT REFLECTIVE JOURNAL
 * Interactive Journal Navigation, Edit Mode, Scratchpad & Deduplication Toggle
 * Author: Riya Gupta (BT23GCS453)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  let currentChapter = 1;
  const totalChapters = 6;
  let isEditMode = false;

  const chapterNames = [
    'Introduction',
    'P1: EcoSmart',
    'P2: Mentoring LPL',
    'P3: Myself & Learning',
    'P4: Resume Gap',
    'P5: What Comes Next'
  ];

  // --- DOM Elements ---
  const pages = document.querySelectorAll('.chapter-page');
  const tabs = document.querySelectorAll('.index-tab');
  const dots = document.querySelectorAll('.prog-dot');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const prevLabel = document.getElementById('prevBtnLabel');
  const nextLabel = document.getElementById('nextBtnLabel');
  const footerPageNum = document.getElementById('footerPageNum');
  const pageDateDisplay = document.getElementById('pageDateDisplay');
  const pageCounterDisplay = document.getElementById('pageCounterDisplay');
  const journalContent = document.getElementById('journalContent');

  // Utility Controls
  const toggleEditBtn = document.getElementById('toggleEditBtn');
  const editBtnText = document.getElementById('editBtnText');
  const printJournalBtn = document.getElementById('printJournalBtn');
  const openScratchBtn = document.getElementById('openScratchBtn');
  const closeScratchBtn = document.getElementById('closeScratchBtn');
  const scratchpadPanel = document.getElementById('scratchpadPanel');
  const scratchpadInput = document.getElementById('scratchpadInput');
  const scratchSaveStatus = document.getElementById('scratchSaveStatus');
  const clearScratchBtn = document.getElementById('clearScratchBtn');

  // --- Chapter Navigation ---
  function goToChapter(chapNumber, smoothScroll = true) {
    if (chapNumber < 1 || chapNumber > totalChapters) return;
    currentChapter = chapNumber;

    // Update Pages
    pages.forEach((page, index) => {
      const pageIndex = index + 1;
      if (pageIndex === chapNumber) {
        page.classList.add('active-page');
        // Update header metadata from page attributes
        const pageDate = page.getAttribute('data-date') || 'Academic Year 2026';
        if (pageDateDisplay) pageDateDisplay.textContent = pageDate;
      } else {
        page.classList.remove('active-page');
      }
    });

    // Update Tabs
    tabs.forEach((tab) => {
      const tabChap = parseInt(tab.getAttribute('data-chapter'), 10);
      if (tabChap === chapNumber) {
        tab.classList.add('active');
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        tab.classList.remove('active');
      }
    });

    // Update Progress Dots
    dots.forEach((dot) => {
      const dotChap = parseInt(dot.getAttribute('data-chapter'), 10);
      if (dotChap === chapNumber) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update Counter
    if (pageCounterDisplay) {
      pageCounterDisplay.textContent = `Page 0${chapNumber} of 0${totalChapters}`;
    }

    // Update Navigation Buttons & Labels
    if (prevBtn) {
      prevBtn.disabled = chapNumber === 1;
      if (chapNumber > 1) {
        prevLabel.textContent = `← ${chapterNames[chapNumber - 2]}`;
      } else {
        prevLabel.textContent = 'Previous Entry';
      }
    }

    if (nextBtn) {
      nextBtn.disabled = chapNumber === totalChapters;
      if (chapNumber < totalChapters) {
        nextLabel.textContent = `${chapterNames[chapNumber]} →`;
      } else {
        nextLabel.textContent = 'Journal Complete';
      }
    }

    if (footerPageNum) {
      footerPageNum.textContent = `Entry ${chapNumber} of ${totalChapters} • ${chapterNames[chapNumber - 1]}`;
    }

    // Scroll to top of journal container gently
    if (smoothScroll && window.scrollY > 150) {
      journalContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Save active chapter in history / hash
    window.location.hash = `chapter-${chapNumber}`;
  }

  // Event Listeners for Tabs & Dots
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const chap = parseInt(tab.getAttribute('data-chapter'), 10);
      goToChapter(chap);
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const chap = parseInt(dot.getAttribute('data-chapter'), 10);
      goToChapter(chap);
    });
  });

  // Prev / Next Page Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToChapter(currentChapter - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToChapter(currentChapter + 1);
    });
  }

  // Keyboard navigation (Left / Right arrow keys)
  document.addEventListener('keydown', (e) => {
    // Don't trigger if user is typing inside an input or textarea or in contenteditable
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (currentChapter < totalChapters) goToChapter(currentChapter + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentChapter > 1) goToChapter(currentChapter - 1);
    }
  });

  // Handle URL Hash on load
  const hash = window.location.hash;
  if (hash && hash.startsWith('#chapter-')) {
    const chapNum = parseInt(hash.replace('#chapter-', ''), 10);
    if (!isNaN(chapNum) && chapNum >= 1 && chapNum <= totalChapters) {
      goToChapter(chapNum, false);
    }
  }

  // --- Deduplication Interactive Comparison (Chapter 5) ---
  const dedupBtns = document.querySelectorAll('.dedup-btn');
  const dedupViews = document.querySelectorAll('.dedup-view');

  dedupBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      dedupBtns.forEach(b => b.classList.remove('active'));
      dedupViews.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const activeEl = document.getElementById(`view-${targetView}`);
      if (activeEl) activeEl.classList.add('active');
    });
  });

  // --- Journal Edit Mode & Auto-Save Feature ---
  const editableSelectors = '.journal-narrative p, .sticky-note, .margin-note, .polaroid-caption, .timeline-desc, .timeline-title';
  const saveHtmlBtn = document.getElementById('saveHtmlBtn');
  const saveStatusToast = document.getElementById('saveStatusToast');

  function showSaveToast(msg = '✓ Saved') {
    if (saveStatusToast) {
      saveStatusToast.textContent = msg;
      saveStatusToast.style.display = 'inline-block';
      setTimeout(() => {
        saveStatusToast.style.display = 'none';
      }, 2200);
    }
  }

  function saveCurrentEditsToLocalStorage() {
    const editableElements = document.querySelectorAll(editableSelectors);
    const editsToSave = {};
    editableElements.forEach((el, index) => {
      if (!el.id) el.id = `edit-block-${index}`;
      editsToSave[el.id] = el.innerHTML;
    });
    localStorage.setItem('riya_journal_custom_edits', JSON.stringify(editsToSave));
    showSaveToast('✓ Auto-saved');
  }

  // Load saved edits from localStorage on page start
  const savedEdits = localStorage.getItem('riya_journal_custom_edits');
  if (savedEdits) {
    try {
      const parsed = JSON.parse(savedEdits);
      Object.keys(parsed).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = parsed[id];
      });
    } catch (e) {
      console.warn('Could not restore saved journal edits:', e);
    }
  }

  // Auto-save on every keystroke when user edits content
  document.addEventListener('input', (e) => {
    if (e.target && e.target.isContentEditable) {
      saveCurrentEditsToLocalStorage();
    }
  });

  if (toggleEditBtn) {
    toggleEditBtn.addEventListener('click', () => {
      isEditMode = !isEditMode;
      const editableElements = document.querySelectorAll(editableSelectors);

      editableElements.forEach((el, index) => {
        if (!el.id) el.id = `edit-block-${index}`;
        el.contentEditable = isEditMode ? 'true' : 'false';
        if (isEditMode) {
          el.style.outline = '1.5px dashed var(--accent-ochre)';
          el.style.cursor = 'text';
          el.style.backgroundColor = 'rgba(250, 238, 164, 0.15)';
        } else {
          el.style.outline = 'none';
          el.style.cursor = 'default';
          el.style.backgroundColor = 'transparent';
        }
      });

      if (isEditMode) {
        toggleEditBtn.classList.add('active');
        editBtnText.textContent = 'Edit Mode: ON (Click text)';
        showSaveToast('✏️ Edit mode active');
      } else {
        toggleEditBtn.classList.remove('active');
        editBtnText.textContent = 'Journal Edit Mode: Off';
        saveCurrentEditsToLocalStorage();
      }
    });
  }

  // 1-Click Export / Save Updated index.html to disk
  if (saveHtmlBtn) {
    saveHtmlBtn.addEventListener('click', async () => {
      // First ensure any active edits are saved
      saveCurrentEditsToLocalStorage();

      // Temporarily turn off edit mode indicators for a clean export
      const editableElements = document.querySelectorAll(editableSelectors);
      editableElements.forEach((el) => {
        el.contentEditable = 'false';
        el.style.outline = 'none';
        el.style.backgroundColor = 'transparent';
      });
      if (toggleEditBtn) toggleEditBtn.classList.remove('active');
      if (editBtnText) editBtnText.textContent = 'Journal Edit Mode: Off';
      isEditMode = false;

      // Generate the clean HTML string
      const docHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

      // Try modern File System Access API if browser supports choosing destination directly
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: 'index.html',
            types: [{
              description: 'HTML File',
              accept: { 'text/html': ['.html'] }
            }]
          });
          const writable = await handle.createWritable();
          await writable.write(docHtml);
          await writable.close();
          showSaveToast('💾 Saved to Disk!');
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }

      // Standard Download Fallback:
      const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSaveToast('💾 index.html Downloaded!');
    });
  }

  // --- Sticky Scratchpad Feature ---
  if (openScratchBtn && scratchpadPanel) {
    openScratchBtn.addEventListener('click', () => {
      scratchpadPanel.classList.toggle('open');
    });
  }

  if (closeScratchBtn && scratchpadPanel) {
    closeScratchBtn.addEventListener('click', () => {
      scratchpadPanel.classList.remove('open');
    });
  }

  // Load saved scratchpad
  if (scratchpadInput) {
    const savedNotes = localStorage.getItem('riya_journal_scratchpad');
    if (savedNotes) scratchpadInput.value = savedNotes;

    scratchpadInput.addEventListener('input', () => {
      localStorage.setItem('riya_journal_scratchpad', scratchpadInput.value);
      if (scratchSaveStatus) {
        scratchSaveStatus.textContent = 'Saved!';
        setTimeout(() => {
          scratchSaveStatus.textContent = 'Auto-saves locally';
        }, 1500);
      }
    });
  }

  if (clearScratchBtn && scratchpadInput) {
    clearScratchBtn.addEventListener('click', () => {
      if (confirm('Clear scratchpad notes?')) {
        scratchpadInput.value = '';
        localStorage.removeItem('riya_journal_scratchpad');
        scratchSaveStatus.textContent = 'Cleared';
      }
    });
  }

  // --- Print / Save PDF Feature ---
  if (printJournalBtn) {
    printJournalBtn.addEventListener('click', () => {
      // Before printing, show all pages so print layout formats entire journal
      window.print();
    });
  }

  // --- Polaroid Interactive Subtle Wiggle on Click ---
  const polaroids = document.querySelectorAll('.polaroid-frame');
  polaroids.forEach((polaroid) => {
    polaroid.addEventListener('click', () => {
      polaroid.style.transition = 'transform 0.15s ease';
      polaroid.style.transform = 'scale(1.03) rotate(0deg)';
      setTimeout(() => {
        polaroid.style.transform = '';
      }, 350);
    });
  });

  // Initial trigger
  goToChapter(1, false);
});
