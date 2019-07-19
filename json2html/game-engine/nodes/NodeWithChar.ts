import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as R from 'fp-ts/lib/Record'

import AstNode, { InitArgs } from './AstNode'

import Char from '../Char'

export default abstract class NodeWithChar extends AstNode {
    who: O.Option<Char> = O.none

    constructor(
        private whosName: O.Option<string>,
        public what: string,
        idNexts: string[]
    ) {
        super(idNexts, true)
    }

    init({ id, data, execThenExecNext }: InitArgs) {
        super.init({ id, data, execThenExecNext })
        this.who = pipe(
            this.whosName,
            O.chain(name => {
                const res = R.lookup(name, data.chars)
                if (O.isNone(res)) {
                    console.warn(`Say: invalid character name: ${name}`)
                }
                return res
            })
        )
    }
}
