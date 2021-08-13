import { AriaProgressBarProps } from "@react-types/progress";
import { HTMLAttributes } from "react";
interface ProgressBarAria {
    /** Props for the progress bar container element. */
    progressBarProps: HTMLAttributes<HTMLElement>;
    /** Props for the progress bar's visual label element (if any). */
    labelProps: HTMLAttributes<HTMLElement>;
}
/**
 * Provides the accessibility implementation for a progress bar component.
 * Progress bars show either determinate or indeterminate progress of an operation
 * over time.
 */
export function useProgressBar(props: AriaProgressBarProps): ProgressBarAria;

//# sourceMappingURL=types.d.ts.map
