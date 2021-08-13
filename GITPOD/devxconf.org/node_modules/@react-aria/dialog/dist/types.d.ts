import { AriaDialogProps } from "@react-types/dialog";
import { HTMLAttributes, RefObject } from "react";
interface DialogAria {
    /** Props for the dialog container element. */
    dialogProps: HTMLAttributes<HTMLElement>;
    /** Props for the dialog title element. */
    titleProps: HTMLAttributes<HTMLElement>;
}
/**
 * Provides the behavior and accessibility implementation for a dialog component.
 * A dialog is an overlay shown above other content in an application.
 */
export function useDialog(props: AriaDialogProps, ref: RefObject<HTMLElement>): DialogAria;

//# sourceMappingURL=types.d.ts.map
