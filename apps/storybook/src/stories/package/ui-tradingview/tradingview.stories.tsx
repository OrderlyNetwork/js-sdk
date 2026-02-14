import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@orderly.network/ui";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";

const meta: Meta<typeof TradingviewWidget> = {
  title: "Package/ui-tradingview",
  component: TradingviewWidget,
  decorators: [
    (Story) => (
      <Scaffold>
        <Box height={600}>
          <Story />
        </Box>
      </Scaffold>
    ),
  ],
  parameters: {},
  args: {
    symbol: "PERP_BTC_USDC",
  },
};

type Story = StoryObj<typeof meta>;

export default meta;

const tradingviewProps = {
  symbol: "PERP_ETH_USDC",
  scriptSRC: "/tradingview/charting_library/charting_library.js",
  libraryPath: "/tradingview/charting_library/",
  customCssUrl: "/tradingview/chart.css",
};

export const Default: Story = {
  args: {
    ...tradingviewProps,
  },
};

export const NoTradingviewFile: Story = {
  render: () => {
    return <TradingviewWidget symbol="PERP_BTC_USDC" />;
  },
};

/**
 * Example custom indicator: plots close price as a line.
 * Open the chart, click Indicators, and add "Orderly Demo Close Line" from the list.
 */
export const CustomIndicators: Story = {
  args: {
    ...tradingviewProps,
    customIndicatorsGetter: function (PineJS) {
      return Promise.resolve([
        {
          name: 'My Custom Coloring Candles',
          metainfo: {
            _metainfoVersion: 51,

            id: 'mycustomcolouringcandles@tv-basicstudies-1',
            name: 'My Custom Coloring Candles',
            description: 'My Custom Coloring Candles',
            shortDescription: 'My Custom Coloring Candles',

            isCustomIndicator: true,

            is_price_study: false, // whether the study should appear on the main series pane.
            linkedToSeries: true, // whether the study price scale should be the same as the main series one.

            format: {
              type: 'price',
              precision: 2,
            },

            plots: [
              {
                id: 'plot_open',
                type: 'ohlc_open',
                target: 'plot_candle',
              },
              {
                id: 'plot_high',
                type: 'ohlc_high',
                target: 'plot_candle',
              },
              {
                id: 'plot_low',
                type: 'ohlc_low',
                target: 'plot_candle',
              },
              {
                id: 'plot_close',
                type: 'ohlc_close',
                target: 'plot_candle',
              },
              {
                id: 'plot_bar_color',
                type: 'ohlc_colorer',
                palette: 'palette_bar',
                target: 'plot_candle',
              },
              {
                id: 'plot_wick_color',
                type: 'wick_colorer',
                palette: 'palette_wick',
                target: 'plot_candle',
              },
              {
                id: 'plot_border_color',
                type: 'border_colorer',
                palette: 'palette_border',
                target: 'plot_candle',
              },
            ],

            palettes: {
              palette_bar: {
                colors: [{ name: 'Colour One' }, { name: 'Colour Two' }],

                valToIndex: {
                  0: 0,
                  1: 1,
                },
              },
              palette_wick: {
                colors: [{ name: 'Colour One' }, { name: 'Colour Two' }],

                valToIndex: {
                  0: 0,
                  1: 1,
                },
              },
              palette_border: {
                colors: [{ name: 'Colour One' }, { name: 'Colour Two' }],

                valToIndex: {
                  0: 0,
                  1: 1,
                },
              },
            },

            ohlcPlots: {
              plot_candle: {
                title: 'Candles',
              },
            },

            defaults: {
              ohlcPlots: {
                plot_candle: {
                  borderColor: '#000000',
                  color: '#000000',
                  drawBorder: true,
                  drawWick: true,
                  plottype: 'ohlc_candles',
                  visible: true,
                  wickColor: '#000000',
                },
              },

              palettes: {
                palette_bar: {
                  colors: [
                    { color: '#1948CC', width: 1, style: 0 },
                    { color: '#F47D02', width: 1, style: 0 },
                  ],
                },
                palette_wick: {
                  colors: [
                    { color: '#0C3299', },
                    { color: '#E65000', },
                  ],
                },
                palette_border: {
                  colors: [
                    { color: '#5B9CF6', },
                    { color: '#FFB74D', },
                  ],
                },
              },

              precision: 2,
              inputs: {},
            },
            styles: {},
            inputs: [],
          },
          constructor: function () {
            this.main = function (context, inputCallback) {
              this._context = context;
              this._input = inputCallback;

              this._context.select_sym(0);

              const o = PineJS.Std.open(this._context);
              const h = PineJS.Std.high(this._context);
              const l = PineJS.Std.low(this._context);
              const c = PineJS.Std.close(this._context);

              // Color is determined randomly
              const colour = Math.round(Math.random());
              return [o, h, l, c, colour /*bar*/, colour /*wick*/, colour /*border*/];
            };
          },
        },
      ]);
    }
  },
};
