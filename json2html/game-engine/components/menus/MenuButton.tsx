/** @jsx jsx */
import { css, jsx, SerializedStyles } from '@emotion/core'
import { FunctionComponent } from 'react'

import { style } from '../../context'
import GuiButton from '../GuiButton'

export interface BtnProps {
    onClick: (e: React.MouseEvent) => void
    selected?: boolean
    disabled?: boolean
    styles?: SerializedStyles
}

const MenuButton: FunctionComponent<BtnProps> = ({
    onClick,
    selected = false,
    disabled = false,
    styles: stylesOverride,
    children
}) => (
    <GuiButton
        onClick={onClick}
        disabled={disabled || selected}
        className={selected ? 'selected' : undefined}
        css={[buttonStyles, stylesOverride]}
    >
        {children}
    </GuiButton>
)
export default MenuButton

const buttonStyles = css({
    padding: style.guibtn_padding,
    height: style.guibtn_height,

    '&.selected, &.selected:hover': {
        color: style.selected_color
    }
})
