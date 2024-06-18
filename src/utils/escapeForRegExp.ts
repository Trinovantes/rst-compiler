export function escapeForRegExp(str: string): string {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}
