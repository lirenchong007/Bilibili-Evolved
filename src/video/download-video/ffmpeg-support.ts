import { RawItem } from './batch-download'

const dashExtensions = ['.mp4', '.m4a']
export const getFragmentsList = (count: number, originalTitle: string, extensions: string[]) => {
  if (count < 2) {
    return null
  }
  const names = []
  for (let index = 1; index <= count; index++) {
    let indexNumber = ` - ${index}`
    if (extensions.includes('.m4a')) {
      indexNumber = ''
    }
    names.push(escapeFilename(`file '${originalTitle}${indexNumber}${extensions[index - 1]}'`))
  }
  return names.join('\n')
}
export const getBatchFragmentsList = (items: RawItem[], extensionOrDash: string | boolean) => {
  const multipleFragments = (item: RawItem) => item.fragments.length > 1
  const fragmentsItems = items.filter(multipleFragments)
  if (fragmentsItems.length === 0) {
    return null
  }
  const names = new Map<string, string>()
  fragmentsItems.forEach(item => {
    names.set(escapeFilename(`ffmpeg-files-${item.title}.txt`), item.fragments.map((_, index) => {
      let indexNumber = ` - ${index + 1}`
      if (extensionOrDash === true) {
        indexNumber = ''
      }
      return escapeFilename(`file '${item.title}${indexNumber}${extensionOrDash === true ? dashExtensions[index] : extensionOrDash}'`)
    }).join('\n'))
  })
  return names
}
export const getBatchEpisodesList = (items: RawItem[], extensionOrDash: string | boolean) => {
  const names: string[] = []
  items.forEach(item => {
    item.fragments.forEach((_, index) => {
      let indexNumber = ''
      if (item.fragments.length > 1 && extensionOrDash !== true) {
        indexNumber = ` - ${index + 1}`
      }
      names.push(escapeFilename(`file '${item.title}${indexNumber}${extensionOrDash === true ? dashExtensions[index] : extensionOrDash}'`))
    })
  })
  return names.join('\n')
}
export default {
  export: {
    getFragmentsList,
    getBatchFragmentsList,
    getBatchEpisodesList,
  },
}