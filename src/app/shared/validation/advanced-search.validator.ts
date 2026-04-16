import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function advancedSearch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const input = control.value.trim();

        if (!input || !input.trim()) {
            return { emptyInput: true }; // Enter the text.
        }

        // ---- Basic checks ----
        if (/^(\||&)/.test(input)) {
            return { invalidStartOperator: true };    // Invalid (Input cannot start with operator)
        }

        if (/(\||&)$/.test(input)) {
            return { invalidEndOperator: true };  // Invalid (Input cannot end with operator)
        }

        // ---- Check for unbalanced quotes ----
        const quoteCount = (input.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
            return { invalidUnclosedQuote: true };    // Invalid (Unclosed quote invalid input)
        }

        // ---- Check for multiple operators ----
        const operatorCount = (input.match(/\|/g) || []).length + (input.match(/&/g) || []).length;
        if (operatorCount > 1) {
            return { invalidMoreOperator: true };  // Invalid (More than one operator not allowed)
        }

        // ---- Check for mixed operators ----
        if (input.includes('|') && input.includes('&')) {
            return { invalidMixOperator: true };     // Invalid (Mixed operators not allowed)
        }

        // ---- Regex patterns ----
        // const wordPattern = `[A-Za-z0-9_]+`;
        // const quotedWordPattern = `"[^"]+"`;
        // const singleTerm = `(${wordPattern}|${quotedWordPattern})`;

        // // Valid patterns
        // const patterns = [
        //     // Single term
        //     new RegExp(`^${singleTerm}$`),

        //     // OR / AND / symbolic OR/AND
        //     new RegExp(`^${singleTerm}\\s*(\\||&|\\bor\\b|\\band\\b)\\s*${singleTerm}$`, 'i'),
        // ];

        // const isBasicValid = patterns.some(p => p.test(input));
        // if (!isBasicValid) {
        //     return { invalidPattern: true };     // Invalid (Pattern not matched)
        // }

        // // Literal phrase with operator (e.g., "Word and Word" & Word)
        // const literalAndOperator = /"[^"]+"\s*(\||&)\s*\w+/;
        // if (literalAndOperator.test(input)) {
        //     return { invalidLiteralWithOperator: true }; // Invalid (Literal phrase with operator not allowed)
        // }

        // Regex to match allowed operands (quoted or unquoted)
        // const operandPattern = /"[^"]+"|[A-Za-z]+/g;

        // Match all operands
        // const operands = input.match(operandPattern);
        // if (!operands) return { invalidPattern: true };

        // // Rule 1: quoted words should not contain 'and' or 'or'
        // const invalidQuoted = operands.some(op => {
        //     if (op.startsWith('"')) {
        //         const inner = op.replace(/"/g, '');
        //         return /\b(and|or)\b/i.test(inner);
        //     }
        //     return false;
        // });
        // if (invalidQuoted) return { invalidLiteralWithOperator: true };

        // // Rule 2: ensure proper structure like operand (operator operand)*
        // const validStructure = /^(\s*"[^"]+"|\s*[A-Za-z]+)(\s*(&|\|)\s*(".*?"|[A-Za-z]+))*$/.test(input);
        // if (!validStructure) return { invalidLiteralWithOperator: true };

        // Regex to match allowed structure
        // const validStructure =
        //     /^(\s*"[^"]+"|\s*[A-Za-z]+(\s+(and|or)\s+[A-Za-z]+)*)(\s*(&|\|)\s*(".*?"|[A-Za-z]+(\s+(and|or)\s+[A-Za-z]+)*))*$/.test(input);

        // const validStructure = /^(\s*"[^"]+"|\s*[A-Za-z0-9]+(\s+[A-Za-z0-9]+|\s+(and|or)\s+[A-Za-z0-9]+)*)(\s*(&|\|)\s*(".*?"|[A-Za-z0-9]+(\s+[A-Za-z0-9]+|\s+(and|or)\s+[A-Za-z0-9]+)*))*$/.test(input);

        // Allow Swedish Characters
        // const validStructure = /^(\s*"[^"]+"|\s*[A-Za-z0-9ÅÄÖåäö]+(\s+[A-Za-z0-9ÅÄÖåäö]+|\s+(and|or)\s+[A-Za-z0-9ÅÄÖåäö]+)*)(\s*(&|\|)\s*(".*?"|[A-Za-z0-9ÅÄÖåäö]+(\s+[A-Za-z0-9ÅÄÖåäö]+|\s+(and|or)\s+[A-Za-z0-9ÅÄÖåäö]+)*))*$/.test(input);

        // Allow Swedish Characters & Special Characters
        const validStructure = /^(\s*"[^"]+"|\s*[^\s"&|]+(\s+[^\s"&|]+|\s+(and|or)\s+[^\s"&|]+)*)(\s*(&|\|)\s*(".*?"|[^\s"&|]+(\s+[^\s"&|]+|\s+(and|or)\s+[^\s"&|]+)*))*$/.test(input);


        if (!validStructure) return { invalidPattern: true };

        // Extra check: disallow mixing "and/or inside quotes" with & or |
        const hasQuotedAndOr = /"[^"]*\b(and|or)\b[^"]*"/i.test(input);
        const hasSymbolOperators = /[&|]/.test(input);

        if (hasQuotedAndOr && hasSymbolOperators) {
            return { invalidLiteralWithOperator: true };
        }

        return null; // No error
    };
}