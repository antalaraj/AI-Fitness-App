const fitnessForm = document.getElementById('fitnessForm');
if (fitnessForm) fitnessForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // 1. UI References
    const loader = document.getElementById('loader');
    const results = document.getElementById('results');
    const btn = document.getElementById('generateBtn');

    // 2. Reset UI
    results.classList.add('hidden');
    loader.classList.remove('hidden');
    btn.disabled = true;

    // 3. Gather Data
    const formData = {
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        goal: document.getElementById('goal').value,
        activity: document.getElementById('activity').value,
        diet: document.getElementById('diet').value,
        conditions: document.getElementById('conditions').value
    };

    try {
        // 4. Send to Backend (Now returns Clean HTML)
        const response = await fetch('/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok || data.status !== 'success') {
            throw new Error(data.message || data.error || `Request failed (${response.status})`);
        }

        if (data.status === 'success') {
            // 5. Populate Stats
            document.getElementById('res-bmi').innerText = data.bmi;
            document.getElementById('res-category').innerText = data.bmi_category;
            document.getElementById('res-plan-type').innerText = data.plan_type;
            
            // Populate Hidden PDF Stats (if they exist in your HTML)
            if(document.getElementById('pdf-bmi')) {
                document.getElementById('pdf-bmi').innerText = data.bmi;
                document.getElementById('pdf-cat').innerText = data.bmi_category;
                document.getElementById('pdf-plan').innerText = data.plan_type;
            }

            // 6. INJECT HTML (No Markdown parsing needed anymore!)
            // The backend now sends a perfect HTML string with tables already built.
            document.getElementById('ai-output').innerHTML = data.ai_plan;

            // 7. Show Results
            results.classList.remove('hidden');
        } else {
            alert('Error: ' + data.message);
        }

    } catch (error) {
        console.error(error);
        alert('Could not generate your plan: ' + (error.message || 'Please refresh and try again.'));
    } finally {
        loader.classList.add('hidden');
        btn.disabled = false;
    }
});

/* =========================================
   PDF GENERATION (Client-Side)
   ========================================= */
   
/* =========================================
   TRUE PDF GENERATION (Matches New Python Logic)
   ========================================= */
function downloadPDF() {
    if (typeof window.html2pdf !== "function") {
        alert("PDF library did not load. Please refresh the page and try again.");
        return;
    }

    const source = document.getElementById("print-area");
    if (!source) {
        alert("There is no fitness plan to export yet.");
        return;
    }

    // Export a clean, isolated copy so the PDF has its own predictable layout
    // and does not inherit screen-only controls or responsive overflow.
    const wrapper = document.createElement("div");
    wrapper.className = "pdf-export";
    wrapper.style.width = "190mm";
    wrapper.style.padding = "8mm";
    wrapper.style.background = "#ffffff";
    wrapper.style.color = "#1f2937";
    wrapper.style.fontFamily = "Arial, Helvetica, sans-serif";
    wrapper.style.fontSize = "10pt";
    wrapper.style.lineHeight = "1.45";

    const clone = source.cloneNode(true);
    clone.style.width = "100%";
    clone.style.maxWidth = "none";
    clone.style.margin = "0";
    clone.style.padding = "0";
    clone.style.boxShadow = "none";
    clone.style.border = "0";

    // Remove controls and hidden helpers from the exported copy.
    clone.querySelectorAll(".action-buttons, button, form, .pdf-footer").forEach(el => el.remove());

    // Avoid clipped nutrition columns in the PDF.
    clone.querySelectorAll("div[style*='overflow-x']").forEach(el => {
        el.style.overflow = "visible";
        el.style.width = "100%";
        el.style.border = "0";
    });
    clone.querySelectorAll("table").forEach(table => {
        table.style.width = "100%";
        table.style.minWidth = "0";
        table.style.tableLayout = "fixed";
        table.style.fontSize = "8pt";
        table.style.borderCollapse = "collapse";
    });
    clone.querySelectorAll("th, td").forEach(cell => {
        cell.style.padding = "6px";
        cell.style.whiteSpace = "normal";
        cell.style.overflowWrap = "anywhere";
        cell.style.wordBreak = "normal";
        cell.style.verticalAlign = "top";
    });
    clone.querySelectorAll("tr").forEach(row => {
        row.style.breakInside = "avoid";
        row.style.pageBreakInside = "avoid";
    });

    // Keep workout and coaching cards together when possible.
    clone.querySelectorAll("div[style*='padding:18px'], div[style*='border-top:5px']").forEach(card => {
        card.style.breakInside = "avoid";
        card.style.pageBreakInside = "avoid";
        card.style.boxShadow = "none";
        card.style.transform = "none";
        card.style.marginBottom = "12px";
    });

    // Normalize malformed duration strings from model output for readability.
    clone.querySelectorAll("p").forEach(p => {
        p.innerHTML = p.innerHTML
            .replace(/Duration:\\s*["']?H?\\s*(\\d+)\\s*\\/?\\s*(?:min(?:ute)?s?)["']?/gi, "Duration: $1 minutes")
            .replace(/(\\d+)\\s*\\/sec\\b/gi, "$1 seconds")
            .replace(/(\\d+)\\s*\\/min\\b/gi, "$1 minutes")
            .replace(/(\\d+)\\s*\\/rep\\b/gi, "$1 reps");
    });

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const options = {
        margin: [8, 8, 12, 8],
        filename: "Elite_Fitness_Plan.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1000
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: [".stat-box", "tr", "h2", "h3"] }
    };

    window.html2pdf().set(options).from(wrapper).save()
        .catch(error => {
            console.error("PDF export failed:", error);
            alert("Could not create the PDF. Please try again.");
        })
        .finally(() => wrapper.remove());
}

/* =========================================
   COPY TO CLIPBOARD
   ========================================= */
async function copyPlan() {
    // Get text content (strips HTML tags for clean pasting)
    const text = document.getElementById('ai-output').innerText;
    
    try {
        await navigator.clipboard.writeText(text);
        
        // Button Feedback
        const btn = document.querySelector('button[onclick="copyPlan()"]');
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = '✅ Copied!';
        btn.style.borderColor = '#10b981';
        btn.style.color = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 2000);
    } catch (err) {
        alert('Failed to copy text.');
    }
}