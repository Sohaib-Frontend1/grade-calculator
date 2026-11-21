/**
 * ============================================================
 *  حاسبة الدرجات — سكربت التطبيق
 * ============================================================
 */

const defaultSubjects = {
    "azhar-term1": [
        { name: "القرآن الكريم", max: 20 },
        { name: "الفقه", max: 20 },
        { name: "الحديث", max: 20 },
        { name: "التفسير", max: 20 },
        { name: "التوحيد", max: 20 },
        { name: "الثقافة الإسلامية", max: 10 },
        { name: "النحو", max: 20 },
        { name: "الصرف", max: 20 },
        { name: "البلاغة", max: 20 },
        { name: "الإنشاء", max: 20 },
        { name: "الأدب والمطالعة والنصوص", max: 20 },
        { name: "اللغة الإنجليزية", max: 20 },
        { name: "الرياضيات", max: 20 },
        { name: "العلوم المتكاملة", max: 60 },
        { name: "الحديث الشفوي", max: 10 }
    ],
    "azhar-allYear": [
        { name: "القرآن الكريم", max: 40 },
        { name: "الفقه", max: 40 },
        { name: "الحديث", max: 40 },
        { name: "التفسير", max: 40 },
        { name: "التوحيد", max: 40 },
        { name: "الثقافة الإسلامية", max: 20 },
        { name: "النحو", max: 40 },
        { name: "الصرف", max: 40 },
        { name: "البلاغة", max: 40 },
        { name: "الإنشاء", max: 40 },
        { name: "الأدب والمطالعة والنصوص", max: 40 },
        { name: "اللغة الإنجليزية", max: 40 },
        { name: "الرياضيات", max: 40 },
        { name: "العلوم المتكاملة", max: 120 },
        { name: "الحديث الشفوي", max: 20 }
    ],
    general: [
        { name: "اللغة العربية", max: 100 },
        { name: "اللغة الإنجليزية", max: 100 },
        { name: "الرياضيات", max: 100 },
        { name: "العلوم", max: 100 },
        { name: "الدراسات الاجتماعية", max: 100 }
    ]
};

let subjects = {};
let sections = ["azhar", "general"];
let grades = {};
let passPercent = 50;
let currentType = "";
let editIndex = -1;
let deleteCallback = null;
let activeMainTab = "azhar";
let activeSubTab = "azhar-term1";

const resultBox = document.getElementById("result");

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

function saveToLocalStorage() {
    localStorage.setItem("calculator_subjects", JSON.stringify(subjects));
    localStorage.setItem("calculator_sections", JSON.stringify(sections));
    localStorage.setItem("calculator_grades", JSON.stringify(grades));
    localStorage.setItem("calculator_passPercent", passPercent);
}

function loadFromLocalStorage() {
    const savedSubjects = localStorage.getItem("calculator_subjects");
    const savedSections = localStorage.getItem("calculator_sections");
    const savedGrades = localStorage.getItem("calculator_grades");
    const savedPass = localStorage.getItem("calculator_passPercent");

    subjects = savedSubjects ? JSON.parse(savedSubjects) : JSON.parse(JSON.stringify(defaultSubjects));
    sections = savedSections ? JSON.parse(savedSections) : ["azhar", "general"];
    grades = savedGrades ? JSON.parse(savedGrades) : {};
    passPercent = savedPass ? parseInt(savedPass) || 50 : 50;

    sections.forEach(sec => {
        if (!subjects[sec]) subjects[sec] = [];
    });

    Object.keys(grades).forEach(type => {
        Object.keys(grades[type]).forEach(idx => {
            const val = parseFloat(grades[type][idx]);
            if (isNaN(val) || val < 0) {
                delete grades[type][idx];
            }
        });
    });
}

const THEME_ICONS = { light: "./images/moon.svg", dark: "./images/sun.svg" };

function updateThemeIcon() {
    const img = document.getElementById("themeIcon");
    if (!img) return;
    const isLight = document.documentElement.classList.contains("light-mode");
    img.src = isLight ? THEME_ICONS.light : THEME_ICONS.dark;
}

function applyTheme() {
    if (localStorage.getItem("theme") === "light") {
        document.documentElement.classList.add("light-mode");
    } else {
        document.documentElement.classList.remove("light-mode");
    }
    updateThemeIcon();
}

function toggleTheme() {
    if (document.documentElement.classList.contains("light-mode")) {
        document.documentElement.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.add("light-mode");
        localStorage.setItem("theme", "light");
    }
    updateThemeIcon();
}

function getSectionLabel(section) {
    if (section === "azhar") return "الأزهر";
    if (section === "general") return "العام";
    return section;
}

function renderMainTabs() {
    const tabsContainer = document.getElementById("mainTabs");
    tabsContainer.innerHTML = "";
    sections.forEach(section => {
        const btn = document.createElement("button");
        btn.className = "tab";
        if (section === activeMainTab) btn.classList.add("active");
        btn.textContent = getSectionLabel(section);
        btn.onclick = () => {
            switchMainTab(section);
            checkInbutForResultBox();
        }
        tabsContainer.appendChild(btn);
    });
}

function switchMainTab(section) {
    if (!sections.includes(section)) return;
    activeMainTab = section;

    document.querySelectorAll("#mainTabs .tab").forEach(tab => {
        tab.classList.toggle("active", tab.textContent === getSectionLabel(section));
    });

    const tabContents = document.getElementById("tabContents");
    tabContents.innerHTML = "";

    if (section === "azhar") {
        const subTabsDiv = document.createElement("div");
        subTabsDiv.className = "sub-tabs";

        const subKeys = ["azhar-term1", "azhar-allYear"];
        const subNames = ["الفصل الدراسي (الأول أو الثاني)", "السنة الكاملة"];

        subKeys.forEach((key, idx) => {
            const subBtn = document.createElement("button");
            subBtn.className = "sub-tab";
            if (idx === 0) subBtn.classList.add("active");
            subBtn.textContent = subNames[idx];
            subBtn.onclick = () => switchSubTab(key);
            subTabsDiv.appendChild(subBtn);
        });
        tabContents.appendChild(subTabsDiv);

        subKeys.forEach((key, idx) => {
            const contentDiv = document.createElement("div");
            contentDiv.id = key;
            contentDiv.className = "sub-tab-content";
            if (idx === 0) contentDiv.classList.add("active");

            const subjectsDiv = document.createElement("div");
            subjectsDiv.id = key + "-subjects";
            contentDiv.appendChild(subjectsDiv);

            const addBtn = document.createElement("button");
            addBtn.className = "add-btn";
            addBtn.textContent = "إضافة مادة";
            addBtn.onclick = () => openModal(key);
            contentDiv.appendChild(addBtn);

            tabContents.appendChild(contentDiv);
        });

        activeSubTab = "azhar-term1";
        renderSubjects(activeSubTab);
    } else {
        const contentDiv = document.createElement("div");
        contentDiv.id = section;
        contentDiv.className = "tab-content active";

        const subjectsDiv = document.createElement("div");
        subjectsDiv.id = section + "-subjects";
        contentDiv.appendChild(subjectsDiv);

        const addBtn = document.createElement("button");
        addBtn.className = "add-btn";
        addBtn.textContent = "إضافة مادة";
        addBtn.onclick = () => openModal(section);
        contentDiv.appendChild(addBtn);

        tabContents.appendChild(contentDiv);

        activeSubTab = section;
        renderSubjects(section);
    }
}

function switchSubTab(subKey) {
    activeSubTab = subKey;
    const labels = { "azhar-term1": "الفصل الدراسي (الأول أو الثاني)", "azhar-allYear": "السنة الكاملة" };

    document.querySelectorAll(".sub-tab").forEach(btn => {
        btn.classList.toggle("active", btn.textContent === labels[subKey]);
    });

    document.querySelectorAll(".sub-tab-content").forEach(c => c.classList.remove("active"));
    const content = document.getElementById(subKey);
    if (content) content.classList.add("active");

    renderSubjects(subKey);
    checkInbutForResultBox();
}

function renderSubjects(type) {
    const container = document.getElementById(type + "-subjects");
    if (!container) return;
    container.innerHTML = "";
    const items = subjects[type] || [];

    items.forEach((subject, index) => {
        const savedValue = grades[type] && grades[type][index] !== undefined ? grades[type][index] : "";

        const div = document.createElement("div");
        div.className = "input-group";
        div.innerHTML = `
            <label for="${type}-${index}">${escapeHtml(subject.name)}:</label>
            <input type="number" id="${type}-${index}" placeholder="من ${subject.max}" max="${subject.max}" min="0" step="any" value="${savedValue}"
                   oninput="validateInput(this, ${subject.max}); saveGrade('${type}', ${index}, this.value)">
            <div class="btn-group">
                <button class="edit-btn" onclick="openEditModal('${type}', ${index})"><img src="images/edit.svg" alt="تعديل"/></button>
                <button class="delete-btn" onclick="confirmDelete('${type}', ${index})">×</button>
            </div>
        `;
        container.appendChild(div);

        if (savedValue !== "") updateRowStatus(type, index, savedValue, subject.max);
    });
}

function saveGrade(type, index, value) {
    if (!grades[type]) grades[type] = {};

    if (value === "" || isNaN(parseFloat(value))) {
        delete grades[type][index];
        localStorage.setItem("calculator_grades", JSON.stringify(grades));
        return;
    }

    let val = parseFloat(value);
    const subject = subjects[type][index];
    if (!subject) return;

    if (val < 0) val = 0;
    if (val > subject.max) val = subject.max;

    grades[type][index] = val;
    localStorage.setItem("calculator_grades", JSON.stringify(grades));

    updateRowStatus(type, index, val, subject.max);
}

function updateRowStatus(type, index, value, max) {
    const val = parseFloat(value);
    const input = document.getElementById(`${type}-${index}`);
    if (!input) return;

    const row = input.closest(".input-group");
    if (isNaN(val) || max <= 0) {
        row.classList.remove("pass", "fail");
        return;
    }

    const percent = (val / max) * 100;
    if (percent >= passPercent) {
        row.classList.add("pass");
        row.classList.remove("fail");
    } else {
        row.classList.add("fail");
        row.classList.remove("pass");
    }
}

function validateInput(input, max) {
    if (input.value === "") return;
    const value = parseFloat(input.value);
    if (isNaN(value)) return;

    if (value < 0) {
        showAlert("لا يمكن أن تكون الدرجة سالبة");
        input.value = 0;
        return;
    }

    if (value > max) {
        showAlert(`الدرجة لا تزيد عن ${max}`);
        input.value = max;
    }
}

function openModal(type) {
    if (!subjects[type]) return;
    currentType = type;
    editIndex = -1;
    document.getElementById("modal-title").textContent = "إضافة مادة";
    document.getElementById("subject-name").value = "";
    document.getElementById("subject-max").value = "";
    document.getElementById("modal").classList.add("active");
}

function openEditModal(type, index) {
    if (!subjects[type] || !subjects[type][index]) return;
    currentType = type;
    editIndex = index;
    document.getElementById("modal-title").textContent = "تعديل مادة";
    document.getElementById("subject-name").value = subjects[type][index].name;
    document.getElementById("subject-max").value = subjects[type][index].max;
    document.getElementById("modal").classList.add("active");
}

function closeModal() { document.getElementById("modal").classList.remove("active"); }

function saveSubject() {
    const name = document.getElementById("subject-name").value.trim();
    const rawMax = document.getElementById("subject-max").value;
    const max = parseFloat(rawMax);

    if (!name) { showAlert("يرجى إدخال اسم المادة"); return; }
    if (rawMax === "" || isNaN(max)) { showAlert("يرجى إدخال الدرجة الكاملة للمادة"); return; }
    if (max <= 0) { showAlert("يجب أن تكون الدرجة الكاملة أكبر من صفر"); return; }
    if (max > 10000) { showAlert("الدرجة الكاملة أكبر من الحد المعقول"); return; }

    const list = subjects[currentType] || [];

    if (editIndex === -1 && list.some(s => s.name === name)) {
        showAlert("توجد مادة بنفس الاسم في هذا القسم");
        return;
    }

    if (editIndex === -1) {
        subjects[currentType].push({ name, max });
    } else {
        subjects[currentType][editIndex] = { name, max };
    }

    if (grades[currentType]) {
        Object.keys(grades[currentType]).forEach(idx => {
            const subj = subjects[currentType][idx];
            if (subj && grades[currentType][idx] > subj.max) grades[currentType][idx] = subj.max;
        });
    }

    saveToLocalStorage();
    renderSubjects(currentType);
    closeModal();
}

function confirmDelete(type, index) {
    if (!subjects[type] || !subjects[type][index]) return;

    document.getElementById("confirmMessage").textContent = `هل أنت متأكد من حذف مادة "${subjects[type][index].name}"؟`;
    document.getElementById("confirmModal").classList.add("active");

    deleteCallback = () => {
        subjects[type].splice(index, 1);
        if (grades[type]) {
            const newGrades = {};
            Object.keys(grades[type]).map(Number).sort((a, b) => a - b).forEach(k => {
                if (k !== index) {
                    const newIndex = k > index ? k - 1 : k;
                    newGrades[newIndex] = grades[type][k];
                }
            });
            grades[type] = newGrades;
        }
        saveToLocalStorage();
        renderSubjects(type);
        closeConfirmModal();
    };
}

function closeConfirmModal() {
    document.getElementById("confirmModal").classList.remove("active");
    deleteCallback = null;
}

document.getElementById("confirmYes").onclick = () => { if (deleteCallback) deleteCallback(); };
document.getElementById("confirmNo").onclick = closeConfirmModal;

function showAlert(message) {
    document.getElementById("alertMessage").textContent = message;
    document.getElementById("alertModal").classList.add("active");
}

function closeAlertModal() { document.getElementById("alertModal").classList.remove("active"); }

function openSettingsModal() {
    document.getElementById("passPercentInput").value = passPercent;
    renderSettingsSections();
    document.getElementById("settingsModal").classList.add("active");
}

function closeSettingsModal() { document.getElementById("settingsModal").classList.remove("active"); }

function renderSettingsSections() {
    const list = document.getElementById("settingsSectionsList");
    list.innerHTML = "";

    sections.forEach(sec => {
        const div = document.createElement("div");
        div.className = "section-item";
        const isDefault = sec === "azhar" || sec === "general";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = getSectionLabel(sec);
        div.appendChild(nameSpan);

        if (isDefault) {
            const badge = document.createElement("span");
            badge.style.fontSize = "12px";
            badge.textContent = "افتراضي";
            div.appendChild(badge);
        } else {
            const btn = document.createElement("button");
            btn.className = "delete-btn";
            btn.textContent = "×";
            btn.onclick = () => deleteSectionFromSettings(sec);
            div.appendChild(btn);
        }
        list.appendChild(div);
    });
}

function addSectionFromSettings() {
    const input = document.getElementById("newSectionInput");
    const name = input.value.trim();

    if (!name) { showAlert("يرجى إدخال اسم القسم"); return; }
    if (name.length > 40) { showAlert("اسم القسم طويل جدًا"); return; }
    if (sections.includes(name) || sections.some(s => getSectionLabel(s) === name)) {
        showAlert("هذا القسم موجود بالفعل");
        return;
    }

    sections.push(name);
    subjects[name] = [];
    input.value = "";
    renderSettingsSections();
}

function deleteSectionFromSettings(section) {
    if (section === "azhar" || section === "general") return;

    sections = sections.filter(s => s !== section);
    delete subjects[section];
    delete grades[section];
    renderSettingsSections();

    if (activeMainTab === section) {
        activeMainTab = sections[0] || "azhar";
        switchMainTab(activeMainTab);
    }
}

function saveSettings() {
    const raw = document.getElementById("passPercentInput").value;
    const newPass = parseInt(raw, 10);

    if (raw === "" || isNaN(newPass)) { showAlert("يرجى إدخال نسبة نجاح صالحة"); return; }
    if (newPass < 0 || newPass > 100) { showAlert("يجب أن تكون نسبة النجاح بين 0 و 100"); return; }

    passPercent = newPass;
    saveToLocalStorage();
    renderMainTabs();
    switchMainTab(activeMainTab);
    closeSettingsModal();
    renderSubjects(activeSubTab);
}

function validateAllGrades(type) {
    const items = subjects[type] || [];
    const missing = [];
    const invalid = [];

    items.forEach((subject, index) => {
        const stored = grades[type] ? grades[type][index] : undefined;
        if (stored === undefined || stored === null || stored === "") {
            missing.push(subject.name);
            return;
        }
        const val = parseFloat(stored);
        if (isNaN(val) || val < 0 || val > subject.max) invalid.push(subject.name);
    });

    return { valid: missing.length === 0 && invalid.length === 0, missing, invalid };
}

function calculate() {
    const type = activeSubTab;
    const items = subjects[type] || [];

    if (items.length === 0) { showAlert("لا توجد مواد مسجلة لحساب نسبتها"); return; }

    const check = validateAllGrades(type);

    if (check.missing.length > 0) {
        showAlert(`يجب إدخال جميع الدرجات قبل الحساب.\nالمواد الناقصة: ${check.missing.join("، ")}`);
        resultBox.style.display = "none";
        return;
    }

    if (check.invalid.length > 0) {
        showAlert(`توجد قيم غير صالحة في: ${check.invalid.join("، ")}`);
        resultBox.style.display = "none";
        return;
    }

    let totalObtained = 0;
    let totalMax = 0;

    items.forEach((subject, index) => {
        totalObtained += parseFloat(grades[type][index]);
        totalMax += subject.max;
    });

    if (totalMax === 0) { showAlert("لا يمكن حساب النسبة دون درجات كاملة"); return; }

    const percentage = (totalObtained / totalMax) * 100;

    document.getElementById("result").style.display = "block";
    document.getElementById("result-text").textContent = `مجموعك: ${totalObtained.toFixed(1)} من ${totalMax.toFixed(1)} = ${percentage.toFixed(2)}%`;

    let gradeMsg = "";
    if (percentage >= 90) gradeMsg = "ممتاز";
    else if (percentage >= 75) gradeMsg = "جيد جداً";
    else if (percentage >= 50) gradeMsg = "مقبول";
    else gradeMsg = "حاول مرة أخرى، تقدر أفضل";

    document.getElementById("grade-message").textContent = gradeMsg;
    document.getElementById("progress-fill").style.width = Math.min(percentage, 100) + "%";
}

function checkInbutForResultBox() {
    const type = activeSubTab;
    const items = subjects[type] || [];

    if (items.length === 0) {
        resultBox.style.display = "none";
        return;
    }

    const check = validateAllGrades(type);

    if (check.missing.length > 0 || check.invalid.length > 0) {
        resultBox.style.display = "none";
    } else {
        resultBox.style.display = "block";
        calculate();
    }
}

function renderTableOnly() {
    const container = document.getElementById("tablePrintArea");
    if (!container) return;
    container.innerHTML = "";

    const type = activeSubTab;
    const items = subjects[type] || [];
    if (items.length === 0) return;

    const chunkSize = 6;
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const table = document.createElement("table");
        table.className = "grades-table";

        let head = "<tr>", gRow = "<tr>", mRow = "<tr>";

        chunk.forEach((s, idx) => {
            const real = i + idx;
            const v = grades[type] && grades[type][real] !== undefined ? grades[type][real] : "-";
            head += `<th>${escapeHtml(s.name)}</th>`;
            gRow += `<td>${v}</td>`;
            mRow += `<td>${s.max}</td>`;
        });

        table.innerHTML = `<thead>${head}</thead><tbody>${gRow}${mRow}</tbody>`;
        container.appendChild(table);
    }

    let tot = 0, totMax = 0;
    items.forEach((s, idx) => {
        if (grades[type] && grades[type][idx] !== undefined) {
            const v = parseFloat(grades[type][idx]);
            if (!isNaN(v)) {
                tot += v;
                totMax += s.max;
            }
        }
    });

    const t2 = document.createElement("table");
    t2.className = "grades-table";
    t2.style.width = "auto";
    t2.innerHTML = `<thead><tr><th>المجموع</th></tr></thead><tbody><tr><td>${tot}</td></tr><tr><td>${totMax}</td></tr></tbody>`;
    container.appendChild(t2);
}

function printFullResult() {
    if (document.getElementById("result").style.display !== "block") {
        showAlert("يرجى حساب النسبة قبل الطباعة");
        return;
    }
    window.print();
}

function printTableOnly() {
    const type = activeSubTab;
    if (!subjects[type] || subjects[type].length === 0) {
        showAlert("لا توجد مواد لطباعة جدولها");
        return;
    }

    renderTableOnly();
    document.body.classList.add("printing-table-only");
    window.print();
    document.body.classList.remove("printing-table-only");
}

function ensureHtml2Canvas() {
    if (typeof html2canvas === "undefined") {
        showAlert("تعذر تحميل مكتبة معالجة الصور.\nيرجى التحقق من اتصالك بالإنترنت ثم إعادة تحميل الصفحة.");
        return false;
    }
    return true;
}

async function prepareElementForCapture(element) {
    element.classList.add("capturing");
    document.body.classList.add("exporting-image");

    // تغيير العنوان مؤقتًا لـ "نتيجتي" أثناء التصوير
    const resultTitle = element.querySelector("h2");
    if (resultTitle) {
        resultTitle.dataset.originalText = resultTitle.textContent;
        resultTitle.textContent = "نتيجتي";
    }

    // تغيير كلمة مجموعك لمجموعي في الصورة فقط
    const resultText = element.querySelector("#result-text");
    if (resultText) {
        resultText.dataset.originalText = resultText.textContent;
        resultText.textContent = resultText.textContent.replace("مجموعك", "مجموعي");
    }

    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (_) { }
    }
}

function getCaptureBackground() {
    const isLight = document.documentElement.classList.contains("light-mode");
    return isLight ? "#f8fafc" : "#334155";
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function setButtonBusy(btn, busyText) {
    if (!btn) return () => { };
    const original = btn.innerHTML;
    btn.disabled = true;
    const span = btn.querySelector("span");
    if (span) span.textContent = busyText;
    return () => { btn.disabled = false; btn.innerHTML = original; };
}

async function shareAsImage(event) {
    if (document.getElementById("result").style.display !== "block") {
        showAlert("يرجى حساب النسبة قبل المشاركة");
        return;
    }
    if (!ensureHtml2Canvas()) return;

    const element = document.getElementById("result");
    const btn = event?.target?.closest("button");
    const restoreBtn = setButtonBusy(btn, "جارٍ...");

    try {
        await prepareElementForCapture(element);

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: getCaptureBackground(),
            logging: false
        });

        const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
        if (!blob) throw new Error("toBlob returned null");

        const fileName = "النتيجة.png";
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: "نتيجتي" });
                return;
            } catch (err) {
                if (err.name === "AbortError") return;
            }
        }

        downloadBlob(blob, fileName);
    } catch (err) {
        console.error("shareAsImage failed:", err);
        showAlert("تعذر إنشاء الصورة.\nيرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
    } finally {
        element.classList.remove("capturing");
        document.body.classList.remove("exporting-image");

        // إرجاع العنوان الأصلي "النتيجة" بعد التصوير
        const resultTitle = element.querySelector("h2");
        if (resultTitle && resultTitle.dataset.originalText) {
            resultTitle.textContent = resultTitle.dataset.originalText;
        }

        // إرجاع كلمة مجموعك بعد التصوير
        const resultText = element.querySelector("#result-text");
        if (resultText && resultText.dataset.originalText) {
            resultText.textContent = resultText.dataset.originalText;
        }

        restoreBtn();
    }
}

async function saveTableAsImage(event) {
    const type = activeSubTab;
    if (!subjects[type] || subjects[type].length === 0) {
        showAlert("لا توجد مواد لحفظ جدولها");
        return;
    }
    if (!ensureHtml2Canvas()) return;

    const btn = event?.target?.closest("button");
    const restoreBtn = setButtonBusy(btn, "جارٍ...");

    renderTableOnly();
    const el = document.getElementById("tablePrintArea");

    document.body.classList.add("exporting-image");
    el.style.display = "block";

    try {
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        const canvas = await html2canvas(el, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
        });

        const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
        if (!blob) throw new Error("toBlob returned null");

        downloadBlob(blob, "الجدول.png");
    } catch (err) {
        console.error("saveTableAsImage failed:", err);
        showAlert("تعذر إنشاء صورة الجدول.\nيرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
    } finally {
        el.style.display = "none";
        document.body.classList.remove("exporting-image");
        restoreBtn();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    loadFromLocalStorage();
    renderMainTabs();
    switchMainTab(activeMainTab);
});