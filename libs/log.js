export function logError(message, args) {
    console.error(`\x1b[31m${message}\x1b[0m`, args || '');
}

export function logWarn(message, args) {
    console.warn(`\x1b[33m${message}\x1b[0m`, args || '');
}

export function logSuccess(message, args) {
    console.log(`\x1b[32m${message}\x1b[0m`, args || '');
}