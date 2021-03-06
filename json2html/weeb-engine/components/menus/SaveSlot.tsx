/** @jsx jsx */
import { css, CSSObject, jsx } from '@emotion/core'
import { TextAlignProperty } from 'csstype'
import { Do } from 'fp-ts-contrib/lib/Do'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { FunctionComponent } from 'react'

import { firstNode, style, transl } from '../../context'
import GameProps from '../../history/GameProps'
import statesFromHistory from '../../history/statesFromHistory'
import Save from '../../saves/Save'
import { getBgOrElse, ifNoSlotBg, mediaQuery } from '../../utils/styles'
import Game from '../game/Game'

interface Props {
    save: O.Option<Save>
    onClick: (e: React.MouseEvent) => void
    deleteSave: () => void
    disabledIfEmpty?: boolean
}

const SaveSlot: FunctionComponent<Props> = ({
    save,
    onClick,
    deleteSave,
    disabledIfEmpty = false
}) => {
    const rectAndLabel: O.Option<[JSX.Element, string]> = Do(O.option)
        .bind('save', save)
        .bindL('states', ({ save }) =>
            pipe(
                statesFromHistory(firstNode, save.history),
                E.fold(() => {
                    deleteSave()
                    return O.none
                }, O.some)
            )
        )
        .bindL('currentState', ({ states }) => A.last(states))
        .return<[JSX.Element, string]>(
            ({ currentState: [gameProps], save: { date } }) => [
                getGame(gameProps),
                date
            ]
        )
    const disabled = O.isNone(rectAndLabel) && disabledIfEmpty
    const [gameRect, label] = pipe(
        rectAndLabel,
        O.getOrElse(() => [emptySlotL(), transl.emptySlot])
    )

    return (
        <button css={styles.saveSlot} onClick={onClick} disabled={disabled}>
            {gameRect}
            <div css={styles.text}>{label}</div>
        </button>
    )
}
export default SaveSlot

const getGame = (gameProps: GameProps): JSX.Element => (
    <Game gameProps={gameProps} isSaveSlot={true} styles={styles.game} />
)

const emptySlotL = () => <div css={styles.emptySlot} />

const styles = {
    saveSlot: css({
        position: 'relative',
        backgroundSize: '100% 100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: style.slot_color,
        width: style.slot_width,
        height: style.slot_height,
        margin: style.slot_padding,
        fontSize: `${style.slot_fsize_h}vh`,
        textAlign: style.slot_txtalign as TextAlignProperty,
        ...getBgOrElse('slot_bg'),
        [mediaQuery(style)]: {
            fontSize: `${style.slot_fsize_v}vw`
        },
        ':hover:not([disabled])': {
            ...getBgOrElse('slot_hover')
        }
    }),

    text: css({
        position: 'absolute',
        bottom: '2em'
    }),

    emptySlot: css({
        ...gameAndEmptySlot(),

        ':hover > &': {
            ...ifNoSlotBg({
                backgroundColor: '#005b7a'
            })
        }
    }),

    game: {
        container: css({
            ...gameAndEmptySlot(),

            '& video': {
                position: 'relative'
            }
        }),

        namebox: css({
            fontSize: `${style.namebox_fsize_h * style.thumb_height_scale}vh`,
            [mediaQuery(style)]: {
                fontSize: `${style.namebox_fsize_v * style.thumb_width_scale}vw`
            }
        }),

        dialog: css({
            fontSize: `${style.dialog_fsize_h * style.thumb_height_scale}vh`,
            [mediaQuery(style)]: {
                fontSize: `${style.dialog_fsize_v * style.thumb_width_scale}vw`
            }
        }),

        choice: css({
            fontSize: `${style.choicebtn_fsize_h * style.thumb_height_scale}vh`,
            [mediaQuery(style)]: {
                fontSize: `${style.choicebtn_fsize_v *
                    style.thumb_width_scale}vw`
            }
        })
    }
}

function gameAndEmptySlot(): CSSObject {
    return {
        width: `calc(${style.thumb_width} + 1px)`,
        height: `calc(${style.thumb_height} + 1px)`,
        marginTop: style.thumb_margin_top,
        ...ifNoSlotBg({
            backgroundColor: '#003d51'
        })
    }
}
