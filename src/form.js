const form = document.getElementById('buzz-form');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupClose = document.getElementById('popup-close');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: form.name.value.trim(),
    uid: form.uid.value.trim(),
    character: form.character.value.trim(),
    message: form.message.value.trim()
  };

  if (!formData.name || !formData.uid || !formData.character) {
    showPopup('กรุณากรอกชื่อ, UID และชื่อตัวละครให้ครบ');
    return;
  }

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      showPopup('ส่งข้อมูลเรียบร้อยแล้ว!');
      form.reset();
    } else {
      const error = await res.json();
      showPopup('เกิดข้อผิดพลาด: ' + (error.error || 'ไม่สามารถส่งข้อมูลได้'));
    }
  } catch (err) {
    console.error(err);
    showPopup('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
  }
});

popupClose.addEventListener('click', () => {
  hidePopup();
});

function showPopup(message) {
  popupMessage.textContent = message;
  popup.classList.add('show');
}

function hidePopup() {
  popup.classList.remove('show');
}

// Helper function to show a message below the form and hide after 3s
function showMessage(text, color) {
  messageContainer.textContent = text;
  messageContainer.style.color = color || '#00ffc3';

  setTimeout(() => {
    messageContainer.textContent = '';
  }, 3000);
}
