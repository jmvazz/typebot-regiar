import { CodeEditor } from '@/components/CodeEditor'
import { useTypebot } from '@/features/editor'
import { BubbleProps } from '@typebot.io/js'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { parseReactBubbleProps } from '../../snippetParsers'

export const ReactBubbleSnippet = ({
  theme,
  previewMessage,
}: Pick<BubbleProps, 'theme' | 'previewMessage'>) => {
  const { typebot } = useTypebot()

  const snippet = prettier.format(
    `import { Bubble } from "@typebot.io/react";

      const App = () => {
        return <Bubble ${parseReactBubbleProps({
          typebot: typebot?.publicId ?? '',
          theme,
          previewMessage,
        })}/>
      }`,
    {
      parser: 'babel',
      plugins: [parserBabel],
    }
  )

  return <CodeEditor value={snippet} lang="javascript" isReadOnly />
}
