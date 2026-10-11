const display = document.getElementById("display");
const resultValue = document.getElementById("resultValue");
const status = document.getElementById("status");
const variableControls = document.getElementById("variableControls");
const generateTableButton = document.getElementById("generateTable");
const showIntermediate = document.getElementById("showIntermediate");
const tableStatus = document.getElementById("tableStatus");
const truthTableSection = document.getElementById("truthTableSection");
const truthTableWrapper = document.getElementById("truthTableWrapper");
const classification = document.getElementById("classification");


/* =========================================================
   V3.10 LANGUAGE SUPPORT
========================================================= */
const translations = {
    en: {
        languageLabel: "Language",
        buyCoffee: "Donate the dev",
        title: "🧠 Logic Calculator",
        expressionLabel: "Expression",
        expressionAria: "Logic expression",
        resultLabel: "Result:",
        variablesTitle: "Variables",
        variableHelp: "Click a variable to cycle",
        variableHelpEnd: "means the variable will vary when generating a table.",
        generateTable: "Generate Table",
        showIntermediate: "Show intermediate expressions",
        truthTableTitle: "📊 Truth Table",
        keyboardTitle: "⌨️ Keyboard shortcuts",
        and: "AND", or: "OR", not: "NOT", xor: "XOR",
        implies: "IMPLIES", equivalent: "EQUIVALENT",
        variablesHint: "= variables", truthValuesHint: "= truth values",
        groupingHint: "= grouping",
        footer: "Logic calculator by Field V3.10",
        validExpression: "✓ Valid expression",
        enterExpression: "Enter an expression",
        expectedValue: "Expected a value",
        missingClose: "Missing closing )",
        unexpectedClose: "Unexpected closing )",
        unexpectedToken: 'Unexpected "{value}"',
        unknownSymbol: 'Unknown symbol "{value}"',
        noValue: 'No value for variable "{value}"',
        unknownOperator: 'Unknown operator "{value}"',
        outdatedTable: "Table may be outdated — press Generate Table to refresh.",
        tooManyUnknown: "Too many ? variables ({count}). Maximum is 8.",
        rowGenerated: "{count} row(s) generated.",
        tautology: "TAUTOLOGY", contradiction: "CONTRADICTION",
        depends: "DEPENDS", contingency: "CONTINGENCY",
        trueCount: "{count} true", falseCount: "{count} false",
        backspace: "Backspace", clear: "Clear"
    },
    th: {
        languageLabel: "ภาษา",
        buyCoffee: "ซื้อกาแฟให้ผม",
        title: "🧠 เครื่องคำนวณตรรกศาสตร์",
        expressionLabel: "นิพจน์ตรรกะ",
        expressionAria: "นิพจน์ตรรกะ",
        resultLabel: "ผลลัพธ์:",
        variablesTitle: "ตัวแปร",
        variableHelp: "คลิกตัวแปรเพื่อเปลี่ยนค่า",
        variableHelpEnd: "หมายความว่าตัวแปรนี้จะเปลี่ยนค่าได้เมื่อสร้างตาราง",
        generateTable: "สร้างตาราง",
        showIntermediate: "แสดงนิพจน์ระหว่างทาง",
        truthTableTitle: "📊 ตารางค่าความจริง",
        keyboardTitle: "⌨️ แป้นพิมพ์ลัด",
        and: "และ (AND)", or: "หรือ (OR)", not: "นิเสธ (NOT)", xor: "XOR",
        implies: "ถ้า...แล้ว", equivalent: "ก็ต่อเมื่อ",
        variablesHint: "= ตัวแปร", truthValuesHint: "= ค่าความจริง",
        groupingHint: "= การจัดกลุ่ม",
        footer: "เครื่องคำนวณตรรกะ โดย Field V3.10",
        validExpression: "✓ นิพจน์ถูกต้อง",
        enterExpression: "กรุณาป้อนนิพจน์",
        expectedValue: "ต้องมีค่าหรือตัวแปร",
        missingClose: "วงเล็บปิด ) หายไป",
        unexpectedClose: "พบวงเล็บปิด ) ที่ไม่คาดคิด",
        unexpectedToken: 'พบ "{value}" ที่ไม่คาดคิด',
        unknownSymbol: 'ไม่รู้จักสัญลักษณ์ "{value}"',
        noValue: 'ไม่มีค่าสำหรับตัวแปร "{value}"',
        unknownOperator: 'ไม่รู้จักตัวดำเนินการ "{value}"',
        outdatedTable: "ตารางอาจไม่เป็นปัจจุบัน — กด «สร้างตาราง» เพื่ออัปเดต",
        tooManyUnknown: "มีตัวแปร ? มากเกินไป ({count}) สูงสุด 8 ตัว",
        rowGenerated: "สร้างตารางแล้ว {count} แถว",
        tautology: "สัจนิรันดร์ (TAUTOLOGY)",
        contradiction: "ข้อขัดแย้ง (CONTRADICTION)",
        depends: "ขึ้นอยู่กับตัวแปร",
        contingency: "ประพจน์ไม่แน่นอน (CONTINGENCY)",
        trueCount: "จริง {count} ค่า", falseCount: "เท็จ {count} ค่า",
        backspace: "ลบย้อนกลับ", clear: "ล้าง"
    }
};

let currentLanguage = localStorage.getItem("logicCalculatorLanguage") || "en";
if (!translations[currentLanguage]) currentLanguage = "en";

function t(key, values = {}) {
    let result = translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
    for (const [name, value] of Object.entries(values)) {
        result = result.replaceAll(`{${name}}`, String(value));
    }
    return result;
}

function localizePage() {
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        if (translations[currentLanguage][key]) element.textContent = translations[currentLanguage][key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(element => {
        const key = element.dataset.i18nAria;
        if (translations[currentLanguage][key]) element.setAttribute("aria-label", translations[currentLanguage][key]);
    });
}

const languageSelect = document.getElementById("languageSelect");
languageSelect.value = currentLanguage;
languageSelect.addEventListener("change", () => {
    currentLanguage = translations[languageSelect.value] ? languageSelect.value : "en";
    localStorage.setItem("logicCalculatorLanguage", currentLanguage);
    localizePage();
    calculate();
    if (!truthTableSection.hidden) generateTruthTable();
});



/* =========================================================
   VARIABLE STATE
========================================================= */

const variables = {};


/* =========================================================
   FIND VARIABLES
========================================================= */

function getVariables(expression) {

    const found = expression.match(/[a-z]/g) || [];

    return [
        ...new Set(
            found.map(letter => letter.toLowerCase())
        )
    ].sort();
}


/* =========================================================
   VARIABLE CONTROLS
========================================================= */

function updateVariableControls() {

    const usedVariables = getVariables(display.value);

    // Give new variables a default value of TRUE.
    for (const variable of usedVariables) {

        if (!(variable in variables)) {
            variables[variable] = true;
        }
    }

    variableControls.innerHTML = "";

    for (const variable of usedVariables) {

        const button = document.createElement("button");

        button.type = "button";
        const state = variables[variable];

        button.className =
            "variable " +
            (state === true
                ? "true"
                : state === false
                    ? "false"
                    : "unknown");

        button.innerHTML = `
            <span class="name">${variable}</span>
            <span class="value">
                ${state === true ? "T" : state === false ? "F" : "?"}
            </span>
        `;

        button.addEventListener("click", () => {

            // T → F → ? → T
            if (variables[variable] === true) {
                variables[variable] = false;
            } else if (variables[variable] === false) {
                variables[variable] = null;
            } else {
                variables[variable] = true;
            }

            updateVariableControls();
            calculate();
            invalidateTable();
        });

        variableControls.appendChild(button);
    }
}


/* =========================================================
   TOKENIZER
========================================================= */

function tokenize(expression) {
    const tokens = [];
    let i = 0;

    while (i < expression.length) {
        const char = expression[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        if (char === "T" || char === "F") {
            tokens.push({ type: "boolean", value: char === "T" });
            i++;
            continue;
        }

        if (/[a-z]/.test(char)) {
            tokens.push({ type: "variable", value: char });
            i++;
            continue;
        }

        if (
            char === "∧" || char === "∨" || char === "¬" ||
            char === "⊕" || char === "→" || char === "↔" ||
            char === "(" || char === ")"
        ) {
            tokens.push({ type: "operator", value: char });
            i++;
            continue;
        }

        throw new Error(t("unknownSymbol", { value: char }));
    }

    return tokens;
}


/* =========================================================
   PARSER → EXPRESSION TREE
========================================================= */

function parseExpression(expression) {
    const tokens = tokenize(expression);
    let position = 0;

    function primary() {
        const token = tokens[position];

        if (!token) {
            throw new Error(t("expectedValue"));
        }

        if (token.type === "boolean") {
            position++;
            return { type: "boolean", value: token.value };
        }

        if (token.type === "variable") {
            position++;
            return { type: "variable", name: token.value };
        }

        if (token.type === "operator" && token.value === "¬") {
            position++;
            return {
                type: "unary",
                operator: "¬",
                child: primary()
            };
        }

        if (token.type === "operator" && token.value === "(") {
            position++;
            const value = equivalence();

            if (!tokens[position] || tokens[position].value !== ")") {
                throw new Error(t("missingClose"));
            }

            position++;
            return value;
        }

        throw new Error(t("expectedValue"));
    }

    function and() {
        let node = primary();

        while (tokens[position]?.value === "∧") {
            position++;
            node = {
                type: "binary",
                operator: "∧",
                left: node,
                right: primary()
            };
        }

        return node;
    }

    function xor() {
        let node = and();

        while (tokens[position]?.value === "⊕") {
            position++;
            node = {
                type: "binary",
                operator: "⊕",
                left: node,
                right: and()
            };
        }

        return node;
    }

    function or() {
        let node = xor();

        while (tokens[position]?.value === "∨") {
            position++;
            node = {
                type: "binary",
                operator: "∨",
                left: node,
                right: xor()
            };
        }

        return node;
    }

    function implication() {
        const left = or();

        if (tokens[position]?.value === "→") {
            position++;
            return {
                type: "binary",
                operator: "→",
                left,
                right: implication()
            };
        }

        return left;
    }

    function equivalence() {
        let node = implication();

        while (tokens[position]?.value === "↔") {
            position++;
            node = {
                type: "binary",
                operator: "↔",
                left: node,
                right: implication()
            };
        }

        return node;
    }

    if (tokens.length === 0) {
        throw new Error(t("enterExpression"));
    }

    const tree = equivalence();

    if (position !== tokens.length) {
        const token = tokens[position];

        if (token.value === ")") {
            throw new Error(t("unexpectedClose"));
        }

        throw new Error(t("unexpectedToken", { value: token.value }));
    }

    return tree;
}


/* =========================================================
   EVALUATION
========================================================= */

function evaluateNode(node, assignment) {
    if (node.type === "boolean") {
        return node.value;
    }

    if (node.type === "variable") {
        if (!(node.name in assignment)) {
            throw new Error(t("noValue", { value: node.name }));
        }
        return Boolean(assignment[node.name]);
    }

    if (node.type === "unary") {
        return !evaluateNode(node.child, assignment);
    }

    if (node.type === "binary") {
        const left = evaluateNode(node.left, assignment);
        const right = evaluateNode(node.right, assignment);

        switch (node.operator) {
            case "∧": return left && right;
            case "∨": return left || right;
            case "⊕": return Boolean(left) !== Boolean(right);
            case "→": return !left || right;
            case "↔": return left === right;
            default:
                throw new Error(t("unknownOperator", { value: node.operator }));
        }
    }

    throw new Error("Invalid expression tree");
}


/* =========================================================
   NODE DISPLAY
========================================================= */

function nodeToString(node) {
    if (node.type === "boolean") return node.value ? "T" : "F";
    if (node.type === "variable") return node.name;

    if (node.type === "unary") {
        const child = node.child.type === "binary"
            ? `(${nodeToString(node.child)})`
            : nodeToString(node.child);

        return `¬${child}`;
    }

    if (node.type === "binary") {
        return `(${nodeToString(node.left)} ${node.operator} ${nodeToString(node.right)})`;
    }

    return "?";
}


function collectIntermediateNodes(node, list = [], seen = new Set()) {
    if (node.type === "unary") {
        collectIntermediateNodes(node.child, list, seen);
    } else if (node.type === "binary") {
        collectIntermediateNodes(node.left, list, seen);
        collectIntermediateNodes(node.right, list, seen);
    } else {
        return list;
    }

    const label = nodeToString(node);

    if (!seen.has(label)) {
        seen.add(label);
        list.push(node);
    }

    return list;
}


/* =========================================================
   NORMAL CALCULATE
========================================================= */

function evaluate(expression) {
    const tree = parseExpression(expression);
    const assignment = {};

    for (const variable of getVariables(expression)) {
        // ? is a table-generation state. For the live single result,
        // use TRUE so the normal V2 calculator always has a Boolean result.
        assignment[variable] =
            variables[variable] === null
                ? true
                : variables[variable];
    }

    return evaluateNode(tree, assignment);
}


function calculate() {
    const expression = display.value;

    try {
        const value = evaluate(expression);

        resultValue.textContent = value ? "TRUE" : "FALSE";

        resultValue.classList.toggle("false", !value);

        status.textContent = t("validExpression");
        status.classList.remove("error");

    } catch (error) {
        resultValue.textContent = "—";
        resultValue.classList.remove("false");

        status.textContent = "⚠ " + error.message;
        status.classList.add("error");
    }

    updateVariableControls();
}


/* =========================================================
   TABLE INVALIDATION
========================================================= */

function invalidateTable() {
    if (!truthTableSection.hidden) {
        tableStatus.textContent = t("outdatedTable");
    }
}


/* =========================================================
   TRUTH TABLE
========================================================= */

function generateAssignments(allVariables) {
    const varying = allVariables.filter(
        variable => variables[variable] === null
    );

    const fixed = allVariables.filter(
        variable => variables[variable] !== null
    );

    const rows = [];
    const rowCount = 2 ** varying.length;

    for (let mask = 0; mask < rowCount; mask++) {
        const assignment = {};

        for (const variable of fixed) {
            assignment[variable] = variables[variable];
        }

        for (let i = 0; i < varying.length; i++) {
            const bit =
                (mask >> (varying.length - 1 - i)) & 1;

            assignment[varying[i]] = bit === 1;
        }

        rows.push(assignment);
    }

    return rows;
}


function generateTruthTable() {
    const expression = display.value.trim();

    tableStatus.textContent = "";
    tableStatus.classList.remove("error");

    try {
        const tree = parseExpression(expression);
        const allVariables = getVariables(expression);

        const varying = allVariables.filter(
            variable => variables[variable] === null
        );

        if (varying.length > 8) {
            throw new Error(t("tooManyUnknown", { count: varying.length }));
        }

        const rows = generateAssignments(allVariables);
        const showSteps = showIntermediate.checked;

        const intermediateNodes = showSteps
            ? collectIntermediateNodes(tree)
            : [];

        const table = document.createElement("table");
        table.className = "truth-table";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        for (const variable of allVariables) {
            const th = document.createElement("th");
            th.textContent = variable;
            headerRow.appendChild(th);
        }

        const visibleNodes = intermediateNodes.filter(
            node =>
                node.type !== "variable" &&
                node.type !== "boolean" &&
                node !== tree
        );

        if (showSteps) {
            for (const node of visibleNodes) {
                const th = document.createElement("th");
                th.textContent = nodeToString(node);
                headerRow.appendChild(th);
            }
        }

        const resultHeader = document.createElement("th");
        resultHeader.textContent = t("resultLabel").replace(/:$/, "");
        headerRow.appendChild(resultHeader);

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        const results = [];

        for (const assignment of rows) {
            const tr = document.createElement("tr");

            for (const variable of allVariables) {
                const td = document.createElement("td");
                const value = assignment[variable];

                td.textContent = value ? "T" : "F";
                td.className = value ? "true" : "false";
                tr.appendChild(td);
            }

            if (showSteps) {
                for (const node of visibleNodes) {
                    const value = evaluateNode(node, assignment);
                    const td = document.createElement("td");

                    td.textContent = value ? "T" : "F";
                    td.className = value ? "true" : "false";
                    tr.appendChild(td);
                }
            }

            const result = evaluateNode(tree, assignment);
            results.push(result);

            const resultCell = document.createElement("td");
            resultCell.textContent = result ? "T" : "F";
            resultCell.className = result ? "true" : "false";
            tr.appendChild(resultCell);

            tbody.appendChild(tr);
        }

        table.appendChild(tbody);

        truthTableWrapper.innerHTML = "";
        truthTableWrapper.appendChild(table);
        truthTableSection.hidden = false;

        const trueCount = results.filter(Boolean).length;
        const falseCount = results.length - trueCount;

        const hasUnknown = varying.length > 0;

        let type;
        let className;

        if (trueCount === results.length) {
            type = t("tautology");
            className = "tautology";
        } else if (falseCount === results.length) {
            type = t("contradiction");
            className = "contradiction";
        } else {
            // With ? variables, mixed results mean the expression DEPENDS
            // on those variables. Without ?, keep the traditional label.
            type = hasUnknown ? t("depends") : t("contingency");
            className = hasUnknown ? "depends" : "depends";
        }

        classification.className =
            `classification ${className}`;

        classification.textContent =
            `${type} — ${t("trueCount", { count: trueCount })} / ${t("falseCount", { count: falseCount })} (${results.length} ${currentLanguage === "th" ? "แถว" : `row${results.length === 1 ? "" : "s"}`})`;

        tableStatus.textContent = t("rowGenerated", { count: results.length });

    } catch (error) {
        truthTableSection.hidden = true;
        tableStatus.textContent = "⚠ " + error.message;
        tableStatus.classList.add("error");
    }
}

/* =========================================================
   INSERT TEXT AT CURSOR
========================================================= */

function insertText(text) {

    const start = display.selectionStart;
    const end = display.selectionEnd;

    const before =
        display.value.slice(0, start);

    const after =
        display.value.slice(end);

    display.value =
        before + text + after;

    const newPosition =
        start + text.length;

    display.focus();

    display.setSelectionRange(
        newPosition,
        newPosition
    );

    calculate();
}


/* =========================================================
   BUTTON INPUT
========================================================= */

document
    .querySelectorAll("[data-value]")
    .forEach(button => {

        button.addEventListener("click", () => {

            insertText(
                button.dataset.value
            );
        });
    });


/* =========================================================
   BACKSPACE
========================================================= */

document
    .getElementById("backspace")
    .addEventListener("click", () => {

        const start = display.selectionStart;
        const end = display.selectionEnd;


        // Delete selection
        if (start !== end) {

            display.value =
                display.value.slice(0, start) +
                display.value.slice(end);

            display.focus();

            display.setSelectionRange(
                start,
                start
            );

            calculate();
            invalidateTable();

            return;
        }


        // Delete character before cursor
        if (start > 0) {

            display.value =
                display.value.slice(0, start - 1) +
                display.value.slice(start);

            display.focus();

            display.setSelectionRange(
                start - 1,
                start - 1
            );
        }

        calculate();
        invalidateTable();
    });


/* =========================================================
   CLEAR
========================================================= */

document
    .getElementById("clear")
    .addEventListener("click", () => {

        display.value = "";

        display.focus();

        truthTableSection.hidden = true;
        tableStatus.textContent = "";

        calculate();
    });


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

display.addEventListener("keydown", event => {

    let replacement = null;


    switch (event.key) {

        case "&":
            replacement = "∧";
            break;

        case "|":
            replacement = "∨";
            break;

        case "!":
            replacement = "¬";
            break;

        case "^":
            replacement = "⊕";
            break;
    }


    if (replacement !== null) {

        event.preventDefault();

        insertText(replacement);
    }
});


/* =========================================================
   ARROW / TEXT INPUT OPERATOR CONVERSION
========================================================= */

display.addEventListener("input", () => {

    const original = display.value;

    let converted = original;

    /*
     * Keyboard shortcuts
     */

    converted = converted.replace(/&/g, "∧");
    converted = converted.replace(/\|/g, "∨");
    converted = converted.replace(/!/g, "¬");
    converted = converted.replace(/\^/g, "⊕");

    /*
     * Multi-character operators
     */

    converted = converted.replace(/<->/g, "↔");
    converted = converted.replace(/->/g, "→");


    /*
     * Only update the input if
     * something actually changed.
     */

    if (converted !== original) {

        const cursor =
            display.selectionStart;

        const difference =
            converted.length - original.length;

        display.value = converted;

        const newPosition =
            Math.max(
                0,
                cursor + difference
            );

        display.setSelectionRange(
            newPosition,
            newPosition
        );
    }


    calculate();
});


/* =========================================================
   GENERATE TABLE BUTTON
========================================================= */

generateTableButton.addEventListener("click", generateTruthTable);


/* =========================================================
   INITIALIZE
========================================================= */

localizePage();
updateVariableControls();

calculate();

display.focus();

display.setSelectionRange(
    display.value.length,
    display.value.length
);
