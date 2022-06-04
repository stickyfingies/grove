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

/**
 * Creates a **named, colored** logging channel, such that
 * all logs coming from the same channel name are outputted with 
 * the same color.  Useful for debugging, and pretty, too :)
 * @example
 * ```
 * const [log, error] = LogService('channel:name');
 * // ...
 * log('heck yeah! strings!!');
 * error({ code: 0xDEADBEEF, msg: 'objects, too' });
 * ```
 */
export default function LogService(logName: string) {
    const logCategory = logName.split(':')[0];

    const makePrettyPrinter = (fn: Function) => {
        return (payload: unknown) => {
            if (typeof payload === 'object') { payload = JSON.stringify(payload, undefined, 2); }
            const color = getFontColor(logCategory);
            fn(`%c[${logName}]\n%c${payload}`, `color:${color};font-weight:bold;`, 'color:#333333;font-weight:bold;');
        }
    }
    const log = makePrettyPrinter(console.log);
    const report = makePrettyPrinter(console.error);

    return [log, report];
}