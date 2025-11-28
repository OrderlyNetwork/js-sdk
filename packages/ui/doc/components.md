# Orderly UI Component Index (`packages/ui/src`)

This retrieval document mirrors the `packages/ui/src` directory structure and summarizes each module’s purpose, main exports, and implementation notes for quick AI ingestion.

## Root Files

- `index.ts`: Central export barrel for components, hooks, locales, and utilities.
- `install.tsx`: Placeholder for internal plugin wiring (nav/sidebar installers are commented out).
- `tailwind.css`: Base Tailwind layer used by every component.
- `version.ts`: Registers `@orderly.network/ui` version on `window.__ORDERLY_VERSION__`.

## avatar

- Files: `avatar.tsx`, `index.ts`.
- Provides Radix-based avatar primitives plus `EVMAvatar` blockies. See `doc/avatar/avatar.md` for details.

## badge

- File: `badge.tsx`.
- Renders status pills with variant/color/size combinations. See `doc/badge/badge.md`.

## box

- Files: `box.tsx`, `index.ts`.
- Foundational layout primitive with spacing, positioning, and decoration variants (`doc/box/box.md`).

## button

- Files: `base.tsx`, `button.tsx`, `throttledButton.tsx`, `index.ts`.
- Covers `Button`, `BaseButton`, and `ThrottledButton` along with `buttonVariants` (`doc/button/button.md`).

## card

- Files: `cardBase.tsx`, `card.tsx`, `hoverCard.tsx`, `index.ts`.
- Slot-based card surfaces and hover cards (`doc/card/card.md`).

## carousel

- Files: `carousel.tsx`, `index.ts`.
- Embla carousel wrapper with context + items (`doc/carousel/carousel.md`).

## checkbox

- Files: `checkbox.tsx`, `index.ts`.
- Radix-based checkbox with indicator styling (`doc/checkbox/checkbox.md`).

## collapsible

- Files: `collapsible.tsx`, `collapse/collapse.tsx`, `index.ts`.
- Collapsible primitives + higher level `Collapse` component (`doc/collapsible/collapsible.md`).

## dialog

- Files: `dialog.tsx`, `simpleDialog.tsx`, `simpleDialogFooter.tsx`, `alertDialog.tsx`, `triggerDialog.tsx`, `helper.tsx`, `index.ts`.
- Complete dialog system wrapping Radix Dialog (`doc/dialog/dialog.md`).

## divider

- Files: `divider.tsx`, `index.ts`.
- Themed separators with direction/intensity variants (`doc/divider/divider.md`).

## dropdown

- Files: `dropdown.tsx`, `menuItem.tsx`, `checkbox.tsx`, `radioGroup.tsx`, `tokens.tsx`, `index.ts`.
- Dropdown menu wrappers with checkbox/radio/token items (`doc/dropdown/dropdown.md`).

## empty

- Files: `empty.tsx`, `index.ts`.
- Minimal empty state component (`doc/empty/empty.md`).

## flex

- Files: `flex.tsx`, `index.ts`.
- Flexbox container built on Box (`doc/flex/flex.md`).

## grid

- Files: `grid.tsx`, `span.tsx`, `index.ts`.
- CSS Grid helper with span utilities (`doc/grid/grid.md`).

## helpers

- Files: `parse-props.ts`, `sizeType.ts`, `component-props.ts`, `colorType.ts`, `layoutClassHelper.ts`.
- Shared prop parsers and type helpers (`doc/helpers/helpers.md`).

## hooks

- Files: `useScreen.ts`, `useMediaQuery.ts`, `useObserverElement.ts`, `index.ts`.
- Responsive and observer hooks (`doc/hooks/hooks.md`).

## icon

- Files: `baseIcon*.tsx`, dozens of icon components, `index.ts`.
- Full SVG icon set (`doc/icon/icon.md`).

## input

- Files: `input.tsx`, `baseInput.tsx`, `textField.tsx`, `inputAdditional.tsx`, `textarea.tsx`, etc.
- Input family with prefix/suffix, formatters, and tooltip variants (`doc/input/input.md`).

## layout

- Files: `layout.tsx`, `gap.tsx`, `decoration.ts`, `position.tsx`, `shadow.tsx`, `visible.ts`, `intensity.ts`.
- Shared variant definitions (`doc/layout/layout.md`).

## listView

- Files: `listView.tsx`, `useEndReached.ts`, `index.ts`.
- Scrollable list component with infinite-load support (`doc/listView/listView.md`).

## locale

- Files: `context.ts`, `provider.tsx`, `useLocale.ts`, `en.ts`, `index.ts`.
- Lightweight localization framework (`doc/locale/locale.md`).

## logo

- Files: `logo.tsx`, `index.ts`.
- Simple logo component (`doc/logo/logo.md`).

## marquee

- Files: `marquee.tsx`, `index.ts`.
- Embla auto-scroll marquee (`doc/marquee/marquee.md`).

## misc

- Files: `either.tsx`, `switch.tsx`.
- Utility render helpers (`doc/misc/misc.md`).

## modal

- Files: `index.tsx`, `modalContext.tsx`, `modalHelper.tsx`, `useModal.tsx`, `types.ts`, `utils.ts`, `preset/*`.
- Promise-based modal manager and presets (`doc/modal/modal.md`).

## pagination

- Files: `pagination.tsx`, `index.ts`.
- Pagination control (`doc/pagination/pagination.md`).

## pickers

- Files: `picker.tsx`, `datepicker.tsx`, `dateRangePicker.tsx`, `date/*`, `index.ts`.
- Date and range pickers (`doc/pickers/pickers.md`).

## plugin

- Files: `install.tsx`, `pluginContext.tsx`, `registry.ts`, `slot.tsx`, `types.ts`, `useBuilder.ts`, `useExtensionBuilder.ts`, `notFound.tsx`.
- Runtime extension system (`doc/plugin/plugin.md`).

## popover

- Files: `popover.tsx`, `index.ts`.
- Popover primitives (`doc/popover/popover.md`).

## provider

- Files: `componentProvider.tsx`, `orderlyThemeContext.tsx`, `orderlyThemeProvider.tsx`.
- Theme + component providers (`doc/provider/provider.md`).

## radio

- Files: `radio.tsx`, `index.ts`.
- Radix Radio wrappers (`doc/radio/radio.md`).

## scrollarea

- Files: `scrollArea.tsx`, `index.ts`.
- Themed scroll containers (`doc/scrollarea/scrollarea.md`).

## scrollIndicator

- Files: `scrollIndicator.tsx`, `scrollButton.tsx`, `hooks/*`, `index.tsx`.
- Horizontal scroll helper (`doc/scrollIndicator/scrollIndicator.md`).

## select

- Files: `select.tsx`, `selectPrimitive.tsx`, `withOptions.tsx`, `chains.tsx`, `combine.tsx`, `tokens.tsx`, `index.ts`.
- Selects and token/chain-specific variants (`doc/select/select.md`).

## sheet

- Files: `sheet.tsx`, `simpleSheet.tsx`, `actionSheet.tsx`, `helper.tsx`, `index.ts`.
- Drawer/action sheet components (`doc/sheet/sheet.md`).

## slider

- Files: `slider.tsx`, `utils.ts`, `index.ts`.
- Radix slider wrapper (`doc/slider/slider.md`).

## spinner

- Files: `spinner.tsx`, `index.ts`.
- Loaders (`doc/spinner/spinner.md`).

## switch

- Files: `switch.tsx`, `index.ts`.
- Toggle switches (`doc/switch/switch.md`).

## table

- Files: `dataTable.tsx`, `transform.ts`, `multiSortHeader.tsx`, `features/*`, `hooks/*`, `icons.tsx`, `index.tsx`, etc.
- TanStack-powered data grid system (`doc/table/table.md`).

## tabs

- Files: `tabs.tsx`, `tabsBase.tsx`, `index.ts`.
- Tab navigation (`doc/tabs/tabs.md`).

## tag

- Files: `tag.tsx`, `index.ts`.
- Tag/chip component (`doc/tag/tag.md`).

## tailwind

- Files: `base.ts`, `components.ts`, `theme.ts`, `size.ts`, `gradient.ts`, `position.ts`, `scrollBar.ts`, `chart.ts`, `index.ts`.
- Tailwind plugin + preset exports (`doc/tailwind/tailwind.md`).

## theme

- File: `theme.ts`.
- Token definitions (`doc/theme/theme.md`).

## toast

- Files: `Toaster.tsx`, `toastTile.tsx`, `index.ts`.
- Toast utilities (`doc/toast/toast.md`).

## tooltip

- Files: `tooltip.tsx`, `index.ts`.
- Tooltip primitives (`doc/tooltip/tooltip.md`).

## transitions

- Files: `fade.tsx`.
- Shared animation helpers (`doc/transitions/transitions.md`).

## typography

- Files: `text.tsx`, `typography.tsx`, `numeral.tsx`, `statistic.tsx`, `symbol.tsx`, `formatted.tsx`, `gradient.tsx`, `numType.tsx`, `utils.ts`, `index.ts`.
- Text and numeric components (`doc/typography/typography.md`).

## utils

- Files: `string.ts`, `transition.ts`, `tv.ts`, `index.ts`.
- Miscellaneous helpers (`doc/utils/utils.md`).

## alert doc

- Detailed preset reference at `doc/alert/alert.md` (see file for modal preset usage).
