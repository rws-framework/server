export function RWSTSLocator() {
    return (target: any) => {
        // Store the stack trace when the decorator is called (during TS compilation)
        const stack = new Error().stack;
        // Parse the stack to find the caller file (which will be the TS file)
        const callerFile = stack
            ?.split('\n')[1]
            ?.match(/(?:at\s+)(?:.*\s+\()?([^:]+):/)?.[1];        
        if (callerFile) {
            Reflect.defineMetadata('source:file', callerFile, target);
        }
    };
}