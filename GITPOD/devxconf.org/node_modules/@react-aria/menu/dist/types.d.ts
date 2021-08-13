import { AriaButtonProps } from "@react-types/button";
import { HTMLAttributes, RefObject, Key, ReactNode } from "react";
import { MenuTriggerState } from "@react-stately/menu";
import { AriaMenuProps } from "@react-types/menu";
import { KeyboardDelegate } from "@react-types/shared";
import { TreeState } from "@react-stately/tree";
interface MenuTriggerAriaProps {
    /** The type of menu that the menu trigger opens. */
    type?: 'menu' | 'listbox';
    /** Whether menu trigger is disabled. */
    isDisabled?: boolean;
}
interface MenuTriggerAria {
    /** Props for the menu trigger element. */
    menuTriggerProps: AriaButtonProps;
    /** Props for the menu. */
    menuProps: HTMLAttributes<HTMLElement>;
}
/**
 * Provides the behavior and accessibility implementation for a menu trigger.
 * @param props - Props for the menu trigger.
 * @param state - State for the menu trigger.
 */
export function useMenuTrigger(props: MenuTriggerAriaProps, state: MenuTriggerState, ref: RefObject<HTMLElement>): MenuTriggerAria;
interface MenuAria {
    /** Props for the menu element. */
    menuProps: HTMLAttributes<HTMLElement>;
}
interface AriaMenuOptions<T> extends AriaMenuProps<T> {
    /** Whether the menu uses virtual scrolling. */
    isVirtualized?: boolean;
    /**
     * An optional keyboard delegate implementation for type to select,
     * to override the default.
     */
    keyboardDelegate?: KeyboardDelegate;
}
/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 * @param props - Props for the menu.
 * @param state - State for the menu, as returned by `useListState`.
 */
export function useMenu<T>(props: AriaMenuOptions<T>, state: TreeState<T>, ref: RefObject<HTMLElement>): MenuAria;
interface MenuItemAria {
    /** Props for the menu item element. */
    menuItemProps: HTMLAttributes<HTMLElement>;
    /** Props for the main text element inside the menu item. */
    labelProps: HTMLAttributes<HTMLElement>;
    /** Props for the description text element inside the menu item, if any. */
    descriptionProps: HTMLAttributes<HTMLElement>;
    /** Props for the keyboard shortcut text element inside the item, if any. */
    keyboardShortcutProps: HTMLAttributes<HTMLElement>;
}
interface AriaMenuItemProps {
    /** Whether the menu item is disabled. */
    isDisabled?: boolean;
    /** Whether the menu item is selected. */
    isSelected?: boolean;
    /** A screen reader only label for the menu item. */
    'aria-label'?: string;
    /** The unique key for the menu item. */
    key?: Key;
    /** Handler that is called when the menu should close after selecting an item. */
    onClose?: () => void;
    /**
     * Whether the menu should close when the menu item is selected.
     * @default true
     */
    closeOnSelect?: boolean;
    /** Whether the menu item is contained in a virtual scrolling menu. */
    isVirtualized?: boolean;
    /** Handler that is called when the user activates the item. */
    onAction?: (key: Key) => void;
}
/**
 * Provides the behavior and accessibility implementation for an item in a menu.
 * See `useMenu` for more details about menus.
 * @param props - Props for the item.
 * @param state - State for the menu, as returned by `useTreeState`.
 */
export function useMenuItem<T>(props: AriaMenuItemProps, state: TreeState<T>, ref: RefObject<HTMLElement>): MenuItemAria;
interface AriaMenuSectionProps {
    /** The heading for the section. */
    heading?: ReactNode;
    /** An accessibility label for the section. Required if `heading` is not present. */
    'aria-label'?: string;
}
interface MenuSectionAria {
    /** Props for the wrapper list item. */
    itemProps: HTMLAttributes<HTMLElement>;
    /** Props for the heading element, if any. */
    headingProps: HTMLAttributes<HTMLElement>;
    /** Props for the group element. */
    groupProps: HTMLAttributes<HTMLElement>;
}
/**
 * Provides the behavior and accessibility implementation for a section in a menu.
 * See `useMenu` for more details about menus.
 * @param props - Props for the section.
 */
export function useMenuSection(props: AriaMenuSectionProps): MenuSectionAria;

//# sourceMappingURL=types.d.ts.map
