/**
 * File Uploader Component
 * Manages Drag & Drop, File input, sample reset, and feedback toasts.
 */
window.FileUploader = {
  init() {
    const dropZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    if (!dropZone || !fileInput) return;

    // Drag & Drop Listeners
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        this.handleFile(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFile(e.target.files[0]);
      }
    });
  },

  async handleFile(file) {
    const fileName = file.name;
    const ext = fileName.split('.').pop().toLowerCase();
    const currentFileBadge = document.getElementById('current-file-name');

    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      window.DetailModal.showToast('지원하지 않는 파일 형식입니다. (.xlsx, .xls, .csv)', 'error');
      return;
    }

    try {
      window.DetailModal.showToast(`파일 파싱 중... (${fileName})`, 'info');
      let records = [];

      if (ext === 'csv') {
        records = await window.FileParser.parseCSV(file);
      } else {
        records = await window.FileParser.parseExcel(file);
      }

      if (!records || records.length === 0) {
        throw new Error('유효한 데이터 행을 찾을 수 없습니다.');
      }

      if (currentFileBadge) {
        currentFileBadge.textContent = `현재 파일: ${fileName} (${records.length}건)`;
      }

      window.appState.setData(records);
      window.DetailModal.showToast(`성공적으로 불러왔습니다! (${records.length}개 사업)`, 'success');
    } catch (err) {
      console.error(err);
      window.DetailModal.showToast(`파일 처리 실패: ${err.message}`, 'error');
    }
  },

  resetDefaultData() {
    if (window.DEFAULT_BUDGET_DATA) {
      const currentFileBadge = document.getElementById('current-file-name');
      if (currentFileBadge) {
        currentFileBadge.textContent = '현재 파일: 2027년_국방예산_정부안_기본데이터.xlsx (27건)';
      }
      window.appState.setData(window.DEFAULT_BUDGET_DATA);
      window.DetailModal.showToast('2027년 국방예산 기본 데이터셋으로 복원되었습니다.', 'success');
    }
  }
};
