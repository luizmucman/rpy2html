import falafel from 'falafel'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'

const convertToJs = (code: string): string =>
    pipe(
        code,
        replace(/==/g, '==='),
        replace(/or/g, '||'),
        replace(/and/g, '&&'),
        replace(/not/g, '!'),
        escapeVars
    )
export default convertToJs

const replace = (searchValue: string | RegExp, replaceValue: string) => (
    str: string
): string => str.replace(searchValue, replaceValue)

const escapeVars = (code: string): string =>
    pipe(
        E.tryCatch(
            () =>
                falafel(code, node => {
                    if (
                        node.type === 'Identifier' &&
                        (node.parent.object === undefined ||
                            node.parent.object === node)
                    ) {
                        node.update(`window._${node.name}`)
                    }
                }).toString(),
            _ => _
        ),
        E.fold(
            e => {
                console.error(`Error while converting js: ${code}\n`, e)
                return code
            },
            _ => _
        )
    )
