
    const MAX_SELECTIONS = 2;

    function toggleDoc(el) {
      const isSelected = el.classList.contains('selected');
      const currentCount = document.querySelectorAll('.doc-option.selected').length;
      if (!isSelected && currentCount >= MAX_SELECTIONS) return;
      el.classList.toggle('selected');
      updateCount();
      renderUploadSlots();
    }

    function updateCount() {
      const count = document.querySelectorAll('.doc-option.selected').length;
      document.getElementById('selected-count').textContent = `Selected: ${count} of 2`;
    }

    function renderUploadSlots() {
      const selected = document.querySelectorAll('.doc-option.selected');
      const section = document.getElementById('upload-section');
      const slots = document.getElementById('upload-slots');

      if (selected.length === 0) {
        section.style.display = 'none';
        slots.innerHTML = '';
        return;
      }

      section.style.display = 'block';
      slots.innerHTML = '';

      selected.forEach((doc, i) => {
        const docName = doc.querySelector('.doc-name').textContent;
        const id = 'doc-upload-' + i;
        const slot = document.createElement('div');
        slot.style.marginBottom = '14px';
        slot.innerHTML = `
          <label style="font-size:0.85rem;color:#555;display:block;margin-bottom:6px;">${docName}</label>
          <input type="file" id="${id}" accept="image/*" style="display:none" onchange="showThumb(this, '${id}-thumb')">
          <div onclick="document.getElementById('${id}').click()" style="
            border: 2px dashed #cbd5e1;
            border-radius: 10px;
            padding: 18px;
            text-align: center;
            cursor: pointer;
            color: #94a3b8;
            font-size: 0.85rem;
            background: #f8fafc;
            transition: border-color 0.2s;
          " onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#cbd5e1'">
            📷 Click to upload photo
          </div>
          <img id="${id}-thumb" style="display:none;margin-top:8px;max-width:100%;max-height:140px;border-radius:8px;object-fit:cover;">
        `;
        slots.appendChild(slot);
      });
    }

    function showThumb(input, thumbId) {
      const thumb = document.getElementById(thumbId);
      if (input.files && input.files[0]) {
        thumb.src = URL.createObjectURL(input.files[0]);
        thumb.style.display = 'block';
      }
    }

    function handleRegister() {
      var lastname = document.getElementById('lastname').value.trim();
      var given = document.getElementById('given').value.trim();
      var college = document.getElementById('college').value;
      var email = document.getElementById('email').value.trim();
      var phone = document.getElementById('phone').value.trim();
      var password = document.getElementById('password').value;
      var confirm = document.getElementById('confirm-password').value;
      var selectedDocs = Array.from(document.querySelectorAll('.doc-option.selected'))
                              .map(el => el.querySelector('.doc-name').textContent);

      if (!lastname || !given || !college || !email || !phone || !password || !confirm) {
        alert('Please fill in all required fields.');
        return;
      }
      if (password !== confirm) {
        alert('Passwords do not match.');
        return;
      }
      if (selectedDocs.length < 2) {
        alert('Please select 2 documents.');
        return;
      }

      // Save registration data so profile page can read it
      localStorage.setItem('registrationData', JSON.stringify({
        lastname: lastname,
        given: given,
        mi: document.getElementById('mi').value.trim(),
        college: college,
        email: email,
        phone: phone,
        docs: selectedDocs
      }));

      window.location.href = 'regsuccess.html';
    }