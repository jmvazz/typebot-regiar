import { FlexProps } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { env, getViewerUrl } from 'utils'
import { CodeEditor } from '@/components/CodeEditor'
import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'

type Props = {
  widthLabel: string
  heightLabel: string
  onCopied?: () => void
} & FlexProps

export const IframeSnippet = ({ widthLabel, heightLabel }: Props) => {
  const { typebot } = useTypebot()
  const src = `${env('VIEWER_INTERNAL_URL') ?? getViewerUrl()}/${
    typebot?.publicId
  }`
  const code = prettier.format(
    `<iframe src="${src}" style="border: none; width='${widthLabel}'; height='${heightLabel}'"></iframe>`,
    { parser: 'html', plugins: [parserHtml] }
  )

  return <CodeEditor value={code} lang="html" isReadOnly />
}
