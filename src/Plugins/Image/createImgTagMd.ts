import { createImgTagHtml } from './createImgTagHtml.ts'
import { getImageInfo } from './getImageInfo.ts'

export function createImgTagMd(imgInfo: ReturnType<typeof getImageInfo>): string {
    const { needHtmlTag, attrs, targetUrl } = imgInfo
    if (needHtmlTag) {
        return createImgTagHtml(imgInfo)
    }

    const alt = attrs.get('alt')
    const src = attrs.get('src')
    const imgTag = `![${alt}](${src})`

    if (targetUrl) {
        return `[${imgTag}](${targetUrl})`
    } else {
        return imgTag
    }
}
