/**
 * @note - stickyfingies
 * Certain parts of the codebase import `LogService` directly,
 * but not all.  I'm taking extra care to make certain parts
 * of the codebase resusable, so I don't want uneccesary deps
 */

function getFontColor(string: string) {
    let stringUniqueHash = [...string].reduce((accumulator, char) => {
        return char.charCodeAt(0) + ((accumulator << 5) - accumulator);
    }, 69);
    return `hsl(${stringUniqueHash % 360}, 95%, 35%)`;
}

export default function LogService(logName: any) {
    const logCategory = logName.split(':')[0];

    const prettyPrinter = (fn: Function) => {
        return (payload: any) => {
            if (typeof payload === 'object') { payload = JSON.stringify(payload, undefined, 2); }
            const color = getFontColor(logCategory);
            fn(`%c[${logName}]\n%c${payload}`, `color:${color};font-weight:bold;`, 'color:#333333;font-weight:bold;');
        }
    }
    const log = prettyPrinter(console.log);
    const report = prettyPrinter(console.error);

    return [log, report];
}
