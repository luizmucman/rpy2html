/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { SerializedStyles } from '@emotion/core'
import { TextAlignProperty } from 'csstype'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { FunctionComponent } from 'react'

import Char from '../../../renpy-json-loader/Char'
import { style } from '../../context'
import { getBgOrElse, mediaQuery, styleFrom } from '../../utils/styles'

interface Props {
    hide: boolean
    char: O.Option<Char>
    styles?: {
        namebox?: SerializedStyles
        dialog?: SerializedStyles
    }
}

const Textbox: FunctionComponent<Props> = ({
    hide,
    char,
    styles: stylesOverride = {},
    children
}) => {
    const textboxStyle = hide ? { display: 'none' } : undefined
    const charStyle: React.CSSProperties = pipe(
        char,
        O.chain(_ =>
            pipe(
                _.color,
                O.map(_ => ({ color: _ }))
            )
        ),
        O.getOrElse(() => ({}))
    )
    const charName = pipe(
        char,
        O.map(_ => _.name),
        O.getOrElse(() => '')
    )

    return (
        <div css={styles.textbox} style={textboxStyle}>
            <div
                css={[styles.namebox, stylesOverride.namebox]}
                style={charStyle}
            >
                {charName}
            </div>
            <div css={[styles.dialog, stylesOverride.dialog]}>{children}</div>
        </div>
    )
}
export default Textbox

const styles = {
    textbox: css({
        position: 'absolute',
        width: '100%',
        backgroundSize: '100% 100%',
        height: style.textbox_height,
        ...styleFrom(style.textbox_yalign),
        ...getBgOrElse('textbox_bg', 'rgba(0,0,0,0.75)')
    }),

    namebox: css({
        position: 'absolute',
        color: '#0099cc',
        top: style.namebox_top,
        left: style.namebox_left,
        right: style.namebox_left,
        fontFamily: style.namebox_ffamily,
        fontSize: `${style.namebox_fsize_h}vh`,
        width: style.namebox_width,
        height: style.namebox_height,
        padding: style.namebox_padding,
        textAlign: style.namebox_txtalign as TextAlignProperty,
        ...styleFrom(style.namebox_bgtile),
        ...getBgOrElse('namebox_bg'),
        [mediaQuery(style)]: {
            fontSize: `${style.namebox_fsize_v}vw`
        }
    }),

    dialog: css({
        position: 'absolute',
        top: style.dialog_top,
        left: style.dialog_left,
        fontFamily: style.dialog_ffamily,
        fontSize: `${style.dialog_fsize_h}vh`,
        color: style.dialog_color,
        width: style.dialog_width,
        textAlign: style.dialog_txtalign as TextAlignProperty,
        [mediaQuery(style)]: {
            fontSize: `${style.dialog_fsize_v}vw`
        }
    })
}
