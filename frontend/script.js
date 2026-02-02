document.getElementById('fitnessForm').addEventListener('submit', async function(e) {
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
        const response = await fetch('http://127.0.0.1:4500/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

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
        alert('Server connection failed. Please ensure "python app.py" is running.');
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
    // Check if jsPDF is loaded
    if (!window.jspdf) {
        alert("PDF Library not loaded. Please refresh the page.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // 1. HELPER: GET SCREEN DATA
    const bmi = document.getElementById('res-bmi').innerText;
    const category = document.getElementById('res-category').innerText;
    const planType = document.getElementById('res-plan-type').innerText;
    
    // 2. HEADER SECTION
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Primary Purple (#4f46e5)
    doc.text("Elite Fitness & Nutrition Plan", 105, 20, null, null, "center");
    
    // Stats Box
    doc.setDrawColor(79, 70, 229);
    doc.setFillColor(238, 242, 255); // Light Purple bg
    doc.rect(14, 30, 182, 12, "FD"); // Filled & Stroked
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const statsText = `BMI: ${bmi}   |   Category: ${category}   |   Focus: ${planType}`;
    doc.text(statsText, 105, 37, null, null, "center");

    let finalY = 55; // Track vertical cursor position

    // 3. PARSE AI HTML CONTENT
    // We create a temporary invisible div to parse the HTML string easily
    const aiContainer = document.createElement('div');
    aiContainer.innerHTML = document.getElementById('ai-output').innerHTML;

    // ============================================
    // A. WORKOUT PROTOCOL (New Parsing Logic)
    // ============================================
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text("Weekly Workout Protocol", 14, finalY);
    finalY += 10;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");

    // TARGET: Divs with specific padding used in your python code (padding:18px)
    const workoutCards = aiContainer.querySelectorAll('div[style*="padding:18px"]');

    if (workoutCards.length > 0) {
        workoutCards.forEach((card) => {
            // Page Break Check
            if (finalY > 250) { doc.addPage(); finalY = 20; }

            // 1. Extract Header (Day & Purpose)
            const titleEl = card.querySelector('strong');
            const titleText = titleEl ? titleEl.innerText : "Workout Day";

            // 2. Extract Body Details (Paragraphs)
            // We loop through P tags to get Warmup, Main, Cool-down, Duration
            let detailsText = "";
            card.querySelectorAll('p').forEach(p => {
                // formatting clean up: remove bold tags, keep text
                detailsText += "• " + p.innerText.replace(/\n/g, " ") + "\n";
            });

            // 3. Extract Coaching Cue (The green box)
            const cueEl = card.querySelector('div[style*="border-left:4px solid"]');
            let cueText = cueEl ? cueEl.innerText.replace("💡", "").trim() : "";
            
            // --- DRAWING ---
            
            // Draw Title
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0); // Black for title
            doc.text(titleText, 14, finalY);
            finalY += 6;

            // Draw Details
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 60, 60); // Dark Gray for text
            const splitDetails = doc.splitTextToSize(detailsText, 170);
            doc.text(splitDetails, 18, finalY);
            finalY += (splitDetails.length * 5) + 2;

            // Draw Cue (if exists)
            if (cueText) {
                doc.setFont("helvetica", "italic");
                doc.setTextColor(16, 185, 129); // Green (#10b981) for cue
                const splitCue = doc.splitTextToSize(`Coach Cue: ${cueText}`, 170);
                doc.text(splitCue, 18, finalY);
                finalY += (splitCue.length * 5);
            }

            finalY += 8; // Spacing between cards
        });
    } else {
        doc.text("No workout data found.", 14, finalY);
        finalY += 10;
    }
    
    finalY += 5;

    // ============================================
    // B. NUTRITION TABLE
    // ============================================
    // This logic remains robust as tables are standard
    const tableHeaders = [];
    aiContainer.querySelectorAll('table th').forEach(th => tableHeaders.push(th.innerText));

    const tableRows = [];
    aiContainer.querySelectorAll('table tbody tr').forEach(tr => {
        const rowData = [];
        tr.querySelectorAll('td').forEach(td => rowData.push(td.innerText));
        tableRows.push(rowData);
    });

    if (tableHeaders.length > 0) {
        if (finalY > 220) { doc.addPage(); finalY = 20; }
        
        doc.autoTable({
            startY: finalY,
            head: [tableHeaders],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 4 },
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });
        
        finalY = doc.lastAutoTable.finalY + 15;
    }

    // ============================================
    // C. MINDSET & HABITS (New Parsing Logic)
    // ============================================
    if (finalY > 250) { doc.addPage(); finalY = 20; }

    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text("Daily Mindset & Habits", 14, finalY);
    finalY += 10;

    // TARGET: Divs with the specific amber top border (border-top:5px solid #f59e0b)
    const mindsetCards = aiContainer.querySelectorAll('div[style*="border-top:5px solid #f59e0b"]');

    if (mindsetCards.length > 0) {
        doc.setFontSize(10);
        
        mindsetCards.forEach((card) => {
            if (finalY > 270) { doc.addPage(); finalY = 20; }

            // 1. Extract Day
            const dayEl = card.querySelector('strong');
            // Clean emojis if present (like 🎯)
            const dayText = dayEl ? dayEl.innerText.replace(/🎯/g, "").trim() : "Day";

            // 2. Extract Quote
            const quoteEl = card.querySelector('p');
            const quoteText = quoteEl ? quoteEl.innerText.replace(/["“”]/g, "") : "";

            // --- DRAWING ---
            doc.setFont("helvetica", "bold");
            doc.setTextColor(180, 83, 9); // Amber/Brown color for Day title
            doc.text(dayText, 14, finalY);
            
            // Quote content
            doc.setFont("helvetica", "italic");
            doc.setTextColor(50, 50, 50); // Dark Gray
            const splitQuote = doc.splitTextToSize(`"${quoteText}"`, 140);
            doc.text(splitQuote, 40, finalY); // Indented

            finalY += (splitQuote.length * 5) + 6;
        });
    }

    // 4. FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount} - Generated by AI Personal Trainer`, 105, 290, null, null, "center");
    }

    // 5. SAVE
    doc.save("Elite_Fitness_Plan.pdf");
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