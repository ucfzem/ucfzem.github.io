import fs from "fs";
import path from "path";

const BOOK_TXT = path.resolve(process.cwd(), "book.txt");
const INDEX_HTML = path.resolve(process.cwd(), "index.html");

function readFileSafe(p) {
  if (!fs.existsSync(p)) {
    throw new Error(`Fichier introuvable : ${p}`);
  }
  return fs.readFileSync(p, "utf8");
}

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function escapeForTemplateLiteral(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function splitIntoSections(raw) {
  const text = normalizeNewlines(raw).trim();
  if (!text) return [];

  const chapterSplit = text.split(/(?=^الفصل\s+.+$)/m);
  if (chapterSplit.length > 1) {
    return chapterSplit.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  const blockSplit = text.split(/\n\s*\n+/);
  if (blockSplit.length > 1) {
    return blockSplit.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  return [text];
}

function titleFromSection(section) {
  const lines = section.split("\n");
  const firstLine = lines[0].trim();
  if (/^الفصل\s+.+$/.test(firstLine)) return firstLine;
  const cleaned = firstLine.replace(/\s+/g, " ");
  return cleaned.length <= 60 ? cleaned || "قسم" : cleaned.slice(0, 57) + "...";
}

function bodyFromSection(section, titleLine) {
  const lines = section.split("\n");
  if (titleLine && /^الفصل\s+.+$/.test(lines[0].trim())) {
    const rest = lines.slice(1).join("\n").trim();
    return rest.length > 0 ? rest : section.trim();
  }
  return section.trim();
}

function textToHtmlParagraphs(text) {
  const normalized = normalizeNewlines(text);
  const paragraphs = normalized.split(/\n\s*\n+/).map((p) => p.trim()).filter((p) => p.length > 0);
  if (paragraphs.length === 0) return "";
  return paragraphs.map((p) => `    <p>${p.replace(/\n/g, "<br>\n")}</p>`).join("\n");
}

function buildBookData(sections) {
  const bookData = [];
  sections.forEach((section, idx) => {
    const id = `sec-${idx + 1}`;
    const titleAr = titleFromSection(section);
    const bodyText = bodyFromSection(section, true);
    const contentHtml = textToHtmlParagraphs(bodyText);
    const titleObj = { ar: titleAr, en: titleAr, fr: titleAr, es: titleAr };
    const contentObj = { ar: `\n${contentHtml}\n`, en: `\n${contentHtml}\n`, fr: `\n${contentHtml}\n`, es: `\n${contentHtml}\n` };
    bookData.push({ id, title: titleObj, content: contentObj });
  });
  return bookData;
}

function replaceBookDataInHtml(html, bookData) {
  const startMarker = "const bookData = [";
  const startIndex = html.indexOf(startMarker);
  if (startIndex === -1) throw new Error('Impossible de trouver "const bookData = [" dans index.html');

  let bracketCount = 0, inString = false, stringChar = null, i = startIndex;
  while (i < html.length) {
    const ch = html[i], prev = html[i - 1];
    if ((ch === '"' || ch === "'" || ch === "`") && prev !== "\\") {
      if (!inString) { inString = true; stringChar = ch; }
      else if (inString && stringChar === ch) { inString = false; stringChar = null; }
    }
    if (!inString) {
      if (ch === "[") bracketCount++;
      if (ch === "]") {
        bracketCount--;
        if (bracketCount === 0) {
          let endIndex = i + 1;
          while (endIndex < html.length && /\s/.test(html[endIndex])) endIndex++;
          if (html[endIndex] === ";") endIndex++;

          let rebuilt = "const bookData = [\n";
          bookData.forEach((item, idx) => {
            rebuilt += "      {\n";
            rebuilt += `        id: "${escapeForTemplateLiteral(item.id)}",\n`;
            rebuilt += "        title: {\n";
            rebuilt += `          ar: "${escapeForTemplateLiteral(item.title.ar)}",\n`;
            rebuilt += `          en: "${escapeForTemplateLiteral(item.title.en)}",\n`;
            rebuilt += `          fr: "${escapeForTemplateLiteral(item.title.fr)}",\n`;
            rebuilt += `          es: "${escapeForTemplateLiteral(item.title.es)}"\n`;
            rebuilt += "        },\n";
            rebuilt += "        content: {\n";
            rebuilt += `          ar: \`\n${item.content.ar}\`,\n`;
            rebuilt += `          en: \`\n${item.content.en}\`,\n`;
            rebuilt += `          fr: \`\n${item.content.fr}\`,\n`;
            rebuilt += `          es: \`\n${item.content.es}\`\n`;
            rebuilt += "        }\n";
            rebuilt += idx === bookData.length - 1 ? "      }\n    ];\n\n" : "      },\n";
          });
          return html.slice(0, startIndex) + rebuilt + html.slice(endIndex);
        }
      }
    }
    i++;
  }
  throw new Error("Impossible de trouver la fin du tableau bookData");
}

function main() {
  try {
    const bookText = readFileSafe(BOOK_TXT);
    const sections = splitIntoSections(bookText);
    if (sections.length === 0) throw new Error("Aucune section trouvée.");
    const bookData = buildBookData(sections);
    const html = readFileSafe(INDEX_HTML);
    const updatedHtml = replaceBookDataInHtml(html, bookData);

    fs.writeFileSync(INDEX_HTML + ".bak." + Date.now(), html, "utf8");
    fs.writeFileSync(INDEX_HTML, updatedHtml, "utf8");
    console.log(`✓ index.html mis à jour avec succès ! (${bookData.length} sections)`);
  } catch (err) {
    console.error("✗ Erreur :", err.message);
    process.exit(1);
  }
}

main();
