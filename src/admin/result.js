async function init(pwd) {
  const res = await fetch("/api/submit", {
    headers: {
      Authorization: pwd || "",
    },
  });
  if (res.status === 401) return auth();
  const submissions = await res.json();

  const container = document.querySelector(".container");
  container.childNodes.forEach((n) => n.remove());
  if (submissions.length === 0) {
    document.querySelector(".loading a").innerText = "No submissions yet.";
    return;
  }
  document.querySelector(".loading").classList.add("hide");

  // Populate the container with submission data
  for (const [i, submission] of Object.entries(submissions)) {
    const submissionDiv = document.createElement("div");
    const number = parseInt(i) + 1;
    submissionDiv.setAttribute("data-index", i);
    submissionDiv.className = "submission";
    submissionDiv.innerHTML = `
      <h3>${sanitize(number)}. ${sanitize(submission.name)} (<a href="#" class="copy-uid">${sanitize(
      submission.uid
    )} 📋</a>)</h3>
      <p>ตัวละคร: ${sanitize(submission.character)}</p>
      <p>ข้อความ: ${sanitize(
      (submission.message || "ไม่มีข้อความที่ส่งมา").substring(0, 500)
    )}</p>
    `;

    // Modal for displaying full message
    submissionDiv.addEventListener("click", ev => {
      // Ignore if click was made on the copy element
      if (ev.target.tagName === "A") return;
      modal(
        `
      <h3>${sanitize(submission.name)} (<a href="#" class="copy-uid">${sanitize(
      submission.uid
    )}</a>)</h3>
      <p>ตัวละคร: ${sanitize(submission.character)}</p>
      <p>ข้อความ: ${sanitize(
          submission.message || "ไม่มีข้อความที่ส่งมา"
        )}</p>
    `
      );
    });

    // Add event listener to copy UID to clipboard
    const uidLink = submissionDiv.querySelector(".copy-uid");
    uidLink.addEventListener("click", (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(submission.uid);
    });
    container.appendChild(submissionDiv);
  }

  // Initialize the search bar
  const search = document.querySelector(".search input");
  search.oninput = (e) => {
    const query = e.target.value.toLowerCase();
    const elements = document.querySelectorAll(".submission");
    elements.forEach((submission) => {
      const id = submission.getAttribute("data-index");
      const sub = submissions[id - 0];
      const matches =
        sub.name.toLowerCase().includes(query) ||
        sub.uid.toLowerCase().includes(query) ||
        sub.character.toLowerCase().includes(query) ||
        sub.message.toLowerCase().includes(query);
      submission.classList.toggle("hide", !matches);
    });
  };

  // Initialize the delete all button
  const deleteAllBtn = document.querySelector(".delete");
  deleteAllBtn.onclick = async () => {
    if (
      confirm(
        "คุณมั่นใจว่าอยากลบทั้งหมดจริงไหม สิ่งนี้ไม่สามารถยกเลิกได้ หากทำไปแล้ว"
      )
    ) {
      const res = await fetch("/api/submit", {
        method: "DELETE",
        headers: {
          Authorization: pwd || "",
        },
      });
      if (res.ok) {
        location.reload();
      } else {
        modal("Failed to delete submissions. Please try again.");
      }
    }
  };

  // Count
  document.querySelector(".count").innerText = "ทั้งหมด : " + submissions.length;
}

function auth() {
  document.querySelector(".loading a").innerText = "Login required";
  const input = document.querySelector(".loading input");
  input.hidden = false;
  input.focus();
  input.value = "";
  input.onkeyup = (e) => {
    if (e.key === "Enter") {
      input.hidden = true;
      init(input.value);
    }
  };
}

init();

function sanitize(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

function modal(text) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <p>${text}</p>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector(".close");
  closeBtn.onclick = () => {
    document.body.removeChild(modal);
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  };

  const uidLink = modal.querySelector(".copy-uid");
  uidLink?.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(uidLink.textContent.replace(" 📋", ""));
  });

  return modal;
}
