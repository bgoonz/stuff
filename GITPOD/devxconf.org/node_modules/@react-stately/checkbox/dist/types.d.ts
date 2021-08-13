import { CheckboxGroupProps } from "@react-types/checkbox";
export interface CheckboxGroupState {
    /** Current selected values. */
    readonly value: readonly string[];
    /** Whether the checkbox group is disabled. */
    readonly isDisabled: boolean;
    /** Whether the checkbox group is read only. */
    readonly isReadOnly: boolean;
    /** Returns whether the given value is selected. */
    isSelected(value: string): boolean;
    /** Sets the selected values. */
    setValue(value: string[]): void;
    /** Adds a value to the set of selected values. */
    addValue(value: string): void;
    /** Removes a value from the set of selected values. */
    removeValue(value: string): void;
    /** Toggles a value in the set of selected values. */
    toggleValue(value: string): void;
}
/**
 * Provides state management for a checkbox group component. Provides a name for the group,
 * and manages selection and focus state.
 */
export function useCheckboxGroupState(props?: CheckboxGroupProps): CheckboxGroupState;

//# sourceMappingURL=types.d.ts.map
