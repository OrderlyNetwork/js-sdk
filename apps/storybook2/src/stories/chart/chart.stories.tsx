import type {Meta, StoryObj} from '@storybook/react';
// import { fn } from '@storybook/test';
import {Axis, Bar, Chart, Legend, Line, PnlLineChart} from '@orderly.network/chart';
import {Box} from '@orderly.network/ui';
import {OverviewModule} from '@orderly.network/portfolio'
import {OrderlyApp} from '@orderly.network/react-app'

const meta = {
    title: 'Chart/Chart',
    component: Chart,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    // tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        //   backgroundColor: { control: 'color' },

    },
    decorators: [
        (Story) => (
            <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}><Box width="500px" height={'400px'}>
                {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
                <Story/>
            </Box>
            </OrderlyApp>
        ),
    ],
    // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args

} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const pnlLine: Story = {
    render: () => {
         const state = OverviewModule.useAssetsLineChartScript();
        return <PnlLineChart {...state}/>
    },
}
