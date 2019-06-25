/** @jsx jsx */
import { css, CSSObject, jsx } from '@emotion/core';
import { TextAlignProperty } from 'csstype';
import { Do } from 'fp-ts-contrib/lib/Do';
import { last } from 'fp-ts/lib/Array';
import { fromEither, Option, option } from 'fp-ts/lib/Option';
import { FunctionComponent } from 'react';

import { firstNode, style, transl } from '../../context';
import statesFromHistory from '../../gameHistory/statesFromHistory';
import Save from '../../storage/Save';
import { getBgOrElse, ifNoSlotBg, mediaQuery } from '../../utils/styles';
import Game from '../game/Game';

interface Props {
    save: Option<Save>;
    onClick: (e: React.MouseEvent) => void;
}

const SaveSlot: FunctionComponent<Props> = ({ save, onClick }) => {
    const gameRect: JSX.Element = Do(option)
        .bind('save', save)
        .bindL('states', ({ save }) =>
            fromEither(statesFromHistory(firstNode, save.history))
        )
        .bindL('currentState', ({ states }) => last(states))
        .return(({ currentState: [gameProps] }) => (
            <Game gameProps={gameProps} styleOverload={styles.game} />
        ))
        .getOrElse(<div css={styles.emptySlot} />);

    return (
        <div css={styles.saveSlot} onClick={onClick}>
            {gameRect}
            <div css={styles.text}>
                {save.map(_ => _.date).getOrElse(transl.emptySlot)}
            </div>
        </div>
    );
};
export default SaveSlot;

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
        ':hover': {
            ...getBgOrElse('slot_hover')
        }
    }),

    text: css({
        marginTop: '0.33em'
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
            position: 'relative',

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
};

function gameAndEmptySlot(): CSSObject {
    return {
        width: `calc(${style.thumb_width} + 1px)`,
        height: `calc(${style.thumb_height} + 1px)`,
        marginTop: style.thumb_margin_top,
        ...ifNoSlotBg({
            backgroundColor: '#003d51'
        })
    };
}