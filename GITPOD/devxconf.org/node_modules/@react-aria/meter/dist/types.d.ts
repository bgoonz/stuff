import { AriaMeterProps } from "@react-types/meter";
import { HTMLAttributes } from "react";
interface MeterAria {
    /** Props for the meter container element. */
    meterProps: HTMLAttributes<HTMLElement>;
    /** Props for the meter's visual label (if any). */
    labelProps: HTMLAttributes<HTMLElement>;
}
/**
 * Provides the accessibility implementation for a meter component.
 * Meters represent a quantity within a known range, or a fractional value.
 */
export function useMeter(props: AriaMeterProps): MeterAria;

//# sourceMappingURL=types.d.ts.map
