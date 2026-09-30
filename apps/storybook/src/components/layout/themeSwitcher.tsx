import {
  Box,
  cn,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  useOrderlyTheme,
  useScreen,
} from "@orderly.network/ui";

function ThemeIcon({ className }: { className?: string }) {
  const { currentTheme } = useOrderlyTheme();
  const isLight = currentTheme?.mode === "light";

  if (isLight) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
          fill="currentColor"
        />
        <path
          d="M12 1.5v2M12 20.5v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1.5 12h2M20.5 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M21.75 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9-5.998Z" />
    </svg>
  );
}

export function ThemeSwitcher() {
  const { themes, currentThemeId, setCurrentThemeId } = useOrderlyTheme();
  const { isMobile } = useScreen();

  if (!themes || themes.length <= 1) {
    return null;
  }

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch theme"
          className="oui-flex oui-items-center oui-justify-center oui-bg-transparent oui-border-none oui-p-0"
        >
          <ThemeIcon
            className={cn(
              "oui-size-6 lg:oui-size-5",
              "oui-cursor-pointer oui-text-base-contrast-80",
              "oui-transition-colors hover:oui-text-base-contrast",
              isMobile && "oui-size-[18px]",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="oui-flex oui-min-w-[160px] oui-flex-col oui-gap-1 oui-p-2"
        >
          {themes.map((theme) => {
            const selected = currentThemeId === theme.id;
            return (
              <DropdownMenuItem
                key={theme.id}
                onSelect={() => setCurrentThemeId?.(theme.id)}
                className={cn(
                  "oui-h-9 oui-rounded-md oui-px-3 oui-py-2 oui-text-xs",
                  selected && "oui-bg-base-5",
                )}
              >
                <Flex justify="between" width="100%" itemAlign="center">
                  {theme.displayName}
                  {selected && (
                    <Box width={4} height={4} gradient="primary" r="full" />
                  )}
                </Flex>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
}
