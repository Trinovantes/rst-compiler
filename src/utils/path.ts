// ----------------------------------------------------------------------------
// MARK: getPathDirname
// Replace path.dirname
// ----------------------------------------------------------------------------

export function getPathDirname(path: string): string {
    if (path.length === 0) {
        return '.'
    }

    const isAbsolute = path.at(0) === '/'

    // Iterate BACKWARDS and stop when we find first slash preceding non-path-separator
    // e.g. Stop on first slash after after seeing `b`
    //  `/a/b`  -> `/a`
    //  `/a/b/` -> `/a`
    let dirnameSlashIdx: number | null = null
    let sawNonPathSeparator = false

    for (let i = path.length - 1; i >= 1; i--) {
        const currChar = path.charAt(i)
        if (currChar !== '/') {
            sawNonPathSeparator = true
            continue
        }

        // currChar === '/'
        // If we already see non-path-separator, then we can terminate the search
        if (sawNonPathSeparator) {
            dirnameSlashIdx = i
            break
        }
    }

    // Search failed, then path is empty
    if (dirnameSlashIdx === null) {
        return isAbsolute ? '/' : '.'
    }

    // Special case of UNC path (`//abc` should return `//`)
    if (isAbsolute && dirnameSlashIdx === 1) {
        return '//'
    }

    return path.slice(0, dirnameSlashIdx)
}

// ----------------------------------------------------------------------------
// MARK: joinFilePath
// Replace path.join
// ----------------------------------------------------------------------------

export function joinFilePath(...args: Array<string>): string {
    let joined = ''

    for (const arg of args) {
        if (!arg) {
            continue
        }

        if (joined.length === 0) {
            joined = arg
        } else {
            joined += `/${arg}`
        }
    }

    return normalizeFilePath(joined)
}

// ----------------------------------------------------------------------------
// MARK: resolveFilePath
// Replace path.resolve
// ----------------------------------------------------------------------------

export function resolveFilePath(...args: Array<string>): string {
    let resolvedPath = ''
    let lastFragmentWasAbsolute = false

    // Iterate backwards and construct the resolved path
    for (let i = args.length - 1; i >= 0 && !lastFragmentWasAbsolute; i--) {
        const currPathFragment = args[i]
        if (!currPathFragment) {
            continue
        }

        if (resolvedPath.length === 0) {
            resolvedPath = currPathFragment
        } else {
            resolvedPath = currPathFragment + '/' + resolvedPath
        }

        lastFragmentWasAbsolute = currPathFragment.charAt(0) === '/'
    }

    // Use normalizeString instead of normalizeFilePath because
    // path.resolve is defined to trim trailing slash whereas normalizeFilePath preserves trailing slash
    resolvedPath = normalizeString(resolvedPath, lastFragmentWasAbsolute)

    if (lastFragmentWasAbsolute) {
        return `/${resolvedPath}`
    }
    if (resolvedPath.length === 0) {
        return '.'
    }

    return resolvedPath
}

// ----------------------------------------------------------------------------
// MARK: normalizeFilePath
// Replace path.normalize
// ----------------------------------------------------------------------------

export function normalizeFilePath(path: string): string {
    if (path.length === 0) {
        return '.'
    }
    if (path.length === 1) {
        return path
    }

    const isAbsolute = path.charAt(0) === '/'
    const hasTrailingSlash = path.charAt(path.length - 1) === '/'

    let resultPath = normalizeString(path, isAbsolute)
    if (resultPath.length === 0) {
        if (isAbsolute) {
            return '/'
        } else {
            if (hasTrailingSlash) {
                return './'
            } else {
                return '.'
            }
        }
    }

    if (isAbsolute) {
        resultPath = `/${resultPath}`
    }
    if (hasTrailingSlash) {
        resultPath = `${resultPath}/`
    }

    return resultPath
}

function normalizeString(path: string, isAbsolute: boolean): string {
    const parts = path.split('/').filter((part) => part.length > 0)
    const outputStack = new Array<string>()

    for (let i = 0; i < parts.length; i++) {
        const currPart = parts.at(i)

        // Skip over repeated slashes e.g. `////`
        if (!currPart) {
            continue
        }

        // Skip over single dots e.g. `/./`
        if (currPart === '.') {
            continue
        }

        // Skip over double dots and pop off previous part off stack
        if (currPart === '..') {
            switch (true) {
                // Unless:
                case !isAbsolute && outputStack.length === 0: // Original path is relative path and output is currently empty (at the start)
                case outputStack.at(-1) === '..': // Already has '..' on the stack (i.e. continuing relative ../../../)
                    break

                default: {
                    outputStack.pop()
                    continue
                }
            }
        }

        outputStack.push(currPart)
    }

    return outputStack.join('/')
}
