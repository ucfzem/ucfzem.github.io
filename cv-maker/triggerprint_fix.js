// Copy from line 1452 to end of triggerPrint (line 1750) from the file

function triggerPrint() {
  if (!window.jspdf) {
    showToast('❌ jsPDF non chargé');
    console.error('jsPDF missing');
    return;
  }

  const p = cvData.personal || {};
  const fileName = (p.fullName ? p.fullName.trim().replace(/\s+/g,'_') : 'CV') + '.pdf';
  showToast('⏳ Génération...');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit:'pt', format:'a4', orientation:'portrait' });

  const W = 595.28, H = 841.89;
  const SIDEBAR = 175;
  const GOLD = '#C9A84C';
  const DARK = '#2C1A06';
  const LIGHT = '#FAF3E8';
  const SUB = '#D4C4A8';
  const EMPTY = '#6B5535';

  pdf.setFillColor(DARK);
  pdf.rect(0, 0, SIDEBAR, H, 'F');

  pdf.setFillColor('#ffffff');
  pdf.rect(SIDEBAR, 0, W - SIDEBAR, H, 'F');

  let sy = 36;
  let my = 36;
  const sx = 18;
  const mx = SIDEBAR + 18;
  const mw = W - SIDEBAR - 36;

  // Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(GOLD);
  pdf.text(p.fullName || '', sx, sy);
  sy += 6;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(SUB);
  pdf.text((p.title || '').toUpperCase(), sx, sy + 8);
  sy += 22;

  // Divider
  pdf.setDrawColor(GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(sx, sy, SIDEBAR - sx, sy);
  sy += 10;

  // Contact
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(LIGHT);
  const contacts = [
    p.email    ? p.email          : null,
    p.phone    ? p.phone          : null,
    p.location ? p.location       : null,
    p.website  ? p.website        : null,
  ].filter(Boolean);
  contacts.forEach(c => {
    pdf.setFillColor(GOLD);
    pdf.rect(sx, sy - 4, 3, 3, 'F');
    pdf.setTextColor(LIGHT);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(c, sx + 6, sy);
    sy += 11;
  });
  sy += 6;

  // Skills
  cvData.skillCategories.forEach(cat => {
    if (!cat.skills.length) return;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(GOLD);
    pdf.text((cat.name || '').toUpperCase(), sx, sy);
    sy += 2;
    pdf.setDrawColor(GOLD);
    pdf.setLineWidth(0.3);
    pdf.line(sx, sy + 1, SIDEBAR - sx, sy + 1);
    sy += 8;

    cat.skills.forEach(sk => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(LIGHT);
      pdf.text(sk.name || '', sx + 2, sy);

      const map = { Expert:4, Advanced:3, Intermediate:2, Beginner:1 };
      const n = map[sk.level] || 0;
      for (let i = 0; i < 4; i++) {
        pdf.setFillColor(i < n ? GOLD : EMPTY);
        pdf.circle(SIDEBAR - sx - 3 - (3 - i) * 9, sy - 3, 3, 'F');
      }
      sy += 11;
    });
    sy += 4;
  });

  // Languages
  if (cvData.languages.length) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(GOLD);
    pdf.text('LANGUES', sx, sy);
    sy += 2;
    pdf.setDrawColor(GOLD);
    pdf.setLineWidth(0.3);
    pdf.line(sx, sy + 1, SIDEBAR - sx, sy + 1);
    sy += 8;

    cvData.languages.forEach(l => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(LIGHT);
      pdf.text(l.name || '', sx + 2, sy);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(GOLD);
      pdf.text(l.level || '', SIDEBAR - sx, sy, { align: 'right' });
      sy += 11;
    });
  }

  // Summary
  if (p.summary) {
    pdf.setFillColor('#FAF3E8');
    const sumLines = pdf.splitTextToSize(p.summary, mw - 16);
    const sumH = sumLines.length * 11 + 14;
    pdf.rect(mx, my - 10, mw, sumH, 'F');
    pdf.setFillColor(GOLD);
    pdf.rect(mx, my - 10, 2.5, sumH, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor('#3D2E1A');
    pdf.text(sumLines, mx + 8, my);
    my += sumH + 8;
  }

  const sectionTitle = (title) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(DARK);
    pdf.text(title.toUpperCase(), mx, my);
    my += 2;
    pdf.setDrawColor(DARK);
    pdf.setLineWidth(1);
    pdf.line(mx, my, mx + mw, my);
    my += 10;
  };

  const exps = cvData.experiences.filter(e => e.company);
  if (exps.length) {
    sectionTitle('Expérience Professionnelle');
    exps.forEach(e => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(DARK);
      pdf.text(e.position || '', mx, my);
      const dateStr = (e.startDate ? formatDate(e.startDate) : '') + ' \u2013 ' + (e.endDate ? formatDate(e.endDate) : 'Présent');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor('#A89878');
      pdf.text(dateStr, mx + mw, my, { align: 'right' });
      my += 10;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(GOLD);
      pdf.text(e.company || '', mx, my);
      my += 10;

      if (e.description) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor('#3D2E1A');
        const lines = pdf.splitTextToSize(e.description, mw);
        pdf.text(lines, mx, my);
        my += lines.length * 10 + 4;
      }
      my += 4;
    });
  }

  const edus = cvData.education.filter(e => e.institution);
  if (edus.length) {
    sectionTitle('Éducation & Formation');
    edus.forEach(e => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(DARK);
      const degreeText = (e.degree || '') + (e.field ? ' en ' + e.field : '');
      pdf.text(degreeText, mx, my);
      const dateStr = (e.startDate ? formatDate(e.startDate) : '') + ' \u2013 ' + (e.endDate ? formatDate(e.endDate) : 'Présent');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor('#A89878');
      pdf.text(dateStr, mx + mw, my, { align: 'right' });
      my += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor('#5C4A2E');
      pdf.text(e.institution + (e.gpa ? ' | GPA: ' + e.gpa : ''), mx, my);
      my += 14;
    });
  }

  cvData.customSections.filter(s => s.title && s.items.length).forEach(s => {
    sectionTitle(s.title);
    s.items.filter(i => i.title).forEach(i => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(DARK);
      pdf.text(i.title, mx, my);
      my += 10;
      if (i.subtitle) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7.5);
        pdf.setTextColor('#A89878');
        pdf.text(i.subtitle, mx, my);
        my += 9;
      }
      if (i.description) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor('#3D2E1A');
        const lines = pdf.splitTextToSize(i.description, mw);
        pdf.text(lines, mx, my);
        my += lines.length * 10 + 4;
      }
      my += 4;
    });
  });

  const pdfBase64 = pdf.output('datauristring');
  const newTab = window.open();
  newTab.document.write(`<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${fileName}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#111;font-family:sans-serif;display:flex;flex-direction:column;height:100vh;}.bar{width:100%;background:#1a1a1a;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}.bar span{color:#C9A84C;font-weight:700;font-size:15px;}.btn{background:#C9A84C;color:#1a1a1a;padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;}iframe{flex:1;width:100%;border:none;}</style>
  </head><body>
    <div class="bar"><span>📄 ${fileName}</span><a class="btn" href="${pdfBase64}" download="${fileName}">⬇️ Télécharger</a></div>
    <iframe src="${pdfBase64}"></iframe>
  </body></html>`);
  newTab.document.close();
  showToast('✅ PDF généré !');
}
