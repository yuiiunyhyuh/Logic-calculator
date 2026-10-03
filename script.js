const display = document.getElementById("display");
const resultValue = document.getElementById("resultValue");
const status = document.getElementById("status");
const variableControls = document.getElementById("variableControls");


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
        button.className =
            "variable " +
            (variables[variable] ? "true" : "false");

        button.innerHTML = `
            <span class="name">${variable}</span>
            <span class="value">
                ${variables[variable] ? "T" : "F"}
            </span>
        `;

        button.addEventListener("click", () => {

            variables[variable] =
                !variables[variable];

            updateVariableControls();
            calculate();
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


        // Ignore spaces
        if (/\s/.test(char)) {
            i++;
            continue;
        }


        // TRUE / FALSE
        if (char === "T" || char === "F") {

            tokens.push({
                type: "boolean",
                value: char === "T"
            });

            i++;
            continue;
        }


        // Variables
        if (/[a-z]/.test(char)) {

            tokens.push({
                type: "variable",
                value: char
            });

            i++;
            continue;
        }


        // Logic operators
        if (
            char === "∧" ||
            char === "∨" ||
            char === "¬" ||
            char === "⊕" ||
            char === "→" ||
            char === "↔" ||
            char === "(" ||
            char === ")"
        ) {

            tokens.push({
                type: "operator",
                value: char
            });

            i++;
            continue;
        }


        throw new Error(
            `Unknown symbol "${char}"`
        );
    }

    return tokens;
}


/* =========================================================
   PARSER
========================================================= */

function evaluate(expression) {

    const tokens = tokenize(expression);

    let position = 0;


    /* -----------------------------------------------------
       PRIMARY
    ----------------------------------------------------- */

    function primary() {

        const token = tokens[position];

        if (!token) {
            throw new Error("Expected a value");
        }


        // T / F
        if (token.type === "boolean") {

            position++;

            return token.value;
        }


        // Variable
        if (token.type === "variable") {

            position++;

            return variables[token.value];
        }


        // NOT
        if (
            token.type === "operator" &&
            token.value === "¬"
        ) {

            position++;

            return !primary();
        }


        // Parentheses
        if (
            token.type === "operator" &&
            token.value === "("
        ) {

            position++;

            const value = equivalence();

            if (
                !tokens[position] ||
                tokens[position].value !== ")"
            ) {
                throw new Error(
                    "Missing closing )"
                );
            }

            position++;

            return value;
        }


        throw new Error("Expected a value");
    }


    /* -----------------------------------------------------
       AND
       Highest binary precedence
    ----------------------------------------------------- */

    function and() {

        let value = primary();

        while (
            tokens[position] &&
            tokens[position].value === "∧"
        ) {

            position++;

            const right = primary();

            value = value && right;
        }

        return value;
    }


    /* -----------------------------------------------------
       XOR
    ----------------------------------------------------- */

    function xor() {

        let value = and();

        while (
            tokens[position] &&
            tokens[position].value === "⊕"
        ) {

            position++;

            const right = and();

            value =
                Boolean(value) !== Boolean(right);
        }

        return value;
    }


    /* -----------------------------------------------------
       OR
    ----------------------------------------------------- */

    function or() {

        let value = xor();

        while (
            tokens[position] &&
            tokens[position].value === "∨"
        ) {

            position++;

            const right = xor();

            value = value || right;
        }

        return value;
    }


    /* -----------------------------------------------------
       IMPLICATION
    ----------------------------------------------------- */

    function implication() {

        const left = or();

        if (
            tokens[position] &&
            tokens[position].value === "→"
        ) {

            position++;

            const right = implication();

            return !left || right;
        }

        return left;
    }


    /* -----------------------------------------------------
       EQUIVALENCE
    ----------------------------------------------------- */

    function equivalence() {

        let value = implication();

        while (
            tokens[position] &&
            tokens[position].value === "↔"
        ) {

            position++;

            const right = implication();

            value = value === right;
        }

        return value;
    }


    if (tokens.length === 0) {
        throw new Error("Enter an expression");
    }


    const value = equivalence();


    if (position !== tokens.length) {

        const token = tokens[position];

        if (token.value === ")") {
            throw new Error(
                "Unexpected closing )"
            );
        }

        throw new Error(
            `Unexpected "${token.value}"`
        );
    }


    return value;
}


/* =========================================================
   CALCULATE
========================================================= */

function calculate() {

    const expression = display.value;

    try {

        const value = evaluate(expression);

        resultValue.textContent =
            value ? "TRUE" : "FALSE";

        resultValue.classList.toggle(
            "false",
            !value
        );

        status.textContent =
            "✓ Valid expression";

        status.classList.remove("error");

    } catch (error) {

        resultValue.textContent = "—";

        resultValue.classList.remove("false");

        status.textContent =
            "⚠ " + error.message;

        status.classList.add("error");
    }

    updateVariableControls();
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
    });


/* =========================================================
   CLEAR
========================================================= */

document
    .getElementById("clear")
    .addEventListener("click", () => {

        display.value = "";

        display.focus();

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
   INITIALIZE
========================================================= */

updateVariableControls();

calculate();

display.focus();

display.setSelectionRange(
    display.value.length,
    display.value.length
);