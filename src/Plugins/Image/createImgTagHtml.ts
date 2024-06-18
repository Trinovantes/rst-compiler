import { getImageInfo } from './getImageInfo.js'

export function createImgTagHtml(imgInfo: ReturnType<typeof getImageInfo>): string {
    const { attrs, targetUrl } = imgInfo
    const imgTag = `<img${attrs.toString()} />`

    if (imgInfo.targetUrl) {
        return `<a href="${targetUrl}">${imgTag}</a>`
    } else {
        return imgTag
    }
}
