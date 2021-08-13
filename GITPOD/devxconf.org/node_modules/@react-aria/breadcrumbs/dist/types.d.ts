import { AriaBreadcrumbItemProps, AriaBreadcrumbsProps } from "@react-types/breadcrumbs";
import { HTMLAttributes, RefObject } from "react";
interface BreadcrumbItemAria {
    /** Props for the breadcrumb item link element. */
    itemProps: HTMLAttributes<HTMLElement>;
}
/**
 * Provides the behavior and accessibility implementation for an in a breadcrumbs component.
 * See `useBreadcrumbs` for details about breadcrumbs.
 */
export function useBreadcrumbItem(props: AriaBreadcrumbItemProps, ref: RefObject<HTMLElement>): BreadcrumbItemAria;
interface BreadcrumbsAria {
    /** Props for the breadcrumbs navigation element. */
    navProps: HTMLAttributes<HTMLElement>;
}
/**
 * Provides the behavior and accessibility implementation for a breadcrumbs component.
 * Breadcrumbs display a heirarchy of links to the current page or resource in an application.
 */
export function useBreadcrumbs<T>(props: AriaBreadcrumbsProps<T>): BreadcrumbsAria;

//# sourceMappingURL=types.d.ts.map
