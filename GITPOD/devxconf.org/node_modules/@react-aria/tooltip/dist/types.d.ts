import { AriaTooltipProps, TooltipTriggerProps } from "@react-types/tooltip";
import { HTMLAttributes, RefObject } from "react";
import { TooltipTriggerState } from "@react-stately/tooltip";
import { FocusEvents } from "@react-types/shared";
import { HoverProps, PressProps } from "@react-aria/interactions";
interface TooltipAria {
    /**
     * Props for the tooltip element.
     */
    tooltipProps: HTMLAttributes<HTMLElement>;
}
/**
 * Provides the accessibility implementation for a Tooltip component.
 */
export function useTooltip(props: AriaTooltipProps, state?: TooltipTriggerState): TooltipAria;
interface TooltipTriggerAria {
    /**
     * Props for the trigger element.
     */
    triggerProps: HTMLAttributes<HTMLElement> & PressProps & HoverProps & FocusEvents;
    /**
     * Props for the overlay container element.
     */
    tooltipProps: HTMLAttributes<HTMLElement>;
}
/**
 * Provides the behavior and accessibility implementation for a tooltip trigger, e.g. a button
 * that shows a description when focused or hovered.
 */
export function useTooltipTrigger(props: TooltipTriggerProps, state: TooltipTriggerState, ref: RefObject<HTMLElement>): TooltipTriggerAria;

//# sourceMappingURL=types.d.ts.map
