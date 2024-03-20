import React, { ComponentType } from 'react'
import { FC } from 'react'

export enum AppType {
  Root = 'Explore Apps',
  Blog = 'Blog',
  Bridge = 'Bridge',
  Swap = 'Swap',
  xSwap = 'xSwap',
  Furo = 'Pay',
  Legacy = 'Sushi 1.0',
  Internal = 'Internal',
  Kashi = 'Lend & Borrow',
  Analytics = 'Analytics',
  Earn = 'Pools',
  Partner = 'Partner',
  Widget = 'Widget',
  Academy = 'Academy',
  Governance_dashboard = 'Governance Dashboard',
}

export type ExtractProps<T> = T extends ComponentType<infer P> ? P : T
export type AnyTag = keyof JSX.IntrinsicElements

// Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
// A more precise version of just React.ComponentPropsWithoutRef on its own
export type PropsOf<
  C extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>,
> = JSX.LibraryManagedAttributes<C, React.ComponentPropsWithoutRef<C>>

type AsProp<C extends React.ElementType> = {
  /**
   * An override of the default HTML tag.
   * Can also be another React component.
   */
  as?: C
}

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type ExtendableProps<
  ExtendedProps = Record<string, never>,
  OverrideProps = Record<string, never>,
> = OverrideProps & Omit<ExtendedProps, keyof OverrideProps>

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
export type InheritableElementProps<
  C extends React.ElementType,
  Props = Record<string, never>,
> = ExtendableProps<PropsOf<C>, Props>

/**
 * A more sophisticated version of `InheritableElementProps` where
 * the passed in `as` prop will determine which props can be included
 */
export type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = Record<string, never>,
> = InheritableElementProps<C, Props & AsProp<C>>

/**
 * Utility type to extract the `ref` prop from a polymorphic component
 */
export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref']

/**
 * A wrapper of `PolymorphicComponentProps` that also includes the `ref`
 * prop for the polymorphic component
 */
export type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = Record<string, never>,
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> }

export type IconProps = React.ComponentProps<'svg'>
export type IconComponent = FC<IconProps>
