import displayErrors from "displayErrors";
import parseCommandLineArgs from "parseCommandLineArgs";


const {jslintEdition, jslintFile} = require("./index");
var flags;
var filePaths;
var cmdLineOpts;
var parsedArgs;

function printErrorAndExit(err) {
    console.error(err.toString());
    process.exit(1);
}

try {
    parsedArgs = parseCommandLineArgs(process.argv.slice(2));
} catch (err) {
    printErrorAndExit(err);
}

filePaths = parsedArgs.filePaths;
cmdLineOpts = parsedArgs.options;
flags = parsedArgs.flags;

if (flags.version) {
    const version = require("./package.json").version;
    if (flags.raw) {
        process.stdout.write(JSON.stringify({
            version: version,
            jslintEdition: jslintEdition
        }));
    } else {
        console.log("jslint (JSLinter) %s (JSLint edition %s)",
                version, jslintEdition);
        console.log("Copyright (c) 2015-2016 Nicola Squartini");
    }
    process.exit(0);
}

if (filePaths.length === 0) {
    printErrorAndExit("No files specified.");
}

jslintFile(filePaths, {
    callback: flags.raw
        ? function ({pathname, report}) {
            return {
                file: pathname,
                option: report.option,
                stop: report.stop,
                warnings: report.warnings
            };
        }
        : function ({pathname, report}) {
            displayErrors(pathname, report);
        },
    options: cmdLineOpts,
    shaBang: flags["sha-bang"]
}).then(function (out) {
    if (flags.raw) {
        process.stdout.write(JSON.stringify(out));

    }
}).catch(printErrorAndExit);
