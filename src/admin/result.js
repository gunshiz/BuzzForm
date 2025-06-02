var modalTexts = [];
async function init(pwd, data) {
  const res =
    data ||
    (await fetch("/api/submit", {
      headers: {
        // Once you're authorized, cookie is set for future requests.
        Authorization: pwd || "",
      },
    }));
  if (res.status === 401) return auth();
  if (!data) initReload();
  if (pwd) document.querySelector(".loading input").hidden = true;

  // Set up notification
  initNotifications();

  const submissions = await res.json();

  const container = document.querySelector(".container");
  container.innerHTML = "";
  if (submissions.length === 0) {
    document.querySelector(".loading").style.zIndex = "4";
    document.querySelector(".search input").disabled = true;
    document.querySelector(".search .delete").disabled = true;

    document.querySelector(".loading a").innerText = "ใครคนแรกน้า";
    initLimit();
    return;
  }
  document.querySelector(".loading").classList.add("hide");

  modalTexts = [];

  // Populate the container with submission data
  for (const [i, submission] of Object.entries(submissions)) {
    const submissionDiv = document.createElement("div");
    const number = parseInt(i) + 1;
    submissionDiv.setAttribute("data-index", i);
    submissionDiv.className = "submission";
    submissionDiv.innerHTML = `
      <h3><b>${sanitize(number)}</b>. ${sanitize(
      submission.name
    )} (<a href="#" class="copy-uid">${sanitize(submission.uid)} 📋</a>)</h3>
      <p>ตัวละคร: ${sanitize(submission.character)}</p>
      <p>ข้อความ: ${sanitize(
        (submission.message || "ไม่มีข้อความที่ส่งมา").substring(0, 500)
      )}</p>
    `;

    modalTexts[i] = `
  <h3><b>${sanitize(number)}</b>. ${sanitize(
      submission.name
    )} (<a href="#" class="copy-uid">${sanitize(submission.uid)}</a>)</h3>
  <p>ตัวละคร: ${sanitize(submission.character)}</p>
  <p>ข้อความ: ${sanitize(submission.message || "ไม่มีข้อความที่ส่งมา")}</p>
`;

    // Modal for displaying full message
    submissionDiv.addEventListener("click", (ev) => {
      // Ignore if click was made on the copy element
      if (ev.target.tagName === "A") return;
      const i = submissionDiv.getAttribute("data-index") - 0;
      modal(modalTexts[i], i);
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
  function applySearch() {
    const query = search.value.toLowerCase();
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
  }
  search.oninput = applySearch;

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
  document.querySelector(".count").innerText =
    "ทั้งหมด : " + submissions.length;

  initLimit();
}

async function initLimit() {
  // Limit configuration
  /**
   * @type {{ max: number | null, disabled: boolean }}
   */
  const config = await fetch("/api/submit/limit").then((e) => e.json());
  const count = document.querySelector(".count");
  if (config.max) count.innerText += `/${config.max}`;
  if (config.disabled) count.classList.add("disabled");
  const limit = document.querySelector(".limit");
  const apply = limit.querySelector(".apply");
  const input = limit.querySelector(".input");
  function updateUi() {
    input.hidden = config.disabled;
    input.value = input.value || (config.max === null ? "" : config.max);
    apply.innerText = config.disabled
      ? "ปลดล็อค"
      : input.value && input.value !== config.max + ""
      ? "ใช้การจำกัด"
      : config.max
      ? "ไม่จำกัด"
      : "ล็อค";
  }
  updateUi();
  input.oninput = updateUi;
  apply.onclick = async () => {
    // Follow the button text
    if (apply.innerText === "ล็อค") {
      config.disabled = true;
      config.max = null;
    } else if (
      apply.innerText === "ไม่จำกัด" ||
      apply.innerText === "ปลดล็อค"
    ) {
      config.disabled = false;
      config.max = null;
    } else if (apply.innerText === "ใช้การจำกัด") {
      const value = parseInt(input.value);
      if (isNaN(value) || value < 1) {
        alert("โปรดใส่เลขเต็มบวก");
        return;
      }
      config.disabled = false;
      config.max = value;
    } else {
      return; // No action needed
    }
    await fetch("/api/submit/limit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });
    location.reload();
  };
  count.onmouseenter = () => limit.classList.remove("hide");
  limit.onmouseleave = () => limit.classList.add("hide");
  count.onclick = () => limit.classList.toggle("hide");
}

async function initReload() {
  const src = new EventSource("/api/submit/watch");
  src.onmessage = (e) => init(undefined, JSON.parse(e.data));
}

function auth() {
  const splash = document.querySelector(".loading a");
  splash.innerText = "Login required";
  /**
   * @type {HTMLInputElement}
   */
  const input = document.querySelector(".loading input");
  input.hidden = false;
  input.focus();
  input.onkeyup = (e) => {
    if (e.key === "Enter") {
      splash.innerText = "Logging in...";
      input.hidden = true;
      init(input.value);
      input.value = "";
    }
    if (
      ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
      input.value.length > 0
    )
      init(input.value);
  };
}

async function initNotifications() {
  if (!("serviceWorker" in navigator)) return; // Check if service workers are supported
  navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  if (Notification.permission !== "granted") {
    if ((await Notification.requestPermission()) !== "granted") return; // Request notification permission from the user's device
  }
  const public_key = await fetch("/api/ntf/public_key").then((e) => e.json());

  const registration = await navigator.serviceWorker.ready;
  if (await registration.pushManager.getSubscription()) return;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: Uint8Array.from(
      atob(
        public_key.replace(/-/g, "+").replace(/_/g, "/") +
          "=".repeat((4 - (public_key.length % 4)) % 4)
      ),
      (c) => c.charCodeAt(0)
    ),
  });
  await fetch(`/api/ntf/sub`, {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

init();

function sanitize(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

function modal(text, next) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <p class="content"></p>
      ${typeof next === "number" ? '<span class="next">อันถัดไป</span>' : ""}
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector(".close");
  closeBtn.onclick = () => {
    document.body.removeChild(modal);
  };

  const nextBtn = modal.querySelector(".next");
  if (typeof next === "number")
    nextBtn.onclick = () => {
      next = (next + 1) % modalTexts.length;
      modal.querySelector(".content").innerHTML = modalTexts[next];
    };

  window.onclick = (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  };

  modal.querySelector(".content").innerHTML = text;

  const uidLink = modal.querySelector(".copy-uid");
  uidLink?.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(uidLink.textContent.replace(" 📋", ""));
  });

  return modal;
}
