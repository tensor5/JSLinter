function highlight(str) {
    'use strict';
    return '\x1B[7m' + str + '\x1B[27m';
}

function highlightCol(str, i) {
    'use strict';
    var c = str.charAt(i),
        code = str.charCodeAt(i),
        codeOther,
        before,
        middle,
        after;

    // Handle non-BMP characters
    if (code >= 0xD800 && code <= 0xDBFF) {
        codeOther = str.charCodeAt(i + 1);
        if (codeOther >= 0xDC00 && codeOther <= 0xDFFF) {
            middle = highlight(c + str.charAt(i + 1));
            after = str.slice(i + 2);
        }
    } else if (code >= 0xDC00 && code <= 0xDFFF && i !== 0) {
        codeOther = str.charCodeAt(i - 1);
        if (codeOther >= 0xD800 && codeOther <= 0xDBFF) {
            before = str.slice(0, i - 1);
            middle = highlight(str.charAt(i - 1) + c);
        }
    }

    before = before || str.slice(0, i);
    middle = middle || highlight(c);
    after = after || str.slice(i + 1);
    return before + middle + after;
}

function paddedNumber(totalSpace, number) {
    'use strict';

    var digitString = number.toString(),
        padding = totalSpace - digitString.length,
        space = ' ';

    if (padding >= 0) {
        return space.repeat(padding) + digitString;
    } else {
        return digitString;
    }
}

function displayErrors(path, data) {
    'use strict';

    var fudge = +!!data.option.fudge,
        maxLine,
        maxLineDigits,
        maxerr = data.option.maxerr,
        numberOfWarnings = data.warnings.length,
        tooMany = numberOfWarnings >= maxerr,
        tooManyNumber = numberOfWarnings - tooMany,
        tooManyNumberDigits = tooManyNumber.toString().length,
        unable = 'JSLint was unable to finish.';

    if (numberOfWarnings !== 0) {
        console.log('\n%s', path);
        maxLine = data.warnings[numberOfWarnings - 1].line + fudge;
        maxLineDigits = maxLine.toString().length;
    }
    data.warnings.forEach(function (warning, i) {
        var message = warning.message,
            messageCol,
            messageColHi,
            messageLine,
            messageLineHi,
            messageNum;

        if (i === maxerr && data.stop) {
            console.log(' ', message, unable);
        } else {
            messageCol = warning.column;
            messageColHi = highlightCol(data.lines[warning.line], messageCol);
            messageLine = warning.line + fudge;
            messageLineHi = highlight(paddedNumber(maxLineDigits, messageLine));
            messageNum = paddedNumber(tooManyNumberDigits, i + 1);
            console.log('  #%s %s', messageNum, message);
            console.log('  %s %s', messageLineHi, messageColHi);
        }
    });
    if (data.stop && !tooMany) {
        console.log(' ', unable);
    }
}

export default displayErrors;
